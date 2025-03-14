
/**
 * Mock data service for INSEE API
 * Used when actual API connection is not available
 */

/**
 * Get mock company data based on search term
 * @param companyName The name to use in the mock company
 * @returns Mock company data
 */
export function getMockCompanyData(companyName: string) {
  // Create a mock company based on the search term
  const mockCompany = {
    siret: "12345678901234",
    siren: "123456789",
    name: companyName,
    address: "123 Rue de Paris, 75001 Paris",
    activityCode: "62.01Z",
    legalForm: "5710",
    creationDate: "2010-01-01",
    employeeCount: "20-49 employees",
    status: "Active"
  };
  
  console.log(`Returning mock data for company: ${companyName}`);
  return mockCompany;
}
