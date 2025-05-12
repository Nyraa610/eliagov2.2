
import { OpenAI } from "https://esm.sh/openai@4.28.0";

type OpenAIResponse = {
  data: {
    choices: Array<{
      message: {
        content: string;
      };
    }>;
  };
};

/**
 * Initialize the OpenAI client
 */
export function initializeOpenAI(): OpenAI {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  
  if (!apiKey) {
    throw new Error("Missing OpenAI API key");
  }
  
  return new OpenAI({
    apiKey
  });
}

/**
 * Get the appropriate system prompt based on analysis type
 */
export function getSystemPrompt(type: string, analysisType?: string): string {
  switch (type) {
    case 'course-summary':
      return `
        You are an expert in creating concise, informative summaries of educational content.
        Your task is to summarize the course content provided, highlighting key points and takeaways.
        Organize your summary in a structured format with sections and bullet points.
        Keep your summary clear, accurate, and focused on the most important information.
      `;
      
    case 'esg-assessment':
      if (analysisType === 'iro-analysis') {
        return `
          You are an ESG (Environmental, Social, Governance) expert specializing in risk assessment and opportunity identification.
          Your task is to analyze a business description and identify potential ESG risks and opportunities.
          
          For each risk and opportunity, include:
          - A clear title
          - A brief description (2-3 sentences)
          - Impact level (Low, Medium, High)
          - Likelihood/probability level (Low, Medium, High)
          - For risks: suggested mitigation measures
          - For opportunities: suggested enhancement measures
          
          Format your response as JSON with an array of risks and an array of opportunities.
        `;
      }
      return `
        You are an ESG (Environmental, Social, Governance) expert providing a comprehensive assessment.
        Your task is to analyze the provided information and generate a clear, structured assessment.
        Focus on identifying key areas of strength and improvement, and provide actionable recommendations.
        Your assessment should balance thoroughness with practical insights that can be implemented.
      `;
      
    case 'esg-assistant':
      return `
        You are an ESG (Environmental, Social, Governance) specialist assistant named ELIA.
        Your role is to help users understand and implement ESG principles in their organizations.
        Provide clear, accurate, and practical guidance on ESG topics, frameworks, reporting standards, and implementation strategies.
        When providing JSON outputs, ensure they are valid and well-structured.
        Be conversational but informative, focusing on providing actionable insights.
      `;
      
    default:
      return `You are a helpful assistant providing information and analysis on the given topic.`;
  }
}

/**
 * Create a chat completion with OpenAI
 */
export async function createChatCompletion(
  openai: OpenAI, 
  messages: Array<{ role: string; content: string }>,
  type: string,
  requestId?: string
): Promise<OpenAIResponse> {
  console.log(`Creating chat completion with ${messages.length} messages${requestId ? `. Request ID: ${requestId}` : ''}`);
  
  try {
    const model = type === 'esg-assistant' ? 'gpt-4o-mini' : 'gpt-4o-mini';
    
    const completion = await openai.chat.completions.create({
      model,
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 2500,
    });
    
    // Convert from the actual OpenAI response format to the expected format
    return {
      data: {
        choices: [
          {
            message: {
              content: completion.choices[0]?.message?.content || ""
            }
          }
        ]
      }
    };
  } catch (error) {
    console.error(`Error calling OpenAI${requestId ? ` (Request ID: ${requestId})` : ''}:`, error);
    throw new Error(`Failed to connect to OpenAI: ${error.message}`);
  }
}
