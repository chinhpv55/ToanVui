-- ============================================================
-- Migration 006: Exercise bank (cached AI-generated exercises)
-- ============================================================
-- Reuses Claude-generated exercises across users. The /api/generate-exercise
-- route checks the bank first; only calls Claude when the bank doesn't have
-- enough fresh items for the requested (topic, difficulty) pair.
--
-- Estimated cost reduction: 80-95% once the bank is warm.
-- ============================================================

-- ── Idempotent cleanup ──
DROP FUNCTION IF EXISTS public.get_unseen_exercises(UUID, UUID, difficulty_enum, INT);
DROP FUNCTION IF EXISTS public.mark_exercises_seen(UUID, UUID[]);
DROP FUNCTION IF EXISTS public.bank_stats();
DROP TABLE IF EXISTS public.student_seen_exercises CASCADE;
DROP TABLE IF EXISTS public.exercise_bank CASCADE;

-- ============================================================
-- TABLE: exercise_bank
-- ============================================================
CREATE TABLE public.exercise_bank (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID NOT NULL REFERENCES public.curriculum_topics(id) ON DELETE CASCADE,
    difficulty difficulty_enum NOT NULL,
    question_type question_type_enum NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    choices JSONB,
    hint TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Naive fingerprint to dedup obvious copies; parser also dedups in app code.
    question_norm TEXT GENERATED ALWAYS AS (
        regexp_replace(lower(question), '\s+', '', 'g')
    ) STORED
);

CREATE INDEX idx_bank_topic_diff ON public.exercise_bank(topic_id, difficulty);
CREATE INDEX idx_bank_created ON public.exercise_bank(created_at DESC);
CREATE UNIQUE INDEX idx_bank_dedup ON public.exercise_bank(topic_id, difficulty, question_norm);

ALTER TABLE public.exercise_bank ENABLE ROW LEVEL SECURITY;

-- Read by all authenticated users (it's just exercise content, no PII).
CREATE POLICY "exercise_bank_select_authenticated"
    ON public.exercise_bank FOR SELECT
    TO authenticated
    USING (true);

-- ============================================================
-- TABLE: student_seen_exercises
-- ============================================================
CREATE TABLE public.student_seen_exercises (
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercise_bank(id) ON DELETE CASCADE,
    seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (student_id, exercise_id)
);

CREATE INDEX idx_seen_student ON public.student_seen_exercises(student_id);

ALTER TABLE public.student_seen_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "seen_select_self_or_parent"
    ON public.student_seen_exercises FOR SELECT
    TO authenticated
    USING (
        student_id = auth.uid()
        OR student_id IN (SELECT id FROM public.students WHERE parent_id = auth.uid())
    );

CREATE POLICY "seen_insert_self_or_parent"
    ON public.student_seen_exercises FOR INSERT
    TO authenticated
    WITH CHECK (
        student_id = auth.uid()
        OR student_id IN (SELECT id FROM public.students WHERE parent_id = auth.uid())
    );

-- ============================================================
-- RPC: get_unseen_exercises
-- Random N bank items the student hasn't seen yet.
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_unseen_exercises(
    p_student_id UUID,
    p_topic_id UUID,
    p_difficulty difficulty_enum,
    p_count INT DEFAULT 5
)
RETURNS TABLE(
    id UUID,
    question TEXT,
    answer TEXT,
    question_type question_type_enum,
    choices JSONB,
    hint TEXT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $body$
    SELECT eb.id, eb.question, eb.answer, eb.question_type, eb.choices, eb.hint
    FROM public.exercise_bank eb
    WHERE eb.topic_id = p_topic_id
      AND eb.difficulty = p_difficulty
      AND eb.id NOT IN (
          SELECT exercise_id FROM public.student_seen_exercises
          WHERE student_id = p_student_id
      )
    ORDER BY random()
    LIMIT p_count;
$body$;

GRANT EXECUTE ON FUNCTION public.get_unseen_exercises(UUID, UUID, difficulty_enum, INT) TO authenticated;

-- ============================================================
-- RPC: mark_exercises_seen
-- Batch insert into student_seen_exercises (idempotent via ON CONFLICT).
-- ============================================================
CREATE OR REPLACE FUNCTION public.mark_exercises_seen(
    p_student_id UUID,
    p_exercise_ids UUID[]
)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
AS $body$
    INSERT INTO public.student_seen_exercises (student_id, exercise_id)
    SELECT p_student_id, eid FROM unnest(p_exercise_ids) AS eid
    ON CONFLICT (student_id, exercise_id) DO NOTHING;
$body$;

GRANT EXECUTE ON FUNCTION public.mark_exercises_seen(UUID, UUID[]) TO authenticated;

-- ============================================================
-- RPC: bank_stats (admin-only)
-- Returns per-topic bank coverage for the admin panel.
-- ============================================================
CREATE OR REPLACE FUNCTION public.bank_stats()
RETURNS TABLE(
    topic_id UUID,
    topic_code TEXT,
    topic_name TEXT,
    grade INT,
    series series_enum,
    easy_count BIGINT,
    medium_count BIGINT,
    hard_count BIGINT,
    total_count BIGINT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $body$
    SELECT
        ct.id,
        ct.topic_code::TEXT,
        ct.topic_name::TEXT,
        ct.grade,
        ct.series,
        COUNT(eb.*) FILTER (WHERE eb.difficulty = 'easy')   AS easy_count,
        COUNT(eb.*) FILTER (WHERE eb.difficulty = 'medium') AS medium_count,
        COUNT(eb.*) FILTER (WHERE eb.difficulty = 'hard')   AS hard_count,
        COUNT(eb.*)                                          AS total_count
    FROM public.curriculum_topics ct
    LEFT JOIN public.exercise_bank eb ON eb.topic_id = ct.id
    WHERE public.is_admin(auth.uid())
    GROUP BY ct.id
    ORDER BY ct.grade, ct.sort_order;
$body$;

GRANT EXECUTE ON FUNCTION public.bank_stats() TO authenticated;
