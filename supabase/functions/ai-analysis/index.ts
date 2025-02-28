
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the OpenAI API key from the environment
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }

    // Parse the request body
    const { type, content, additionalParams } = await req.json();

    // Generate the prompt based on the analysis type
    let systemPrompt = '';
    let userPrompt = '';

    switch (type) {
      case 'course-summary':
        systemPrompt = 'You are an expert educator and content summarizer. Your task is to create a concise yet comprehensive summary of a training course.';
        userPrompt = `Please provide a summary of the following course content. Include the main topics covered, key learning objectives, and structure of the course. The summary should be well-organized and informative.\n\nCourse Content:\n${content}`;
        break;
      
      case 'esg-assessment':
        systemPrompt = 'You are an expert in Environmental, Social, and Governance (ESG) analysis. Your task is to provide insightful analysis and recommendations based on a company\'s ESG information.';
        userPrompt = `Please analyze the following ESG information and provide a comprehensive assessment. Include strengths, areas for improvement, and specific recommendations. Break down your analysis into Environmental, Social, and Governance sections.\n\nCompany ESG Information:\n${content}`;
        break;
      
      default:
        throw new Error(`Unsupported analysis type: ${type}`);
    }

    console.log(`Running ${type} analysis...`);

    // Call the OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    console.log('Analysis completed successfully');

    return new Response(
      JSON.stringify({ 
        result: generatedText,
        metadata: {
          type,
          timestamp: new Date().toISOString(),
          model: 'gpt-4o-mini'
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in ai-analysis function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
