
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get the request body
    const { companyId, companyName } = await req.json();
    
    if (!companyId) {
      return new Response(
        JSON.stringify({ error: "Company ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize the Supabase client with the service role key for admin access
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          persistSession: false,
        },
      }
    );

    console.log(`Initializing storage for company: ${companyName || companyId}`);

    // Initialize all needed buckets
    const bucketNames = ['company_documents_storage', 'value_chain_documents', 'training_materials'];
    
    for (const bucketName of bucketNames) {
      // Check if bucket exists
      const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();
      
      if (bucketsError) {
        console.error(`Error checking if bucket ${bucketName} exists:`, bucketsError);
        continue;
      }
      
      const bucketExists = buckets.some(b => b.name === bucketName);
      
      // Create bucket if it doesn't exist
      if (!bucketExists) {
        console.log(`Creating bucket: ${bucketName}`);
        const { error: createBucketError } = await supabaseAdmin.storage.createBucket(bucketName, {
          public: true
        });
        
        if (createBucketError) {
          console.error(`Error creating bucket ${bucketName}:`, createBucketError);
        } else {
          console.log(`Successfully created bucket: ${bucketName}`);
        }
      }
    }

    // Create all needed folders
    const folderPaths = [
      // Company documents
      `${companyId}/.folder`,
      `personal/${companyId}/.folder`,
      // Value chain documents
      `value_chain/${companyId}/.folder`,
    ];
    
    for (const path of folderPaths) {
      // Determine which bucket to use based on path
      const bucketName = path.startsWith('value_chain/') 
        ? 'value_chain_documents' 
        : 'company_documents_storage';
      
      console.log(`Creating path: ${path} in bucket: ${bucketName}`);
      
      // Upload a placeholder file to create the directory structure
      const { error: uploadError } = await supabaseAdmin.storage
        .from(bucketName)
        .upload(path, new Uint8Array(0), {
          contentType: "application/x-directory",
          upsert: true,
        });

      if (uploadError) {
        console.error(`Error creating path ${path}:`, uploadError);
      } else {
        console.log(`Successfully created path: ${path}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Company storage for '${companyName || companyId}' initialized successfully` 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 200 
      }
    );

  } catch (error) {
    console.error("Error in initialize-company-storage function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
