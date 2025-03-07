
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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
    // Create a Supabase client with the service role key (this has admin privileges)
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if this is an admin request
    const authHeader = req.headers.get('Authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);
    const { data: auth, error: authError } = await supabase.auth.getUser(token);

    if (authError || !auth.user) {
      throw new Error('Unauthorized');
    }

    // Get the user's role from their profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', auth.user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    // Create the default company if it doesn't exist
    let defaultCompany;
    const { data: existingCompany, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('name', 'Elia Go')
      .maybeSingle();

    if (companyError) {
      console.error("Error checking for default company:", companyError);
      throw companyError;
    }

    if (!existingCompany) {
      const { data: newCompany, error: createError } = await supabase
        .from('companies')
        .insert([{ name: 'Elia Go' }])
        .select()
        .single();

      if (createError) {
        console.error("Error creating default company:", createError);
        throw createError;
      }

      defaultCompany = newCompany;
      console.log("Created default company:", defaultCompany);
    } else {
      defaultCompany = existingCompany;
      console.log("Using existing default company:", defaultCompany);
    }

    // Get users who don't have a company membership
    const { data: companyMembers, error: memberError } = await supabase
      .from('company_members')
      .select('user_id');

    if (memberError) {
      console.error("Error fetching company members:", memberError);
      throw memberError;
    }

    const memberUserIds = companyMembers.map(member => member.user_id);

    // Get all users
    const { data: allUsers, error: userError } = await supabase
      .from('profiles')
      .select('id');

    if (userError) {
      console.error("Error fetching users:", userError);
      throw userError;
    }

    // Find users without a company
    const usersWithoutCompany = allUsers.filter(user => !memberUserIds.includes(user.id));
    console.log(`Found ${usersWithoutCompany.length} users without a company`);

    // Add these users to the default company
    if (usersWithoutCompany.length > 0) {
      const membersToInsert = usersWithoutCompany.map(user => ({
        user_id: user.id,
        company_id: defaultCompany.id,
        is_admin: true // Make them admins of their own company
      }));

      const { data: insertedMembers, error: insertError } = await supabase
        .from('company_members')
        .insert(membersToInsert)
        .select();

      if (insertError) {
        console.error("Error adding users to default company:", insertError);
        throw insertError;
      }

      console.log(`Added ${insertedMembers.length} users to the default company`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Migration complete. Assigned ${usersWithoutCompany.length} users to the default company.`,
        details: {
          company: defaultCompany,
          usersProcessed: usersWithoutCompany.length
        }
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    console.error("Error in migration:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "An unknown error occurred",
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
});
