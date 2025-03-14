
/**
 * Process and validate the company info from OpenAI response
 */
export function processCompanyInfo(companyInfoText: string): any {
  if (!companyInfoText) {
    throw new Error('No response content from OpenAI');
  }
  
  console.log('Received company info from OpenAI:', companyInfoText.substring(0, 200) + '...');
  
  // Extract JSON from the response (in case there's any extra text)
  const jsonMatch = companyInfoText.match(/\{[\s\S]*\}/);
  const jsonString = jsonMatch ? jsonMatch[0] : companyInfoText;
  let companyInfo;
  
  try {
    companyInfo = JSON.parse(jsonString);
    console.log('Successfully parsed JSON response');
  } catch (jsonError) {
    console.error('JSON parse error. Raw response:', companyInfoText);
    throw new Error('Failed to parse JSON from OpenAI response');
  }
  
  return validateCompanyInfo(companyInfo);
}

/**
 * Validate and sanitize company info object
 */
function validateCompanyInfo(companyInfo: any): any {
  // Validate required fields with better fallback values
  const requiredFields = ['industry', 'employeeCount', 'history', 'mission', 'productsServices', 'location', 'yearFounded', 'overview'];
  let hasMissingFields = false;
  
  for (const field of requiredFields) {
    if (!companyInfo[field]) {
      hasMissingFields = true;
      console.warn(`Missing field in OpenAI response: ${field}`);
      // Set appropriate defaults based on field type
      switch (field) {
        case 'productsServices':
          companyInfo[field] = ['General services'];
          break;
        case 'yearFounded':
          companyInfo[field] = new Date().getFullYear() - 10; // Default to 10 years ago
          break;
        default:
          companyInfo[field] = `Information about ${field} not available`;
      }
    }
  }
  
  // Log warning if we had to fill in missing fields
  if (hasMissingFields) {
    console.warn('Some fields were missing in the OpenAI response and were populated with default values');
  }
  
  // Ensure yearFounded is a number
  if (typeof companyInfo.yearFounded !== 'number') {
    companyInfo.yearFounded = parseInt(companyInfo.yearFounded) || new Date().getFullYear() - 10;
  }
  
  // Ensure productsServices is an array
  if (!Array.isArray(companyInfo.productsServices)) {
    companyInfo.productsServices = [companyInfo.productsServices || 'General services'];
  }
  
  console.log('Successfully processed company info');
  return companyInfo;
}
