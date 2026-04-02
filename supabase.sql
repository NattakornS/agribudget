-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  name text NOT NULL,
  type text NOT NULL,
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.crop_types (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text,
  description text,
  image text,
  CONSTRAINT crop_types_pkey PRIMARY KEY (id)
);
CREATE TABLE public.crops (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  name text NOT NULL,
  location text,
  area numeric,
  amount integer,
  started_date date,
  latitude numeric,
  longitude numeric,
  crop_type bigint,
  CONSTRAINT crops_pkey PRIMARY KEY (id),
  CONSTRAINT crops_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT crops_crop_type_fkey FOREIGN KEY (crop_type) REFERENCES public.crop_types(id)
);
CREATE TABLE public.expenses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  amount numeric NOT NULL CHECK (amount > 0::numeric),
  detail text,
  crop_id uuid NOT NULL,
  category_id uuid,
  cost numeric,
  total numeric,
  unit text,
  CONSTRAINT expenses_pkey PRIMARY KEY (id),
  CONSTRAINT expenses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT expenses_crop_id_fkey FOREIGN KEY (crop_id) REFERENCES public.crops(id),
  CONSTRAINT expenses_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);
CREATE TABLE public.fertilize_planner (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  crop_id uuid NOT NULL,
  plan_date date NOT NULL,
  stage text,
  status text NOT NULL DEFAULT 'plan'::text,
  detail text,
  fertilizer_type text,
  amount_kg numeric,
  CONSTRAINT fertilize_planner_pkey PRIMARY KEY (id),
  CONSTRAINT fertilize_planner_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT fertilize_planner_crop_id_fkey FOREIGN KEY (crop_id) REFERENCES public.crops(id)
);
CREATE TABLE public.fertilize_planner_expenses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  plan_id uuid,
  expense_id uuid,
  user_id uuid NOT NULL,
  CONSTRAINT fertilize_planner_expenses_pkey PRIMARY KEY (id),
  CONSTRAINT fertilize_planner_expenses_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.fertilize_planner(id),
  CONSTRAINT fertilize_planner_expenses_expense_id_fkey FOREIGN KEY (expense_id) REFERENCES public.expenses(id),
  CONSTRAINT fertilize_planner_expenses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.income (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  income_date date NOT NULL DEFAULT CURRENT_DATE,
  sub_total numeric NOT NULL CHECK (sub_total >= 0::numeric),
  detail text,
  crop_id uuid NOT NULL,
  category_id uuid,
  price numeric,
  amount numeric,
  total numeric,
  unit text,
  CONSTRAINT income_pkey PRIMARY KEY (id),
  CONSTRAINT income_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT income_crop_id_fkey FOREIGN KEY (crop_id) REFERENCES public.crops(id),
  CONSTRAINT income_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);
CREATE TABLE public.income_expenses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  income_id uuid,
  expense_id uuid,
  user_id uuid NOT NULL,
  CONSTRAINT income_expenses_pkey PRIMARY KEY (id),
  CONSTRAINT income_expenses_income_id_fkey FOREIGN KEY (income_id) REFERENCES public.income(id),
  CONSTRAINT income_expenses_expense_id_fkey FOREIGN KEY (expense_id) REFERENCES public.expenses(id),
  CONSTRAINT income_expenses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.crop_shares (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  crop_id uuid NOT NULL,
  owner_user_id uuid NOT NULL,
  invitee_email text NOT NULL,
  invitee_user_id uuid,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT crop_shares_pkey PRIMARY KEY (id),
  CONSTRAINT crop_shares_crop_id_fkey FOREIGN KEY (crop_id) REFERENCES public.crops(id) ON DELETE CASCADE,
  CONSTRAINT crop_shares_owner_fkey FOREIGN KEY (owner_user_id) REFERENCES auth.users(id),
  CONSTRAINT crop_shares_invitee_fkey FOREIGN KEY (invitee_user_id) REFERENCES auth.users(id),
  CONSTRAINT crop_shares_unique UNIQUE (crop_id, invitee_email)
);
-- Indexes for crop_shares
-- CREATE INDEX ON public.crop_shares (owner_user_id);
-- CREATE INDEX ON public.crop_shares (invitee_user_id);
-- CREATE INDEX ON public.crop_shares (invitee_email);

-- RLS Policies for crop_shares (apply in Supabase dashboard):
-- ALTER TABLE public.crop_shares ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "owner read"   ON crop_shares FOR SELECT USING (owner_user_id = auth.uid());
-- CREATE POLICY "owner insert" ON crop_shares FOR INSERT WITH CHECK (owner_user_id = auth.uid());
-- CREATE POLICY "owner delete" ON crop_shares FOR DELETE USING (owner_user_id = auth.uid());
-- CREATE POLICY "invitee read" ON crop_shares FOR SELECT USING (
--   invitee_user_id = auth.uid()
--   OR invitee_email = auth.email()
-- );
-- CREATE POLICY "invitee update" ON crop_shares FOR UPDATE USING (
--   invitee_user_id = auth.uid()
--   OR invitee_email = auth.email()
-- );
-- Additional SELECT policies on crops, expenses, income, fertilize_planner:
-- CREATE POLICY "shared crop read" ON crops FOR SELECT USING (
--   EXISTS (SELECT 1 FROM crop_shares WHERE crop_shares.crop_id = crops.id
--     AND crop_shares.invitee_user_id = auth.uid() AND crop_shares.status = 'accepted')
-- );
-- CREATE POLICY "shared crop expenses read" ON expenses FOR SELECT USING (
--   EXISTS (SELECT 1 FROM crop_shares WHERE crop_shares.crop_id = expenses.crop_id
--     AND crop_shares.invitee_user_id = auth.uid() AND crop_shares.status = 'accepted')
-- );
-- CREATE POLICY "owner sees shared contributions" ON expenses FOR SELECT USING (
--   EXISTS (SELECT 1 FROM crop_shares WHERE crop_shares.crop_id = expenses.crop_id
--     AND crop_shares.owner_user_id = auth.uid() AND crop_shares.status = 'accepted')
-- );
-- (Repeat "shared crop read" and "owner sees shared contributions" for income and fertilize_planner)