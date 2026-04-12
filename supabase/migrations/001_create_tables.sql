-- ============================================================
-- VuiToan3 Database Schema
-- Migration 001: Create all tables, enums, indexes, and RLS
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE subject_enum AS ENUM ('toan', 'tieng_viet', 'tnxh', 'tieng_anh');

CREATE TYPE series_enum AS ENUM ('canh_dieu', 'kntt', 'chan_troi');

CREATE TYPE skill_type_enum AS ENUM ('so_hoc', 'hinh_hoc', 'do_luong', 'toan_do', 'bieu_thuc', 'thong_ke');

CREATE TYPE mastery_level_enum AS ENUM ('not_started', 'learning', 'practicing', 'mastered');

CREATE TYPE difficulty_enum AS ENUM ('easy', 'medium', 'hard');

CREATE TYPE question_type_enum AS ENUM ('fill_blank', 'multiple_choice', 'drag_drop');

-- ============================================================
-- TABLE: curriculum_topics
-- Stores the SGK (textbook) content tree
-- ============================================================

CREATE TABLE curriculum_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject subject_enum NOT NULL DEFAULT 'toan',
    grade INT NOT NULL DEFAULT 3,
    series series_enum NOT NULL DEFAULT 'canh_dieu',
    semester INT NOT NULL CHECK (semester IN (1, 2)),
    chapter_code VARCHAR(20) NOT NULL,
    chapter_name VARCHAR(200) NOT NULL,
    topic_code VARCHAR(30) NOT NULL UNIQUE,
    topic_name VARCHAR(300) NOT NULL,
    skill_type skill_type_enum NOT NULL,
    week_suggestion INT NOT NULL CHECK (week_suggestion BETWEEN 1 AND 35),
    sort_order INT NOT NULL,
    ai_prompt_template TEXT,
    difficulty_levels JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE: students
-- Student profiles linked to auth.users
-- ============================================================

CREATE TABLE students (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    grade INT NOT NULL DEFAULT 3,
    series series_enum NOT NULL DEFAULT 'canh_dieu',
    current_week INT CHECK (current_week BETWEEN 1 AND 35),
    avatar_id VARCHAR(50) DEFAULT 'default',
    total_stars INT NOT NULL DEFAULT 0,
    streak_days INT NOT NULL DEFAULT 0,
    last_practice_date DATE,
    assigned_topic_id UUID REFERENCES curriculum_topics(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE: student_topic_progress
-- Per-topic progress tracking (composite PK)
-- ============================================================

CREATE TABLE student_topic_progress (
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES curriculum_topics(id) ON DELETE CASCADE,
    attempts INT NOT NULL DEFAULT 0,
    correct INT NOT NULL DEFAULT 0,
    accuracy_rate FLOAT DEFAULT 0.0,
    mastery_level mastery_level_enum NOT NULL DEFAULT 'not_started',
    current_difficulty difficulty_enum NOT NULL DEFAULT 'easy',
    consecutive_correct INT NOT NULL DEFAULT 0,
    consecutive_wrong INT NOT NULL DEFAULT 0,
    last_practiced_at TIMESTAMPTZ,
    weak_flag BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (student_id, topic_id)
);

-- ============================================================
-- TABLE: exercise_sessions
-- Exercise history / audit log
-- ============================================================

CREATE TABLE exercise_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES curriculum_topics(id) ON DELETE CASCADE,
    question_generated TEXT NOT NULL,
    question_type question_type_enum NOT NULL,
    student_answer VARCHAR(500),
    correct_answer VARCHAR(500) NOT NULL,
    is_correct BOOLEAN,
    ai_explanation TEXT,
    difficulty_used difficulty_enum NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- curriculum_topics indexes
CREATE INDEX idx_curriculum_week ON curriculum_topics(week_suggestion);
CREATE INDEX idx_curriculum_chapter ON curriculum_topics(chapter_code);
CREATE INDEX idx_curriculum_subject_grade ON curriculum_topics(subject, grade, series);

-- student_topic_progress indexes
CREATE INDEX idx_progress_weak ON student_topic_progress(student_id, weak_flag) WHERE weak_flag = true;
CREATE INDEX idx_progress_mastery ON student_topic_progress(student_id, mastery_level);

-- exercise_sessions indexes
CREATE INDEX idx_sessions_student_date ON exercise_sessions(student_id, created_at DESC);
CREATE INDEX idx_sessions_topic ON exercise_sessions(student_id, topic_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE curriculum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_topic_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_sessions ENABLE ROW LEVEL SECURITY;

-- curriculum_topics: readable by all authenticated users
CREATE POLICY "curriculum_topics_select_authenticated"
    ON curriculum_topics
    FOR SELECT
    TO authenticated
    USING (true);

-- students: readable/writable by self or parent
CREATE POLICY "students_select_self_or_parent"
    ON students
    FOR SELECT
    TO authenticated
    USING (
        id = auth.uid()
        OR parent_id = auth.uid()
    );

CREATE POLICY "students_insert_self_or_parent"
    ON students
    FOR INSERT
    TO authenticated
    WITH CHECK (
        id = auth.uid()
        OR parent_id = auth.uid()
    );

CREATE POLICY "students_update_self_or_parent"
    ON students
    FOR UPDATE
    TO authenticated
    USING (
        id = auth.uid()
        OR parent_id = auth.uid()
    )
    WITH CHECK (
        id = auth.uid()
        OR parent_id = auth.uid()
    );

-- student_topic_progress: accessible by self or parent
CREATE POLICY "progress_select_self_or_parent"
    ON student_topic_progress
    FOR SELECT
    TO authenticated
    USING (
        student_id = auth.uid()
        OR student_id IN (SELECT id FROM students WHERE parent_id = auth.uid())
    );

CREATE POLICY "progress_insert_self_or_parent"
    ON student_topic_progress
    FOR INSERT
    TO authenticated
    WITH CHECK (
        student_id = auth.uid()
        OR student_id IN (SELECT id FROM students WHERE parent_id = auth.uid())
    );

CREATE POLICY "progress_update_self_or_parent"
    ON student_topic_progress
    FOR UPDATE
    TO authenticated
    USING (
        student_id = auth.uid()
        OR student_id IN (SELECT id FROM students WHERE parent_id = auth.uid())
    )
    WITH CHECK (
        student_id = auth.uid()
        OR student_id IN (SELECT id FROM students WHERE parent_id = auth.uid())
    );

-- exercise_sessions: accessible by self or parent
CREATE POLICY "sessions_select_self_or_parent"
    ON exercise_sessions
    FOR SELECT
    TO authenticated
    USING (
        student_id = auth.uid()
        OR student_id IN (SELECT id FROM students WHERE parent_id = auth.uid())
    );

CREATE POLICY "sessions_insert_self_or_parent"
    ON exercise_sessions
    FOR INSERT
    TO authenticated
    WITH CHECK (
        student_id = auth.uid()
        OR student_id IN (SELECT id FROM students WHERE parent_id = auth.uid())
    );

-- ============================================================
-- TRIGGER: auto-update updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_progress_updated_at
    BEFORE UPDATE ON student_topic_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
