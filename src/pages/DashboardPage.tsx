import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { getIncome } from '@/services/incomeService';
import { getExpenses } from '@/services/expenseService';
import { Income, Expense } from '@/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Function to process data for the chart
const processChartData = (income: Income[], expenses: Expense[]) => {
  const profitsByYearAndCrop: { [year: string]: { [cropName: string]: { income: number, expense: number } } } = {};

  // Process income
  income.forEach(inc => {
    const year = new Date(inc.income_date).getFullYear().toString();
    const cropName = inc.crops?.name || 'Uncategorized';
    if (!profitsByYearAndCrop[year]) profitsByYearAndCrop[year] = {};
    if (!profitsByYearAndCrop[year][cropName]) profitsByYearAndCrop[year][cropName] = { income: 0, expense: 0 };
    profitsByYearAndCrop[year][cropName].income += inc.sub_total;
  });

  // Process expenses
  expenses.forEach(exp => {
    const year = new Date(exp.expense_date).getFullYear().toString();
    const cropName = exp.crops?.name || 'Uncategorized';
    if (!profitsByYearAndCrop[year]) profitsByYearAndCrop[year] = {};
    if (!profitsByYearAndCrop[year][cropName]) profitsByYearAndCrop[year][cropName] = { income: 0, expense: 0 };
    profitsByYearAndCrop[year][cropName].expense += exp.amount;
  });

  const years = Object.keys(profitsByYearAndCrop).sort();
  const cropNames = [...new Set([...income.map(i => i.crops?.name), ...expenses.map(e => e.crops?.name)])].filter(Boolean) as string[];

  const datasets = cropNames.map((cropName, index) => {
    const data = years.map(year => {
      const yearData = profitsByYearAndCrop[year];
      if (yearData && yearData[cropName]) {
        return yearData[cropName].income - yearData[cropName].expense;
      }
      return 0;
    });

    const colorValue = (index * 50) % 255;
    return {
      label: `${cropName} Profit`,
      data,
      backgroundColor: `rgba(${colorValue}, 99, 132, 0.5)`,
    };
  });

  return {
    labels: years,
    datasets,
  };
};


const DashboardPage = () => {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [incomeData, expensesData] = await Promise.all([
          getIncome(),
          getExpenses(),
        ]);
        const processedData = processChartData(incomeData as Income[], expensesData as Expense[]);
        setChartData(processedData);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading Dashboard...</div>;
  if (error) return <div style={{ color: 'red' }}>Error loading data: {error}</div>;

  return (
    <div>
      <h1>Dashboard</h1>
      <h2>Yearly Profit by Crop</h2>
      {chartData && (
        <Bar
          options={{
            responsive: true,
            plugins: {
              legend: { position: 'top' as const },
              title: { display: true, text: 'Profit (Income - Expenses)' },
            },
          }}
          data={chartData}
        />
      )}
    </div>
  );
};

export default DashboardPage;
