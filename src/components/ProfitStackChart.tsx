import { useMemo, useRef, useEffect } from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import type { Expense, Income } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";
// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
interface IncomeBreakdownChartProps {
  income: Income[];
  expenses: Expense[];
}

const ProfitStackChart: React.FC<IncomeBreakdownChartProps> = ({
  income,
  expenses,
}) => {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | null>(null);

  // Function to process data for the stacked chart
  const processChartData = (income: Income[], expenses: Expense[]) => {
    const profitsByYearAndCrop: {
      [year: string]: {
        [cropName: string]: { income: number; expense: number };
      };
    } = {};

    // Process income
    income.forEach((inc) => {
      const year = new Date(inc.income_date).getFullYear().toString();
      const cropName = inc.crops?.name || "Uncategorized";
      if (!profitsByYearAndCrop[year]) profitsByYearAndCrop[year] = {};
      if (!profitsByYearAndCrop[year][cropName])
        profitsByYearAndCrop[year][cropName] = { income: 0, expense: 0 };
      profitsByYearAndCrop[year][cropName].income += inc.sub_total;
    });

    // Process expenses
    expenses.forEach((exp) => {
      const year = new Date(exp.expense_date).getFullYear().toString();
      const cropName = exp.crops?.name || "Uncategorized";
      if (!profitsByYearAndCrop[year]) profitsByYearAndCrop[year] = {};
      if (!profitsByYearAndCrop[year][cropName])
        profitsByYearAndCrop[year][cropName] = { income: 0, expense: 0 };
      profitsByYearAndCrop[year][cropName].expense += exp.total;
    });

    const years = Object.keys(profitsByYearAndCrop).sort();
    const cropNames = [
      ...new Set([
        ...income.map((i) => i.crops?.name),
        ...expenses.map((e) => e.crops?.name),
      ]),
    ].filter(Boolean) as string[];

    // Create datasets for expenses and profit (stacked to show total income)
    const expenseDatasets = cropNames.map((cropName, index) => {
      const data = years.map((year) => {
        const yearData = profitsByYearAndCrop[year];
        if (yearData && yearData[cropName]) {
          return Math.round(yearData[cropName].expense * 100) / 100;
        }
        return 0;
      });

      const hue = (index * 137.5) % 360; // Golden angle for good color distribution
      return {
        label: `${cropName} - Expenses`,
        data,
        backgroundColor: `hsla(${hue}, 60%, 45%, 0.8)`, // Darker shade for expenses
        borderColor: `hsl(${hue}, 60%, 35%)`,
        borderWidth: 1,
        stack: cropName, // Stack by crop name
      };
    });

    const profitDatasets = cropNames.map((cropName, index) => {
      const data = years.map((year) => {
        const yearData = profitsByYearAndCrop[year];
        if (yearData && yearData[cropName]) {
          const profit = yearData[cropName].income - yearData[cropName].expense;
          return Math.round(Math.max(0, profit) * 100) / 100; // Only show positive profit
        }
        return 0;
      });

      const hue = (index * 137.5) % 360; // Same hue as expenses but lighter
      return {
        label: `${cropName} - Profit`,
        data,
        backgroundColor: `hsla(${hue}, 70%, 65%, 0.8)`, // Lighter shade for profit
        borderColor: `hsl(${hue}, 70%, 55%)`,
        borderWidth: 1,
        stack: cropName, // Stack by crop name
      };
    });

    return {
      labels: years,
      datasets: [...expenseDatasets, ...profitDatasets],
    };
  };

  const chartData = useMemo(() => {
    return processChartData(income, expenses);
  }, [income, expenses]);

  useEffect(() => {
    if (canvasRef.current && chartData.labels.length > 0) {
      // Destroy existing chart if it exists
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        chartRef.current = new ChartJS(ctx, {
          type: "bar",
          data: chartData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: t("breakDownIncomePerYear"),
                font: {
                  size: 16,
                  weight: "bold",
                },
              },
              legend: {
                position: "bottom",
                labels: {
                  font: {
                    family: "Itim",
                  },
                  generateLabels: function (chart: any) {
                    const datasets = chart.data.datasets;
                    const cropNames = [
                      ...new Set(
                        datasets.map((d: any) => d.label?.split(" - ")[0])
                      ),
                    ] as string[];

                    return cropNames.map((cropName: string, index: number) => {
                      const hue = (index * 137.5) % 360;
                      return {
                        text: cropName || "Unknown",
                        fillStyle: `hsl(${hue}, 70%, 55%)`,
                        strokeStyle: `hsl(${hue}, 70%, 55%)`,
                        lineWidth: 1,
                        hidden: false,
                        index: index,
                      };
                    });
                  },
                },
              },
              //   tooltip: {
              //     mode: 'index',
              //     intersect: true,
              //     callbacks: {
              //       title: function(context: any) {
              //         return `Year: ${context[0].label}`;
              //       },
              //       label: function(context: any) {
              //         const value = context.parsed.y;
              //         const label = context.dataset.label;
              //         return `${label}: ฿${Number(value).toLocaleString()}`;
              //       },
              //       afterBody: function(context: any) {
              //         // Calculate total income for each crop in the tooltip
              //         const cropTotals: { [crop: string]: { expense: number, profit: number } } = {};

              //         context.forEach((item: any) => {
              //           const [cropName, type] = item.dataset.label.split(' - ');
              //           if (!cropTotals[cropName]) {
              //             cropTotals[cropName] = { expense: 0, profit: 0 };
              //           }
              //           if (type === 'Expenses') {
              //             cropTotals[cropName].expense = item.parsed.y;
              //           } else if (type === 'Profit') {
              //             cropTotals[cropName].profit = item.parsed.y;
              //           }
              //         });

              //         const summaries: string[] = [];
              //         Object.entries(cropTotals).forEach(([cropName, totals]) => {
              //           const totalIncome = totals.expense + totals.profit;
              //           if (totalIncome > 0) {
              //             summaries.push(`${cropName} Total Income: ฿${totalIncome.toLocaleString()}`);
              //           }
              //         });

              //         return summaries;
              //       },
              //     },
              //   },
            },
            scales: {
              x: {
                stacked: true,
                title: {
                  display: true,
                  text: "Year",
                  font: {
                    size: 14,
                    weight: "bold",
                  },
                },
              },
              y: {
                stacked: true,
                beginAtZero: true,
                title: {
                  display: true,
                  text: "Amount (฿)",
                  font: {
                    size: 14,
                    weight: "bold",
                  },
                },
                ticks: {
                  callback: (value: any) =>
                    `฿${Number(value).toLocaleString()}`,
                },
                grid: {
                  color: "rgba(0, 0, 0, 0.1)",
                },
              },
            },
            animation: {
              duration: 1000,
              easing: "easeInOutQuart",
            },
          },
        });
      }
    }

    // Cleanup function
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [chartData]);

  if (income.length === 0 && expenses.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        No income or expense data available
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] relative">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default ProfitStackChart;
