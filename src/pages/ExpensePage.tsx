import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Crop, Expense, ExpenseFormData } from '@/types';
import { getCrops } from '@/services/cropService';
import { getExpenses, createExpense, deleteExpense } from '@/services/expenseService';

const expenseSchema = z.object({
  crop_id: z.string().min(1, 'Please select a crop'),
  amount: z.coerce.number().positive('Amount must be a positive number'),
  expense_date: z.string().min(1, 'Date is required'),
  category_name: z.string().min(1, 'Category is required'),
  detail: z.string().optional(),
});

const ExpensePage = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      expense_date: new Date().toISOString().split('T')[0], // Set default to today
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [expensesData, cropsData] = await Promise.all([getExpenses(), getCrops()]);
        setExpenses(expensesData);
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
      const newExpense = await createExpense(data);
      // Refetch expenses to get the newly created one with joins
      const updatedExpenses = await getExpenses();
      setExpenses(updatedExpenses);
      reset();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(id);
        setExpenses(expenses.filter((expense) => expense.id !== id));
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Expenses</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit(handleAddExpense)}>
        <h2>Add New Expense</h2>
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
          <label>Amount:</label>
          <input type="number" step="0.01" {...register('amount')} />
          {errors.amount && <p style={{ color: 'red' }}>{errors.amount.message}</p>}
        </div>
        <div>
          <label>Date:</label>
          <input type="date" {...register('expense_date')} />
          {errors.expense_date && <p style={{ color: 'red' }}>{errors.expense_date.message}</p>}
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
        <button type="submit">Add Expense</button>
      </form>

      <hr />

      <h2>Existing Expenses</h2>
      <ul>
        {expenses.map((expense) => (
          <li key={expense.id}>
            <strong>{expense.expense_date}</strong>: {expense.crops?.name} - <strong>${expense.amount}</strong> ({expense.categories?.name})
            <p>{expense.detail}</p>
            <button onClick={() => handleDeleteExpense(expense.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExpensePage;
