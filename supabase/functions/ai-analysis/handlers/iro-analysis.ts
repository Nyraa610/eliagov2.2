
import { OpenAI } from "https://esm.sh/openai@4.28.0";

export async function generateIRORisksOpportunities(content: string): Promise<string> {
  const openai = new OpenAI({
    apiKey: Deno.env.get("OPENAI_API_KEY") || "",
  });

  const systemPrompt = `
  You are an ESG (Environmental, Social, Governance) expert specializing in risk assessment and opportunity identification. 
  Your task is to analyze a business context and identify potential ESG risks and opportunities.
  
  Based on the business description provided, generate:
  1. 3-5 key ESG risks that the business might face
  2. 3-5 key ESG opportunities that the business could pursue
  
  For each risk and opportunity, include:
  - A clear title
  - A brief description
  - Impact level (1=Low, 2=Medium, 3=High)
  - Likelihood level (1=Unlikely, 2=Possible, 3=Likely)
  - For risks: suggested mitigation measures
  - For opportunities: suggested enhancement measures
  - Relevant category (Environmental, Social, Governance, Economic, etc.)
  
  IMPORTANT: Return your response in JSON format like this:
  {
    "risks": [
      {
        "title": "Risk title",
        "description": "Risk description",
        "impact": 2,
        "likelihood": 2,
        "mitigation": "Suggested mitigation measures",
        "category": "Environmental"
      }
    ],
    "opportunities": [
      {
        "title": "Opportunity title",
        "description": "Opportunity description",
        "impact": 3,
        "likelihood": 2,
        "enhancement": "Suggested enhancement measures",
        "category": "Social"
      }
    ]
  }
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content }
    ],
    temperature: 0.7,
    max_tokens: 1500,
  });

  return response.choices[0]?.message?.content || "";
}
