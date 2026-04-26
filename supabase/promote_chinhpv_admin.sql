-- ============================================================
-- One-shot: promote chinhpv@gmail.com to admin + active.
-- ============================================================
-- Prereq: chinhpv@gmail.com đã đăng nhập app ít nhất 1 lần
-- (qua Google OAuth) để Supabase tạo row trong auth.users.
-- Chạy STEP 1 để verify, rồi chạy STEP 2 để promote.
-- ============================================================

-- ── STEP 1: verify user đã tồn tại ──
SELECT
    u.id,
    u.email,
    u.created_at,
    ua.plan,
    ua.is_admin
FROM auth.users u
LEFT JOIN public.user_accounts ua ON ua.user_id = u.id
WHERE u.email = 'chinhpv@gmail.com';
-- Nếu trả 0 row: anh chưa login Google lần nào → login trước, rồi quay lại.
-- Nếu trả 1 row với is_admin = false: chạy STEP 2.

-- ── STEP 2: promote ──
UPDATE public.user_accounts
   SET is_admin = true,
       plan = 'active',
       activated_at = COALESCE(activated_at, now()),
       suspended_at = NULL,
       notes = 'Owner / admin'
 WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'chinhpv@gmail.com');

-- Verify lại
SELECT u.email, ua.plan, ua.is_admin, ua.notes
  FROM public.user_accounts ua
  JOIN auth.users u ON u.id = ua.user_id
 WHERE u.email = 'chinhpv@gmail.com';
