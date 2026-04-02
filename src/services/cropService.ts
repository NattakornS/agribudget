import { supabase } from "@/lib/supabaseClient";
import type { CropFormData } from "@/types";
import { getAcceptedSharedCrops } from "@/services/cropShareService";

const TABLE_NAME = "crops";

const CROP_SELECT = `
  id,
  user_id,
  created_at,
  updated_at,
  name,
  location,
  area,
  amount,
  started_date,
  latitude,
  longitude,
  crop_type ( id, name, image )
`;

let inFlightGetCrops: Promise<any> | null = null;

export const getCrops = async () => {
  if (inFlightGetCrops) return inFlightGetCrops;

  inFlightGetCrops = (async () => {
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      throw new Error("User not authenticated");
    }
    const userId = sessionData.session.user.id;

    const [ownedResult, sharedCrops] = await Promise.all([
      supabase
        .from(TABLE_NAME)
        .select(CROP_SELECT)
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      getAcceptedSharedCrops(),
    ]);

    if (ownedResult.error) throw ownedResult.error;

    const owned = (ownedResult.data ?? []).map((c: any) => ({ ...c, _shared: false }));
    return [...owned, ...sharedCrops];
  })().finally(() => {
    inFlightGetCrops = null;
  });

  return inFlightGetCrops;
};

export const createCrop = async (cropData: CropFormData) => {
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();
  if (sessionError || !sessionData.session) {
    throw new Error("User not authenticated");
  }
  const userId = sessionData.session.user.id;

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert([{ ...cropData, user_id: userId }])
    .select();

  if (error) throw error;
  return data[0];
};

export const updateCrop = async (
  id: string,
  cropData: Partial<CropFormData>
) => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({ ...cropData, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select();

  if (error) throw error;
  return data[0];
};

export const deleteCrop = async (id: string) => {
  const { error } = await supabase.from(TABLE_NAME).delete().eq("id", id);

  if (error) throw error;
};
