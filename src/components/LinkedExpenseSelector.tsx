import ExpenseAddDialogNew from "@/components/ExpenseAddDialogNew";
import { useState, useMemo, useEffect } from "react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Expense, Crop, ExpenseFormData } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus, Calendar, ListChecks, ListTodo } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { createExpense } from "@/services/expenseService";


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
  const [isManualTotal, setIsManualTotal] = useState(false);

  const {t} = useLanguage();

  const getExpenseSchema = (t: (key: string) => string) => z.object({
    crop_id: z.string().min(1, t('pleaseSelectCrop')),
    cost: z.number().positive(t('costMustBePositive')),
    unit: z.string().optional(),
    amount: z.number().positive(t('amountMustBePositive')),
    total: z.number().positive(t('totalMustBePositive')),
    expense_date: z.string().min(1, t('dateRequired')),
    category_name: z.string().min(1, t('categoryRequired')),
    detail: z.string().optional(),
  });

  const defaultValues: ExpenseFormData = {
    expense_date: new Date().toISOString().split('T')[0],
    cost: 0,
    unit: '',
    amount: 0,
    total: 0,
    crop_id: '',
    category_name: '',
    detail: ''
  };

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ExpenseFormData>({
    resolver: zodResolver(getExpenseSchema(t)),
    defaultValues
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
          expense.total?.toString().includes(query)
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

  

  const handleSelectAll = () => {
    const allExpenseIds = filteredAndSortedExpenses.map((expense) => expense.id);
    onSelectionChange(allExpenseIds);
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

    // Watch cost and amount for automatic calculation
  const watchedCost = watch('cost');
  const watchedAmount = watch('amount');
  // Auto-calculate total when cost or amount changes, unless manually overridden
  useEffect(() => {
    if (!isManualTotal && watchedCost && watchedAmount) {
      const calculatedTotal = watchedCost * watchedAmount;
      setValue('total', calculatedTotal);
    }
  }, [watchedCost, watchedAmount, isManualTotal, setValue]);
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{t('linkedExpenses')} {t('optional')}</Label>
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setIsAddDialogOpen(true)
              setIsManualTotal(false);
              reset(defaultValues);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
          </Button>
          <ExpenseAddDialogNew
            isOpen={isAddDialogOpen}
            onClose={() => {
              setIsAddDialogOpen(false);
              setIsManualTotal(false);
              reset(defaultValues);
            }}
            onSave={handleSubmit((data: ExpenseFormData) => {
              createExpense(data);
              onExpenseAdded();
              setIsAddDialogOpen(false);
              reset(defaultValues);
              setIsManualTotal(false);
            })}
            onDelete={() => {}}
            title={t('addExpense')}
            crops={crops}
            register={register}
            watch={watch}
            setValue={setValue}
            errors={errors}
            isManualTotal={isManualTotal}
            setIsManualTotal={setIsManualTotal}
          />
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
              {selectedExpenseIds.length} {t('itemSelected')}
              {selectedExpenseIds.length > 0 && (
                <span className="ml-2">
                  ({t('total')}: ฿
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
                              ฿{expense.total?.toLocaleString("en-US")}
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
