import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Crop, Expense, Income, IncomeFormData } from '@/types';
import { getCrops } from '@/services/cropService';
import { getExpenses } from '@/services/expenseService';
import { getIncome, createIncome, deleteIncome } from '@/services/incomeService';

const incomeSchema = z.object({
  crop_id: z.string().min(1, 'Please select a crop'),
  sub_total: z.coerce.number().positive('Sub-total must be a positive number'),
  income_date: z.string().min(1, 'Date is required'),
  category_name: z.string().min(1, 'Category is required'),
  detail: z.string().optional(),
  linked_expense_ids: z.array(z.string()).default([]),
});

const IncomePage = () => {
  const [incomeList, setIncomeList] = useState<Income[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      income_date: new Date().toISOString().split('T')[0],
      linked_expense_ids: [],
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [incomeData, cropsData, expensesData] = await Promise.all([
          getIncome(),
          getCrops(),
          getExpenses(),
        ]);
        setIncomeList(incomeData as Income[]);
        setCrops(cropsData);
        setExpenses(expensesData);
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
      await createIncome(data);
      // Refetch income to get the newly created one with joins
      const updatedIncome = await getIncome();
      setIncomeList(updatedIncome as Income[]);
      reset();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteIncome = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this income record?')) {
      try {
        await deleteIncome(id);
        setIncomeList(incomeList.filter((income) => income.id !== id));
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const getLinkedExpenses = (income: any) => {
    return income.income_expenses?.map((ie: any) => ie.expenses) ?? [];
  }

  const calculateTotal = (income: any) => {
    const linkedExpenses = getLinkedExpenses(income);
    const linkedExpensesTotal = linkedExpenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);
    return income.sub_total - linkedExpensesTotal;
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Income</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit(handleAddIncome)}>
        <h2>Add New Income</h2>
        <div>
          <label>Crop:</label>
          <select {...register('crop_id')}>
            <option value="">Select a Crop</option>
            {crops.map((crop) => (
              <option key={crop.id} value={crop.id}>{crop.name}</option>
            ))}
          </select>
          {errors.crop_id && <p style={{ color: 'red' }}>{errors.crop_id.message}</p>}
        </div>
        <div>
          <label>Sub-total:</label>
          <input type="number" step="0.01" {...register('sub_total')} />
          {errors.sub_total && <p style={{ color: 'red' }}>{errors.sub_total.message}</p>}
        </div>
        <div>
          <label>Date:</label>
          <input type="date" {...register('income_date')} />
          {errors.income_date && <p style={{ color: 'red' }}>{errors.income_date.message}</p>}
        </div>
        <div>
          <label>Category:</label>
          <input type="text" {...register('category_name')} />
          {errors.category_name && <p style={{ color: 'red' }}>{errors.category_name.message}</p>}
        </div>
        <div>
          <label>Detail:</label>
          <textarea {...register('detail')}></textarea>
        </div>
        <div>
          <label>Link Expenses:</label>
          <select multiple {...register('linked_expense_ids')} size={5}>
            {expenses.map((expense) => (
              <option key={expense.id} value={expense.id}>
                {expense.expense_date} - {expense.crops?.name} - ${expense.amount} ({expense.detail})
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Add Income</button>
      </form>

      <hr />

      <h2>Income Records</h2>
      <ul>
        {incomeList.map((income) => {
          const linkedExpenses = getLinkedExpenses(income);
          return (
            <li key={income.id}>
              <strong>{income.income_date}</strong>: {income.crops?.name} - <strong>Sub-total: ${income.sub_total}</strong> ({income.categories?.name})
              <p>{income.detail}</p>
              {linkedExpenses.length > 0 && (
                <div>
                  <h4>Linked Expenses:</h4>
                  <ul>
                    {linkedExpenses.map((exp: any) => (
                      <li key={exp.id}>{exp.expense_date}: {exp.detail} - ${exp.amount}</li>
                    ))}
                  </ul>
                </div>
              )}
              <h3>Net Total: ${calculateTotal(income).toFixed(2)}</h3>
              <button onClick={() => handleDeleteIncome(income.id)}>Delete</button>
            </li>
          )
        })}
      </ul>
    </div>
  );
};

export default IncomePage;
