
import { saveAs } from 'file-saver';
import { createReport } from 'docx-templates';
import { toast } from 'sonner';

/**
 * Export document in the specified format
 */
export async function exportDocument(
  assessmentType: string, 
  documentData: any, 
  format: 'pdf' | 'word', 
  filename: string
): Promise<boolean> {
  try {
    console.log(`Exporting ${assessmentType} document as ${format}`);
    
    // For now, we only support Word export
    if (format === 'word') {
      return await exportWordDocument(documentData, filename);
    } else if (format === 'pdf') {
      // PDF export is not fully implemented yet
      // This is a placeholder for future implementation
      toast.warning("PDF export is not fully implemented yet. Exporting as Word document instead.");
      return await exportWordDocument(documentData, filename.replace('.pdf', '.docx'));
    }
    
    return false;
  } catch (error) {
    console.error(`Failed to export document as ${format}:`, error);
    return false;
  }
}

/**
 * Export document as Word document
 */
async function exportWordDocument(documentData: any, filename: string): Promise<boolean> {
  try {
    // Use a default template path
    const templatePath = '/src/DocumentTemplates/EliaGo_SustainabilityAssessment.docx';
    
    // Fetch the template file
    const response = await fetch(templatePath);
    if (!response.ok) {
      throw new Error(`Failed to fetch template: ${response.status} ${response.statusText}`);
    }
    
    const templateBuffer = await response.arrayBuffer();
    
    try {
      // Process the template with docx-templates
      const templateBufferData = Buffer.from(templateBuffer);
      
      const result = await createReport({
        template: templateBufferData,
        data: documentData,
        cmdDelimiter: '[]', // Using placeholders with [] format like [CompanyName]
      });
      
      // Convert the result to a Blob
      const blob = new Blob([result], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      
      // Save the file
      saveAs(blob, filename);
      
      return true;
    } catch (docxError) {
      console.error("Error processing with docx-templates, falling back to basic download:", docxError);
      
      // Fallback: Just download the original template if docx-templates fails
      const blob = new Blob([templateBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      saveAs(blob, filename);
      
      // Show a warning
      toast.warning("Could not process template with custom data. Downloading original template instead.");
      
      return true;
    }
  } catch (error) {
    console.error("Failed to export Word document:", error);
    return false;
  }
}

/**
 * Get document preview as a blob
 */
export async function getDocumentPreview(documentData: any): Promise<Blob | null> {
  try {
    // For now, we'll return null as preview is not fully implemented
    return null;
  } catch (error) {
    console.error("Failed to get document preview:", error);
    return null;
  }
}
