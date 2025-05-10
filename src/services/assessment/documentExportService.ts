
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import {
  createDocumentFromTemplate,
  createDocumentBlobFromTemplate,
  prepareDocumentData
} from '@/utils/documentUtils';

/**
 * Export document as PDF or Word
 */
export async function exportDocument(
  assessmentType: string, 
  documentData: any, 
  format: 'pdf' | 'word', 
  filename: string
): Promise<boolean> {
  try {
    console.log(`Exporting ${assessmentType} as ${format}:`, { documentData, filename });
    
    if (format === 'pdf') {
      // Create PDF using jsPDF
      const pdf = new jsPDF();
      
      // Add title
      pdf.setFontSize(20);
      pdf.text(documentData.title || "Assessment Document", 20, 20);
      
      // Add company info
      pdf.setFontSize(14);
      pdf.text(`Company: ${documentData.companyName || ""}`, 20, 35);
      pdf.text(`Industry: ${documentData.industry || ""}`, 20, 45);
      pdf.text(`Date: ${documentData.date || new Date().toLocaleDateString()}`, 20, 55);
      
      // Add content sections
      let yPosition = 70;
      
      // Executive Summary
      if (documentData.executiveSummary) {
        pdf.setFontSize(16);
        pdf.text("Executive Summary", 20, yPosition);
        yPosition += 10;
        pdf.setFontSize(12);
        const summaryText = pdf.splitTextToSize(
          documentData.executiveSummary.summary || "", 
          170
        );
        pdf.text(summaryText, 20, yPosition);
        yPosition += summaryText.length * 7 + 10;
      }
      
      // Sustainability Context
      if (documentData.sustainabilityContext) {
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.setFontSize(16);
        pdf.text("Sustainability in the Mediterranean", 20, yPosition);
        yPosition += 10;
        pdf.setFontSize(12);
        const contextText = pdf.splitTextToSize(
          documentData.sustainabilityContext || "", 
          170
        );
        pdf.text(contextText, 20, yPosition);
        yPosition += contextText.length * 7 + 10;
      }
      
      // Continue adding other sections...
      // When we reach page limit, add a new page
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }
      
      // Save the PDF and trigger download
      pdf.save(filename);
      return true;
    } 
    else if (format === 'word') {
      try {
        // Get the template path - update path to ensure it can be found
        const templatePath = '/src/DocumentTemplates/EliaGo_SustainabilityAssessment.docx';
        
        // Prepare the data for the template
        const preparedData = prepareDocumentData(documentData);
        
        // Generate the document from template
        return await createDocumentFromTemplate(templatePath, preparedData, filename);
      } catch (error) {
        console.error("Error creating Word document:", error);
        return false;
      }
    }
    
    return false;
  } catch (error) {
    console.error(`Failed to export document as ${format}:`, error);
    toast.error(`Failed to export document as ${format}`);
    return false;
  }
}

/**
 * Generate document preview for online viewing
 */
export async function getDocumentPreview(
  assessmentType: string, 
  documentData: any
): Promise<Blob | null> {
  try {
    console.log(`Generating preview for ${assessmentType}:`, documentData);
    
    // Get the template path - update path to ensure it can be found
    const templatePath = '/src/DocumentTemplates/EliaGo_SustainabilityAssessment.docx';
    
    // Prepare the data for the template
    const preparedData = prepareDocumentData(documentData);
    
    // Generate the document blob from template
    return await createDocumentBlobFromTemplate(templatePath, preparedData);
  } catch (error) {
    console.error("Error creating document preview:", error);
    toast.error("Failed to generate document preview");
    return null;
  }
}
