
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
  try {
    console.log(`Starting createChatCompletion for type: ${type} with ${messages.length} messages`);
    
    if (type === 'esg-assessment' && messages[messages.length - 1].content.includes("IRO")) {
      const content = messages[messages.length - 1].content;
      console.log("Using IRO assessment flow");
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
        console.log("Using OpenAI assistant for ESG assistant query");
        
        // Create a thread
        console.log("Creating thread...");
        const thread = await openai.beta.threads.create();
        console.log("Thread created:", thread.id);
        
        // Add messages to the thread
        console.log("Adding messages to thread...");
        for (const msg of messages) {
          if (msg.role === 'user' || msg.role === 'assistant') {
            await openai.beta.threads.messages.create(thread.id, {
              role: msg.role,
              content: msg.content
            });
          }
        }
        console.log("Messages added to thread");
        
        // Run the assistant on the thread
        console.log("Creating assistant run...");
        const run = await openai.beta.threads.runs.create(thread.id, {
          assistant_id: "asst_sxtwO6YB80QvXGYgQlCNxVKa", // Your specific assistant ID
        });
        console.log("Run created:", run.id);
        
        // Poll for completion
        let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        let pollCount = 0;
        const maxPolls = 30; // Avoid infinite polling
        
        // Simple polling mechanism - in production, you'd want to use webhooks
        while (runStatus.status !== 'completed' && 
               runStatus.status !== 'failed' && 
               runStatus.status !== 'cancelled' && 
               pollCount < maxPolls) {
          console.log(`Run status (poll ${pollCount}): ${runStatus.status}`);
          
          if (runStatus.status === 'requires_action') {
            console.log("Run requires action:", JSON.stringify(runStatus.required_action, null, 2));
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000));
          runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
          pollCount++;
        }
        
        if (runStatus.status === 'failed') {
          console.error('Assistant run failed:', JSON.stringify(runStatus.last_error, null, 2));
          throw new Error('Assistant run failed: ' + runStatus.last_error?.message || 'Unknown error');
        }
        
        if (pollCount >= maxPolls && runStatus.status !== 'completed') {
          console.error(`Run timed out after ${maxPolls} polls. Final status: ${runStatus.status}`);
          throw new Error(`Assistant run timed out with status: ${runStatus.status}`);
        }
        
        console.log("Run completed, fetching messages");
        
        // Get the messages from the thread
        const messages = await openai.beta.threads.messages.list(thread.id);
        
        // Find the assistant's last message
        const assistantMessages = messages.data.filter(msg => msg.role === 'assistant');
        
        if (assistantMessages.length === 0) {
          console.error("No assistant messages found in the thread");
          throw new Error('No response from assistant');
        }
        
        // Get the most recent assistant message
        const lastMessage = assistantMessages[0];
        console.log("Assistant message ID:", lastMessage.id);
        
        // Extract the text content
        let content = '';
        
        // Debug the content structure
        console.log("Message content structure:", JSON.stringify(lastMessage.content, null, 2));
        
        if (lastMessage.content && Array.isArray(lastMessage.content)) {
          for (const contentPart of lastMessage.content) {
            if (contentPart.type === 'text') {
              content += contentPart.text.value;
              console.log("Extracted text content:", contentPart.text.value.substring(0, 100) + "...");
            }
          }
        }
        
        console.log("Final extracted content length:", content.length);
        
        if (!content) {
          console.error("Failed to extract text content from assistant message");
          content = "I couldn't generate a response at this time. Please try again later.";
        }
        
        return {
          data: {
            choices: [
              {
                message: {
                  content: content
                }
              }
            ]
          }
        };
      } catch (error) {
        console.error("Error using OpenAI assistant:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        
        // Fallback to regular chat completion
        console.log("Falling back to regular chat completion");
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
    console.log("Using regular chat completion");
    const model = "gpt-4o-mini";
    const temperature = 0.7;
    const maxTokens = 1500;
    
    console.log(`Calling OpenAI API with model: ${model}`);
    const response = await openai.chat.completions.create({
      model: model,
      messages,
      temperature: temperature,
      max_tokens: maxTokens,
    });
    
    console.log("OpenAI API response received successfully");
    return response;
  } catch (error) {
    console.error("Error in createChatCompletion:", error);
    console.error("Error details:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    throw error;
  }
}
