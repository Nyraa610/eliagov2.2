
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

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
    // Initialize Supabase client with environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // Get the Authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the JWT token from the Authorization header
    const token = authHeader.replace('Bearer ', '');

    // Get the user from the JWT token
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid user token', details: userError }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    let requestData;
    try {
      requestData = await req.json();
    } catch (error) {
      console.error('Failed to parse request body:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, companyId, pageId, content, title, apiKey: providedApiKey } = requestData;

    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Missing required action parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For the testConnection action, we use the provided API key
    let notionApiKey = providedApiKey;

    // For other actions, get the Notion API key from the database
    if (action !== 'testConnection') {
      if (!companyId) {
        return new Response(
          JSON.stringify({ error: 'Missing required companyId parameter' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get the Notion API key for the company
      const { data: integrationData, error: integrationError } = await supabaseClient
        .from('company_integrations')
        .select('api_key')
        .eq('company_id', companyId)
        .eq('integration_type', 'notion')
        .single();

      if (integrationError || !integrationData) {
        console.error('Notion integration not found:', integrationError);
        return new Response(
          JSON.stringify({ error: 'Notion integration not found for this company', details: integrationError }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      notionApiKey = integrationData.api_key;
    }

    if (!notionApiKey) {
      return new Response(
        JSON.stringify({ error: 'No API key available for request' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Updated validation: Accept both secret_ and ntn_ formats
    if (!notionApiKey.startsWith('secret_') && !notionApiKey.startsWith('ntn_')) {
      console.error('Invalid Notion API key format - should start with "secret_" or "ntn_"');
      return new Response(
        JSON.stringify({ 
          error: 'Invalid API key format', 
          message: 'Notion API keys should start with "secret_" for internal integrations or "ntn_" for public integrations.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    switch (action) {
      case 'listPages': {
        // List pages from Notion workspace
        const response = await fetch('https://api.notion.com/v1/search', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${notionApiKey}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filter: {
              value: 'page',
              property: 'object'
            },
            sort: {
              direction: 'descending',
              timestamp: 'last_edited_time'
            }
          }),
        });

        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch (e) {
            errorData = { message: response.statusText };
          }
          
          console.error('Notion API error:', response.status, errorData);
          
          // Provide more specific error messages for common issues
          let errorMessage = 'Error fetching Notion pages';
          if (response.status === 401) {
            errorMessage = 'Invalid Notion API key. Please check your integration token.';
          } else if (response.status === 403) {
            errorMessage = 'Access denied. Make sure you have shared pages with your integration in Notion.';
          } else if (response.status === 429) {
            errorMessage = 'Too many requests to Notion API. Please try again later.';
          }
          
          return new Response(
            JSON.stringify({ 
              error: errorMessage, 
              status: response.status,
              details: errorData 
            }),
            { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const data = await response.json();
        
        // Transform the results to a simpler format
        const pages = data.results.map(page => ({
          id: page.id,
          title: page.properties?.title?.title?.[0]?.plain_text || 
                 page.properties?.Name?.title?.[0]?.plain_text || 
                 'Untitled',
          lastEdited: page.last_edited_time
        }));

        return new Response(
          JSON.stringify({ pages }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      case 'createPage': {
        // Create a new page in Notion with content
        if (!title) {
          return new Response(
            JSON.stringify({ error: 'Title is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Convert our action plan content to Notion blocks
        const blocks = generateNotionBlocks(content);

        const response = await fetch('https://api.notion.com/v1/pages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${notionApiKey}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            parent: { page_id: pageId },
            properties: {
              title: {
                title: [
                  {
                    type: 'text',
                    text: { content: title }
                  }
                ]
              }
            },
            children: blocks,
          }),
        });

        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch (e) {
            errorData = { message: response.statusText };
          }
          
          console.error('Notion API error:', response.status, errorData);
          
          // Provide more specific error messages
          let errorMessage = 'Error creating Notion page';
          if (response.status === 401) {
            errorMessage = 'Invalid Notion API key. Please check your integration token.';
          } else if (response.status === 403) {
            errorMessage = 'Access denied. Make sure you have shared the parent page with your integration.';
          } else if (response.status === 404) {
            errorMessage = 'Parent page not found. Make sure the page exists and is shared with the integration.';
          }
          
          return new Response(
            JSON.stringify({ 
              error: errorMessage, 
              status: response.status,
              details: errorData 
            }),
            { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const data = await response.json();
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            pageId: data.id,
            url: data.url 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      case 'testConnection': {
        // Test if the API key is valid by making a simple request
        console.log('Testing connection with API key');
        
        const response = await fetch('https://api.notion.com/v1/users/me', {
          headers: {
            'Authorization': `Bearer ${notionApiKey}`,
            'Notion-Version': '2022-06-28',
          },
        });

        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch (e) {
            errorData = { message: response.statusText };
          }
          
          console.error('Notion API test error:', response.status, errorData);
          
          // Provide more specific error messages
          let errorMessage = 'Failed to connect to Notion API';
          if (response.status === 401) {
            errorMessage = 'Invalid Notion API key. Please check your integration token.';
          } else if (response.status === 403) {
            errorMessage = 'Access denied. Make sure you have the correct permissions.';
          } else if (response.status === 429) {
            errorMessage = 'Too many requests to Notion API. Please try again later.';
          }
          
          return new Response(
            JSON.stringify({ 
              success: false,
              error: errorMessage,
              status: response.status,
              details: errorData 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const data = await response.json();

        // If we have companyId, this is a connection setup
        if (companyId && providedApiKey) {
          console.log('Test successful, returning success response');
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            userData: data 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Error in notion-integration function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to convert our action plan content to Notion blocks
function generateNotionBlocks(content: any) {
  const blocks = [];
  
  if (!content) {
    return [
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ type: 'text', text: { content: 'No content provided' } }]
        }
      }
    ];
  }
  
  if (content.shortTermGoals) {
    blocks.push({
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{ type: 'text', text: { content: 'Short-term Goals' } }]
      }
    });
    
    blocks.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{ type: 'text', text: { content: content.shortTermGoals } }]
      }
    });
  }
  
  if (content.longTermGoals) {
    blocks.push({
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{ type: 'text', text: { content: 'Long-term Goals' } }]
      }
    });
    
    blocks.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{ type: 'text', text: { content: content.longTermGoals } }]
      }
    });
  }

  if (content.keyInitiatives && Array.isArray(content.keyInitiatives)) {
    blocks.push({
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{ type: 'text', text: { content: 'Key Initiatives' } }]
      }
    });
    
    content.keyInitiatives.forEach((initiative: string) => {
      blocks.push({
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: initiative } }]
        }
      });
    });
  } else if (content.keyInitiatives && typeof content.keyInitiatives === 'string') {
    blocks.push({
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{ type: 'text', text: { content: 'Key Initiatives' } }]
      }
    });
    
    blocks.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{ type: 'text', text: { content: content.keyInitiatives } }]
      }
    });
  }

  if (content.timeline) {
    blocks.push({
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{ type: 'text', text: { content: 'Timeline' } }]
      }
    });
    
    blocks.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{ type: 'text', text: { content: content.timeline } }]
      }
    });
  }

  return blocks;
}
