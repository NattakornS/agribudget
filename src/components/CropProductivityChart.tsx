import { useMemo, useRef, useEffect } from "react";
import type { Crop, Income } from "@/types";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { useLanguage } from "@/contexts/LanguageContext";
interface CropProductivityChartProps {
  crops: Crop[];
  incomeData: Income[];
  selectedYear?: number; // Optional: filter by specific year
}
// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
const CropProductivityChart: React.FC<CropProductivityChartProps> = ({
  crops,
  incomeData,
  selectedYear,
}) => {
  const {t} = useLanguage()
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | null>(null);

  const chartData = useMemo(() => {
    // Create a map of crop data for quick lookup
    const cropMap = new Map(crops.map((crop) => [crop.id, crop]));

    // Group income by crop and year
    const productivityData: {
      [cropId: string]: {
        [year: string]: number;
      };
    } = {};

    incomeData.forEach((income) => {
      const crop = cropMap.get(income.crop_id);
      if (!crop || !crop.area || crop.area <= 0) return; // Skip if no crop or area data

      const year = new Date(income.income_date).getFullYear().toString();

      // Filter by selected year if provided
      if (selectedYear && year !== selectedYear.toString()) return;

      if (!productivityData[income.crop_id]) {
        productivityData[income.crop_id] = {};
      }

      if (!productivityData[income.crop_id][year]) {
        productivityData[income.crop_id][year] = 0;
      }

      productivityData[income.crop_id][year] += income.amount;
    });

    // Calculate productivity (kg per rai per year)
    const processedData: {
      cropName: string;
      year: string;
      productivity: number;
      totalAmount: number;
      areaInRai: number;
    }[] = [];

    Object.entries(productivityData).forEach(([cropId, yearData]) => {
      const crop = cropMap.get(cropId);
      if (!crop || !crop.area) return;

      const areaInRai = crop.area / 1600; // Convert square meters to rai

      Object.entries(yearData).forEach(([year, totalAmount]) => {
        const productivity = totalAmount / areaInRai;
        processedData.push({
          cropName: crop.name,
          year,
          productivity: Math.round(productivity * 100) / 100,
          totalAmount: Math.round(totalAmount * 100) / 100,
          areaInRai: Math.round(areaInRai * 100) / 100,
        });
      });
    });

    // Sort by productivity for better visualization
    processedData.sort((a, b) => b.productivity - a.productivity);

    // Prepare data for Chart.js
    // Group by year for multi-year comparison
    const years = [...new Set(processedData.map((d) => d.year))].sort();
    const cropNames = [...new Set(processedData.map((d) => d.cropName))];

    // Create datasets for each year
    const datasets = years.map((year, index) => {
      const yearColors = [
        { bg: "rgba(34, 197, 94, 0.8)", border: "#22c55e" },
        { bg: "rgba(59, 130, 246, 0.8)", border: "#3b82f6" },
        { bg: "rgba(168, 85, 247, 0.8)", border: "#a855f7" },
        { bg: "rgba(236, 72, 153, 0.8)", border: "#ec4899" },
        { bg: "rgba(251, 146, 60, 0.8)", border: "#fb923c" },
      ];

      const color = yearColors[index % yearColors.length];

      const data = cropNames.map((cropName) => {
        const record = processedData.find(
          (d) => d.cropName === cropName && d.year === year
        );
        return record ? record.productivity : 0;
      });

      return {
        label: `${t('year')} ${year}`,
        data,
        backgroundColor: color.bg,
        borderColor: color.border,
        borderWidth: 2,
      };
    });

    // Store additional data for tooltips
    const tooltipData = processedData.reduce((acc, item) => {
      const key = `${item.cropName}-${item.year}`;
      acc[key] = {
        totalAmount: item.totalAmount,
        areaInRai: item.areaInRai,
      };
      return acc;
    }, {} as Record<string, { totalAmount: number; areaInRai: number }>);

    return {
      labels: cropNames,
      datasets,
      tooltipData,
    };
  }, [crops, incomeData, selectedYear]);

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
          data: {
            labels: chartData.labels,
            datasets: chartData.datasets,
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: t('cropProductivityAnalysis'),
                font: {
                  size: 18,
                  weight: "bold",
                },
                padding: 20,
              },
              legend: {
                position: "top",
                labels: {
                  padding: 15,
                  font: {
                    size: 12,
                  },
                },
              },
              tooltip: {
                callbacks: {
                  title: function (context: any) {
                    return context[0].label;
                  },
                  label: function (context: any) {
                    const cropName = context.label;
                    const year = context.dataset.label.replace(`${t('year')} `, "");
                    const productivity = context.parsed.y;
                    const key = `${cropName}-${year}`;
                    const additionalData = chartData.tooltipData[key];

                    if (additionalData && productivity > 0) {
                      return [
                        `${context.dataset.label}: ${productivity.toLocaleString()}`,
                        // `${t('totalAmount')}: ${additionalData.totalAmount.toLocaleString()} kg`,
                        // `${t('area')}: ${additionalData.areaInRai.toLocaleString()} ${t('rai')}`,
                      ];
                    }
                    return `${
                      context.dataset.label
                    }: ${productivity.toLocaleString()} ${t('productiviityUnit')}`;
                  },
                },
                displayColors: true,
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                titleColor: "#fff",
                bodyColor: "#fff",
                borderColor: "rgba(255, 255, 255, 0.2)",
                borderWidth: 1,
                padding: 12,
                bodySpacing: 4,
                titleMarginBottom: 8,
              },
            },
            scales: {
              x: {
                display: true,
                title: {
                  display: true,
                  text: t('crops'),
                  font: {
                    size: 14,
                    weight: "bold",
                  },
                },
                ticks: {
                  maxRotation: 45,
                  minRotation: 0,
                  autoSkip: false,
                  font: {
                    size: 11,
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
                  text: `${t('productivity')} (${t('productivityUnit')})`,
                  font: {
                    size: 14,
                    weight: "bold",
                  },
                },
                ticks: {
                  callback: function (value: any) {
                    return Number(value).toLocaleString();
                  },
                  font: {
                    size: 11,
                  },
                },
                grid: {
                  color: "rgba(0, 0, 0, 0.1)",
                  // drawBorder: false
                },
                beginAtZero: true,
              },
            },
            interaction: {
              mode: "index",
              intersect: false,
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

  if (crops.length === 0 || incomeData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-2">{t('noDataAvailable')}</p>
          <p className="text-sm text-gray-500">
            {crops.length === 0 ? t('noCropsFound') : t('noIncomeDataFound')}
          </p>
        </div>
      </div>
    );
  }

  if (chartData.labels.length === 0) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-2">
            {t('insufficientData')}
          </p>
          <p className="text-sm text-gray-500">
            {t('cropsNeedAreaData')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 bg-white rounded-lg shadow-sm">
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          {t('productivityFormula')}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {t('oneRaiEquals')}
        </p>
      </div>
      <div className="w-full h-[500px] relative">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};
export default CropProductivityChart;
// Example usage with mock data
// const ExampleUsage = () => {
//   // Mock crop data
//   const mockCrops: Crop[] = [
//     {
//       id: '1',
//       created_at: '2024-01-01',
//       updated_at: '2024-01-01',
//       user_id: 'user1',
//       name: 'Rice Field A',
//       area: 3200, // 2 rai
//       started_date: '2024-01-01'
//     },
//     {
//       id: '2',
//       created_at: '2024-01-01',
//       updated_at: '2024-01-01',
//       user_id: 'user1',
//       name: 'Corn Field B',
//       area: 4800, // 3 rai
//       started_date: '2024-01-01'
//     },
//     {
//       id: '3',
//       created_at: '2024-01-01',
//       updated_at: '2024-01-01',
//       user_id: 'user1',
//       name: 'Cassava Field C',
//       area: 6400, // 4 rai
//       started_date: '2024-01-01'
//     }
//   ];

//   // Mock income data
//   const mockIncomeData: Income[] = [
//     // Rice Field A - 2024
//     { id: '1', income_date: '2024-03-15', crop_id: '1', amount: 1200, price: 15000, unit: 'kg' },
//     { id: '2', income_date: '2024-06-20', crop_id: '1', amount: 1300, price: 16000, unit: 'kg' },
//     { id: '3', income_date: '2024-09-10', crop_id: '1', amount: 1100, price: 14000, unit: 'kg' },

//     // Corn Field B - 2024
//     { id: '4', income_date: '2024-04-01', crop_id: '2', amount: 2400, price: 18000, unit: 'kg' },
//     { id: '5', income_date: '2024-08-15', crop_id: '2', amount: 2600, price: 20000, unit: 'kg' },

//     // Cassava Field C - 2024
//     { id: '6', income_date: '2024-05-10', crop_id: '3', amount: 4800, price: 9600, unit: 'kg' },
//     { id: '7', income_date: '2024-11-20', crop_id: '3', amount: 5200, price: 10400, unit: 'kg' },

//     // Some 2023 data for comparison
//     { id: '8', income_date: '2023-03-15', crop_id: '1', amount: 1000, price: 13000, unit: 'kg' },
//     { id: '9', income_date: '2023-06-20', crop_id: '1', amount: 1100, price: 14000, unit: 'kg' },
//     { id: '10', income_date: '2023-04-01', crop_id: '2', amount: 2000, price: 16000, unit: 'kg' },
//     { id: '11', income_date: '2023-05-10', crop_id: '3', amount: 4000, price: 8000, unit: 'kg' },
//   ];

//   return (
//     <div className="p-6 bg-gray-100 min-h-screen">
//       <h1 className="text-2xl font-bold mb-6">Crop Productivity Analysis</h1>
//       <CropProductivityChart
//         crops={mockCrops}
//         incomeData={mockIncomeData}
//       />
//     </div>
//   );
// };

// export default ExampleUsage;
