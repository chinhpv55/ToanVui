-- ============================================================
-- Migration 010: Admin "today" stats + clear bad bank entries
-- ============================================================
-- 1) New RPC admin_today_stats() — returns # signups + # active learners
--    today (Asia/Ho_Chi_Minh timezone) for the admin dashboard.
-- 2) Clear exercise_bank entries for topic CD3-C3-01 (Các số có 4 chữ số,
--    lớp 3 Cánh Diều). Old seeds had tautological "viết số ... bằng chữ số"
--    bug — system prompt fixed in 1.5.2; need empty bank so new questions
--    seed under the new rules.
-- ============================================================

-- ── 1) Admin today stats RPC ─────────────────────────────────
DROP FUNCTION IF EXISTS public.admin_today_stats();

CREATE OR REPLACE FUNCTION public.admin_today_stats()
RETURNS TABLE(
    today_signups BIGINT,
    today_active_learners BIGINT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $today_stats_body$
    WITH today_vn AS (
        SELECT (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date AS d
    )
    SELECT
        (SELECT COUNT(*)
           FROM public.user_accounts ua, today_vn t
          WHERE (ua.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date = t.d
            AND public.is_admin(auth.uid())) AS today_signups,
        (SELECT COUNT(DISTINCT es.student_id)
           FROM public.exercise_sessions es, today_vn t
          WHERE (es.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date = t.d
            AND public.is_admin(auth.uid())) AS today_active_learners;
$today_stats_body$;

GRANT EXECUTE ON FUNCTION public.admin_today_stats() TO authenticated;

-- ── 2) Clear bad bank for CD3-C3-01 ──────────────────────────
DELETE FROM public.exercise_bank
 WHERE topic_id IN (
     SELECT id FROM public.curriculum_topics
      WHERE topic_code = 'CD3-C3-01'
 );

-- Optional: if other "Đọc, viết số" topics show same bug, admin can
-- delete more by topic_code via:
--   DELETE FROM public.exercise_bank
--    WHERE topic_id IN (
--        SELECT id FROM public.curriculum_topics
--         WHERE topic_code IN ('KN3-C8-XX','CD4-C1-XX','CD5-C1-13', ...)
--    );
