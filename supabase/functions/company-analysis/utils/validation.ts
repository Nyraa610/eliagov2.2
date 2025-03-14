
/**
 * Validate company name from request
 */
export function validateCompanyName(requestData: any): string {
  if (!requestData.companyName) {
    throw new Error('Company name is required');
  }
  
  console.log(`Validated company name: ${requestData.companyName}`);
  return requestData.companyName;
}
