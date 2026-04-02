import { supabase } from '@/lib/supabaseClient';
import type { FertilizerPlanFormData, PlanStatus } from '@/types';
import { getAcceptedSharedCropIds, getOwnedSharedCropIds } from './cropShareService';

const PLANNER_TABLE = 'fertilize_planner';
const JOIN_TABLE = 'fertilize_planner_expenses';

const PLAN_SELECT = `
  *,
  crops ( name ),
  fertilize_planner_expenses ( expenses ( id, expense_date, amount, detail ) )
`;

export const getFertilizerPlans = async () => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session) throw new Error('User not authenticated');
  const userId = sessionData.session.user.id;

  const [ownResult, sharedWithMeIds, mySharedIds] = await Promise.all([
    supabase
      .from(PLANNER_TABLE)
      .select(PLAN_SELECT)
      .eq('user_id', userId)
      .order('plan_date', { ascending: true }),
    getAcceptedSharedCropIds().catch(() => []),
    getOwnedSharedCropIds().catch(() => []),
  ]);

  if (ownResult.error) throw ownResult.error;

  const allSharedCropIds = [...new Set([...sharedWithMeIds, ...mySharedIds])];

  if (allSharedCropIds.length === 0) return ownResult.data ?? [];

  const { data: crossData, error: crossError } = await supabase
    .from(PLANNER_TABLE)
    .select(PLAN_SELECT)
    .in('crop_id', allSharedCropIds)
    .order('plan_date', { ascending: true });

  if (crossError) throw crossError;

  const seen = new Set<string>();
  return [...(ownResult.data ?? []), ...(crossData ?? [])].filter((e) => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });
};

export const createFertilizerPlan = async (formData: FertilizerPlanFormData) => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session) throw new Error('User not authenticated');
  const userId = sessionData.session.user.id;

  // 1. Prepare the main plan data
  const planData = {
    user_id: userId,
    crop_id: formData.crop_id,
    plan_date: formData.plan_date,
    stage: formData.stage,
    status: formData.status,
    detail: formData.detail,
    fertilizer_type: formData.fertilizer_type,
    amount_kg: formData.amount_kg,
  };

  // 2. Insert the plan record
  const { data: newPlan, error: planError } = await supabase
    .from(PLANNER_TABLE)
    .insert(planData)
    .select()
    .single();

  if (planError) throw planError;

  // 3. Link expenses if any
  if (formData.linked_expense_ids && formData.linked_expense_ids.length > 0) {
    const links = formData.linked_expense_ids.map(expenseId => ({
      plan_id: newPlan.id,
      expense_id: expenseId,
      user_id: userId,
    }));

    const { error: linkError } = await supabase.from(JOIN_TABLE).insert(links);
    if (linkError) throw linkError;
  }

  return newPlan;
};

export const updatePlanStatus = async (id: string, status: PlanStatus) => {
  const { data, error } = await supabase
    .from(PLANNER_TABLE)
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};


export const updateFertilizerPlan = async (id: string, formData: FertilizerPlanFormData) => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session) throw new Error('User not authenticated');
  const userId = sessionData.session.user.id;

  // 1. Update the main plan data
  const planData = {
    crop_id: formData.crop_id,
    plan_date: formData.plan_date,
    stage: formData.stage,
    status: formData.status,
    detail: formData.detail,
    fertilizer_type: formData.fertilizer_type,
    amount_kg: formData.amount_kg,
    updated_at: new Date().toISOString(),
  };

  // 2. Update the plan record
  const { data: updatedPlan, error: planError } = await supabase
    .from(PLANNER_TABLE)
    .update(planData)
    .eq('id', id)
    .select()
    .single();

  if (planError) throw planError;

  // 3. Delete existing expense links
  const { error: deleteLinksError } = await supabase
    .from(JOIN_TABLE)
    .delete()
    .eq('plan_id', id);

  if (deleteLinksError) throw deleteLinksError;

  // 4. Create new expense links if any
  if (formData.linked_expense_ids && formData.linked_expense_ids.length > 0) {
    const links = formData.linked_expense_ids.map(expenseId => ({
      plan_id: id,
      expense_id: expenseId,
      user_id: userId,
    }));

    const { error: linkError } = await supabase.from(JOIN_TABLE).insert(links);
    if (linkError) throw linkError;
  }

  return updatedPlan;
};

export const deleteFertilizerPlan = async (id: string) => {
  const { error } = await supabase
    .from(PLANNER_TABLE)
    .delete()
    .eq('id', id);

  if (error) throw error;
};
