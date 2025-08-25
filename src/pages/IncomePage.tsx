import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Crop, Expense, Income, IncomeFormData } from '@/types';
import { getCrops } from '@/services/cropService';
import { getExpenses } from '@/services/expenseService';
import { getIncome, createIncome, updateIncome, deleteIncome } from '@/services/incomeService';
import { useCropFilter } from '@/contexts/CropFilterContext';
import { useYearFilter } from '@/contexts/YearFilterContext';
import FloatingActionButton from '@/components/FloatingActionButton';
import RecordList from '@/components/RecordList';
import EditModal from '@/components/EditModal';
import LinkedExpenseSelector from '@/components/LinkedExpenseSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, AlertCircle } from 'lucide-react';

const incomeSchema = z.object({
  crop_id: z.string().min(1, 'Please select a crop'),
  price: z.number().positive('Price must be a positive number'),
  unit: z.string().optional(),
  amount: z.number().positive('Amount must be a positive number'),
  sub_total: z.number(),//.positive('Sub-total must be a positive number'),
  total: z.number(),//.positive('Total must be a positive number').optional(),
  income_date: z.string().min(1, 'Date is required'),
  category_name: z.string().min(1, 'Category is required'),
  detail: z.string().optional(),
  linked_expense_ids: z.array(z.string()).optional(),
});

