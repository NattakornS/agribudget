import { supabase } from '@/lib/supabaseClient';
import { FertilizerPlanFormData, PlanStatus } from '@/types';

const PLANNER_TABLE = 'fertilize_planner';
const JOIN_TABLE = 'fertilize_planner_expenses';

export const getFertilizerPlans = async () => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from(PLANNER_TABLE)
    .select(`
      *,
      crops ( name ),
      expenses ( id, expense_date, amount, detail )
    `)
    .eq('user_id', sessionData.session.user.id)
    .order('plan_date', { ascending: true });

  if (error) throw error;
  return data;
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


export const deleteFertilizerPlan = async (id: string) => {
  const { error } = await supabase
    .from(PLANNER_TABLE)
    .delete()
    .eq('id', id);

  if (error) throw error;
};
