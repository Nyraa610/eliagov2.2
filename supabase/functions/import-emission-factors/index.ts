
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    // Get the authentication token from the request headers
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a Supabase client with the Auth context of the user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify the user has admin privileges
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid user' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the request body
    const { url } = await req.json();
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching emission factors CSV from: ${url}`);
    
    // Fetch the CSV file
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    
    // Parse CSV and prepare data for insertion
    const lines = csvText.split('\n');
    const headers = lines[0].split(';');
    
    // Find column indices
    const codeIndex = headers.findIndex(h => h.includes('Code'));
    const nameIndex = headers.findIndex(h => h.includes('Nom'));
    const categoryIndex = headers.findIndex(h => h.includes('Scope') || h.includes('Catégorie'));
    const subcategoryIndex = headers.findIndex(h => h.includes('Sous-catégorie'));
    const unitIndex = headers.findIndex(h => h.includes('Unité'));
    const valueIndex = headers.findIndex(h => h.includes('Valeur'));
    const uncertaintyIndex = headers.findIndex(h => h.includes('Incertitude'));
    
    console.log(`Found column indices: code=${codeIndex}, name=${nameIndex}, category=${categoryIndex}, subcategory=${subcategoryIndex}, unit=${unitIndex}, value=${valueIndex}, uncertainty=${uncertaintyIndex}`);
    
    // Process each row and insert in batches
    const batchSize = 100;
    let insertedCount = 0;
    let errorCount = 0;
    let batch = [];
    
    // Skip the header row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      try {
        const columns = line.split(';');
        
        // Clean and prepare data
        const code = codeIndex >= 0 ? columns[codeIndex]?.trim() : null;
        const name = nameIndex >= 0 ? columns[nameIndex]?.trim() : 'Unknown';
        const category = categoryIndex >= 0 ? columns[categoryIndex]?.trim() : null;
        const subcategory = subcategoryIndex >= 0 ? columns[subcategoryIndex]?.trim() : null;
        const unit = unitIndex >= 0 ? columns[unitIndex]?.trim() : null;
        
        // Convert numeric values, handling comma as decimal separator
        let emissionValue = null;
        if (valueIndex >= 0 && columns[valueIndex]) {
          emissionValue = parseFloat(columns[valueIndex].replace(',', '.'));
        }
        
        let uncertaintyPercent = null;
        if (uncertaintyIndex >= 0 && columns[uncertaintyIndex]) {
          uncertaintyPercent = parseFloat(columns[uncertaintyIndex].replace(',', '.'));
        }
        
        // Skip rows without required data
        if (!name) continue;
        
        batch.push({
          code,
          name,
          category,
          subcategory,
          unit,
          emission_value: emissionValue,
          uncertainty_percent: uncertaintyPercent
        });
        
        // Insert when batch is full
        if (batch.length >= batchSize) {
          const { error: insertError } = await supabaseClient
            .from('emission_factors')
            .insert(batch);
          
          if (insertError) {
            console.error(`Insert error: ${insertError.message}`);
            errorCount += batch.length;
          } else {
            insertedCount += batch.length;
          }
          
          batch = [];
        }
      } catch (err) {
        console.error(`Error processing line ${i}: ${err.message}`);
        errorCount++;
      }
    }
    
    // Insert any remaining rows
    if (batch.length > 0) {
      const { error: finalInsertError } = await supabaseClient
        .from('emission_factors')
        .insert(batch);
      
      if (finalInsertError) {
        console.error(`Final insert error: ${finalInsertError.message}`);
        errorCount += batch.length;
      } else {
        insertedCount += batch.length;
      }
    }
    
    console.log(`Import completed. Inserted: ${insertedCount}, Errors: ${errorCount}`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Import completed successfully. Inserted ${insertedCount} emission factors. Failed: ${errorCount}` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error(`Error in import-emission-factors function: ${error.message}`);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
