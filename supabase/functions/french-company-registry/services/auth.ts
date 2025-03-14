
/**
 * INSEE API authentication service
 * Handles getting access tokens from the INSEE API
 */

/**
 * Get an authentication token from INSEE API using API key
 * @returns Promise with the access token
 */
export async function getInseeToken() {
  // Get API key from environment variables
  const API_KEY = Deno.env.get("INSEE_API_KEY");
  
  if (!API_KEY) {
    throw new Error("INSEE API key not configured");
  }
  
  console.log("Using INSEE API key authentication from environment variables");
  return API_KEY;
}
