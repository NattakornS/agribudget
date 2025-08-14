import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Crop, Expense, FertilizerPlan, FertilizerPlanFormData, PlanStatus } from '@/types';
import { getCrops } from '@/services/cropService';
import { getExpenses } from '@/services/expenseService';
import { getFertilizerPlans, createFertilizerPlan, deleteFertilizerPlan, updatePlanStatus } from '@/services/fertilizerService';

const planSchema = z.object({
  crop_id: z.string().min(1, 'Please select a crop'),
  plan_date: z.string().min(1, 'Date is required'),
  status: z.enum(['plan', 'doing', 'complete']),
  stage: z.string().optional(),
  fertilizer_type: z.string().optional(),
  amount_kg: z.coerce.number().positive().optional().or(z.literal('')),
  detail: z.string().optional(),
  linked_expense_ids: z.array(z.string()).default([]),
});

const statusColumns: PlanStatus[] = ['plan', 'doing', 'complete'];

const FertilizerPlannerPage = () => {
  const [plans, setPlans] = useState<FertilizerPlan[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<FertilizerPlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      plan_date: new Date().toISOString().split('T')[0],
      status: 'plan',
    },
  });

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
        // Filter for expenses that might be fertilizer
        const fertilizerCategories = ['fertilizer', 'pesticide', 'nutrient'];
        const fertilizerExpenses = expensesData.filter(exp =>
            exp.categories?.name && fertilizerCategories.includes(exp.categories.name.toLowerCase())
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
      await createFertilizerPlan(data);
      const updatedPlans = await getFertilizerPlans();
      setPlans(updatedPlans as FertilizerPlan[]);
      reset();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (window.confirm('Are you sure?')) {
      try {
        await deleteFertilizerPlan(id);
        setPlans(plans.filter((p) => p.id !== id));
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: PlanStatus) => {
    try {
        const updatedPlan = await updatePlanStatus(id, newStatus);
        setPlans(plans.map(p => p.id === id ? {...p, status: updatedPlan.status} : p));
    } catch (err: any) {
        setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Fertilizer Planner</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit(handleAddPlan)}>
        <h2>Add New Plan</h2>
        <div>
          <label>Crop:</label>
          <select {...register('crop_id')}>
            <option value="">Select a Crop</option>
            {crops.map((crop) => <option key={crop.id} value={crop.id}>{crop.name}</option>)}
          </select>
        </div>
        <div>
          <label>Plan Date:</label>
          <input type="date" {...register('plan_date')} />
        </div>
        <div>
          <label>Status:</label>
          <select {...register('status')}>
            {statusColumns.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label>Fertilizer Type:</label>
          <input type="text" {...register('fertilizer_type')} />
        </div>
        <div>
          <label>Amount (kg):</label>
          <input type="number" step="0.1" {...register('amount_kg')} />
        </div>
        <div>
          <label>Stage:</label>
          <input type="text" {...register('stage')} />
        </div>
        <div>
          <label>Detail:</label>
          <textarea {...register('detail')}></textarea>
        </div>
        <div>
          <label>Link Fertilizer Purchase (Expense):</label>
          <select multiple {...register('linked_expense_ids')} size={5}>
            {expenses.map((expense) => (
              <option key={expense.id} value={expense.id}>
                {expense.expense_date} - ${expense.amount} ({expense.detail})
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Add Plan</button>
      </form>

      <hr />

      <div style={{ display: 'flex', gap: '16px' }}>
        {statusColumns.map(status => (
          <div key={status} style={{ flex: 1, border: '1px solid #ccc', padding: '8px' }}>
            <h2>{status.toUpperCase()}</h2>
            {plans.filter(p => p.status === status).map(plan => (
              <div key={plan.id} style={{ border: '1px solid #eee', padding: '8px', marginBottom: '8px' }}>
                <strong>{plan.plan_date}: {plan.crops?.name}</strong>
                <p>{plan.fertilizer_type} - {plan.amount_kg} kg</p>
                <p>{plan.detail}</p>

                {(plan as any).fertilize_planner_expenses?.length > 0 && (
                  <div style={{ marginTop: '8px', borderTop: '1px solid #eee', paddingTop: '4px' }}>
                    <p style={{fontSize: '0.8em', fontWeight: 'bold'}}>Linked Expenses:</p>
                    <ul style={{fontSize: '0.8em', paddingLeft: '16px', margin: 0}}>
                      {(plan as any).fertilize_planner_expenses.map((fpe: any) => (
                        <li key={fpe.expenses.id}>
                          {fpe.expenses.detail} - ${fpe.expenses.amount}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <select value={plan.status} onChange={(e) => handleStatusChange(plan.id, e.target.value as PlanStatus)}>
                    {statusColumns.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button onClick={() => handleDeletePlan(plan.id)}>Delete</button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FertilizerPlannerPage;
