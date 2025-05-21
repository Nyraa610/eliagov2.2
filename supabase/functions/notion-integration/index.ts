
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

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
        JSON.stringify({ error: 'Invalid user token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, companyId, pageId, content, title } = await req.json();

    // Get the Notion API key for the company
    const { data: integrationData, error: integrationError } = await supabaseClient
      .from('company_integrations')
      .select('api_key')
      .eq('company_id', companyId)
      .eq('integration_type', 'notion')
      .single();

    if (integrationError || !integrationData) {
      return new Response(
        JSON.stringify({ error: 'Notion integration not found for this company' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const notionApiKey = integrationData.api_key;

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

        const data = await response.json();
        
        if (!response.ok) {
          console.error('Notion API error:', data);
          return new Response(
            JSON.stringify({ error: 'Error fetching Notion pages', details: data }),
            { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

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

        const data = await response.json();
        
        if (!response.ok) {
          console.error('Notion API error:', data);
          return new Response(
            JSON.stringify({ error: 'Error creating Notion page', details: data }),
            { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

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
        const response = await fetch('https://api.notion.com/v1/users/me', {
          headers: {
            'Authorization': `Bearer ${notionApiKey}`,
            'Notion-Version': '2022-06-28',
          },
        });

        const data = await response.json();

        return new Response(
          JSON.stringify({ 
            success: response.ok,
            userData: response.ok ? data : null,
            error: !response.ok ? data : null 
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
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to convert our action plan content to Notion blocks
function generateNotionBlocks(content: any) {
  const blocks = [];
  
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
