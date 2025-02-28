
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    const { fileUrl, fileName, fileType, fileSize } = await req.json();

    if (!fileUrl) {
      return new Response(
        JSON.stringify({ error: "No file URL provided" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get OpenAI API key from environment
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Fetching file content from URL:", fileUrl);
    
    // Fetch the file content
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch file content" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get file content as text (works for text-based files)
    // Note: For binary files like PDFs would need additional processing
    let fileContent;
    if (fileType.includes('text') || 
        fileType.includes('csv') || 
        fileType.includes('json') ||
        fileName.endsWith('.txt') || 
        fileName.endsWith('.csv') || 
        fileName.endsWith('.json')) {
      fileContent = await fileResponse.text();
    } else {
      // For other file types, we'll need a more sophisticated handling
      // Here we'll fallback to just analyzing the file metadata
      fileContent = `File: ${fileName} (Type: ${fileType}, Size: ${fileSize} bytes)`;
    }

    // Make request to OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an AI assistant that analyzes file content and provides insights. Format your response as JSON with the following structure: { summary: string, sentiment: "positive" | "neutral" | "negative", keyPoints: string[], confidence: number between 0-1 }.' 
          },
          { 
            role: 'user', 
            content: `Analyze the following file content and return insights in JSON format. File name: ${fileName}, File type: ${fileType}\n\nContent:\n${fileContent.substring(0, 10000)}` 
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      console.error("OpenAI API error:", errorResponse);
      return new Response(
        JSON.stringify({ error: "Failed to analyze file with AI" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    let parsedResult;
    
    try {
      parsedResult = JSON.parse(data.choices[0].message.content);
      // Add file metadata to the result
      parsedResult.fileName = fileName;
      parsedResult.fileType = fileType;
      parsedResult.fileSize = fileSize;
    } catch (e) {
      console.error("Error parsing OpenAI response:", e);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(parsedResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error analyzing file:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
