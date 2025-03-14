
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

/**
 * Validate OpenAI API key from environment
 */
export function validateOpenAIKey(): string {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    console.error('OpenAI API key not found in environment variables');
    throw new Error('OpenAI API key not found in environment variables');
  }
  
  // Log the API key length for debugging (don't log the actual key)
  console.log(`API key length: ${openaiApiKey.length}, starts with: ${openaiApiKey.substring(0, 3)}...`);
  
  return openaiApiKey;
}
