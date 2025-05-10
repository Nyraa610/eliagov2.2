
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InitStorageRequest {
  bucketName: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("initialize-storage function called");
    
    // Get the API key from the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }
    
    // Create Supabase admin client using service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Parse request body
    const { bucketName }: InitStorageRequest = await req.json();
    
    if (!bucketName) {
      throw new Error('Bucket name is required');
    }
    
    console.log(`Attempting to create bucket: ${bucketName}`);
    
    // First check if bucket exists
    try {
      const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
      
      if (listError) {
        console.error("Error listing buckets:", listError);
        throw listError;
      }
      
      const bucketExists = buckets.some(bucket => bucket.name === bucketName);
      
      if (bucketExists) {
        console.log(`Bucket ${bucketName} already exists, skipping creation`);
        return new Response(
          JSON.stringify({ success: true, message: `Bucket ${bucketName} already exists` }),
          { headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    } catch (listError) {
      console.error("Error checking if bucket exists:", listError);
      // Continue anyway, we'll try to create it
    }
    
    // Try to create the bucket
    try {
      const { data, error } = await supabaseAdmin.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: [
          'image/png', 'image/jpeg', 'image/gif', 'image/webp',
          'application/pdf', 
          'video/mp4', 
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/msword',
          'application/vnd.ms-excel',
          'text/plain',
          'text/csv'
        ]
      });
      
      if (error) {
        // If the error is because the bucket already exists, that's fine
        if (error.message?.includes('already exists')) {
          console.log(`Bucket ${bucketName} already exists (detected from error)`);
          return new Response(
            JSON.stringify({ success: true, message: `Bucket ${bucketName} already exists` }),
            { headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
        
        console.error(`Error creating bucket ${bucketName}:`, error);
        throw error;
      }
      
      // Once the bucket is created, update its RLS policy to allow public access
      try {
        // Update storage.buckets policy for public access
        const { error: policyError } = await supabaseAdmin.rpc(
          'update_bucket_public_access', 
          { bucket_name: bucketName, public_access: true }
        );
        
        if (policyError) {
          console.warn(`Warning: Failed to set public policy for bucket ${bucketName}:`, policyError);
          // Don't throw here, we'll continue since bucket was created
        } else {
          console.log(`Successfully set public policy for bucket ${bucketName}`);
        }
      } catch (policyError) {
        console.warn(`Warning: Failed to set public policy for bucket ${bucketName}:`, policyError);
        // Don't throw here, we'll continue since bucket was created
      }
      
      console.log(`Successfully created bucket: ${bucketName}`);
      
      return new Response(
        JSON.stringify({ success: true, message: `Bucket ${bucketName} created successfully` }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    } catch (error) {
      console.error(`Error in initialize-storage function:`, error);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error instanceof Error ? error.message : String(error)
        }),
        { 
          status: 500, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }
  } catch (error) {
    console.error(`Error in initialize-storage function:`, error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }
});
