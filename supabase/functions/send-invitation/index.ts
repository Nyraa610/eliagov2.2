
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

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
    // Create a Supabase client with the service role key (has admin privileges)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get request body
    const { email, companyId, role = 'user', inviterInfo } = await req.json();
    console.log(`Sending invitation to ${email} for company ${companyId} (role: ${role})`);

    if (!email || !companyId) {
      throw new Error('Email and company ID are required');
    }

    // Get company details
    const { data: companyData, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('name')
      .eq('id', companyId)
      .single();
      
    if (companyError) {
      console.error("Error fetching company details:", companyError);
      throw new Error(`Failed to get company details: ${companyError.message}`);
    }
    
    // Store the invitation in the database
    const { error: inviteError } = await supabaseAdmin
      .from('invitations')
      .insert({
        email: email.toLowerCase(),
        company_id: companyId,
        role: role,
        invited_by: inviterInfo?.id,
        status: 'pending'
      });

    if (inviteError) {
      console.error("Error storing invitation:", inviteError);
      // If the error is a duplicate, we can continue (user was already invited)
      if (inviteError.code !== '23505') { // Postgres unique constraint violation
        throw new Error(`Failed to store invitation: ${inviteError.message}`);
      }
    }
    
    // Create custom email template with proper invitation details
    const emailSubject = `Invitation to join ${companyData.name} on ELIA GO`;
    const appUrl = Deno.env.get('APP_URL') || 'https://app.eliago.com';
    const loginUrl = `${appUrl}/login?invitation=true&email=${encodeURIComponent(email)}&company=${companyId}`;
    
    const roleName = role === 'admin' ? 'Company Administrator' : 
                   role === 'consultant' ? 'Consultant' : 'Company Member';
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
        <h1 style="color: #4F46E5;">You've Been Invited!</h1>
        <p>Hello,</p>
        <p>You've been invited to join <strong>${companyData.name}</strong> on the ELIA GO platform.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Invitation Details:</h3>
          <p><strong>Organization:</strong> ${companyData.name}</p>
          <p><strong>Invited by:</strong> ${inviterInfo?.name || 'A company administrator'} (${inviterInfo?.email || 'No email provided'})</p>
          <p><strong>Role:</strong> ${roleName}</p>
        </div>
        
        <p>ELIA GO is a sustainability management platform that helps companies track ESG metrics, generate reports, and develop action plans.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Accept Invitation</a>
        </div>
        
        <p style="font-size: 14px; color: #666;">If the button doesn't work, please copy and paste this URL into your browser: ${loginUrl}</p>
        
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;">
        <p style="font-size: 12px; color: #999;">If you believe this invitation was sent by mistake, you can safely ignore this email.</p>
      </div>
    `;

    // Send invitation via Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: loginUrl,
      data: {
        company_id: companyId,
        role: role,
        invitation_details: {
          company_name: companyData.name,
          inviter: inviterInfo || { name: 'A company administrator' },
          role: roleName
        }
      },
    });

    if (error) {
      console.error("Error sending invitation:", error);
      throw new Error(`Failed to send invitation: ${error.message}`);
    }
    
    // Send a custom email with better formatting and details
    try {
      const { error: emailError } = await supabaseAdmin.functions.invoke("send-email-native", {
        body: {
          to: email,
          subject: emailSubject,
          html: emailHtml
        }
      });
      
      if (emailError) {
        console.error("Error sending formatted email:", emailError);
        // Don't throw an error here, as the official invitation was already sent
      }
    } catch (emailErr) {
      console.error("Exception sending formatted email:", emailErr);
      // Don't throw an error here, as the official invitation was already sent
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Invitation sent to ${email}` 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error("Error in send-invitation function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