const IncomePage = () => {
  const [incomeList, setIncomeList] = useState<Income[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState<Income | null>(null);
  const [selectedExpenseIds, setSelectedExpenseIds] = useState<string[]>([]);
  
  // Get filters from context
  const { selectedCropId } = useCropFilter();
  const { selectedYear, isAllYears } = useYearFilter();

  const defaultValues: IncomeFormData = {
    income_date: new Date().toISOString().split('T')[0],
    price: 0,
    unit: '',
    amount: 0,
    sub_total: 0,
    total: 0,
    crop_id: '',
    category_name: '',
    detail: '',
    linked_expense_ids: []
  };

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues
  });

  const [isManualSubTotal, setIsManualSubTotal] = useState(false);

  // Watch price and amount for automatic calculation
  const watchedPrice = watch('price');
  const watchedAmount = watch('amount');
  const watchedSubTotal = watch('sub_total');

  // Calculate total expenses of selected expenses
  const selectedExpensesTotal = expenses
    .filter(expense => selectedExpenseIds.includes(expense.id))
    .reduce((sum, expense) => sum + expense.total, 0);

  // Calculate net total (sub_total - selected expenses total)
  const total = watchedSubTotal - selectedExpensesTotal;

  // Filter income list based on selected crop and year
  const filteredIncomeList = useMemo(() => {
    return incomeList.filter(income => {
      const incomeYear = new Date(income.income_date).getFullYear();
      const matchesYear = isAllYears || incomeYear === selectedYear;
      const matchesCrop = !selectedCropId || income.crop_id === selectedCropId;
      return matchesYear && matchesCrop;
    });
  }, [incomeList, selectedCropId, selectedYear, isAllYears]);

  // Auto-calculate sub_total when price or amount changes, unless manually overridden
  useEffect(() => {
    if (!isManualSubTotal && watchedPrice && watchedAmount) {
      const calculatedSubTotal = watchedPrice * watchedAmount;
      setValue('sub_total', calculatedSubTotal);
    }
  }, [watchedPrice, watchedAmount, isManualSubTotal, setValue]);

  const refreshIncome = async () => {
    try {
      const incomeData = await getIncome();
      setIncomeList(incomeData as unknown as Income[]);
    } catch (err: any) {
      setError(err.message);
    }
  };

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
        const [incomeData, cropsData, expensesData] = await Promise.all([
          getIncome(),
          getCrops(),
          getExpenses(),
        ]);
        setIncomeList(incomeData as unknown as Income[]);
        setCrops(cropsData);
        setExpenses(expensesData as unknown as Expense[]);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddIncome = async (data: IncomeFormData) => {
    try {
      const formDataWithExpenses = {
        ...data,
        linked_expense_ids: selectedExpenseIds
      };
      await createIncome(formDataWithExpenses);
      await refreshIncome();
      setIsModalOpen(false);
      setSelectedExpenseIds([]);
      reset(defaultValues);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateIncome = async (data: IncomeFormData) => {
    if (!selectedIncome) return;
    try {
      const formDataWithExpenses = {
        ...data,
        linked_expense_ids: selectedExpenseIds
      };
      await updateIncome(selectedIncome.id, formDataWithExpenses);
      await refreshIncome();
      setIsModalOpen(false);
      setSelectedIncome(null);
      setSelectedExpenseIds([]);
      reset(defaultValues);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteIncome = async () => {
    if (!selectedIncome) return;
    if (window.confirm('Are you sure you want to delete this income record?')) {
      try {
        await deleteIncome(selectedIncome.id);
        await refreshIncome();
        setIsModalOpen(false);
        setSelectedIncome(null);
        setSelectedExpenseIds([]);
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleOpenModal = (income?: Income) => {
    if (income) {
      console.log(income);
      
      setSelectedIncome(income);
      setValue('crop_id', income.crop_id);
      setValue('price', income.price); // We don't have price stored in Income, so default to 0
      setValue('unit', income.unit || '');
      setValue('amount', income.amount); // Default amount
      setValue('sub_total', income.sub_total);
      setValue('income_date', income.income_date.split('T')[0]);
      setValue('category_name', income.categories?.name || '');
      setValue('detail', income.detail || '');
      // Set linked expenses if available
      const linkedExpenseIds = income.expenses?.map(exp => exp.id) || [];
      setSelectedExpenseIds(linkedExpenseIds);
      setIsManualSubTotal(true); // When editing, assume sub_total was manually set
    } else {
      setSelectedIncome(null);
      setSelectedExpenseIds([]);
      setIsManualSubTotal(false);
      reset(defaultValues);
    }
    setIsModalOpen(true);
  };

  const getLinkedExpenses = (income: Income) => {
    return income.expenses || [];
  };

  const calculateNetIncome = (income: Income) => {
    const linkedExpenses = getLinkedExpenses(income);
    const linkedExpensesTotal = linkedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    return income.sub_total - linkedExpensesTotal;
  };

  const renderIncomeItem = (income: Income) => {
    const linkedExpenses = getLinkedExpenses(income);
    const netIncome = calculateNetIncome(income);
    
    return (
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-foreground">
              {income.categories?.name || 'Uncategorized'}
            </h3>
            <Badge variant="secondary">
              {income.crops?.name || 'No Crop'}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
            <Calendar className="h-3 w-3" />
            {new Date(income.income_date).toLocaleDateString()}
          </div>
          {income.detail && (
            <p className="text-sm text-muted-foreground mb-1">{income.detail}</p>
          )}
          {linkedExpenses.length > 0 && (
            <div className="text-xs text-muted-foreground">
              Linked to {linkedExpenses.length} expense(s)
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-lg font-semibold text-green-600 mb-1">
            ฿{income.sub_total.toFixed(2)}
          </div>
          {linkedExpenses.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Net: ฿{netIncome.toFixed(2)}
            </div>
          )}
        </div>
      </div>
    );
  };

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
        <h1 className="text-3xl font-bold tracking-tight">Income</h1>
        <p className="text-muted-foreground">
          Track and manage your farm income
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
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span className="text-sm text-muted-foreground">
              {selectedCropId ? 'Filtered Income:' : 'Total Income:'}
            </span>
            <span className="text-lg font-semibold text-green-600">
              ฿{filteredIncomeList.reduce((sum, income) => sum + income.sub_total, 0).toFixed(2)}
            </span>
            <span className="text-sm text-muted-foreground">
              ({filteredIncomeList.length} records
              {selectedCropId && incomeList.length !== filteredIncomeList.length && 
                ` of ${incomeList.length}`})
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Income List */}
      <RecordList
        records={filteredIncomeList}
        onRecordClick={handleOpenModal}
        renderItem={renderIncomeItem}
      />

      <FloatingActionButton onClick={() => handleOpenModal()} />

      <EditModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedIncome(null);
          setSelectedExpenseIds([]);
          setIsManualSubTotal(false);
          reset(defaultValues);
        }}
        onSave={handleSubmit((data: IncomeFormData) => {
          console.log(data);
          if (selectedIncome) {
            return handleUpdateIncome(data);
          }
          
          return handleAddIncome(data);
        })}
        onDelete={selectedIncome ? () => {
          void handleDeleteIncome();
        } : () => {}}
        title={selectedIncome ? 'Edit Income' : 'Add Income'}
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
              <label className="text-sm font-medium">Price *</label>
              <Input
                type="number"
                step="0.01"
                placeholder="Enter price"
                {...register('price', { valueAsNumber: true })}
              />
              {errors.price && (
                <p className="text-sm text-destructive mt-1">{errors.price.message}</p>
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
              placeholder="Enter unit (e.g., kg, tons, bags)"
              {...register('unit')}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium">Sub-total *</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {!isManualSubTotal && watchedPrice && watchedAmount 
                    ? `Auto: ${watchedPrice} × ${watchedAmount} = ${(watchedPrice * watchedAmount).toFixed(2)}`
                    : 'Manual entry'}
                </span>
                {isManualSubTotal && watchedPrice && watchedAmount && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsManualSubTotal(false);
                      setValue('sub_total', watchedPrice * watchedAmount);
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
              placeholder="Enter sub-total amount"
              {...register('sub_total', { 
                valueAsNumber: true,
                onChange: () => setIsManualSubTotal(true)
              })}
            />
            {errors.sub_total && (
              <p className="text-sm text-destructive mt-1">{errors.sub_total.message}</p>
            )}
          </div>

          {/* Total Field */}
          {(watchedSubTotal > 0 || selectedExpenseIds.length > 0) && (
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Sub-total:</span>
                  <span className="font-medium">${watchedSubTotal.toFixed(2)}</span>
                </div>
                {selectedExpenseIds.length > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Linked expenses ({selectedExpenseIds.length}):</span>
                    <span className="font-medium">-${selectedExpensesTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-base border-t pt-2">
                  <span>Net Total:</span>
                  <span className={total >= 0 ? 'text-green-600' : 'text-red-600'}>
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium">Date *</label>
            <Input
              type="date"
              {...register('income_date')}
            />
            {errors.income_date && (
              <p className="text-sm text-destructive mt-1">{errors.income_date.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Category *</label>
            <Input
              type="text"
              placeholder="Enter category (e.g., Sales, Harvest, Market)"
              {...register('category_name')}
            />
            {errors.category_name && (
              <p className="text-sm text-destructive mt-1">{errors.category_name.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Details (Optional)</label>
            <Textarea
              placeholder="Add any additional details about this income..."
              {...register('detail')}
              rows={3}
            />
          </div>

          {/* Linked Expenses */}
          <LinkedExpenseSelector
            expenses={expenses}
            selectedExpenseIds={selectedExpenseIds}
            onSelectionChange={setSelectedExpenseIds}
            crops={crops}
            onExpenseAdded={refreshExpenses}
          />
        </div>
      </EditModal>
    </div>
  );
};

export default IncomePage;