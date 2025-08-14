import { supabase } from '@/lib/supabaseClient';

const TABLE_NAME = 'categories';

/**
 * Finds a category by name for the current user. If it doesn't exist, it creates it.
 * @param name - The name of the category.
 * @param type - The type of the category ('income' or 'expense').
 * @returns The category object.
 */
export const findOrCreateCategory = async (name: string, type: 'income' | 'expense') => {
  if (!name) return null;

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session) {
    throw new Error('User not authenticated');
  }
  const userId = sessionData.session.user.id;

  // First, try to find the category
  const { data: existing, error: findError } = await supabase
    .from(TABLE_NAME)
    .select('id')
    .eq('user_id', userId)
    .eq('name', name)
    .eq('type', type)
    .maybeSingle();

  if (findError) throw findError;
  if (existing) return existing;

  // If not found, create it
  const { data: created, error: createError } = await supabase
    .from(TABLE_NAME)
    .insert({ name, type, user_id: userId })
    .select('id')
    .single();

  if (createError) throw createError;
  return created;
};

export const getExpenseCategories = async () => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      throw new Error('User not authenticated');
    }
    const userId = sessionData.session.user.id;

    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('id, name')
        .eq('user_id', userId)
        .eq('type', 'expense')
        .order('name', { ascending: true });

    if (error) throw error;
    return data;
}
