import { supabase } from "@/lib/supabaseClient";
import type { Crop, CropShare } from "@/types";

const TABLE_NAME = "crop_shares";

const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) throw new Error("User not authenticated");
  return data.session;
};

export const inviteUserToCrop = async (
  cropId: string,
  inviteeEmail: string
): Promise<CropShare> => {
  const session = await getSession();
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert({
      crop_id: cropId,
      owner_user_id: session.user.id,
      invitee_email: inviteeEmail.toLowerCase().trim(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getSharesForCrop = async (cropId: string): Promise<CropShare[]> => {
  const session = await getSession();
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq("crop_id", cropId)
    .eq("owner_user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
};

export const revokeShare = async (shareId: string): Promise<void> => {
  const session = await getSession();
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq("id", shareId)
    .eq("owner_user_id", session.user.id);

  if (error) throw error;
};

export const getPendingInvitations = async (): Promise<CropShare[]> => {
  const session = await getSession();
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*, crops(id, name, crop_type(id, name, image))")
    .eq("invitee_user_id", session.user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
};

export const respondToInvitation = async (
  shareId: string,
  accept: boolean
): Promise<void> => {
  const { error } = await supabase
    .from(TABLE_NAME)
    .update({ status: accept ? "accepted" : "rejected", updated_at: new Date().toISOString() })
    .eq("id", shareId);

  if (error) throw error;
};

export const claimPendingInvitationsByEmail = async (
  email: string,
  userId: string
): Promise<void> => {
  const { error } = await supabase
    .from(TABLE_NAME)
    .update({ invitee_user_id: userId, updated_at: new Date().toISOString() })
    .eq("invitee_email", email.toLowerCase().trim())
    .is("invitee_user_id", null);

  if (error) throw error;
};

export const getAcceptedSharedCropIds = async (): Promise<string[]> => {
  const session = await getSession();
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("crop_id")
    .eq("invitee_user_id", session.user.id)
    .eq("status", "accepted");

  if (error) throw error;
  return (data ?? []).map((r) => r.crop_id);
};

export const getOwnedSharedCropIds = async (): Promise<string[]> => {
  const session = await getSession();
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("crop_id")
    .eq("owner_user_id", session.user.id)
    .eq("status", "accepted");

  if (error) throw error;
  return [...new Set((data ?? []).map((r) => r.crop_id))];
};

export const getAcceptedSharedCrops = async (): Promise<Crop[]> => {
  const session = await getSession();
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("crop_id, crops(id, user_id, created_at, updated_at, name, location, area, amount, started_date, latitude, longitude, crop_type(id, name, image))")
    .eq("invitee_user_id", session.user.id)
    .eq("status", "accepted");

  if (error) throw error;

  return (data ?? [])
    .map((row: any) => row.crops)
    .filter(Boolean)
    .map((crop: any) => ({ ...crop, _shared: true }));
};
