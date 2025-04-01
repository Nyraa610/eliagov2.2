
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

    // Create a placeholder file to initialize the company folder
    const bucketName = "company_documents_storage";
    const placeholderPath = `${companyId}/.folder`;
    
    // Upload a placeholder file to create the directory structure
    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(placeholderPath, new Uint8Array(0), {
        contentType: "application/x-directory",
        upsert: true,
      });

    if (uploadError) {
      console.error("Error creating company folder:", uploadError);
      throw new Error(`Failed to create company folder: ${uploadError.message}`);
    }

    // Also create personal folder if needed
    const personalFolderPath = `personal/${companyId}/.folder`;
    
    await supabaseAdmin.storage
      .from(bucketName)
      .upload(personalFolderPath, new Uint8Array(0), {
        contentType: "application/x-directory",
        upsert: true,
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Company folder for '${companyName || companyId}' created successfully` 
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
