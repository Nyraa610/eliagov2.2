
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
      // Prepare recipients
      const recipients = Array.isArray(emailRequest.to) 
        ? emailRequest.to.join(',') 
        : emailRequest.to;
      
      const ccRecipients = emailRequest.cc 
        ? (Array.isArray(emailRequest.cc) ? emailRequest.cc.join(',') : emailRequest.cc) 
        : undefined;
        
      const bccRecipients = emailRequest.bcc 
        ? (Array.isArray(emailRequest.bcc) ? emailRequest.bcc.join(',') : emailRequest.bcc) 
        : undefined;
      
      // Set email sender information
      const emailFrom = Deno.env.get('EMAIL_FROM') || 'no-reply@eliago.com';
      const emailFromName = Deno.env.get('EMAIL_FROM_NAME') || 'ELIA GO';
      const sender = `${emailFromName} <${emailFrom}>`;
      
      console.log(`Sending from: ${sender}`);
      
      // Use Supabase's Email API directly via edge function
      // This approach should be more reliable than the previous implementation
      // that was generating the errors
      const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-supabase-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        },
        body: JSON.stringify({
          from: sender,
          to: recipients,
          subject: emailRequest.subject,
          html: emailRequest.html,
          text: emailRequest.text,
          cc: ccRecipients,
          bcc: bccRecipients,
          replyTo: emailRequest.replyTo,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Email sending failed:", errorData);
        throw new Error(`Email service error: ${errorData.error || response.statusText}`);
      }
      
      const result = await response.json();
      console.log("Email sent successfully", result);
      
      return new Response(
        JSON.stringify({ success: true, messageId: result.data?.messageId || 'email-sent' }),
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
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
