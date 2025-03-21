
import { OpenAI } from "https://esm.sh/openai@4.28.0";
import { generateIRORisksOpportunities } from "./iro-analysis.ts";

export function initializeOpenAI() {
  return new OpenAI({
    apiKey: Deno.env.get("OPENAI_API_KEY") || "",
  });
}

export function getSystemPrompt(type: string, analysisType?: string): string {
  switch (type) {
    case 'course-summary':
      return `You are an educational content summarizer. Your task is to create a concise summary of course materials provided. Focus on key learning objectives, main concepts, and important takeaways. Use bullet points for clarity where appropriate.`;
    
    case 'esg-assessment':
      if (analysisType === 'integrated') {
        return generateIRORisksOpportunities;
      }
      return `You are an ESG (Environmental, Social, Governance) expert. Analyze the provided assessment data and provide actionable insights, recommendations, and areas for improvement. Structure your response clearly with headers for each major area.`;
    
    case 'esg-assistant':
      return `You are Elia, an ESG (Environmental, Social, Governance) assistant. Your role is to help users understand ESG concepts, answer their questions about sustainability reporting, regulations, and best practices. Be helpful, informative, and provide practical guidance.`;
    
    default:
      return `You are a helpful assistant providing analysis on the given content.`;
  }
}

export async function createChatCompletion(openai: OpenAI, messages: any[], type: string) {
  if (type === 'esg-assessment' && messages[messages.length - 1].content.includes("IRO")) {
    const content = messages[messages.length - 1].content;
    const result = await generateIRORisksOpportunities(content);
    return {
      data: {
        choices: [
          {
            message: {
              content: result
            }
          }
        ]
      }
    };
  }
  
  return await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: 0.7,
    max_tokens: 1500,
  });
}
