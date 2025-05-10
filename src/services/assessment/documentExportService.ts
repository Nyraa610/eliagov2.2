
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
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
    
    if (format === 'word') {
      return await exportWordDocument(documentData, filename);
    } else if (format === 'pdf') {
      // Check if we have markdown content
      if (documentData.markdownContent) {
        return await exportMarkdownAsPdf(documentData, filename);
      } else {
        // Fallback to simple PDF
        return await exportSimplePdf(documentData, filename);
      }
    }
    
    return false;
  } catch (error) {
    console.error(`Failed to export document as ${format}:`, error);
    toast.error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

/**
 * Export markdown content as PDF
 */
async function exportMarkdownAsPdf(documentData: any, filename: string): Promise<boolean> {
  try {
    const doc = new jsPDF();
    const markdownContent = documentData.markdownContent;
    
    if (!markdownContent) {
      toast.error("No content to export");
      return false;
    }
    
    // Add title
    const title = documentData.title || "Sustainability Report";
    doc.setFontSize(20);
    doc.text(title, 20, 20);
    
    // Add company name if available
    if (documentData.companyName) {
      doc.setFontSize(16);
      doc.text(`For: ${documentData.companyName}`, 20, 30);
    }
    
    // Add date
    const date = documentData.date || new Date().toLocaleDateString();
    doc.setFontSize(12);
    doc.text(`Date: ${date}`, 20, 38);
    
    // Simple markdown content (headings and paragraphs only)
    const lines = markdownContent.split('\n');
    let y = 50;
    
    for (const line of lines) {
      if (line.trim() === '') {
        y += 5; // Add some space for empty lines
        continue;
      }
      
      if (line.startsWith('# ')) {
        // Heading 1
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text(line.substring(2), 20, y);
        y += 10;
      } else if (line.startsWith('## ')) {
        // Heading 2
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(line.substring(3), 20, y);
        y += 8;
      } else if (line.startsWith('### ')) {
        // Heading 3
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(line.substring(4), 20, y);
        y += 7;
      } else if (line.startsWith('- ')) {
        // Bullet point
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(`• ${line.substring(2)}`, 25, y);
        y += 7;
      } else {
        // Regular paragraph
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        
        // Check if we need to add a new page
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        
        // Split long lines to fit on page
        const splitText = doc.splitTextToSize(line, 170);
        doc.text(splitText, 20, y);
        y += 7 * splitText.length;
      }
      
      // Add a new page if we're near the bottom
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    }
    
    // Save the PDF
    doc.save(filename);
    
    return true;
  } catch (error) {
    console.error("Failed to export PDF:", error);
    toast.error("Failed to generate PDF");
    return false;
  }
}

/**
 * Export document as a simple PDF without markdown processing
 */
async function exportSimplePdf(documentData: any, filename: string): Promise<boolean> {
  try {
    const doc = new jsPDF();
    
    // Add title
    const title = documentData.title || "Sustainability Report";
    doc.setFontSize(20);
    doc.text(title, 20, 20);
    
    // Add company name if available
    if (documentData.companyName) {
      doc.setFontSize(16);
      doc.text(`For: ${documentData.companyName}`, 20, 30);
    }
    
    // Add date
    const date = documentData.date || new Date().toLocaleDateString();
    doc.setFontSize(12);
    doc.text(`Date: ${date}`, 20, 38);
    
    let y = 50;
    
    // Add sections
    if (documentData.executiveSummary) {
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Executive Summary", 20, y);
      y += 10;
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      const summaryText = stripHtml(documentData.executiveSummary);
      const lines = doc.splitTextToSize(summaryText, 170);
      doc.text(lines, 20, y);
      y += 10 + (lines.length * 7);
    }
    
    // Add more sections as needed
    // Check for page overflow and add pages as necessary
    
    // Save the PDF
    doc.save(filename);
    return true;
  } catch (error) {
    console.error("Failed to export PDF:", error);
    toast.error("Failed to generate PDF");
    return false;
  }
}

/**
 * Export document as Word document - this is a simplified version without docx-templates
 */
async function exportWordDocument(documentData: any, filename: string): Promise<boolean> {
  try {
    toast.info("Downloading Word template...");
    
    // Simply download the template file directly
    const templatePath = '/DocumentTemplates/EliaGo_SustainabilityAssessment.docx';
    const response = await fetch(templatePath);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch template: ${response.status} ${response.statusText}`);
    }
    
    // Convert to blob and save
    const blob = await response.blob();
    saveAs(blob, filename);
    
    toast.success("Template downloaded successfully. Please open in Word to fill in your details.");
    return true;
  } catch (error) {
    console.error("Failed to download template:", error);
    toast.error(`Failed to download template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

/**
 * Get document preview as a blob
 */
export async function getDocumentPreview(documentData: any): Promise<Blob | null> {
  try {
    // For now, we'll focus on generating the preview from markdown if available
    if (documentData && documentData.markdownContent) {
      // Simple HTML preview
      const previewHtml = `
        <html>
        <head>
          <title>${documentData.title || 'Document Preview'}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            h1 { color: #333; }
            h2 { color: #555; }
            h3 { color: #777; }
            img { max-width: 100%; height: auto; margin: 10px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <h1>${documentData.title || 'Document Preview'}</h1>
          <div>${documentData.markdownContent.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')}</div>
        </body>
        </html>
      `;
      
      return new Blob([previewHtml], { type: 'text/html' });
    }
    
    return null;
  } catch (error) {
    console.error("Failed to get document preview:", error);
    return null;
  }
}

/**
 * Helper function to strip HTML tags from content
 */
function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}
