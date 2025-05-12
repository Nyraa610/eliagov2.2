
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast } from "sonner";

/**
 * Service for generating PDF reports
 */
export const pdfReportService = {
  /**
   * Generate an ESG QuickStart PDF report
   */
  async generateESGQuickStartReport(data: {
    industry: string;
    industryName: string;
    sectorProfile: any;
    selectedStandards: string[];
    standardsData: any[];
    reportContent: string;
  }): Promise<boolean> {
    try {
      const { industry, industryName, sectorProfile, selectedStandards, standardsData, reportContent } = data;
      
      // Create new PDF document
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(24);
      doc.setTextColor(33, 64, 175); // Blue color
      doc.text("ESG QuickStart Report", 20, 20);
      
      // Add industry
      doc.setFontSize(16);
      doc.text(`Industry: ${industryName}`, 20, 35);
      
      // Add date
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 42);
      
      // Add logo/header image
      // If we had a logo, we would add it here
      // doc.addImage(logoUrl, 'PNG', 150, 10, 40, 20);
      
      // Add divider
      doc.setDrawColor(33, 64, 175);
      doc.setLineWidth(0.5);
      doc.line(20, 48, 190, 48);
      
      // Add ESG profile section
      doc.setFontSize(16);
      doc.setTextColor(33, 64, 175);
      doc.text("Industry ESG Profile", 20, 60);
      
      // Add sector description
      if (sectorProfile?.description) {
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        const splitDescription = doc.splitTextToSize(sectorProfile.description, 170);
        doc.text(splitDescription, 20, 70);
      }
      
      let yPos = 90 + (sectorProfile?.description ? Math.min(splitDescription.length * 7, 30) : 0);
      
      // Check if we need to add a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      // Add key risks section if available
      if (sectorProfile?.key_risks && sectorProfile.key_risks.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(33, 64, 175);
        doc.text("Key ESG Risks", 20, yPos);
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        yPos += 10;
        
        sectorProfile.key_risks.forEach((risk: string, index: number) => {
          // Check if we need to add a new page
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          
          doc.text(`• ${risk}`, 25, yPos);
          yPos += 7;
        });
        
        yPos += 5;
      }
      
      // Check if we need to add a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      // Add key opportunities
      if (sectorProfile?.key_opportunities && sectorProfile.key_opportunities.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(33, 64, 175);
        doc.text("Key ESG Opportunities", 20, yPos);
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        yPos += 10;
        
        sectorProfile.key_opportunities.forEach((opportunity: string, index: number) => {
          // Check if we need to add a new page
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          
          doc.text(`• ${opportunity}`, 25, yPos);
          yPos += 7;
        });
        
        yPos += 5;
      }
      
      // Check if we need to add a new page
      if (yPos > 220) {
        doc.addPage();
        yPos = 20;
      }
      
      // Add selected standards section
      doc.setFontSize(16);
      doc.setTextColor(33, 64, 175);
      doc.text("Selected ESG Standards", 20, yPos);
      yPos += 10;
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      if (selectedStandards && selectedStandards.length > 0) {
        selectedStandards.forEach((standardId: string) => {
          const standard = standardsData.find(s => s.id === standardId);
          if (standard) {
            doc.text(`• ${standard.name}: ${standard.description}`, 25, yPos);
            yPos += 7;
          }
        });
      } else {
        doc.text("• No standards currently followed", 25, yPos);
        yPos += 7;
      }
      
      yPos += 10;
      
      // Check if we need to add a new page
      if (yPos > 220) {
        doc.addPage();
        yPos = 20;
      }
      
      // Add recommendations section
      doc.setFontSize(16);
      doc.setTextColor(33, 64, 175);
      doc.text("Recommendations", 20, yPos);
      yPos += 10;
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      // Parse report content for recommendations
      // For now, just add some generic recommendations
      doc.text("• Conduct a comprehensive materiality assessment", 25, yPos);
      yPos += 7;
      doc.text("• Establish baseline measurements for key ESG metrics", 25, yPos);
      yPos += 7;
      doc.text("• Develop an action plan with clear, time-bound objectives", 25, yPos);
      yPos += 15;
      
      // Add footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(`Generated by ELIA GO ESG Platform | Page ${i} of ${pageCount}`, 20, 290);
      }
      
      // Save PDF
      const filename = `ESG_QuickStart_${industry}_Report.pdf`;
      doc.save(filename);
      
      toast.success("PDF report downloaded successfully!");
      return true;
    } catch (error) {
      console.error("Error generating PDF report:", error);
      toast.error("Failed to generate PDF report");
      return false;
    }
  }
};
