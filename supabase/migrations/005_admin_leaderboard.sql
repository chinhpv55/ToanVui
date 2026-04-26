-- ============================================================
-- Migration 005: Admin panel + Weekly Leaderboard support
-- ============================================================
-- Adds 2 SECURITY DEFINER functions that the app calls via supabase.rpc():
--   - admin_list_users()         → admin panel user list (admin-only)
--   - get_weekly_leaderboard()   → weekly stars ranking by grade
-- ============================================================

-- ── Idempotent cleanup ──
DROP FUNCTION IF EXISTS public.admin_list_users();
DROP FUNCTION IF EXISTS public.get_weekly_leaderboard(INT);

-- ============================================================
-- Admin: list all users with plan + email + linked student
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE(
    user_id UUID,
    email TEXT,
    plan plan_enum,
    is_admin BOOLEAN,
    exercise_count INT,
    trial_started_at TIMESTAMPTZ,
    activated_at TIMESTAMPTZ,
    suspended_at TIMESTAMPTZ,
    notes TEXT,
    student_name TEXT,
    student_grade INT,
    student_username TEXT,
    created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $admin_list_body$
    SELECT
        ua.user_id,
        au.email::TEXT,
        ua.plan,
        ua.is_admin,
        ua.exercise_count,
        ua.trial_started_at,
        ua.activated_at,
        ua.suspended_at,
        ua.notes,
        s.name::TEXT,
        s.grade,
        s.username::TEXT,
        ua.created_at
    FROM public.user_accounts ua
    JOIN auth.users au ON au.id = ua.user_id
    LEFT JOIN public.students s ON s.id = ua.user_id
    WHERE public.is_admin(auth.uid())
    ORDER BY
        CASE ua.plan WHEN 'trial' THEN 1 WHEN 'suspended' THEN 2 WHEN 'active' THEN 3 END,
        au.email;
$admin_list_body$;

GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;

-- ============================================================
-- Weekly leaderboard: top 50 students by correct answers this week
-- p_grade = 0 means "all grades", otherwise filters to that grade.
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_weekly_leaderboard(p_grade INT DEFAULT 0)
RETURNS TABLE(
    student_id UUID,
    display_name TEXT,
    avatar_url TEXT,
    avatar_id TEXT,
    grade INT,
    lifetime_stars INT,
    weekly_correct BIGINT,
    rank_position BIGINT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $leaderboard_body$
    WITH weekly AS (
        SELECT
            s.id,
            COALESCE(NULLIF(s.username, ''), 'Học sinh ' || substring(s.id::text, 1, 4))::TEXT AS display_name,
            s.avatar_url,
            s.avatar_id::TEXT,
            s.grade,
            s.total_stars,
            COUNT(es.*) FILTER (WHERE es.is_correct = true) AS weekly_correct
        FROM public.students s
        LEFT JOIN public.exercise_sessions es
          ON es.student_id = s.id
         AND es.created_at >= date_trunc('week', now())
        WHERE p_grade = 0 OR s.grade = p_grade
        GROUP BY s.id
    )
    SELECT
        id,
        display_name,
        avatar_url,
        avatar_id,
        grade,
        total_stars,
        weekly_correct,
        ROW_NUMBER() OVER (ORDER BY weekly_correct DESC, total_stars DESC) AS rank_position
    FROM weekly
    ORDER BY weekly_correct DESC, total_stars DESC
    LIMIT 50;
$leaderboard_body$;

GRANT EXECUTE ON FUNCTION public.get_weekly_leaderboard(INT) TO authenticated;
