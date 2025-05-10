
import { saveAs } from 'file-saver';
import { createReport } from 'docx-templates';

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
    
    const templateBuffer = await response.arrayBuffer();
    
    // Process the template with docx-templates
    // Convert ArrayBuffer to Uint8Array as required by docx-templates
    const templateUint8Array = new Uint8Array(templateBuffer);
    
    const result = await createReport({
      template: templateUint8Array,
      data: data,
      cmdDelimiter: '[]', // Using placeholders with [] format like [CompanyName]
    });
    
    // Convert the result to a Blob
    const blob = new Blob([result], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    
    // Save the file
    saveAs(blob, outputFilename);
    
    return true;
  } catch (error) {
    console.error("Error creating document from template:", error);
    return false;
  }
}

/**
 * Creates a document from template but returns it as a blob instead of downloading
 * This is useful for preview and other operations that don't need a download
 */
export async function createDocumentBlobFromTemplate(templatePath: string, data: any) {
  try {
    // Fetch the template file
    const response = await fetch(templatePath);
    if (!response.ok) {
      throw new Error(`Failed to fetch template: ${response.status} ${response.statusText}`);
    }
    
    const templateBuffer = await response.arrayBuffer();
    
    // Convert ArrayBuffer to Uint8Array as required by docx-templates
    const templateUint8Array = new Uint8Array(templateBuffer);
    
    const result = await createReport({
      template: templateUint8Array,
      data: data,
      cmdDelimiter: '[]', // Using placeholders with [] format like [CompanyName]
    });
    
    // Convert the result to a Blob
    return new Blob([result], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
  } catch (error) {
    console.error("Error creating document blob from template:", error);
    return null;
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

/**
 * Prepare document data for template processing
 * Flattens nested objects to make them accessible to the template engine
 */
export function prepareDocumentData(data: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  
  function flatten(obj: Record<string, any>, prefix = '') {
    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        flatten(value, newKey);
      } else {
        result[newKey] = value;
      }
    }
  }
  
  // First copy all top-level properties
  Object.assign(result, data);
  
  // Then flatten nested objects for easier access in templates
  flatten(data);
  
  return result;
}
