import React from "react";
import type { Crop, ExpenseFormData } from "@/types";
import { createExpense } from "@/services/expenseService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const expenseSchema = z.object({
  crop_id: z.string().min(1, "Please select a crop"),
  amount: z.number().positive("Amount must be a positive number"),
  expense_date: z.string().min(1, "Date is required"),
  category_name: z.string().min(1, "Category is required"),
  detail: z.string().optional(),
  cost: z.number().optional(),
  total: z.number().optional(),
  unit: z.string().optional(),
});

interface ExpenseAddDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onExpenseAdded: () => void;
  crops: Crop[];
  initialValues?: Partial<ExpenseFormData>;
}

const ExpenseAddDialog: React.FC<ExpenseAddDialogProps> = ({
  isOpen,
  onOpenChange,
  onExpenseAdded,
  crops,
  initialValues,
}) => {
  const defaultValues: ExpenseFormData = {
    expense_date: new Date().toISOString().split("T")[0],
    amount: 0,
    cost: 0,
    total: 0,
    unit: "",
    crop_id: "",
    category_name: "",
    detail: "",
  };

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ExpenseFormData>({
    // @ts-ignore
    resolver: zodResolver(expenseSchema),
    defaultValues: { ...defaultValues, ...initialValues },
  });

  const onSubmit: SubmitHandler<ExpenseFormData> = async (data) => {
    try {
      await createExpense(data);
      onExpenseAdded();
      onOpenChange(false);
      reset(defaultValues);
    } catch (err) {
      console.error("Error creating expense:", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
        </DialogHeader>
  <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
          <div>
            <Label htmlFor="crop_id">Crop *</Label>
            <Select onValueChange={(value) => setValue("crop_id", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a crop" />
              </SelectTrigger>
              <SelectContent>
                {crops.map((crop) => (
                  <SelectItem key={crop.id} value={crop.id}>
                    {crop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.crop_id && (
              <p className="text-sm text-destructive mt-1">{errors.crop_id.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="cost">Cost *</Label>
            <Input id="cost" type="number" step="0.01" placeholder="Enter cost" {...register("cost", { valueAsNumber: true })} />
            {errors.cost && <p className="text-sm text-destructive mt-1">{errors.cost.message}</p>}
          </div>

          <div>
            <Label htmlFor="amount">Amount *</Label>
            <Input id="amount" type="number" step="0.01" placeholder="Enter amount" {...register("amount", { valueAsNumber: true })} />
            {errors.amount && <p className="text-sm text-destructive mt-1">{errors.amount.message}</p>}
          </div>

          <div>
            <Label htmlFor="unit">Unit (Optional)</Label>
            <Input id="unit" type="text" placeholder="Enter unit (e.g., kg, liters, bags)" {...register("unit")} />
          </div>

          <div>
            <Label htmlFor="total">Total (Optional)</Label>
            <Input id="total" type="number" step="0.01" placeholder="Enter total" {...register("total", { valueAsNumber: true })} />
            {errors.total && <p className="text-sm text-destructive mt-1">{errors.total.message}</p>}
          </div>

          <div>
            <Label htmlFor="expense_date">Date *</Label>
            <Input id="expense_date" type="date" {...register("expense_date")} />
            {errors.expense_date && <p className="text-sm text-destructive mt-1">{errors.expense_date.message}</p>}
          </div>

          <div>
            <Label htmlFor="category_name">Category *</Label>
            <Input id="category_name" type="text" placeholder="Enter category (e.g., Seeds, Fertilizer, Labor)" {...register("category_name")} />
            {errors.category_name && <p className="text-sm text-destructive mt-1">{errors.category_name.message}</p>}
          </div>

          <div>
            <Label htmlFor="detail">Details (Optional)</Label>
            <Textarea id="detail" placeholder="Add any additional details..." {...register("detail")} rows={3} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Add Expense</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseAddDialog;
