import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Crop, Expense, ExpenseFormData } from '@/types';
import { getCrops } from '@/services/cropService';
import { getExpenses, createExpense, deleteExpense, updateExpense } from '@/services/expenseService';
import { useCropFilter } from '@/contexts/CropFilterContext';
import { useYearFilter } from '@/contexts/YearFilterContext';
import { useLanguage } from '@/contexts/LanguageContext';
import FloatingActionButton from '@/components/FloatingActionButton';
import RecordList from '@/components/RecordList';
import ExpenseAddDialogNew from '@/components/ExpenseAddDialogNew';
import CategoryFilter from '@/components/CategoryFilter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Calendar, AlertCircle } from 'lucide-react';

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

const ExpensePage = () => {
  const { t } = useLanguage();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(t('all'));
  
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
    resolver: zodResolver(getExpenseSchema(t)),
    defaultValues
  });

  const [isManualTotal, setIsManualTotal] = useState(false);

  // Watch cost and amount for automatic calculation
  const watchedCost = watch('cost');
  const watchedAmount = watch('amount');


  // Extract unique categories from expenses
  const expenseCategories = useMemo(() => {
    const uniqueCategories = [...new Set(expenses.map(expense => expense.categories?.name).filter(Boolean))];
    return uniqueCategories.map((name, index) => ({
      id: `category-${index}`,
      name: name || t('uncategorized'),
      color: ['green', 'blue', 'red', 'yellow', 'purple', 'orange'][index % 6]
    }));
  }, [expenses, t]);

  // Filter expenses list based on selected crop, year, and category
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const expenseYear = new Date(expense.expense_date).getFullYear();
      const matchesYear = isAllYears || expenseYear === selectedYear;
      const matchesCrop = !selectedCropId || expense.crop_id === selectedCropId;
      const matchesCategory = selectedCategory === t('all') || expense.categories?.name === selectedCategory;
      console.log(expense.categories?.name ,selectedCategory);
      
      return matchesYear && matchesCrop && matchesCategory;
    });
  }, [expenses, selectedCropId, selectedYear, isAllYears, selectedCategory]);

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
    if (window.confirm(t('areYouSureDeleteExpense'))) {
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
            {expense.categories?.name || t('uncategorized')}
          </h3>
          <Badge variant="secondary">
            {expense.crops?.name || t('noCrop')}
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
          ฿{expense.total?.toLocaleString('en-US')}
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
        <h1 className="text-3xl font-bold tracking-tight">{t('expenses')}</h1>
        <p className="text-muted-foreground">
          {t('trackAndManageExpenses')}
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Category Filter */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
        <CategoryFilter
          categories={expenseCategories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('summary')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 text-red-600">฿</div>
            <span className="text-sm text-muted-foreground">
              {selectedCropId ? t('filteredExpenses') : t('totalExpenses')}
            </span>
            <span className="text-lg font-semibold text-red-600">
              ฿{filteredExpenses.reduce((sum, expense) => sum + expense.total, 0).toLocaleString('en-US')}
            </span>
            <span className="text-sm text-muted-foreground">
              ({filteredExpenses.length} {t('records')}
              {selectedCropId && expenses.length !== filteredExpenses.length && 
                ` ${t('of')} ${expenses.length}`})
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

      <ExpenseAddDialogNew
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
        title={selectedExpense ? t('editExpense') : t('addExpense')}
        crops={crops}
        register={register}
        watch={watch}
        setValue={setValue}
        errors={errors}
        isManualTotal={isManualTotal}
        setIsManualTotal={setIsManualTotal}
      />
    </div>
  );
};

export default ExpensePage;
