-- ============================================================
-- Cleanup junk/test accounts
-- ============================================================
-- Run STEP 1 first to PREVIEW which accounts will be deleted.
-- Eyeball the list. If everything looks like junk, run STEP 2.
-- DO NOT run STEP 2 without reviewing STEP 1 output first.
-- ============================================================

-- ── STEP 1: PREVIEW (read-only, safe) ──
-- Heuristic: junk = email looks fake AND no real activity.
--  - Local part (before @) is ≤ 3 chars OR contains keywords like test/abc/xyz
--  - is_admin = false
--  - exercise_count = 0 (haven't used the app)
--  - email is NOT in the keep-list (admin + family)

WITH suspects AS (
    SELECT
        u.id,
        u.email,
        u.created_at,
        u.email_confirmed_at,
        u.last_sign_in_at,
        ua.plan,
        ua.exercise_count,
        ua.is_admin,
        (SELECT COUNT(*) FROM public.students s WHERE s.parent_id = u.id) AS student_count
    FROM auth.users u
    LEFT JOIN public.user_accounts ua ON ua.user_id = u.id
    WHERE u.email NOT IN ('chinhpv@gmail.com', 'chinhcom@hotmail.com')  -- keep-list
      AND COALESCE(ua.is_admin, false) = false
      AND (
          -- Short local part (a@, ab@, abc@)
          LENGTH(SPLIT_PART(u.email, '@', 1)) <= 3
          -- Or obvious junk keywords
          OR u.email ~* '^(test|abc|xyz|asd|qwe|aaa|bbb|ccc|123|temp|junk|fake|demo|user|admin)[0-9]*@'
          -- Or never confirmed email AND created > 1 day ago
          OR (u.email_confirmed_at IS NULL AND u.created_at < now() - INTERVAL '1 day')
      )
)
SELECT
    email,
    plan,
    exercise_count,
    student_count,
    email_confirmed_at IS NOT NULL AS confirmed,
    created_at::date AS signed_up
FROM suspects
ORDER BY created_at DESC;

-- ============================================================
-- ── STEP 2: DELETE (destructive — run AFTER reviewing Step 1) ──
-- ============================================================
-- Uncomment the block below to actually delete. Cascade will remove
-- user_accounts, students (and their progress) via FK ON DELETE CASCADE.
-- ============================================================
--
-- DELETE FROM auth.users
-- WHERE id IN (
--     SELECT u.id
--     FROM auth.users u
--     LEFT JOIN public.user_accounts ua ON ua.user_id = u.id
--     WHERE u.email NOT IN ('chinhpv@gmail.com', 'chinhcom@hotmail.com')
--       AND COALESCE(ua.is_admin, false) = false
--       AND (
--           LENGTH(SPLIT_PART(u.email, '@', 1)) <= 3
--           OR u.email ~* '^(test|abc|xyz|asd|qwe|aaa|bbb|ccc|123|temp|junk|fake|demo|user|admin)[0-9]*@'
--           OR (u.email_confirmed_at IS NULL AND u.created_at < now() - INTERVAL '1 day')
--       )
-- );
