-- ============================================================
-- Migration 004: User accounts gating (trial / active / suspended)
-- + admin role + auto-create on signup + suspend existing users
-- ============================================================
--
-- Run this AFTER 001/002/003.
-- IMPORTANT: at the bottom of this file we suspend ALL existing users
-- except chinhpv@gmail.com (admin) and chinhcom@hotmail.com (Vân Khánh).
-- Adjust the email list before running if needed.
--
-- Trial rules (enforced in app code, not DB):
--   - max 10 generate-exercise API calls (≈ 10 practice sessions)
--   - OR max 7 days from trial_started_at
--   - whichever comes first
-- ============================================================

-- ── Idempotent cleanup (safe to re-run after a failed previous attempt) ──
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TABLE IF EXISTS public.user_accounts CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.increment_exercise_count(UUID, INT);
DROP FUNCTION IF EXISTS public.is_admin(UUID);
DROP TYPE IF EXISTS plan_enum;

CREATE TYPE plan_enum AS ENUM ('trial', 'active', 'suspended');

CREATE TABLE user_accounts (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    plan plan_enum NOT NULL DEFAULT 'trial',
    trial_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    exercise_count INT NOT NULL DEFAULT 0,
    is_admin BOOLEAN NOT NULL DEFAULT false,
    activated_at TIMESTAMPTZ,
    suspended_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_accounts_plan ON user_accounts(plan);

-- ============================================================
-- Helper functions (SECURITY DEFINER bypasses RLS where needed)
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin(uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $is_admin_body$
    SELECT COALESCE(
        (SELECT is_admin FROM public.user_accounts WHERE user_id = uid),
        false
    );
$is_admin_body$;

-- Increment exercise_count atomically; bypasses RLS so a logged-in user
-- can only modify their own counter (we pass auth.uid() from the API).
CREATE OR REPLACE FUNCTION public.increment_exercise_count(uid UUID, delta INT DEFAULT 1)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $increment_body$
DECLARE
    new_count INT;
BEGIN
    UPDATE public.user_accounts
       SET exercise_count = exercise_count + delta
     WHERE user_id = uid
    RETURNING exercise_count INTO new_count;
    RETURN COALESCE(new_count, 0);
END;
$increment_body$;

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_accounts_select_self"
    ON user_accounts FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "user_accounts_select_admin"
    ON user_accounts FOR SELECT
    TO authenticated
    USING (public.is_admin(auth.uid()));

CREATE POLICY "user_accounts_update_admin"
    ON user_accounts FOR UPDATE
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- ============================================================
-- Auto-create user_accounts row when a new auth.user is created
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $new_user_body$
BEGIN
    INSERT INTO public.user_accounts (user_id, plan, trial_started_at)
    VALUES (NEW.id, 'trial', now())
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$new_user_body$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER trg_user_accounts_updated_at
    BEFORE UPDATE ON user_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Backfill: create a row for every existing auth.user
-- ============================================================

INSERT INTO public.user_accounts (user_id, plan, trial_started_at, created_at)
SELECT id, 'trial', created_at, created_at FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================
-- One-shot: suspend everyone except admin + Vân Khánh
-- ============================================================

-- Mark anh as admin + active
UPDATE public.user_accounts
   SET is_admin = true,
       plan = 'active',
       activated_at = now(),
       notes = 'Owner / admin'
 WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'chinhpv@gmail.com');

-- Activate Vân Khánh's account (family)
UPDATE public.user_accounts
   SET plan = 'active',
       activated_at = now(),
       notes = 'Vân Khánh - family'
 WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'chinhcom@hotmail.com');

-- Suspend every other existing user
UPDATE public.user_accounts
   SET plan = 'suspended',
       suspended_at = now(),
       notes = 'Auto-suspended on 2026-04-26 due to API budget exhaustion; ask admin to activate.'
 WHERE plan = 'trial'
   AND user_id NOT IN (
       SELECT id FROM auth.users
        WHERE email IN ('chinhpv@gmail.com', 'chinhcom@hotmail.com')
   );
