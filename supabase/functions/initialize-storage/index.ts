
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Get the request body
    const { bucketName } = await req.json();
    
    if (!bucketName) {
      return new Response(
        JSON.stringify({ error: 'bucketName is required' }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      );
    }
    
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    
    console.log(`Attempting to create bucket: ${bucketName}`);
    
    // List existing buckets
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      throw listError;
    }
    
    // Check if bucket already exists
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    if (bucketExists) {
      console.log(`Bucket ${bucketName} already exists`);
      return new Response(
        JSON.stringify({ message: `Bucket ${bucketName} already exists`, bucketName }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      );
    }
    
    // Create the bucket
    const { data, error } = await supabaseAdmin.storage.createBucket(bucketName, {
      public: true, // Make bucket public
      fileSizeLimit: 50 * 1024 * 1024, // 50MB
    });
    
    if (error) {
      console.error('Error creating bucket:', error);
      throw error;
    }
    
    console.log(`Successfully created bucket: ${bucketName}`);
    
    return new Response(
      JSON.stringify({ 
        message: `Bucket ${bucketName} created successfully`, 
        data, 
        bucketName 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in initialize-storage function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred while initializing storage'
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
