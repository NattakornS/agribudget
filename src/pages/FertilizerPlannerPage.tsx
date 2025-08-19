import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Crop, Expense, FertilizerPlan, FertilizerPlanFormData, PlanStatus } from '@/types';
import { getCrops } from '@/services/cropService';
import { getExpenses } from '@/services/expenseService';
import { getFertilizerPlans, createFertilizerPlan, deleteFertilizerPlan, updatePlanStatus } from '@/services/fertilizerService';
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
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, AlertCircle, CheckCircle2, Clock, PlayCircle } from 'lucide-react';

const planSchema = z.object({
  crop_id: z.string().min(1, 'Please select a crop'),
  plan_date: z.string().min(1, 'Date is required'),
  status: z.enum(['plan', 'doing', 'complete']),
  stage: z.string().optional(),
  fertilizer_type: z.string().optional(),
  amount_kg: z.number().positive().optional(),
  detail: z.string().optional(),
  linked_expense_ids: z.array(z.string()).default([]),
});

const FertilizerPlannerPage = () => {
  const [plans, setPlans] = useState<FertilizerPlan[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<FertilizerPlan | null>(null);
  const [selectedExpenseIds, setSelectedExpenseIds] = useState<string[]>([]);

  const defaultValues = {
    plan_date: new Date().toISOString().split('T')[0],
    status: 'plan' as PlanStatus,
    crop_id: '',
    stage: '',
    fertilizer_type: '',
    amount_kg: undefined,
    detail: '',
    linked_expense_ids: []
  };

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FertilizerPlanFormData>({
    // @ts-ignore - Skip type checking for resolver
    resolver: zodResolver(planSchema),
    defaultValues
  });

  const refreshPlans = async () => {
    try {
      const plansData = await getFertilizerPlans();
      setPlans(plansData as FertilizerPlan[]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [plansData, cropsData, expensesData] = await Promise.all([
          getFertilizerPlans(),
          getCrops(),
          getExpenses(),
        ]);
        setPlans(plansData as FertilizerPlan[]);
        setCrops(cropsData);
        // Filter for expenses that might be fertilizer-related
        const fertilizerExpenses = (expensesData as unknown as Expense[]).filter(expense =>
          expense.categories?.name?.toLowerCase().includes('fertilizer') ||
          expense.categories?.name?.toLowerCase().includes('nutrient') ||
          expense.categories?.name?.toLowerCase().includes('pesticide')
        );
        setExpenses(fertilizerExpenses);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddPlan = async (data: FertilizerPlanFormData) => {
    try {
      const formDataWithExpenses = {
        ...data,
        linked_expense_ids: selectedExpenseIds
      };
      await createFertilizerPlan(formDataWithExpenses);
      await refreshPlans();
      setIsModalOpen(false);
      setSelectedExpenseIds([]);
      reset(defaultValues);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeletePlan = async () => {
    if (!selectedPlan) return;
    if (window.confirm('Are you sure you want to delete this fertilizer plan?')) {
      try {
        await deleteFertilizerPlan(selectedPlan.id);
        await refreshPlans();
        setIsModalOpen(false);
        setSelectedPlan(null);
        setSelectedExpenseIds([]);
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleStatusChange = async (planId: string, newStatus: PlanStatus) => {
    try {
      await updatePlanStatus(planId, newStatus);
      await refreshPlans();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleOpenModal = (plan?: FertilizerPlan) => {
    if (plan) {
      setSelectedPlan(plan);
      setValue('crop_id', plan.crop_id);
      setValue('plan_date', plan.plan_date.split('T')[0]);
      setValue('status', plan.status);
      setValue('stage', plan.stage || '');
      setValue('fertilizer_type', plan.fertilizer_type || '');
      setValue('amount_kg', plan.amount_kg || undefined);
      setValue('detail', plan.detail || '');
      // Set linked expenses if available
      const linkedExpenseIds = plan.expenses?.map(exp => exp.id) || [];
      setSelectedExpenseIds(linkedExpenseIds);
    } else {
      setSelectedPlan(null);
      setSelectedExpenseIds([]);
      reset(defaultValues);
    }
    setIsModalOpen(true);
  };

  const getStatusIcon = (status: PlanStatus) => {
    switch (status) {
      case 'plan':
        return <Clock className="h-4 w-4" />;
      case 'doing':
        return <PlayCircle className="h-4 w-4" />;
      case 'complete':
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: PlanStatus) => {
    switch (status) {
      case 'plan':
        return 'bg-gray-500';
      case 'doing':
        return 'bg-blue-500';
      case 'complete':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const renderPlanItem = (plan: FertilizerPlan) => {
    return (
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-foreground">
              {plan.fertilizer_type || 'Fertilizer Application'}
            </h3>
            <Badge variant="secondary">
              {plan.crops?.name || 'No Crop'}
            </Badge>
            <Badge 
              className={`text-white ${getStatusColor(plan.status)}`}
            >
              <div className="flex items-center gap-1">
                {getStatusIcon(plan.status)}
                {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
              </div>
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
            <Calendar className="h-3 w-3" />
            {new Date(plan.plan_date).toLocaleDateString()}
          </div>
          {plan.stage && (
            <p className="text-sm text-muted-foreground mb-1">Stage: {plan.stage}</p>
          )}
          {plan.amount_kg && (
            <p className="text-sm text-muted-foreground mb-1">Amount: {plan.amount_kg} kg</p>
          )}
          {plan.detail && (
            <p className="text-sm text-muted-foreground mb-1">{plan.detail}</p>
          )}
          {plan.expenses && plan.expenses.length > 0 && (
            <div className="text-xs text-muted-foreground">
              Linked to {plan.expenses.length} expense(s)
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1">
          {plan.status !== 'complete' && (
            <div className="flex gap-1">
              {plan.status === 'plan' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(plan.id, 'doing');
                  }}
                >
                  Start
                </Button>
              )}
              {plan.status === 'doing' && (
                <Button 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(plan.id, 'complete');
                  }}
                >
                  Complete
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const getStatusCounts = () => {
    const counts = {
      plan: plans.filter(p => p.status === 'plan').length,
      doing: plans.filter(p => p.status === 'doing').length,
      complete: plans.filter(p => p.status === 'complete').length
    };
    return counts;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Fertilizer Planner</h1>
        <p className="text-muted-foreground">
          Plan and track your fertilizer applications
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Status Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-gray-500" />
              Planned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {statusCounts.plan}
            </div>
            <p className="text-sm text-muted-foreground">
              Plans to execute
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <PlayCircle className="h-5 w-5 text-blue-500" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {statusCounts.doing}
            </div>
            <p className="text-sm text-muted-foreground">
              Currently applying
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statusCounts.complete}
            </div>
            <p className="text-sm text-muted-foreground">
              Successfully applied
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Plans List */}
      <RecordList
        records={plans}
        onRecordClick={handleOpenModal}
        renderItem={renderPlanItem}
      />

      <FloatingActionButton onClick={() => handleOpenModal()} />

      <EditModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPlan(null);
          setSelectedExpenseIds([]);
          reset(defaultValues);
        }}
        onSave={handleSubmit((data: any) => {
          return handleAddPlan(data as FertilizerPlanFormData);
        })}
        onDelete={selectedPlan ? () => {
          void handleDeletePlan();
        } : () => {}}
        title={selectedPlan ? 'Edit Fertilizer Plan' : 'Add Fertilizer Plan'}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Crop *</label>
            <Select onValueChange={(value) => setValue('crop_id', value)}>
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
            <label className="text-sm font-medium">Plan Date *</label>
            <Input
              type="date"
              {...register('plan_date')}
            />
            {errors.plan_date && (
              <p className="text-sm text-destructive mt-1">{errors.plan_date.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Status *</label>
            <Select onValueChange={(value) => setValue('status', value as PlanStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="plan">Plan</SelectItem>
                <SelectItem value="doing">Doing</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-destructive mt-1">{errors.status.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Growth Stage</label>
            <Input
              placeholder="e.g., Vegetative, Flowering, Fruiting"
              {...register('stage')}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Fertilizer Type</label>
            <Input
              placeholder="e.g., NPK 10-10-10, Organic Compost"
              {...register('fertilizer_type')}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Amount (kg)</label>
            <Input
              type="number"
              step="0.1"
              placeholder="Amount in kilograms"
              {...register('amount_kg', { valueAsNumber: true })}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Details (Optional)</label>
            <Textarea
              placeholder="Add notes about application method, weather conditions, etc..."
              {...register('detail')}
              rows={3}
            />
          </div>

          {/* Linked Expenses */}
          {expenses.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Link Related Expenses (Optional)</label>
              <div className="max-h-32 overflow-y-auto space-y-2 border rounded-md p-2">
                {expenses.map((expense) => (
                  <div key={expense.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={expense.id}
                      checked={selectedExpenseIds.includes(expense.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedExpenseIds([...selectedExpenseIds, expense.id]);
                        } else {
                          setSelectedExpenseIds(selectedExpenseIds.filter(id => id !== expense.id));
                        }
                      }}
                    />
                    <label htmlFor={expense.id} className="text-sm cursor-pointer flex-1">
                      {expense.categories?.name || 'Uncategorized'} - ${expense.amount.toFixed(2)}
                      <span className="text-muted-foreground ml-2">
                        ({expense.crops?.name})
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </EditModal>
    </div>
  );
};

export default FertilizerPlannerPage;