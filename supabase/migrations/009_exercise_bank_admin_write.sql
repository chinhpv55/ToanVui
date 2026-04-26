-- ============================================================
-- Migration 009: Admin write policies for exercise_bank
-- ============================================================
-- Migration 006 enabled RLS on exercise_bank but only added a SELECT
-- policy. With RLS on and no INSERT policy, every upsert from the
-- /api/admin/seed-bank route was silently rejected and returned
-- count=0, leaving the bank empty (0/263 topics seeded).
--
-- This migration adds INSERT/UPDATE/DELETE policies gated on
-- public.is_admin(auth.uid()) so admin-triggered seeding actually
-- writes rows.
-- ============================================================

DROP POLICY IF EXISTS "exercise_bank_insert_admin" ON public.exercise_bank;
DROP POLICY IF EXISTS "exercise_bank_update_admin" ON public.exercise_bank;
DROP POLICY IF EXISTS "exercise_bank_delete_admin" ON public.exercise_bank;

CREATE POLICY "exercise_bank_insert_admin"
    ON public.exercise_bank FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "exercise_bank_update_admin"
    ON public.exercise_bank FOR UPDATE
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "exercise_bank_delete_admin"
    ON public.exercise_bank FOR DELETE
    TO authenticated
    USING (public.is_admin(auth.uid()));
