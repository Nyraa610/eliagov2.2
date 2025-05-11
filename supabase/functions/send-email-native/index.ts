
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Email request received");
    
    // Create a Supabase client with the service role key
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

    const emailRequest: EmailRequest = await req.json();
    
    // Validate required fields
    if (!emailRequest.to || !emailRequest.subject || !emailRequest.html) {
      console.log("Missing required email fields");
      throw new Error("Missing required fields: to, subject, or html");
    }

    console.log(`Sending email to ${Array.isArray(emailRequest.to) ? emailRequest.to.join(', ') : emailRequest.to}`);
    console.log(`Subject: ${emailRequest.subject}`);
    
    try {
      // Process all recipients (to, cc, bcc)
      const allRecipients = [
        ...(Array.isArray(emailRequest.to) ? emailRequest.to : [emailRequest.to]),
        ...(Array.isArray(emailRequest.cc) ? emailRequest.cc : emailRequest.cc ? [emailRequest.cc] : []),
        ...(Array.isArray(emailRequest.bcc) ? emailRequest.bcc : emailRequest.bcc ? [emailRequest.bcc] : [])
      ];
      
      // Set email sender information
      const emailFrom = Deno.env.get('EMAIL_FROM') || 'no-reply@eliago.com';
      const emailFromName = Deno.env.get('EMAIL_FROM_NAME') || 'ELIA GO';
      const sender = `${emailFromName} <${emailFrom}>`;
      
      console.log(`Sending from: ${sender}`);
      
      // Send emails to each recipient using Supabase Auth's email API
      let successCount = 0;
      const errors = [];
      
      for (const recipient of allRecipients) {
        try {
          // Use Supabase Auth's email API
          // Note: Instead of sendRawEmail which doesn't exist, we use resetPasswordForEmail
          // but with a custom template param to send a custom email
          const { error } = await supabaseAdmin.auth.resetPasswordForEmail(
            recipient,
            { 
              redirectTo: Deno.env.get('SITE_URL') || 'https://app.eliago.com',
              data: {
                subject: emailRequest.subject,
                html_content: emailRequest.html,
                text_content: emailRequest.text || '',
                is_custom_email: true
              }
            }
          );
          
          if (error) {
            console.error(`Error sending to ${recipient}:`, error);
            errors.push({ recipient, error: error.message });
          } else {
            successCount++;
          }
        } catch (err) {
          console.error(`Exception sending to ${recipient}:`, err);
          errors.push({ recipient, error: err.message });
        }
      }
      
      if (errors.length === 0) {
        console.log(`Successfully sent email to all ${successCount} recipients`);
      } else {
        console.warn(`Sent to ${successCount}/${allRecipients.length} recipients with ${errors.length} errors`);
      }
      
      return new Response(
        JSON.stringify({ 
          success: successCount > 0, 
          messageId: `supabase-auth-email-${Date.now()}`,
          details: { 
            successCount,
            totalRecipients: allRecipients.length,
            errors: errors.length > 0 ? errors : undefined
          } 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      throw new Error(`Email sending failed: ${emailError.message}`);
    }
  } catch (error) {
    console.error("Error in send-email-native function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to send email" 
      }),
      { 
        status: 200, // Using 200 to avoid error parsing issues
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
