
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
      return `You are Elia, an ESG and sustainability assistant developed by ELIA GO. Your role is to help users with ESG concepts, sustainability strategies, and using the ELIA platform.

Key responsibilities:
1. Provide expert guidance on ESG topics including environmental, social, and governance aspects
2. Help users understand sustainability frameworks, regulations, and reporting requirements
3. Assist with platform usage, explaining features and helping users navigate the application
4. Offer personalized recommendations based on the user's industry, company size, and ESG maturity
5. Answer questions clearly and concisely, emphasizing actionable insights

Personality traits:
- Professional yet friendly and approachable
- Knowledgeable about sustainability without being overly technical
- Encouraging and supportive of companies at any stage of their ESG journey
- Solution-oriented, focusing on practical next steps
- Educational, helping users build their ESG knowledge

When providing guidance:
- Use plain language and explain complex terms
- Provide examples relevant to the user's context when possible
- Structure your responses with clear sections for readability
- Acknowledge when more information is needed to provide a complete answer
- Emphasize both quick wins and long-term strategic approaches

Remember that users are typically business professionals seeking to improve their organization's sustainability performance. Your goal is to make ESG concepts accessible and actionable.`;
    
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
  
  // Use the custom assistant for ESG assistant type
  if (type === 'esg-assistant') {
    try {
      // Create a thread
      const thread = await openai.beta.threads.create();
      
      // Add messages to the thread
      for (const msg of messages) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          await openai.beta.threads.messages.create(thread.id, {
            role: msg.role,
            content: msg.content
          });
        }
      }
      
      // Run the assistant on the thread
      const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: "asst_sxtwO6YB80QvXGYgQlCNxVKa", // Your specific assistant ID
      });
      
      // Poll for completion
      let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      
      // Simple polling mechanism - in production, you'd want to use webhooks
      while (runStatus.status !== 'completed' && runStatus.status !== 'failed') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      }
      
      if (runStatus.status === 'failed') {
        throw new Error('Assistant run failed: ' + runStatus.last_error?.message || 'Unknown error');
      }
      
      // Get the messages from the thread
      const messages = await openai.beta.threads.messages.list(thread.id);
      
      // Find the assistant's last message
      const assistantMessages = messages.data.filter(msg => msg.role === 'assistant');
      
      if (assistantMessages.length === 0) {
        throw new Error('No response from assistant');
      }
      
      // Get the most recent assistant message
      const lastMessage = assistantMessages[0];
      
      // Extract the text content
      let content = '';
      if (Array.isArray(lastMessage.content) && lastMessage.content.length > 0) {
        const textContent = lastMessage.content.filter(part => part.type === 'text');
        if (textContent.length > 0 && 'text' in textContent[0]) {
          content = textContent[0].text.value;
        }
      }
      
      return {
        data: {
          choices: [
            {
              message: {
                content: content || "I couldn't generate a response at this time."
              }
            }
          ]
        }
      };
    } catch (error) {
      console.error("Error using OpenAI assistant:", error);
      
      // Fallback to regular chat completion
      const model = "gpt-4o-mini";
      const temperature = 0.7;
      const maxTokens = 1500;
      
      return await openai.chat.completions.create({
        model: model,
        messages,
        temperature: temperature,
        max_tokens: maxTokens,
      });
    }
  }
  
  // For other types, use the regular chat completion
  const model = "gpt-4o-mini";
  const temperature = 0.7;
  const maxTokens = 1500;
  
  return await openai.chat.completions.create({
    model: model,
    messages,
    temperature: temperature,
    max_tokens: maxTokens,
  });
}
