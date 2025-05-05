
import { useRef, useEffect } from "react";
import { Chart, registerables } from "chart.js";
import { MaterialityIssue, issueCategories } from "../formSchema";

// Register Chart.js components
Chart.register(...registerables);

interface MaterialityChartProps {
  issues: MaterialityIssue[];
}

// Function to get a color based on the category
export const getCategoryColor = (category?: string): string => {
  switch (category) {
    case 'Environmental':
      return 'rgba(34, 197, 94, 0.7)'; // green
    case 'Social':
      return 'rgba(59, 130, 246, 0.7)'; // blue
    case 'Governance':
      return 'rgba(168, 85, 247, 0.7)'; // purple
    default:
      return 'rgba(99, 102, 241, 0.7)'; // indigo
  }
};

export function MaterialityChart({ issues }: MaterialityChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  
  // Create and update chart when issues change
  useEffect(() => {
    if (!chartRef.current || issues.length === 0) return;
    
    // Destroy previous chart if it exists
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }
    
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    
    // Prepare data for the chart
    const data = issues.map((issue) => ({
      x: issue.financialMateriality,
      y: issue.impactMateriality,
      r: (issue.maturity || 5) / 2 + 5, // Radius based on maturity
      label: issue.title,
      category: issue.category || 'Environmental',
    }));
    
    // Create new chart
    chartInstanceRef.current = new Chart(ctx, {
      type: 'bubble',
      data: {
        datasets: [
          {
            label: 'Materiality Issues',
            data,
            backgroundColor: data.map(item => getCategoryColor(item.category)),
            borderColor: data.map(item => getCategoryColor(item.category).replace('0.7', '1')),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            min: 0,
            max: 10,
            title: {
              display: true,
              text: 'Financial Materiality',
              font: {
                weight: 'bold',
              },
            },
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.1)',
            },
          },
          y: {
            min: 0,
            max: 10,
            title: {
              display: true,
              text: 'Impact Materiality',
              font: {
                weight: 'bold',
              },
            },
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.1)',
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const dataPoint = data[context.dataIndex];
                return [
                  `${dataPoint.label}`,
                  `Financial Materiality: ${dataPoint.x}/10`,
                  `Impact Materiality: ${dataPoint.y}/10`,
                  `Category: ${dataPoint.category}`,
                ];
              },
            },
          },
          legend: {
            display: false,
          }
        },
        animation: {
          onComplete: function() {
            // Draw diagonal line after chart is rendered
            if (!chartInstanceRef.current) return;
            
            const chart = chartInstanceRef.current;
            const ctx = chart.ctx;
            const xAxis = chart.scales['x'];
            const yAxis = chart.scales['y'];
            
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(xAxis.getPixelForValue(0), yAxis.getPixelForValue(0));
            ctx.lineTo(xAxis.getPixelForValue(10), yAxis.getPixelForValue(10));
            ctx.stroke();
            ctx.restore();
          }
        },
      },
    });
    
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [issues]);

  return (
    <div className="h-[400px] relative">
      <canvas ref={chartRef} />
    </div>
  );
}
