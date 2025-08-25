import CropProductivityChart from "@/components/CropProductivityChart";
import { ExpensePieChart } from "@/components/ExpensePieChart";
import { FertilizerUsageTable } from "@/components/FertilizerUsageTable";
import PriceAmountLineChart from "@/components/PriceAmountLineChart";
import ProfitStackChart from "@/components/ProfitStackChart";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCropFilter } from "@/contexts/CropFilterContext";
import { useYearFilter } from "@/contexts/YearFilterContext";
import { getCrops } from "@/services/cropService";
import { getExpenses } from "@/services/expenseService";
import { getFertilizerPlans } from "@/services/fertilizerService";
import { getIncome } from "@/services/incomeService";
import type { Crop, Expense, FertilizerPlan, Income } from "@/types";
import {
  Chart as ChartJS,
  registerables
} from "chart.js";
import { AlertCircle, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";


ChartJS.register(...registerables);
// Function to process data for the chart
// const processChartData = (income: Income[], expenses: Expense[]) => {
//   const profitsByYearAndCrop: {
//     [year: string]: { [cropName: string]: { income: number; expense: number } };
//   } = {};

//   // Process income
//   income.forEach((inc) => {
//     const year = new Date(inc.income_date).getFullYear().toString();
//     const cropName = inc.crops?.name || "Uncategorized";
//     if (!profitsByYearAndCrop[year]) profitsByYearAndCrop[year] = {};
//     if (!profitsByYearAndCrop[year][cropName])
//       profitsByYearAndCrop[year][cropName] = { income: 0, expense: 0 };
//     profitsByYearAndCrop[year][cropName].income += inc.sub_total;
//   });

//   // Process expenses
//   expenses.forEach((exp) => {
//     const year = new Date(exp.expense_date).getFullYear().toString();
//     const cropName = exp.crops?.name || "Uncategorized";
//     if (!profitsByYearAndCrop[year]) profitsByYearAndCrop[year] = {};
//     if (!profitsByYearAndCrop[year][cropName])
//       profitsByYearAndCrop[year][cropName] = { income: 0, expense: 0 };
//     profitsByYearAndCrop[year][cropName].expense += exp.amount;
//   });

//   const years = Object.keys(profitsByYearAndCrop).sort();
//   const cropNames = [
//     ...new Set([
//       ...income.map((i) => i.crops?.name),
//       ...expenses.map((e) => e.crops?.name),
//     ]),
//   ].filter(Boolean) as string[];

//   const datasets = cropNames.map((cropName, index) => {
//     const data = years.map((year) => {
//       const yearData = profitsByYearAndCrop[year];
//       if (yearData && yearData[cropName]) {
//         return yearData[cropName].income - yearData[cropName].expense;
//       }
//       return 0;
//     });

//     const colorValue = (index * 50) % 255;
//     return {
//       label: `${cropName} Profit`,
//       data,
//       backgroundColor: `rgba(${colorValue}, 99, 132, 0.5)`,
//     };
//   });

//   return {
//     labels: years,
//     datasets,
//   };
// };

const DashboardPage = () => {
  const [income, setIncome] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [fertilizerPlan, setfertilizerPlan] = useState<FertilizerPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [incomeData, expensesData, cropsData, fertilizerPlanData] =
          await Promise.all([
            getIncome(),
            getExpenses(),
            getCrops(),
            getFertilizerPlans(),
          ]);
        setIncome(incomeData as unknown as Income[]);
        setExpenses(expensesData as unknown as Expense[]);
        setCrops(cropsData as unknown as Crop[]);
        setfertilizerPlan(fertilizerPlanData as unknown as FertilizerPlan[]);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const { selectedYear, isAllYears } = useYearFilter();
  const { selectedCropId } = useCropFilter();

  // Filter data by year and crop
  const filteredIncome = useMemo(() => {
    let filtered = income;

    if (!isAllYears) {
      filtered = filtered.filter(
        (inc) => new Date(inc.income_date).getFullYear() === selectedYear
      );
    }

    if (selectedCropId) {
      filtered = filtered.filter((inc) => inc.crop_id === selectedCropId);
    }

    return filtered;
  }, [income, selectedYear, isAllYears, selectedCropId]);

  const filteredExpenses = useMemo(() => {
    let filtered = expenses;

    if (!isAllYears) {
      filtered = filtered.filter(
        (exp) => new Date(exp.expense_date).getFullYear() === selectedYear
      );
    }

    if (selectedCropId) {
      filtered = filtered.filter((exp) => exp.crop_id === selectedCropId);
    }

    return filtered;
  }, [expenses, selectedYear, isAllYears, selectedCropId]);

  const totalIncome = filteredIncome.reduce((acc, curr) => acc + curr.sub_total, 0);
  const totalExpenses = filteredExpenses.reduce(
    (acc, curr) => acc + curr.total,
    0
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-4 w-48 mb-4" />
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your farm's financial performance
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ฿{totalIncome.toLocaleString("en-US")}
            </div>
            <p className="text-xs text-muted-foreground">
              From {income.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ฿{totalExpenses.toLocaleString("en-US")}
            </div>
            <p className="text-xs text-muted-foreground">
              From {expenses.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">฿</div>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                totalIncome - totalExpenses >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              ฿{(totalIncome - totalExpenses).toLocaleString("en-US")}
            </div>
            <p
              className={`text-xs ${
                totalIncome - totalExpenses >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {totalIncome - totalExpenses >= 0 ? "Profitable" : "Loss"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profit Chart */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Profit by Crop and Year</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[400px]">
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => `$${value}`,
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      position: "bottom",
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => `$${context.parsed.y}`,
                      },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card> */}
        <Card>
          <CardHeader>
            <CardTitle>Profit by Crop and Year</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfitStackChart
              expenses={filteredExpenses}
              income={filteredIncome}
            ></ProfitStackChart>
          </CardContent>
        </Card>
        {/* Expense Treemap */}
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpensePieChart expenses={filteredExpenses} />
          </CardContent>
        </Card>
        {/* Income Price/amount */}
        <Card>
          <CardHeader>
            <CardTitle>Price/Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <PriceAmountLineChart filteredIncome={filteredIncome} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Crop Productivity</CardTitle>
          </CardHeader>
          <CardContent>
            <CropProductivityChart incomeData={filteredIncome} crops={crops} />
          </CardContent>
        </Card>
        {/* Income each year */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Income Each year</CardTitle>
          </CardHeader>
          <CardContent>
            <YearlyIncomeChart income={filteredIncome} />
          </CardContent>
        </Card> */}
      </div>

      {/* Fertilizer Usage Table */}
      <Card>
        <CardHeader>
          <CardTitle>Fertilizer Usage per Tree</CardTitle>
        </CardHeader>
        <CardContent>
          <FertilizerUsageTable
            fertilizerPlans={fertilizerPlan}
            crops={crops}
          />
        </CardContent>
      </Card>

      <div className="p-5"></div>
    </div>
  );
};
export default DashboardPage;
