
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request body
    const { companyId, companyName } = await req.json();
    
    if (!companyId) {
      return new Response(
        JSON.stringify({ error: "Company ID is required", success: false }),
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
    const bucketResults = [];
    
    for (const bucketName of bucketNames) {
      try {
        // Check if bucket exists
        const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();
        
        if (bucketsError) {
          console.error(`Error checking if bucket ${bucketName} exists:`, bucketsError);
          bucketResults.push({ bucket: bucketName, success: false, message: bucketsError.message });
          continue;
        }
        
        const bucketExists = buckets.some(b => b.name === bucketName);
        
        // Create bucket if it doesn't exist
        if (!bucketExists) {
          console.log(`Creating bucket: ${bucketName}`);
          const { error: createBucketError } = await supabaseAdmin.storage.createBucket(bucketName, {
            public: true,
            fileSizeLimit: 52428800, // 50MB
          });
          
          if (createBucketError) {
            console.error(`Error creating bucket ${bucketName}:`, createBucketError);
            bucketResults.push({ bucket: bucketName, success: false, message: createBucketError.message });
          } else {
            console.log(`Successfully created bucket: ${bucketName}`);
            bucketResults.push({ bucket: bucketName, success: true });
          }
        } else {
          console.log(`Bucket ${bucketName} already exists`);
          bucketResults.push({ bucket: bucketName, success: true });
        }
      } catch (bucketErr) {
        console.error(`Exception handling bucket ${bucketName}:`, bucketErr);
        bucketResults.push({ 
          bucket: bucketName, 
          success: false, 
          message: bucketErr instanceof Error ? bucketErr.message : String(bucketErr) 
        });
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
    
    const folderResults = [];
    
    for (const path of folderPaths) {
      try {
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
          folderResults.push({ path, bucket: bucketName, success: false, message: uploadError.message });
        } else {
          console.log(`Successfully created path: ${path}`);
          folderResults.push({ path, bucket: bucketName, success: true });
        }
      } catch (folderErr) {
        console.error(`Exception creating path ${path}:`, folderErr);
        folderResults.push({ 
          path, 
          success: false, 
          message: folderErr instanceof Error ? folderErr.message : String(folderErr) 
        });
      }
    }

    // Determine overall success
    const allBucketsSuccess = bucketResults.every(r => r.success);
    const allFoldersSuccess = folderResults.every(r => r.success);
    const overallSuccess = allBucketsSuccess && allFoldersSuccess;

    return new Response(
      JSON.stringify({ 
        success: overallSuccess, 
        message: `Company storage for '${companyName || companyId}' initialized with result: ${overallSuccess ? 'SUCCESS' : 'PARTIAL FAILURE'}`,
        details: {
          buckets: bucketResults,
          folders: folderResults
        }
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: overallSuccess ? 200 : 207  // 207 Multi-Status for partial success
      }
    );

  } catch (error) {
    console.error("Error in initialize-company-storage function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : String(error),
        success: false
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
