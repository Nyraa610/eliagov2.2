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
    console.log("Starting send-invitation function...");
    
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
    const body = await req.json();
    const { email, companyId, role = 'user', inviterInfo } = body;
    
    console.log(`Sending invitation to ${email} for company ${companyId} (role: ${role})`);
    console.log("Inviter info:", inviterInfo);

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
    
    console.log("Company data retrieved:", companyData);

    // Check if invitation already exists and is still pending
    const { data: existingInvitation, error: inviteCheckError } = await supabaseAdmin
      .from('invitations')
      .select('id, status')
      .eq('email', email.toLowerCase())
      .eq('company_id', companyId)
      .eq('status', 'pending') // Only consider pending invitations as duplicates
      .maybeSingle();
      
    if (inviteCheckError && inviteCheckError.code !== 'PGRST116') {
      console.error("Error checking existing invitation:", inviteCheckError);
      throw new Error(`Failed to check existing invitation: ${inviteCheckError.message}`);
    }
    
    if (existingInvitation) {
      // Return a specific response for existing invitation
      return new Response(
        JSON.stringify({
          success: false,
          code: "DUPLICATE_INVITATION",
          details: {
            status: existingInvitation.status
          }
        }),
        { 
          status: 200, // Changed from 409 to avoid error parsing issues in the frontend
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Store the invitation in the database
    const { data: inviteData, error: inviteError } = await supabaseAdmin
      .from('invitations')
      .insert({
        email: email.toLowerCase(),
        company_id: companyId,
        role: role,
        invited_by: inviterInfo?.id,
        status: 'pending'
      })
      .select()
      .single();

    if (inviteError) {
      console.error("Error storing invitation:", inviteError);
      // If the error is a duplicate, we can continue (user was already invited)
      if (inviteError.code !== '23505') { // Postgres unique constraint violation
        throw new Error(`Failed to store invitation: ${inviteError.message}`);
      } else {
        console.log("Invitation already exists, continuing with email sending");
      }
    } else {
      console.log("Invitation saved to database:", inviteData);
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

    // Check if user already exists
    console.log("Checking if user already exists");
    const { data: existingUserData, error: userError } = await supabaseAdmin.auth.admin.listUsers({
      filter: {
        email: email
      }
    });
    
    if (userError) {
      console.error("Error checking existing user:", userError);
    }
    
    let invitationSent = false;
    const existingUsers = existingUserData?.users || [];
    
    console.log(`Found ${existingUsers.length} existing users with this email`);

    try {
      // Send the custom email notification directly with Supabase Auth
      console.log("Sending formatted email via Supabase Auth");

      // Get configured email details for sending
      const emailFrom = Deno.env.get('EMAIL_FROM') || 'no-reply@eliago.com';
      const emailFromName = Deno.env.get('EMAIL_FROM_NAME') || 'ELIA GO';
      
      console.log(`Email will be sent from: ${emailFromName} <${emailFrom}>`);
      
      // Use the configured email setup via send-email-native function
      try {
        const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email-native`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
          },
          body: JSON.stringify({
            to: email,
            subject: emailSubject,
            html: emailHtml
          })
        });
        
        // Get the full response text for debugging
        const responseText = await response.text();
        let responseJson;
        
        try {
          responseJson = JSON.parse(responseText);
          console.log("Email API response:", responseJson);
        } catch (parseError) {
          console.error("Failed to parse email API response:", responseText);
          responseJson = { error: "Invalid JSON response" };
        }
        
        if (!response.ok) {
          throw new Error(`Email service error: ${responseJson.error || response.statusText}`);
        }
        
        if (responseJson.success === false) {
          throw new Error(`Email sending failed: ${responseJson.error || "Unknown error"}`);
        }
        
        console.log("Email sent successfully:", responseJson);
        invitationSent = true;
      } catch (emailErr) {
        console.error("Exception sending formatted email:", emailErr);
        throw new Error(`Failed to send invitation email: ${emailErr.message || "Unknown error"}`);
      }
      
      // If the user exists but we're just sending a notification, we're done
      if (existingUsers.length > 0) {
        console.log("User already exists, notification sent");
      } else {
        // For new users, try to send the Supabase auth invitation as a backup
        try {
          console.log("Sending Supabase auth invitation to new user");
          
          const { data: inviteResult, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
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
            console.error("Error sending auth invitation:", error);
            // Not a fatal error if the email notification was already sent
            if (!invitationSent) {
              throw new Error(`Failed to send invitation: ${error.message}`);
            }
          } else {
            console.log("Supabase auth invitation sent successfully");
            invitationSent = true;
          }
        } catch (inviteError) {
          console.error("Failed to send auth invitation:", inviteError);
          // Not a fatal error if the email notification was already sent
          if (!invitationSent) {
            throw inviteError;
          }
        }
      }
    } catch (emailSendError) {
      console.error("Error in send-invitation function:", emailSendError);
      
      // If the invitation was saved to the database but the email failed,
      // we'll return a partial success to the client
      return new Response(
        JSON.stringify({
          success: false,
          savedInvitation: true,
          message: `Invitation saved, but failed to send email: ${emailSendError.message}`,
          error: emailSendError.message
        }),
        { 
          status: 200, // Changed from 202 to avoid error parsing issues
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Invitation sent to ${email}`,
        invitationSent
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error("Error in send-invitation function:", error);
    
    // Create a user-friendly error message
    const userFriendlyMessage = error.message || "Failed to send invitation";
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: userFriendlyMessage,
        details: error.message
      }),
      { 
        status: 200, // Changed from 400 to avoid error parsing issues
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
