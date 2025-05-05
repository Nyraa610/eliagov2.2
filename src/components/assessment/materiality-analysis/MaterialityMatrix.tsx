
import { useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MaterialityIssue } from "./formSchema";
import { UseFormReturn } from "react-hook-form";
import { MaterialityFormValues } from "./formSchema";
import { Chart, registerables } from "chart.js";
import { Download, FileText, Printer } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html-to-image";

// Register Chart.js components
Chart.register(...registerables);

interface MaterialityMatrixProps {
  form: UseFormReturn<MaterialityFormValues>;
  onPrevious: () => void;
  onFinish: (values: MaterialityFormValues) => void;
}

// Function to get a color based on the category
const getCategoryColor = (category?: string): string => {
  switch (category?.toLowerCase()) {
    case 'environmental':
      return 'rgba(34, 197, 94, 0.7)'; // green
    case 'social':
      return 'rgba(59, 130, 246, 0.7)'; // blue
    case 'governance':
      return 'rgba(168, 85, 247, 0.7)'; // purple
    case 'economic':
      return 'rgba(234, 179, 8, 0.7)'; // yellow
    default:
      return 'rgba(99, 102, 241, 0.7)'; // indigo
  }
};

export function MaterialityMatrix({ form, onPrevious, onFinish }: MaterialityMatrixProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const issues = form.watch("materialIssues");
  const matrixContainerRef = useRef<HTMLDivElement>(null);
  
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
      category: issue.category || 'Undefined',
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
          },
          // Add a diagonal line
          afterDraw: (chart) => {
            const ctx = chart.ctx;
            const xAxis = chart.scales.x;
            const yAxis = chart.scales.y;
            
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(xAxis.getPixelForValue(0), yAxis.getPixelForValue(0));
            ctx.lineTo(xAxis.getPixelForValue(10), yAxis.getPixelForValue(10));
            ctx.stroke();
            ctx.restore();
          },
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
  
  // Handle download as PDF
  const handleDownloadPDF = async () => {
    if (!matrixContainerRef.current) return;
    
    try {
      const canvas = await html2canvas(matrixContainerRef.current, {
        backgroundColor: '#ffffff',
      });
      
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      // Add title
      pdf.setFontSize(16);
      pdf.text('Double Materiality Assessment Matrix', 15, 15);
      
      // Calculate dimensions to fit the PDF while maintaining aspect ratio
      const pdfWidth = pdf.internal.pageSize.getWidth() - 30;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Add the image
      pdf.addImage(imgData, 'PNG', 15, 25, pdfWidth, pdfHeight);
      
      // Add issues table
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.text('Materiality Issues Details', 15, 15);
      
      pdf.setFontSize(11);
      let y = 30;
      issues.forEach((issue, index) => {
        if (y > 270) { // Check if we need a new page
          pdf.addPage();
          y = 20;
        }
        
        pdf.setFont(undefined, 'bold');
        pdf.text(`${index + 1}. ${issue.title}`, 15, y);
        y += 6;
        
        pdf.setFont(undefined, 'normal');
        if (issue.description) {
          const splitDescription = pdf.splitTextToSize(issue.description, 180);
          pdf.text(splitDescription, 15, y);
          y += splitDescription.length * 6;
        }
        
        pdf.text(`Financial Materiality: ${issue.financialMateriality}/10`, 15, y);
        y += 6;
        
        pdf.text(`Impact Materiality: ${issue.impactMateriality}/10`, 15, y);
        y += 6;
        
        pdf.text(`Category: ${issue.category || 'Undefined'}`, 15, y);
        y += 10; // Space between issues
      });
      
      // Save the PDF
      const companyName = form.watch("companyName") || "Company";
      pdf.save(`${companyName}-Materiality-Assessment.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };
  
  // Handle print matrix
  const handlePrintMatrix = async () => {
    if (!matrixContainerRef.current) return;
    
    try {
      const canvas = await html2canvas(matrixContainerRef.current, {
        backgroundColor: '#ffffff',
      });
      
      const win = window.open('', '_blank');
      if (!win) return;
      
      win.document.write('<html><head><title>Materiality Matrix</title>');
      win.document.write('<style>body{text-align:center;}</style>');
      win.document.write('</head><body>');
      win.document.write('<h1>Double Materiality Assessment Matrix</h1>');
      win.document.write(`<img src="${canvas.toDataURL()}" style="max-width:100%;" />`);
      win.document.write('<h2>Material Issues</h2><ul style="text-align:left;">');
      
      // Add issue details
      issues.forEach(issue => {
        win.document.write(`<li><strong>${issue.title}</strong> - Financial: ${issue.financialMateriality}/10, Impact: ${issue.impactMateriality}/10</li>`);
      });
      
      win.document.write('</ul></body></html>');
      win.document.close();
      win.setTimeout(() => {
        win.print();
      }, 500);
    } catch (error) {
      console.error('Error printing matrix:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Double Materiality Matrix</CardTitle>
        <CardDescription>
          Visualize your ESG issues based on financial materiality and impact materiality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {issues.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center border rounded-md bg-muted/20">
            <div className="text-center text-muted-foreground">
              <p>No material issues identified yet.</p>
              <p className="text-sm">Please go back and identify issues first.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div 
              ref={matrixContainerRef}
              className="border rounded-md p-4 bg-white"
            >
              <h3 className="text-center font-semibold text-lg mb-4">Double Materiality Assessment Matrix</h3>
              <div className="h-[400px] relative">
                <canvas ref={chartRef} />
              </div>
              
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: getCategoryColor('environmental')}}></div>
                  <span>Environmental</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: getCategoryColor('social')}}></div>
                  <span>Social</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: getCategoryColor('governance')}}></div>
                  <span>Governance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: getCategoryColor('economic')}}></div>
                  <span>Economic</span>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground mt-2">
                <p>Bubble size represents issue maturity/readiness</p>
              </div>
            </div>
            
            <div className="flex justify-center space-x-3">
              <Button variant="outline" size="sm" onClick={handlePrintMatrix}>
                <Printer className="h-4 w-4 mr-2" /> Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" /> Download PDF
              </Button>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-3">Material Issues Summary</h3>
              <div className="space-y-2">
                {issues.map((issue, index) => (
                  <div key={issue.id || index} className="border p-3 rounded-md">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{issue.title}</h4>
                      <div className="text-sm text-muted-foreground">
                        {issue.category || "Uncategorized"}
                      </div>
                    </div>
                    <div className="mt-1 grid grid-cols-2 gap-4">
                      <div className="text-sm">
                        Financial: <span className="font-medium">{issue.financialMateriality}/10</span>
                      </div>
                      <div className="text-sm">
                        Impact: <span className="font-medium">{issue.impactMateriality}/10</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-3">Key Insights</h3>
              <Card className="bg-muted/20">
                <CardContent className="p-4">
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>
                        {issues.filter(i => i.financialMateriality >= 7 && i.impactMateriality >= 7).length} 
                        {" "}issues have high importance for both financial and impact materiality.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>
                        The top financial materiality issue is{" "}
                        {issues.sort((a, b) => b.financialMateriality - a.financialMateriality)[0]?.title}.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>
                        The top impact materiality issue is{" "}
                        {issues.sort((a, b) => b.impactMateriality - a.impactMateriality)[0]?.title}.
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button onClick={() => onFinish(form.getValues())} disabled={issues.length === 0}>
          Complete Assessment
        </Button>
      </CardFooter>
    </Card>
  );
}
