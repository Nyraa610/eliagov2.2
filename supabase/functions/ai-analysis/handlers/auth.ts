
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client for auth
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

export async function verifyAuth(authHeader: string | null) {
  if (!authHeader) {
    throw new Error('Missing authorization header');
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data, error } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

  if (error) {
    throw new Error(`Auth error: ${error.message}`);
  }

  return data.user;
}
