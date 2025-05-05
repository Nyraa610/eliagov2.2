
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { jsPDF } from "jspdf";
import html2canvas from 'html-to-image';
import { MaterialityIssue } from '../formSchema';
import { MaterialityFormValues } from '../formSchema';

export function useMatrixExport() {
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [deliverableName, setDeliverableName] = useState("");
  const { toast } = useToast();

  const addWatermark = (pdf: jsPDF) => {
    const pageCount = pdf.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(24);
      pdf.setTextColor(220, 220, 220);
      pdf.setFont("helvetica", "bold");
      pdf.text("ELIA GO", pdf.internal.pageSize.getWidth() / 2, pdf.internal.pageSize.getHeight() / 2, {
        align: "center",
        angle: 45
      });
    }
  };

  const generatePDF = async (matrixContainerRef: React.RefObject<HTMLDivElement>, issues: MaterialityIssue[], companyName: string) => {
    if (!matrixContainerRef.current) return null;
    
    try {
      const dataUrl = await html2canvas.toPng(matrixContainerRef.current, {
        backgroundColor: '#ffffff',
      });
      
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      
      // Add title
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Double Materiality Assessment Matrix', 15, 15);
      
      // Calculate dimensions to fit the PDF while maintaining aspect ratio
      const imgWidth = 270; // PDF width (less margins)
      const imgHeight = 150; // Approximate height for the chart
      
      // Add the image
      pdf.addImage(dataUrl, 'PNG', 15, 25, imgWidth, imgHeight);
      
      // Add watermark
      addWatermark(pdf);
      
      // Reset text color for the rest of the content
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "normal");
      
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
      
      // Add watermark to every page
      addWatermark(pdf);
      
      return pdf;
    } catch (error) {
      console.error('Error generating PDF:', error);
      return null;
    }
  };

  const handleDownloadPDF = async (matrixContainerRef: React.RefObject<HTMLDivElement>, issues: MaterialityIssue[], companyName: string) => {
    try {
      const pdf = await generatePDF(matrixContainerRef, issues, companyName);
      if (!pdf) return;
      
      // Save the PDF
      pdf.save(`${companyName}-Materiality-Assessment.pdf`);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: "Error",
        description: "Failed to download PDF",
        variant: "destructive"
      });
    }
  };

  const handlePrintMatrix = async (matrixContainerRef: React.RefObject<HTMLDivElement>, issues: MaterialityIssue[]) => {
    if (!matrixContainerRef.current) return;
    
    try {
      const dataUrl = await html2canvas.toPng(matrixContainerRef.current, {
        backgroundColor: '#ffffff',
      });
      
      const win = window.open('', '_blank');
      if (!win) return;
      
      win.document.write('<html><head><title>Materiality Matrix</title>');
      win.document.write('<style>body{text-align:center;}</style>');
      win.document.write('</head><body>');
      win.document.write('<h1>Double Materiality Assessment Matrix</h1>');
      win.document.write(`<img src="${dataUrl}" style="max-width:100%;" />`);
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
      toast({
        title: "Error",
        description: "Failed to print matrix",
        variant: "destructive"
      });
    }
  };

  const handleSaveToDeliverables = async (matrixContainerRef: React.RefObject<HTMLDivElement>, issues: MaterialityIssue[], form: MaterialityFormValues) => {
    try {
      if (!deliverableName) {
        toast({
          title: "Error",
          description: "Please enter a name for the deliverable",
          variant: "destructive"
        });
        return;
      }

      const pdf = await generatePDF(matrixContainerRef, issues, form.companyName || "Company");
      if (!pdf) return;
      
      // Here we would typically upload to a storage service
      // For now, just simulate saving and show success message
      setTimeout(() => {
        toast({
          title: "Success",
          description: `Saved "${deliverableName}" to Elia Go Deliverables`,
        });
        setIsSaveDialogOpen(false);
        setDeliverableName("");
      }, 1000);
    } catch (error) {
      console.error('Error saving deliverable:', error);
      toast({
        title: "Error",
        description: "Failed to save deliverable",
        variant: "destructive"
      });
    }
  };

  return {
    isSaveDialogOpen,
    setIsSaveDialogOpen,
    deliverableName,
    setDeliverableName,
    handleDownloadPDF,
    handlePrintMatrix,
    handleSaveToDeliverables,
  };
}
