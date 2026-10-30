-- ============================================================
-- supabase_policy.sql
-- Fresh RLS policies for agribudget
-- Run this in the Supabase SQL editor to apply all policies.
--
-- Access model:
--   - Owner: full CRUD on own crops and all their associated data
--   - Invitee (accepted): full CRUD on shared crops and all their data
--   - crop_shares: owner manages invites; invitee can accept/reject only
-- ============================================================

-- ------------------------------------------------------------
-- Helper function
-- Returns true if the current user is the crop owner OR an
-- accepted invitee of the given crop.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_crop_member(p_crop_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    EXISTS (
      SELECT 1 FROM public.crops
      WHERE id = p_crop_id AND user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.crop_shares
      WHERE crop_id = p_crop_id
        AND invitee_user_id = auth.uid()
        AND status = 'accepted'
    );
$$;

-- ============================================================
-- Enable RLS
-- ============================================================
ALTER TABLE public.categories               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_shares              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fertilize_planner        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fertilize_planner_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_expenses          ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Drop existing policies (clean slate)
-- ============================================================
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'categories', 'crops', 'crop_shares',
        'expenses', 'income',
        'fertilize_planner', 'fertilize_planner_expenses',
        'income_expenses'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- ============================================================
-- CATEGORIES
-- Own: full CRUD
-- Shared: SELECT only (to display category names on shared-crop records)
-- ============================================================
CREATE POLICY "categories_select"
  ON public.categories FOR SELECT
  USING (
    user_id = auth.uid()
    -- Category referenced by an expense or income on a crop the user has access to
    OR EXISTS (
      SELECT 1 FROM public.expenses e
      WHERE e.category_id = categories.id
        AND public.is_crop_member(e.crop_id)
    )
    OR EXISTS (
      SELECT 1 FROM public.income i
      WHERE i.category_id = categories.id
        AND public.is_crop_member(i.crop_id)
    )
  );

CREATE POLICY "categories_insert"
  ON public.categories FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "categories_update"
  ON public.categories FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "categories_delete"
  ON public.categories FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================
-- CROPS
-- Own: full CRUD
-- Accepted invitee: SELECT + UPDATE (can update crop details)
-- Only owner can INSERT / DELETE
-- ============================================================
CREATE POLICY "crops_select"
  ON public.crops FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.crop_shares
      WHERE crop_id = crops.id
        AND invitee_user_id = auth.uid()
        AND status = 'accepted'
    )
  );

CREATE POLICY "crops_insert"
  ON public.crops FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "crops_update"
  ON public.crops FOR UPDATE
  USING (public.is_crop_member(crops.id));

CREATE POLICY "crops_delete"
  ON public.crops FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================
-- CROP_SHARES
-- Owner: full CRUD on shares they created
-- Invitee: SELECT + UPDATE to accept/reject their invitation
-- ============================================================
CREATE POLICY "crop_shares_select"
  ON public.crop_shares FOR SELECT
  USING (
    owner_user_id = auth.uid()
    OR invitee_user_id = auth.uid()
    OR invitee_email = auth.email()
  );

CREATE POLICY "crop_shares_insert"
  ON public.crop_shares FOR INSERT
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "crop_shares_update"
  ON public.crop_shares FOR UPDATE
  USING (
    owner_user_id = auth.uid()
    OR invitee_user_id = auth.uid()
    OR invitee_email = auth.email()
  );

CREATE POLICY "crop_shares_delete"
  ON public.crop_shares FOR DELETE
  USING (owner_user_id = auth.uid());

-- ============================================================
-- EXPENSES
-- Any crop member (owner or accepted invitee) can do full CRUD.
-- INSERT additionally enforces user_id = auth.uid().
-- ============================================================
CREATE POLICY "expenses_select"
  ON public.expenses FOR SELECT
  USING (public.is_crop_member(crop_id));

CREATE POLICY "expenses_insert"
  ON public.expenses FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND public.is_crop_member(crop_id)
  );

CREATE POLICY "expenses_update"
  ON public.expenses FOR UPDATE
  USING (public.is_crop_member(crop_id));

CREATE POLICY "expenses_delete"
  ON public.expenses FOR DELETE
  USING (public.is_crop_member(crop_id));

-- ============================================================
-- INCOME
-- Same model as expenses.
-- ============================================================
CREATE POLICY "income_select"
  ON public.income FOR SELECT
  USING (public.is_crop_member(crop_id));

CREATE POLICY "income_insert"
  ON public.income FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND public.is_crop_member(crop_id)
  );

CREATE POLICY "income_update"
  ON public.income FOR UPDATE
  USING (public.is_crop_member(crop_id));

