
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
    
    // First, clear the existing emission factors
    await supabaseClient.from('emission_factors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log("Cleared existing emission factors");
    
    // Parse CSV and prepare data for insertion
    const lines = csvText.split('\n');
    const headers = lines[0].split(';').map(header => header.trim());
    
    console.log("CSV Headers:", headers);
    
    // Map ADEME Base Carbone headers to our database fields
    // Common headers in both French and English formats
    const findColumnIndex = (possibleNames) => {
      return headers.findIndex(h => possibleNames.some(name => 
        h.toLowerCase().includes(name.toLowerCase())));
    };
    
    // Map column indices based on various possible header names
    const columnIndices = {
      code: findColumnIndex(['Identifiant', 'Code', 'ID']),
      name: findColumnIndex(['Nom base', 'Name', 'Nom']),
      category: findColumnIndex(['Catégorie', 'Category', 'Scope']),
      subcategory: findColumnIndex(['Sous-catégorie', 'Subcategory', 'Tags']),
      unit: findColumnIndex(['Unité', 'Unit']),
      // For emission values, try multiple columns that might contain CO2 values
      emissionValue: findColumnIndex(['Valeur', 'Value', 'CO2f', 'CO2e', 'Total poste', 'kg CO2']),
      uncertainty: findColumnIndex(['Incertitude', 'Uncertainty']),
      source: findColumnIndex(['Source', 'Origine', 'Contributeur'])
    };
    
    console.log("Mapped column indices:", columnIndices);
    
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
        // Split by semicolon and handle quoted values correctly
        let columns = [];
        let currentCol = "";
        let inQuotes = false;
        
        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          
          if (char === '"' && (j === 0 || line[j-1] !== '\\')) {
            inQuotes = !inQuotes;
          } else if (char === ';' && !inQuotes) {
            columns.push(currentCol);
            currentCol = "";
          } else {
            currentCol += char;
          }
        }
        
        // Add the last column
        columns.push(currentCol);
        
        // Extract data based on mapped column indices
        const name = columnIndices.name >= 0 ? columns[columnIndices.name]?.trim() : 'Unknown';
        const code = columnIndices.code >= 0 ? columns[columnIndices.code]?.trim() : null;
        const category = columnIndices.category >= 0 ? columns[columnIndices.category]?.trim() : null;
        const subcategory = columnIndices.subcategory >= 0 ? columns[columnIndices.subcategory]?.trim() : null;
        const unit = columnIndices.unit >= 0 ? columns[columnIndices.unit]?.trim() : null;
        const source = columnIndices.source >= 0 ? columns[columnIndices.source]?.trim() : 'ADEME Base Carbone';
        
        // Convert numeric values, handling comma as decimal separator
        let emissionValue = null;
        if (columnIndices.emissionValue >= 0 && columns[columnIndices.emissionValue]) {
          const cleanedValue = columns[columnIndices.emissionValue].replace(',', '.').trim();
          if (!isNaN(parseFloat(cleanedValue))) {
            emissionValue = parseFloat(cleanedValue);
          }
        }
        
        let uncertaintyPercent = null;
        if (columnIndices.uncertainty >= 0 && columns[columnIndices.uncertainty]) {
          const cleanedUncertainty = columns[columnIndices.uncertainty].replace(',', '.').replace('%', '').trim();
          if (!isNaN(parseFloat(cleanedUncertainty))) {
            uncertaintyPercent = parseFloat(cleanedUncertainty);
          }
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
          uncertainty_percent: uncertaintyPercent,
          source
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
        message: `Import completed successfully. Inserted ${insertedCount} emission factors. Failed: ${errorCount}`,
        details: {
          headers,
          mappedColumns: columnIndices
        }
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
