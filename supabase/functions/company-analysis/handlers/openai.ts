
/**
 * Analyze a company using OpenAI's API
 */
export async function analyzeCompany(companyName: string, country?: string, registryData?: any): Promise<any> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    console.error('OpenAI API key not found in environment variables');
    throw new Error('OpenAI API key not configured');
  }
  
  console.log(`Analyzing company: ${companyName}, Country: ${country || 'not specified'}`);
  
  try {
    // Build the prompt for company analysis with enhanced info
    const systemPrompt = `You are a business analyst who specializes in company research. 
      Provide comprehensive information about the company in a structured JSON format with the following fields:
      
      - industry: The industry the company operates in
      - employeeCount: The approximate number of employees
      - history: A brief company history
      - mission: The company's mission statement
      - productsServices: An array of the company's main products or services
      - location: Company headquarters location
      - yearFounded: The year the company was founded (as a number)
      - overview: A brief overview of what the company does
      
      Return ONLY the JSON object with no additional text.`;
    
    // Enhanced prompt with country information if available
    const locationInfo = country ? ` based in ${country}` : '';
    let prompt = `Research and provide information about: ${companyName}${locationInfo}`;
    
    // If we have registry data, enhance the prompt with official information
    if (registryData) {
      prompt += `\n\nHere is official registry information about the company:\n`;
      prompt += `- Official Name: ${registryData.name || companyName}\n`;
      if (registryData.siren) prompt += `- SIREN: ${registryData.siren}\n`;
      if (registryData.siret) prompt += `- SIRET: ${registryData.siret}\n`;
      if (registryData.activityCode) prompt += `- Activity Code: ${registryData.activityCode}\n`;
      if (registryData.legalForm) prompt += `- Legal Form: ${registryData.legalForm}\n`;
      if (registryData.creationDate) prompt += `- Creation Date: ${registryData.creationDate}\n`;
      if (registryData.employeeCount) prompt += `- Employee Count: ${registryData.employeeCount}\n`;
      if (registryData.address) prompt += `- Address: ${registryData.address}\n`;
      if (registryData.status) prompt += `- Status: ${registryData.status}\n`;
      
      prompt += `\nPlease incorporate this official data into your analysis. Be accurate with the employee count and creation date.`;
    }
    
    console.log("Sending request to OpenAI API");
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      if (response.status === 429) {
        throw new Error("OpenAI API rate limit exceeded");
      } else {
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }
    }
    
    const data = await response.json();
    console.log("Successfully received OpenAI response");
    return data;
  } catch (error) {
    console.error("Error connecting to OpenAI:", error);
    throw new Error(`Failed to connect to OpenAI: ${error.message}`);
  }
}