CREATE POLICY "income_delete"
  ON public.income FOR DELETE
  USING (public.is_crop_member(crop_id));

-- ============================================================
-- FERTILIZE_PLANNER
-- Same model as expenses/income.
-- ============================================================
CREATE POLICY "fertilize_planner_select"
  ON public.fertilize_planner FOR SELECT
  USING (public.is_crop_member(crop_id));

CREATE POLICY "fertilize_planner_insert"
  ON public.fertilize_planner FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND public.is_crop_member(crop_id)
  );

CREATE POLICY "fertilize_planner_update"
  ON public.fertilize_planner FOR UPDATE
  USING (public.is_crop_member(crop_id));

CREATE POLICY "fertilize_planner_delete"
  ON public.fertilize_planner FOR DELETE
  USING (public.is_crop_member(crop_id));

-- ============================================================
-- FERTILIZE_PLANNER_EXPENSES (junction table)
-- Access is granted when the user is a member of the crop
-- associated with the referenced fertilize_planner row.
-- ============================================================
CREATE POLICY "fertilize_planner_expenses_select"
  ON public.fertilize_planner_expenses FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.fertilize_planner fp
      WHERE fp.id = plan_id
        AND public.is_crop_member(fp.crop_id)
    )
  );

CREATE POLICY "fertilize_planner_expenses_insert"
  ON public.fertilize_planner_expenses FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.fertilize_planner fp
      WHERE fp.id = plan_id
        AND public.is_crop_member(fp.crop_id)
    )
  );

CREATE POLICY "fertilize_planner_expenses_update"
  ON public.fertilize_planner_expenses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.fertilize_planner fp
      WHERE fp.id = plan_id
        AND public.is_crop_member(fp.crop_id)
    )
  );

CREATE POLICY "fertilize_planner_expenses_delete"
  ON public.fertilize_planner_expenses FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.fertilize_planner fp
      WHERE fp.id = plan_id
        AND public.is_crop_member(fp.crop_id)
    )
  );

-- ============================================================
-- INCOME_EXPENSES (junction table)
-- Access is granted when the user is a member of the crop
-- associated with the referenced income row.
-- ============================================================
CREATE POLICY "income_expenses_select"
  ON public.income_expenses FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.income i
      WHERE i.id = income_id
        AND public.is_crop_member(i.crop_id)
    )
  );

CREATE POLICY "income_expenses_insert"
  ON public.income_expenses FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.income i
      WHERE i.id = income_id
        AND public.is_crop_member(i.crop_id)
    )
  );

CREATE POLICY "income_expenses_update"
  ON public.income_expenses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.income i
      WHERE i.id = income_id
        AND public.is_crop_member(i.crop_id)
    )
  );

CREATE POLICY "income_expenses_delete"
  ON public.income_expenses FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.income i
      WHERE i.id = income_id
        AND public.is_crop_member(i.crop_id)
    )
  );

-- ============================================================
-- PUBLIC PROFILES TABLE
-- Mirrors avatar_url and nickname from auth.users so PostgREST
-- can join it directly in SELECT queries via FK.
-- Kept in sync by triggers on auth.users.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id           uuid PRIMARY KEY,
  avatar_url   text,
  display_name text
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read any profile
CREATE POLICY "profiles_select"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can only insert/update their own profile
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

-- ---- Sync trigger: upsert on auth.users INSERT / UPDATE ----
CREATE OR REPLACE FUNCTION public.sync_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, avatar_url, display_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO UPDATE SET
    avatar_url   = EXCLUDED.avatar_url,
    display_name = EXCLUDED.display_name;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_profile_on_user_change ON auth.users;
CREATE TRIGGER sync_profile_on_user_change
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_profile();

-- ---- Cleanup trigger: remove profile on auth.users DELETE ----
CREATE OR REPLACE FUNCTION public.cleanup_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.profiles WHERE id = OLD.id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS cleanup_profile_on_user_delete ON auth.users;
CREATE TRIGGER cleanup_profile_on_user_delete
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.cleanup_user_profile();

-- ---- Seed existing users ----
INSERT INTO public.profiles (id, avatar_url, display_name)
SELECT
  id,
  raw_user_meta_data->>'avatar_url',
  raw_user_meta_data->>'full_name'
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  avatar_url   = EXCLUDED.avatar_url,
  display_name = EXCLUDED.display_name;

-- ---- FKs so PostgREST can join profiles from each table ----
ALTER TABLE public.income
  ADD CONSTRAINT income_user_profile_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id);

ALTER TABLE public.expenses
  ADD CONSTRAINT expenses_user_profile_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id);

ALTER TABLE public.fertilize_planner
  ADD CONSTRAINT fertilize_planner_user_profile_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id);
