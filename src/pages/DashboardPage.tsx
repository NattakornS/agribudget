import CropProductivityChart from "@/components/CropProductivityChart";
import { ExpensePieChart } from "@/components/ExpensePieChart";
import { FertilizerUsageTable } from "@/components/FertilizerUsageTable";
import PriceAmountLineChart from "@/components/PriceAmountLineChart";
import ProfitStackChart from "@/components/ProfitStackChart";
import PageNavHeader from "@/components/PageNavHeader";
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
import { useLanguage } from "@/contexts/LanguageContext";


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
  const { t } = useLanguage();
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
  const { selectedCropId, selectedCrop } = useCropFilter();

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

  const filteredFertilizerPlans = useMemo(() => {
    let filtered = fertilizerPlan;
    
    if (!isAllYears) {
      filtered = filtered.filter(
        (plan) => new Date(plan.plan_date).getFullYear() === selectedYear
      );
    }

    if (selectedCropId) {
      filtered = filtered.filter((plan) => plan.crop_id === selectedCropId);
    }

    return filtered;
  }, [fertilizerPlan, selectedYear, isAllYears, selectedCropId]);

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
      {/* Page Header with Cover Image */}
      <PageNavHeader
        title={t('dashboard')}
        description={t('overviewOfPerformance')}
        coverImage={selectedCrop?.crop_type?.image}
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalIncome')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ฿{totalIncome.toLocaleString("en-US")}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('from')} {income.length} {t('items')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('totalExpenses')}
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ฿{totalExpenses.toLocaleString("en-US")}
            </div>
            <p className="text-xs text-muted-foreground">
               {t('from')} {expenses.length} {t('items')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('netProfit')}</CardTitle>
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
              {totalIncome - totalExpenses >= 0 ? t('profitable') : t('loss')}
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
            <CardTitle>{t('profitByCropAndYear')}</CardTitle>
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
            <CardTitle>{t('expensesByCategory')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpensePieChart expenses={filteredExpenses} />
          </CardContent>
        </Card>
        {/* Income Price/amount */}
        <Card>
          <CardHeader>
            <CardTitle>{t('priceAmount')}</CardTitle>
          </CardHeader>
          <CardContent>
            <PriceAmountLineChart filteredIncome={filteredIncome} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('cropProductivity')}</CardTitle>
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
          <CardTitle>{t('fertilizerUsagePerTree')}</CardTitle>
        </CardHeader>
        <CardContent>
          <FertilizerUsageTable
            fertilizerPlans={filteredFertilizerPlans}
            crops={crops}
          />
        </CardContent>
      </Card>

      <div className="p-5"></div>
    </div>
  );
};
export default DashboardPage;
