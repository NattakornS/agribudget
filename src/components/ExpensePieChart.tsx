import { useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import type { Expense } from '@/types';
import { generateColors } from '@/lib/utils';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
);

interface ExpensePieChartProps {
  expenses: Expense[];
}

export const ExpensePieChart = ({ expenses }: ExpensePieChartProps) => {
  const chartData = useMemo(() => {
    // Group expenses by category
    const groupedExpenses = expenses.reduce((acc, expense) => {
      const categoryName = expense.categories?.name || 'Uncategorized';
      if (!acc[categoryName]) {
        acc[categoryName] = 0;
      }
      acc[categoryName] += expense.amount;
      return acc;
    }, {} as Record<string, number>);
    
    const categories = Object.keys(groupedExpenses);
    const values = Object.values(groupedExpenses);
    const colors = generateColors(categories.length);

    return {
      labels: categories,
      datasets: [
        {
          data: values,
          backgroundColor: colors.map(color => color.base),
          borderColor: colors.map(color => color.border),
          borderWidth: 1,
        },
      ],
    };
  }, [expenses]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'THB',
            }).format(value)} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="h-[400px] w-full">
      <Pie data={chartData} options={options} />
    </div>
  );
};
