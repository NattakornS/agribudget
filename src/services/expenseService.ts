import { supabase } from '@/lib/supabaseClient';
import type { ExpenseFormData } from '@/types';
import { findOrCreateCategory } from './categoryService';

const TABLE_NAME = 'expenses';

let inFlightGetExpenses: Promise<any> | null = null;

export const getExpenses = async () => {
  if (inFlightGetExpenses) return inFlightGetExpenses;

  inFlightGetExpenses = (async () => {
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
        total,
        unit,
        cost,
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
  })().finally(() => {
    inFlightGetExpenses = null;
  });

  return inFlightGetExpenses;
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
    cost: formData.cost,
    unit: formData.unit,
    total: formData.total,
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

export const updateExpense = async (id: string, formData: ExpenseFormData) => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session) {
    throw new Error('User not authenticated');
  }
  const userId = sessionData.session.user.id;

  // Find or create the category and get its ID
  const category = await findOrCreateCategory(formData.category_name, 'expense');

  const expenseData = {
    crop_id: formData.crop_id,
    amount: formData.amount, // Use total as the main amount stored in DB
    total: formData.total, // Use total as the main amount stored in DB
    cost: formData.cost,
    unit: formData.unit,
    detail: formData.detail,
    expense_date: formData.expense_date,
    category_id: category?.id,
  };

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(expenseData)
    .eq('id', id)
    .eq('user_id', userId) // Ensure users can only update their own expenses
    .select(`
      id,
      created_at,
      expense_date,
      amount,
      total,
      cost,
      unit,
      detail,
      crop_id,
      crops ( name ),
      category_id,
      categories ( name )
    `)
    .single();

  if (error) throw error;
  return data;
};