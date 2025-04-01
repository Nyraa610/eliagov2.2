
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    // Get the request payload
    const { bucketName } = await req.json()
    
    if (!bucketName) {
      return new Response(
        JSON.stringify({ error: "Bucket name is required" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    // Check if bucket exists
    const { data: buckets } = await supabaseClient.storage.listBuckets()
    const bucketExists = buckets?.some(b => b.name === bucketName)
    
    if (!bucketExists) {
      // Create the bucket with admin privileges
      const { data, error } = await supabaseClient.storage.createBucket(bucketName, {
        public: true
      })
      
      if (error) {
        throw error
      }
      
      // Create a public policy for the bucket to allow reading files
      const policyQuery = `
        CREATE POLICY "Public Access Policy for ${bucketName}"
        ON storage.objects
        FOR SELECT
        TO public
        USING (bucket_id = '${bucketName}');
        
        CREATE POLICY "Authenticated users can upload to ${bucketName}"
        ON storage.objects
        FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = '${bucketName}');
        
        CREATE POLICY "Users can update their own objects in ${bucketName}"
        ON storage.objects
        FOR UPDATE
        TO authenticated
        USING (bucket_id = '${bucketName}' AND auth.uid() = owner);
        
        CREATE POLICY "Users can delete their own objects in ${bucketName}"
        ON storage.objects
        FOR DELETE
        TO authenticated
        USING (bucket_id = '${bucketName}' AND auth.uid() = owner);
      `
      
      // Execute the policy query
      const { error: policyError } = await supabaseClient.rpc('exec_sql', { query: policyQuery })
      if (policyError) {
        console.error("Error creating policies:", policyError)
        // Continue even if policy creation fails, as the bucket is created
      }
      
      return new Response(
        JSON.stringify({ success: true, message: `Bucket ${bucketName} created successfully` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }
    
    return new Response(
      JSON.stringify({ success: true, message: `Bucket ${bucketName} already exists` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error("Error in initialize-storage function:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
