import { supabase } from '@/lib/supabaseClient';
import { ExpenseFormData } from '@/types';
import { findOrCreateCategory } from './categoryService';

const TABLE_NAME = 'expenses';

export const getExpenses = async () => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session) {
    throw new Error('User not authenticated');
  }
  const userId = sessionData.session.user.id;

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select(`
      id,
      created_at,
      expense_date,
      amount,
      detail,
      crop_id,
      crops ( name ),
      category_id,
      categories ( name )
    `)
    .eq('user_id', userId)
    .order('expense_date', { ascending: false });

  if (error) throw error;
  return data;
};

export const createExpense = async (formData: ExpenseFormData) => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session) {
    throw new Error('User not authenticated');
  }
  const userId = sessionData.session.user.id;

  // Find or create the category and get its ID
  const category = await findOrCreateCategory(formData.category_name, 'expense');

  const expenseData = {
    user_id: userId,
    crop_id: formData.crop_id,
    amount: formData.amount,
    detail: formData.detail,
    expense_date: formData.expense_date,
    category_id: category?.id,
  };

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(expenseData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteExpense = async (id: string) => {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id);

  if (error) throw error;
};
