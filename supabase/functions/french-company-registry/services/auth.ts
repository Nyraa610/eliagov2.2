
/**
 * INSEE API authentication service
 * Handles getting access tokens from the INSEE API
 */

/**
 * Get an authentication token from INSEE API using API key
 * @returns Promise with the access token
 */
export async function getInseeToken() {
  // Use the INSEE public API key for authentication
  const API_KEY = "d7f7865e-5e28-4032-b786-5e5e28a032f6";
  
  if (!API_KEY) {
    throw new Error("INSEE API key not configured");
  }
  
  console.log("Using INSEE public API key authentication");
  return API_KEY;
}
