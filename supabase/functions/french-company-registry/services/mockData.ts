
/**
 * Mock data service for INSEE API
 * Used for development or when actual API connection fails
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
    uniteLegale: {
      denominationUniteLegale: `${companyName} (mock data)`,
      activitePrincipaleUniteLegale: "62.01Z",
      categorieJuridiqueUniteLegale: "5710",
      etatAdministratifUniteLegale: "A"
    },
    adresseEtablissement: {
      numeroVoieEtablissement: "123",
      typeVoieEtablissement: "RUE",
      libelleVoieEtablissement: "DE PARIS",
      codePostalEtablissement: "75001",
      libelleCommuneEtablissement: "PARIS"
    },
    dateCreationEtablissement: "2010-01-01",
    trancheEffectifsEtablissement: "12"
  };
  
  console.log(`Returning mock data for company: ${companyName}`);
  return mockCompany;
}
