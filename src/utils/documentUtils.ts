
import { saveAs } from 'file-saver';

/**
 * Utility function to create and download a document from template
 */
export async function createDocumentFromTemplate(templatePath: string, data: any, outputFilename: string) {
  try {
    // Fetch the template file
    const response = await fetch(templatePath);
    if (!response.ok) {
      throw new Error(`Failed to fetch template: ${response.status} ${response.statusText}`);
    }
    
    const templateBlob = await response.blob();
    
    // Here we would normally use a library like docx-templates to fill in the template
    // For now, we'll just download the original template
    // In a real implementation, we would replace placeholders with actual data
    
    // Save the file
    saveAs(templateBlob, outputFilename);
    
    return true;
  } catch (error) {
    console.error("Error creating document from template:", error);
    return false;
  }
}

/**
 * Replace placeholders in the document with actual values
 */
export function replacePlaceholders(text: string, data: Record<string, any>): string {
  let result = text;
  
  // Replace simple placeholders like [CompanyName]
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      const placeholder = `[${key}]`;
      result = result.replace(new RegExp(placeholder, 'g'), value);
    }
  }
  
  return result;
}
