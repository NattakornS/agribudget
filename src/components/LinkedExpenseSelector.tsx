import { useState, useMemo } from "react";
import type { Expense, ExpenseFormData, Crop } from "@/types";
import { createExpense } from "@/services/expenseService";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Search, Plus, Calendar, ListChecks, ListTodo } from "lucide-react";
import { useForm } from "react-hook-form";
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

interface LinkedExpenseSelectorProps {
  expenses: Expense[];
  selectedExpenseIds: string[];
  onSelectionChange: (expenseIds: string[]) => void;
  crops: Crop[];
  onExpenseAdded: () => void;
}

const LinkedExpenseSelector: React.FC<LinkedExpenseSelectorProps> = ({
  expenses,
  selectedExpenseIds,
  onSelectionChange,
  crops,
  onExpenseAdded,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const defaultValues = {
    expense_date: new Date().toISOString().split("T")[0],
    amount: 0,
    cost: 0,
    total: 0,
    unit: "",
    crop_id: "",
    category_name: "",
    detail: "",
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    // @ts-ignore - Skip type checking for resolver
    resolver: zodResolver(expenseSchema),
    defaultValues,
  });

  // Sort expenses by latest date and filter by search query
  const filteredAndSortedExpenses = useMemo(() => {
    let filtered = expenses;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = expenses.filter(
        (expense) =>
          expense.categories?.name?.toLowerCase().includes(query) ||
          expense.crops?.name?.toLowerCase().includes(query) ||
          expense.detail?.toLowerCase().includes(query) ||
          expense.total.toString().includes(query)
      );
    }

    // Sort by expense_date in descending order (latest first)
    return filtered.sort(
      (a, b) =>
        new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime()
    );
  }, [expenses, searchQuery]);

  const handleExpenseToggle = (expenseId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedExpenseIds, expenseId]);
    } else {
      onSelectionChange(selectedExpenseIds.filter((id) => id !== expenseId));
    }
  };

  const handleAddExpense = async (data: ExpenseFormData) => {
    try {
      await createExpense(data);
      onExpenseAdded();
      setIsAddDialogOpen(false);
      reset(defaultValues);
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  const handleSelectAll = () => {
    const allExpenseIds = filteredAndSortedExpenses.map(
      (expense) => expense.id
    );
    onSelectionChange(allExpenseIds);
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Link Expenses (Optional)</Label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            disabled={filteredAndSortedExpenses.length === 0}
          >
            <ListChecks />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            disabled={selectedExpenseIds.length === 0}
          >
            <ListTodo />
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={handleSubmit((data: any) => {
                  return handleAddExpense(data);
                })}
                className="space-y-4"
              >
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
                    <p className="text-sm text-destructive mt-1">
                      {errors.crop_id.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="Enter amount"
                    {...register("amount", { valueAsNumber: true })}
                  />
                  {errors.amount && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.amount.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="expense_date">Date *</Label>
                  <Input
                    id="expense_date"
                    type="date"
                    {...register("expense_date")}
                  />
                  {errors.expense_date && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.expense_date.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="category_name">Category *</Label>
                  <Input
                    id="category_name"
                    type="text"
                    placeholder="Enter category (e.g., Seeds, Fertilizer, Labor)"
                    {...register("category_name")}
                  />
                  {errors.category_name && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.category_name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="detail">Details (Optional)</Label>
                  <Textarea
                    id="detail"
                    placeholder="Add any additional details..."
                    {...register("detail")}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Add Expense</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {expenses.length > 0 && (
        <div className="space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search expenses by category, crop, details, or amount..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selection Summary */}
          {selectedExpenseIds.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {selectedExpenseIds.length} expense(s) selected
              {selectedExpenseIds.length > 0 && (
                <span className="ml-2">
                  (Total: $
                  {expenses
                    .filter((expense) =>
                      selectedExpenseIds.includes(expense.id)
                    )
                    .reduce((sum, expense) => sum + expense.total, 0)
                    .toFixed(2)}
                  )
                </span>
              )}
            </div>
          )}

          {/* Expenses List */}
          <Card>
            <CardContent className="p-0">
              <div className="max-h-64 overflow-y-auto">
                {filteredAndSortedExpenses.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    {searchQuery
                      ? "No expenses match your search."
                      : "No expenses found."}
                  </div>
                ) : (
                  <div className="space-y-0">
                    {filteredAndSortedExpenses.map((expense, index) => (
                      <div
                        key={expense.id}
                        className={`flex items-center space-x-3 p-3 hover:bg-muted/50 transition-colors ${
                          selectedExpenseIds.includes(expense.id)
                            ? "bg-primary/5 border-l-4 border-l-primary"
                            : ""
                        } ${
                          index !== filteredAndSortedExpenses.length - 1
                            ? "border-b border-border"
                            : ""
                        }`}
                      >
                        <Checkbox
                          id={expense.id}
                          checked={selectedExpenseIds.includes(expense.id)}
                          onCheckedChange={(checked) => {
                            handleExpenseToggle(expense.id, checked as boolean);
                          }}
                        />
                        <label
                          htmlFor={expense.id}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">
                                  {expense.categories?.name || "Uncategorized"}
                                </span>
                                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                  {expense.crops?.name || "No Crop"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(
                                  expense.expense_date
                                ).toLocaleDateString()}
                              </div>
                              {expense.detail && (
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {expense.detail}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-sm font-medium ml-2">
                              ฿{expense.total?.toFixed(2)}
                            </div>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {expenses.length === 0 && (
        <div className="text-center p-4 text-muted-foreground">
          <p>No expenses available to link.</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add First Expense
          </Button>
        </div>
      )}
    </div>
  );
};

export default LinkedExpenseSelector;
