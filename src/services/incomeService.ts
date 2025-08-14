import { supabase } from '@/lib/supabaseClient';
import { IncomeFormData } from '@/types';
import { findOrCreateCategory } from './categoryService';

const INCOME_TABLE = 'income';
const JOIN_TABLE = 'income_expenses';

export const getIncome = async () => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from(INCOME_TABLE)
    .select(`
      id,
      income_date,
      sub_total,
      detail,
      crops ( name ),
      categories ( name ),
      expenses ( id, expense_date, amount, detail, categories (name) )
    `)
    .eq('user_id', sessionData.session.user.id)
    .order('income_date', { ascending: false });

  if (error) throw error;
  return data;
};

export const createIncome = async (formData: IncomeFormData) => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session) throw new Error('User not authenticated');
  const userId = sessionData.session.user.id;

  // 1. Find or create the category
  const category = await findOrCreateCategory(formData.category_name, 'income');

  // 2. Prepare the main income data
  const incomeData = {
    user_id: userId,
    crop_id: formData.crop_id,
    sub_total: formData.sub_total,
    detail: formData.detail,
    income_date: formData.income_date,
    category_id: category?.id,
  };

  // 3. Insert the income record
  const { data: newIncome, error: incomeError } = await supabase
    .from(INCOME_TABLE)
    .insert(incomeData)
    .select()
    .single();

  if (incomeError) throw incomeError;

  // 4. If there are linked expenses, insert them into the join table
  if (formData.linked_expense_ids && formData.linked_expense_ids.length > 0) {
    const links = formData.linked_expense_ids.map(expenseId => ({
      income_id: newIncome.id,
      expense_id: expenseId,
      user_id: userId,
    }));

    const { error: linkError } = await supabase.from(JOIN_TABLE).insert(links);
    if (linkError) throw linkError;
  }

  return newIncome;
};

export const deleteIncome = async (id: string) => {
  // Deleting the income record will cascade and delete the join table entries
  const { error } = await supabase
    .from(INCOME_TABLE)
    .delete()
    .eq('id', id);

  if (error) throw error;
};
