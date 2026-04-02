export interface Crop {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  name: string;
  location?: string | null; // Keep backward compatibility for text location
  latitude?: number | null;
  longitude?: number | null;
  area?: number | null;
  amount?: number | null;
  started_date?: string | null;
  crop_type?: CropType | null;
  _shared?: boolean; // transient flag: true when this crop is shared with the current user (not stored in DB)
}
export interface CropType {
  name?: string | null;
  description?: string | null;
  image?: string | null;
}
export type CropFormData = Omit<Crop, 'id' | 'created_at' | 'updated_at' | 'user_id'>;

export interface Category {
  id: string;
  created_at: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense';
}

export interface Expense {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  expense_date: string;
  amount: number;
  total: number;
  cost: number;
  unit?: string | null;
  detail?: string | null;
  crop_id: string;
  category_id?: string | null;
  // The following fields are for display purposes after joining tables
  crops?: { name: string };
  categories?: { name: string };
}

export type ExpenseFormData = {
  expense_date: string;
  cost: number;
  unit?: string;
  amount: number;
  total: number;
  detail?: string;
  crop_id: string;
  // For the form, we'll handle category as a string
  // and find/create the ID in the background
  category_name: string;
};

export interface Income {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  income_date: string;
  sub_total: number;
  total: number;
  amount: number;
  price: number;
  unit?: string | null;
  detail?: string | null;
  crop_id: string;
  category_id?: string | null;
  // For display
  crops?: { name: string };
  categories?: { name: string };
  // This will hold the linked expenses after we fetch them
  expenses?: Expense[];
}

export type IncomeFormData = {
  income_date: string;
  price: number;
  unit?: string;
  amount: number;
  sub_total: number;
  total: number;
  detail?: string;
  crop_id: string;
  category_name: string;
  // Array of expense IDs to link
  linked_expense_ids: string[];
};

export type PlanStatus = 'plan' | 'doing' | 'complete';

export interface FertilizerPlan {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  crop_id: string;
  plan_date: string;
  stage?: string | null;
  status: PlanStatus;
  detail?: string | null;
  fertilizer_type?: string | null;
  amount_kg?: number | null;
  // For display
  crops?: { name: string };
  // For linking
  expenses?: Expense[];
}

export type FertilizerPlanFormData = {
  crop_id: string;
  plan_date: string;
  stage?: string;
  status: PlanStatus;
  detail?: string;
  fertilizer_type?: string;
  amount_kg?: number;
  linked_expense_ids: string[];
};

export type CropShareStatus = 'pending' | 'accepted' | 'rejected';

export interface CropShare {
  id: string;
  crop_id: string;
  owner_user_id: string;
  invitee_email: string;
  invitee_user_id: string | null;
  status: CropShareStatus;
  created_at: string;
  updated_at: string;
  crops?: { id: string; name: string; crop_type?: CropType | null };
}
