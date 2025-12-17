import { useMemo } from 'react';
import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  LinearScale,
} from 'chart.js';
import { TreemapController, TreemapElement } from 'chartjs-chart-treemap';
import { Chart } from 'react-chartjs-2';
import type { Expense } from '@/types';

// Register the controllers and scales needed for treemap
ChartJS.register(
  LinearScale,  // Required for treemap
  Tooltip,
  Legend,
  TreemapController,
  TreemapElement,
);

interface ExpenseTreemapProps {
  expenses: Expense[];
}

export const ExpenseTreemap = ({ expenses }: ExpenseTreemapProps) => {
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
    
    // Convert to format required by treemap
    const data = Object.entries(groupedExpenses).map(([category, value]) => ({
      g: category, // g is required by treemap for grouping
      v: value,    // v is required by treemap for value
    }));

    return {
      datasets: [
        {
          tree: data,
          key: 'v',
          groups: ['g'],
          spacing: 1,
          data: data, // Required by Chart.js
          backgroundColor: (ctx: any) => {
            if (!ctx.type) return 'transparent';
            const value = ctx.raw?.v;
            const maxValue = Math.max(...data.map(d => d.v));
            const intensity = Math.round((value / maxValue) * 155) + 100;
            return `hsl(210, 70%, ${intensity}%)`;
          },
          labels: {
            display: true,
            formatter: (context: any) => {
              return [
                context.raw.g, // Category name
                new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'THB',
                }).format(context.raw.v), // Value
              ];
            },
          },
        },
      ],
    };
  }, [expenses]);

  const options = {
    plugins: {
      title: {
        display: true,
        text: 'Expenses by Category',
      },
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: (context: any[]) => context[0].raw.g,
          label: (context: any) => {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'THB',
            }).format(context.raw.v);
          },
        },
      },
    },
  };

  return (
    <div className="h-[400px] w-full">
      <Chart type="treemap" data={chartData} options={options} />
    </div>
  );
};
