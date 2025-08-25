import { useMemo, useRef, useEffect } from "react";
import * as Chart from "chart.js";
import type { Income } from "@/types";
interface YearlyIncomeChartProps {
  income: Income[];
}
// Register Chart.js components
Chart.Chart.register(
  Chart.CategoryScale,
  Chart.LinearScale,
  Chart.BarElement,
  Chart.Title,
  Chart.Tooltip,
  Chart.Legend
);
const YearlyIncomeChart: React.FC<YearlyIncomeChartProps> = ({ income }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart.Chart | null>(null);

  const chartData = useMemo(() => {
    // Group income by year
    const incomeByYear: { [year: string]: number } = {};

    income.forEach((inc) => {
      const year = new Date(inc.income_date).getFullYear().toString();
      if (!incomeByYear[year]) {
        incomeByYear[year] = 0;
      }
      incomeByYear[year] += inc.sub_total;
    });

    // Sort years and prepare data
    const years = Object.keys(incomeByYear).sort();
    const totalIncomes = years.map(
      (year) => Math.round(incomeByYear[year] * 100) / 100
    );

    // Generate gradient colors for bars
    const colors = years.map((_, index) => {
      const hue = (index * 137.5) % 360; // Golden angle for good color distribution
      return `hsl(${hue}, 70%, 60%)`;
    });

    const backgroundColors = colors.map((color) => color.replace("60%", "20%"));

    return {
      labels: years,
      datasets: [
        {
          label: "Total Income (฿)",
          data: totalIncomes,
          backgroundColor: backgroundColors,
          borderColor: colors,
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    };
  }, [income]);

  useEffect(() => {
    if (canvasRef.current) {
      // Destroy existing chart if it exists
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        chartRef.current = new Chart.Chart(ctx, {
          type: "bar",
          data: chartData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: "Total Income by Year",
                font: {
                  size: 16,
                  weight: "bold",
                },
              },
              legend: {
                display: false, // Hide legend since we only have one dataset
              },
              tooltip: {
                callbacks: {
                  label: function (context: any) {
                    const value = context.parsed.y;
                    return `Total Income: ฿${Number(value).toLocaleString()}`;
                  },
                },
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                titleColor: "white",
                bodyColor: "white",
                borderColor: "rgba(255, 255, 255, 0.1)",
                borderWidth: 1,
              },
            },
            scales: {
              x: {
                display: true,
                title: {
                  display: true,
                  text: "Year",
                  font: {
                    size: 14,
                    weight: "bold",
                  },
                },
                grid: {
                  display: false,
                },
              },
              y: {
                display: true,
                title: {
                  display: true,
                  text: "Total Income (฿)",
                  font: {
                    size: 14,
                    weight: "bold",
                  },
                },
                ticks: {
                  callback: function (value: any) {
                    return "฿" + Number(value).toLocaleString();
                  },
                },
                beginAtZero: true,
                grid: {
                  color: "rgba(0, 0, 0, 0.1)",
                },
              },
            },
            animation: {
              duration: 1000,
              easing: "easeInOutQuart",
            },
            // hover: {
            //   animationDuration: 200,
            // },
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

  if (income.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        No income data available
      </div>
    );
  }

  // Calculate some summary stats
  const years = Object.keys(chartData.labels || {});
  const totalAllYears = income.reduce((sum, inc) => sum + inc.sub_total, 0);
  const avgYearlyIncome = years.length > 0 ? totalAllYears / years.length : 0;

  return (
    <div className="w-full">
      {/* Summary Stats */}
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg">
          <div className="text-sm text-blue-600 font-medium">Total Years</div>
          <div className="text-xl font-bold text-blue-800">{years.length}</div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-lg">
          <div className="text-sm text-green-600 font-medium">
            Avg. Yearly Income
          </div>
          <div className="text-xl font-bold text-green-800">
            ฿{avgYearlyIncome.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-[400px] relative">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

export default YearlyIncomeChart;
