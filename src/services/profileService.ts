import { supabase } from '@/lib/supabaseClient';

export interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

export const getUserProfiles = async (userIds: string[]): Promise<UserProfile[]> => {
  if (userIds.length === 0) return [];
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, name, avatar')
    .in('id', userIds);
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    id: row.id,
    display_name: row.name,
    avatar_url: row.avatar,
  }));
};
