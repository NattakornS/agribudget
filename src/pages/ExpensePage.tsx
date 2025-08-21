import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Crop, Expense, ExpenseFormData } from '@/types';
import { getCrops } from '@/services/cropService';
import { getExpenses, createExpense, deleteExpense, updateExpense } from '@/services/expenseService';
import { useCropFilter } from '@/contexts/CropFilterContext';
import { useYearFilter } from '@/contexts/YearFilterContext';
import FloatingActionButton from '@/components/FloatingActionButton';
import RecordList from '@/components/RecordList';
import EditModal from '@/components/EditModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Calendar, AlertCircle } from 'lucide-react';

const expenseSchema = z.object({
  crop_id: z.string().min(1, 'Please select a crop'),
  cost: z.number().positive('Cost must be a positive number'),
  unit: z.string().optional(),
  amount: z.number().positive('Amount must be a positive number'),
  total: z.number().positive('Total must be a positive number'),
  expense_date: z.string().min(1, 'Date is required'),
  category_name: z.string().min(1, 'Category is required'),
  detail: z.string().optional(),
});

const ExpensePage = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  
  // Get filters from context
  const { selectedCropId } = useCropFilter();
  const { selectedYear, isAllYears } = useYearFilter();

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
    resolver: zodResolver(expenseSchema),
    defaultValues
  });

  const [isManualTotal, setIsManualTotal] = useState(false);

  // Watch cost and amount for automatic calculation
  const watchedCost = watch('cost');
  const watchedAmount = watch('amount');


  // Filter expenses list based on selected crop and year
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const expenseYear = new Date(expense.expense_date).getFullYear();
      const matchesYear = isAllYears || expenseYear === selectedYear;
      const matchesCrop = !selectedCropId || expense.crop_id === selectedCropId;
      return matchesYear && matchesCrop;
    });
  }, [expenses, selectedCropId, selectedYear, isAllYears]);

  // Auto-calculate total when cost or amount changes, unless manually overridden
  useEffect(() => {
    if (!isManualTotal && watchedCost && watchedAmount) {
      const calculatedTotal = watchedCost * watchedAmount;
      setValue('total', calculatedTotal);
    }
  }, [watchedCost, watchedAmount, isManualTotal, setValue]);

  const refreshExpenses = async () => {
    try {
      const expensesData = await getExpenses();
      setExpenses(expensesData as unknown as Expense[]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [expensesData, cropsData] = await Promise.all([getExpenses(), getCrops()]);
        setExpenses(expensesData as unknown as Expense[]);
        setCrops(cropsData);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddExpense = async (data: ExpenseFormData) => {
    try {
      await createExpense(data);
      await refreshExpenses();
      setIsModalOpen(false);
      reset(defaultValues);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateExpense = async (data: ExpenseFormData) => {
    if (!selectedExpense) return;
    try {
      await updateExpense(selectedExpense.id, data);
      await refreshExpenses();
      setIsModalOpen(false);
      setSelectedExpense(null);
      reset(defaultValues);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteExpense = async () => {
    if (!selectedExpense) return;
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(selectedExpense.id);
        await refreshExpenses();
        setIsModalOpen(false);
        setSelectedExpense(null);
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleOpenModal = (expense?: Expense) => {
    if (expense) {
      console.log(expense);
      
      setSelectedExpense(expense);
      setValue('crop_id', expense.crop_id);
      setValue('cost', expense.cost); // We don't have cost stored in Expense, so default to 0
      setValue('unit', expense.unit ||'');
      setValue('amount', expense.amount); // Default amount
      setValue('total', expense.total); // Use existing amount as total
      setValue('expense_date', expense.expense_date.split('T')[0]);
      setValue('category_name', expense.categories?.name || '');
      setValue('detail', expense.detail || '');
      setIsManualTotal(true); // When editing, assume total was manually set
    } else {
      setSelectedExpense(null);
      setIsManualTotal(false);
      reset(defaultValues);
    }
    setIsModalOpen(true);
  };
  
  // const handleDeleteWrapper = async () => {
  //   try {
  //     await handleDeleteExpense();
  //   } catch (error) {
  //     // Error is already handled in handleDeleteExpense
  //   }
  // };

  const renderExpenseItem = (expense: Expense) => (
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-semibold text-foreground">
            {expense.categories?.name || 'Uncategorized'}
          </h3>
          <Badge variant="secondary">
            {expense.crops?.name || 'No Crop'}
          </Badge>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
          <Calendar className="h-3 w-3" />
          {new Date(expense.expense_date).toLocaleDateString()}
        </div>
        {expense.detail && (
          <p className="text-sm text-muted-foreground">{expense.detail}</p>
        )}
      </div>
      <div className="text-right">
        <div className="flex items-center gap-1 text-lg font-semibold text-red-600">
          ฿{expense.total?.toFixed(2)}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
        <p className="text-muted-foreground">
          Track and manage your farm expenses
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 text-red-600">฿</div>
            <span className="text-sm text-muted-foreground">
              {selectedCropId ? 'Filtered Expenses:' : 'Total Expenses:'}
            </span>
            <span className="text-lg font-semibold text-red-600">
              ฿{filteredExpenses.reduce((sum, expense) => sum + expense.total, 0).toFixed(2)}
            </span>
            <span className="text-sm text-muted-foreground">
              ({filteredExpenses.length} records
              {selectedCropId && expenses.length !== filteredExpenses.length && 
                ` of ${expenses.length}`})
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <RecordList
        records={filteredExpenses}
        onRecordClick={handleOpenModal}
        renderItem={renderExpenseItem}
      />

      <FloatingActionButton onClick={() => handleOpenModal()} />

      <EditModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedExpense(null);
          setIsManualTotal(false);
          reset(defaultValues);
        }}
        onSave={handleSubmit((data: ExpenseFormData) => {
          if (selectedExpense) {
            return handleUpdateExpense(data);
          }
          return handleAddExpense(data);
        })}
        onDelete={selectedExpense ? () => {
          void handleDeleteExpense();
        } : () => {}}
        title={selectedExpense ? 'Edit Expense' : 'Add Expense'}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Crop *</label>
            <Select value={watch('crop_id')} onValueChange={(value) => setValue('crop_id', value)}>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Cost *</label>
              <Input
                type="number"
                step="0.01"
                placeholder="Enter unit cost"
                {...register('cost', { valueAsNumber: true })}
              />
              {errors.cost && (
                <p className="text-sm text-destructive mt-1">{errors.cost.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Amount *</label>
              <Input
                type="number"
                step="0.01"
                placeholder="Enter amount"
                {...register('amount', { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="text-sm text-destructive mt-1">{errors.amount.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Unit (Optional)</label>
            <Input
              type="text"
              placeholder="Enter unit (e.g., kg, liters, bags)"
              {...register('unit')}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium">Total *</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {!isManualTotal && watchedCost && watchedAmount 
                    ? `Auto: ${watchedCost} × ${watchedAmount} = ${(watchedCost * watchedAmount).toFixed(2)}`
                    : 'Manual entry'}
                </span>
                {isManualTotal && watchedCost && watchedAmount && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsManualTotal(false);
                      setValue('total', watchedCost * watchedAmount);
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    Reset to Auto
                  </button>
                )}
              </div>
            </div>
            <Input
              type="number"
              step="0.01"
              placeholder="Enter total"
              {...register('total', { 
                valueAsNumber: true,
                onChange: () => setIsManualTotal(true)
              })}
            />
            {errors.total && (
              <p className="text-sm text-destructive mt-1">{errors.total.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Date *</label>
            <Input
              type="date"
              {...register('expense_date')}
            />
            {errors.expense_date && (
              <p className="text-sm text-destructive mt-1">{errors.expense_date.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Category *</label>
            <Input
              type="text"
              placeholder="Enter category (e.g., Seeds, Fertilizer, Equipment)"
              {...register('category_name')}
            />
            {errors.category_name && (
              <p className="text-sm text-destructive mt-1">{errors.category_name.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Details (Optional)</label>
            <Textarea
              placeholder="Add any additional details about this expense..."
              {...register('detail')}
              rows={3}
            />
            {errors.detail && (
              <p className="text-sm text-destructive mt-1">{errors.detail.message}</p>
            )}
          </div>
        </div>
      </EditModal>
    </div>
  );
};

export default ExpensePage;
