
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.6'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

interface WebResponse {
  siteId?: string;
  error?: string;
}

serve(async (req: Request) => {
  try {
    // Create a Supabase client with the Auth context of the logged-in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the Hotjar site ID from Supabase secrets
    const siteId = Deno.env.get('HOTJAR_SITE_ID');
    
    const response: WebResponse = {
      siteId: siteId || undefined
    };

    return new Response(
      JSON.stringify(response),
      { headers: { 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' } 
      },
    )
  }
})
