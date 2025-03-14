
import { corsHeaders } from "../utils/cors.ts";

/**
 * Call OpenAI API to get company analysis
 */
export async function analyzeCompany(companyName: string, openaiApiKey: string): Promise<any> {
  console.log(`Analyzing company: ${companyName}`);
  
  // Test OpenAI connection before proceeding
  await testOpenAIConnection(openaiApiKey);
  
  // Define system prompt for company analysis
  const systemPrompt = `You are a professional business analyst with expertise in company research and ESG (Environmental, Social, Governance) analysis. 
    
Your task is to provide a detailed, accurate profile of the company name provided, focusing on factual information.

Instructions:
1. Research and present factual information about the company.
2. If the company is well-known, provide accurate information based on public knowledge.
3. If the company is not recognizable or might be fictional, make reasonable estimates based on the company name and possible industry, but keep the information realistic and plausible.
4. Structure your response as JSON matching exactly the format below.
5. Ensure all fields are filled appropriately - never leave any field empty.
6. Be concise but informative in each section.

JSON Response Format:
{
  "industry": "The company's primary industry or sector",
  "employeeCount": "Estimate of employee count (use ranges like '1-10', '11-50', '51-250', '251-1000', '1000+')",
  "history": "A brief 2-3 sentence history of the company",
  "mission": "The company's mission statement or core purpose",
  "productsServices": ["List", "of", "main", "products", "or", "services"],
  "location": "Headquarters location (city, country)",
  "yearFounded": YYYY (numeric year only, no quotes),
  "overview": "A concise 3-4 sentence overview of the company's business, market position, and significance in its industry"
}`;

  // Call OpenAI API with parameters conforming to latest API reference
  console.log('Sending request to OpenAI API');
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini', // Updated to use the recommended model
      messages: [
        { 
          role: 'system', 
          content: systemPrompt 
        },
        { 
          role: 'user', 
          content: `Research and provide a company profile for: ${companyName}` 
        }
      ],
      temperature: 0.2, // Lower temperature for more factual, consistent responses
      max_tokens: 1000, // Ensure we have enough tokens for detailed responses
    }),
  });
  
  // Handle API response errors
  if (!response.ok) {
    let errorMessage = 'OpenAI API error';
    try {
      const errorData = await response.json();
      console.error('OpenAI API error details:', JSON.stringify(errorData));
      errorMessage = `OpenAI API error: ${errorData.error?.message || 'Unknown API error'}`;
      
      // Check for common error types and provide specific messages
      if (errorData.error?.type === 'invalid_request_error') {
        errorMessage = `Invalid request to OpenAI API: ${errorData.error.message}`;
      } else if (errorData.error?.type === 'authentication_error') {
        errorMessage = 'OpenAI API authentication failed. Please check your API key.';
      } else if (errorData.error?.code === 'rate_limit_exceeded') {
        errorMessage = 'OpenAI API rate limit exceeded. Please try again later.';
      }
    } catch (parseError) {
      console.error('Error parsing OpenAI error response:', parseError);
    }
    throw new Error(errorMessage);
  }
  
  const data = await response.json();
  console.log('OpenAI API response received:', JSON.stringify(data).substring(0, 200) + '...');
  
  return data;
}

/**
 * Test connection to OpenAI API before making main request
 */
async function testOpenAIConnection(openaiApiKey: string): Promise<void> {
  try {
    const testResponse = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
      },
    });
    
    if (!testResponse.ok) {
      const errorData = await testResponse.json();
      console.error('OpenAI connection test failed:', errorData);
      throw new Error(`Failed to connect to OpenAI: ${errorData.error?.message || 'Unknown error'}`);
    } else {
      console.log('OpenAI connection test successful');
    }
  } catch (error) {
    console.error('Error testing OpenAI connection:', error);
    throw new Error(`OpenAI connection error: ${error.message}`);
  }
}
