import { useMemo, useRef, useEffect } from 'react';
import * as Chart from 'chart.js';
import type { Income } from '@/types';

interface PriceAmountLineChartProps {
  filteredIncome: Income[];
}

const PriceAmountLineChart: React.FC<PriceAmountLineChartProps> = ({ 
  filteredIncome 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart.Chart | null>(null);

  const chartData = useMemo(() => {
    // Sort income by date
    const sortedIncome = [...filteredIncome].sort(
      (a, b) => new Date(a.income_date).getTime() - new Date(b.income_date).getTime()
    );

    // Group data by date and calculate averages if multiple entries per date
    const groupedData: { [date: string]: { totalAmount: number; totalPrice: number; count: number } } = {};
    
    sortedIncome.forEach(income => {
      const date = new Date(income.income_date).toLocaleDateString();
      
      if (!groupedData[date]) {
        groupedData[date] = { totalAmount: 0, totalPrice: 0, count: 0 };
      }
      
      groupedData[date].totalAmount += income.amount;
      groupedData[date].totalPrice += income.price;
      groupedData[date].count += 1;
    });

    const dates = Object.keys(groupedData);
    const amounts = dates.map(date => Math.round(groupedData[date].totalAmount * 100) / 100);
    const avgPrices = dates.map(date => Math.round((groupedData[date].totalPrice / groupedData[date].count) * 100) / 100);

    return {
      labels: dates,
      datasets: [
        {
          label: `Total Amount (${filteredIncome[0]?.unit || ' '})`,
          data: amounts,
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.1,
          yAxisID: 'y',
          borderWidth: 3,
          pointRadius: 4,
          pointBackgroundColor: '#22c55e',
          pointBorderColor: '#22c55e',
          pointBorderWidth: 2,
        },
        {
          label: 'Average Price per Unit (฿)',
          data: avgPrices,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1,
          yAxisID: 'y1',
          borderWidth: 3,
          pointRadius: 4,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#3b82f6',
          pointBorderWidth: 2,
        },
      ],
    };
  }, [filteredIncome]);

  useEffect(() => {
    // Register Chart.js components
    Chart.Chart.register(
      Chart.CategoryScale,
      Chart.LinearScale,
      Chart.PointElement,
      Chart.LineElement,
      Chart.Title,
      Chart.Tooltip,
      Chart.Legend
    );

    if (canvasRef.current) {
      // Destroy existing chart if it exists
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        chartRef.current = new Chart.Chart(ctx, {
          type: 'line',
          data: chartData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: 'index',
              intersect: false,
            },
            plugins: {
              title: {
                display: true,
                text: 'Income Amount vs Price per Unit Over Time',
                font: {
                  size: 16,
                  weight: 'bold',
                },
              },
              legend: {
                position: 'top',
              },
              tooltip: {
                callbacks: {
                  label: function(context: any) {
                    const label = context.dataset.label || '';
                    const value = context.parsed.y.toFixed(2);
                    return `${label}: ${Number(value).toLocaleString()}`;
                  },
                },
              },
            },
            scales: {
              x: {
                display: true,
                title: {
                  display: true,
                  text: 'Date',
                },
                ticks: {
                  maxRotation: 45,
                  minRotation: 45,
                },
              },
              y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                  display: true,
                  text: 'Total Amount (฿)',
                  color: '#22c55e',
                },
                ticks: {
                  callback: function(value: any) {
                    return '฿' + Number(value).toLocaleString();
                  },
                  color: '#22c55e',
                },
                grid: {
                  drawOnChartArea: false,
                },
              },
              y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                  display: true,
                  text: 'Average Price per Unit (฿)',
                  color: '#3b82f6',
                },
                ticks: {
                  callback: function(value: any) {
                    return '฿' + Number(value).toFixed(2);
                  },
                  color: '#3b82f6',
                },
                grid: {
                  drawOnChartArea: false,
                },
              },
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

  if (filteredIncome.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        No income data available for the selected filters
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] relative">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default PriceAmountLineChart;