
/**
 * INSEE API authentication service
 * Handles getting access tokens from the INSEE API
 */

/**
 * Get an authentication token from INSEE API using client credentials
 * @returns Promise with the access token
 */
export async function getInseeToken() {
  try {
    const clientId = Deno.env.get("INSEE_CLIENT_ID");
    
    if (!clientId) {
      throw new Error("INSEE API client ID not configured");
    }
    
    console.log("Requesting INSEE API token with client certificate");
    
    // For client certificate authentication, we would need to use a more complex fetch
    // with the certificate included, but Deno's fetch doesn't directly support client certificates
    // So we'll need to use the token endpoint that supports client_id + client_secret auth flow
    // using the client_id as the username
    const credentials = btoa(`${clientId}:client_secret`);
    
    const response = await fetch("https://api.insee.fr/token", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "grant_type=client_credentials"
    });
    
    console.log(`INSEE token request status: ${response.status}`);
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error("INSEE token error response:", errorBody);
      throw new Error(`Failed to get INSEE API token: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("INSEE token obtained successfully");
    
    return data.access_token;
  } catch (error) {
    console.error("Error getting INSEE token:", error);
    throw error;
  }
}
