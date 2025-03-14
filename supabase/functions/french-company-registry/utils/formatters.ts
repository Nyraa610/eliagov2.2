
/**
 * Helper utilities for formatting INSEE API response data
 */

/**
 * Format address from the INSEE API response
 * @param adresseData Address data from INSEE API
 * @returns Formatted address string
 */
export function formatAddress(adresseData: any): string {
  if (!adresseData) return "Address not available";
  
  const parts = [
    adresseData.numeroVoieEtablissement,
    adresseData.typeVoieEtablissement,
    adresseData.libelleVoieEtablissement,
    adresseData.codePostalEtablissement,
    adresseData.libelleCommuneEtablissement
  ];
  
  return parts.filter(part => part).join(" ");
}

/**
 * Convert employee count code to a human-readable range
 * @param trancheEffectif INSEE employee count code
 * @returns Human-readable employee range
 */
export function getEmployeeRangeLabel(trancheEffectif: string): string {
  const ranges: Record<string, string> = {
    "NN": "Not specified",
    "00": "0 employees",
    "01": "1-2 employees",
    "02": "3-5 employees",
    "03": "6-9 employees",
    "11": "10-19 employees",
    "12": "20-49 employees",
    "21": "50-99 employees",
    "22": "100-199 employees",
    "31": "200-249 employees",
    "32": "250-499 employees",
    "41": "500-999 employees",
    "42": "1000-1999 employees",
    "51": "2000-4999 employees",
    "52": "5000+ employees"
  };
  
  return ranges[trancheEffectif] || "Unknown";
}
