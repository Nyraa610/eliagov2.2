
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();
    const companyId = url.searchParams.get('companyId');

    if (!companyId) {
      return new Response(
        JSON.stringify({ error: 'Company ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a Supabase client with the Auth context of the user that called the function
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Get the HubSpot integration for the company
    const { data: integration, error: integrationError } = await supabaseClient
      .from('hubspot_integrations')
      .select('*')
      .eq('company_id', companyId)
      .single();

    if (integrationError || !integration) {
      return new Response(
        JSON.stringify({ error: 'HubSpot integration not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if token is expired and needs refresh
    const tokenExpiresAt = new Date(integration.token_expires_at);
    const isTokenExpired = tokenExpiresAt <= new Date();

    let accessToken = integration.access_token;

    if (isTokenExpired) {
      // Refresh token logic would go here
      // For now, we'll return an error
      return new Response(
        JSON.stringify({ error: 'Token expired, please reconnect your HubSpot account' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle different API endpoints
    if (path === 'sync-contacts') {
      // This would normally call the HubSpot API to get contacts
      // Simulate fetching contacts for now
      const mockContacts = [
        {
          hubspot_id: '1',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          company_name: 'Acme Corp',
          sustainability_score: 75,
          raw_data: { properties: { firstname: 'John', lastname: 'Doe' } }
        },
        {
          hubspot_id: '2',
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane.smith@example.com',
          company_name: 'Green Solutions',
          sustainability_score: 90,
          raw_data: { properties: { firstname: 'Jane', lastname: 'Smith' } }
        }
      ];

      // Save contacts to the database
      for (const contact of mockContacts) {
        await supabaseClient.from('hubspot_contacts').upsert({
          company_id: companyId,
          hubspot_id: contact.hubspot_id,
          first_name: contact.first_name,
          last_name: contact.last_name,
          email: contact.email,
          company_name: contact.company_name,
          sustainability_score: contact.sustainability_score,
          last_synced_at: new Date().toISOString(),
          raw_data: contact.raw_data,
          updated_at: new Date().toISOString()
        }, { onConflict: 'company_id,hubspot_id' });
      }

      return new Response(
        JSON.stringify({ success: true, contacts: mockContacts }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } 
    else if (path === 'analyze-sustainability') {
      // Get all notes for analysis
      const { data: notes } = await supabaseClient
        .from('hubspot_notes')
        .select('*')
        .eq('company_id', companyId)
        .eq('analyzed', false);

      // Simulate analysis for now
      if (notes && notes.length > 0) {
        for (const note of notes) {
          // Update the note with analysis results
          await supabaseClient.from('hubspot_notes').update({
            sustainability_keywords: ['sustainability', 'green', 'environment'],
            sustainability_score: Math.floor(Math.random() * 100),
            analyzed: true,
            updated_at: new Date().toISOString()
          }).eq('id', note.id);

          // Create a sample opportunity
          if (Math.random() > 0.5) {
            await supabaseClient.from('sustainability_opportunities').insert({
              company_id: companyId,
              contact_id: note.contact_id,
              title: `Sustainability opportunity from ${note.hubspot_id}`,
              description: 'This contact has shown interest in sustainable practices.',
              opportunity_score: Math.floor(Math.random() * 100),
              opportunity_status: 'new',
              source: 'ai'
            });
          }
        }
      }

      return new Response(
        JSON.stringify({ success: true, analyzed: notes?.length || 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid endpoint' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
