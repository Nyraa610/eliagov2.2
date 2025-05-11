
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  from: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
  cc?: string;
  bcc?: string;
  replyTo?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Send Supabase email request received");
    
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
    if (!emailRequest.from || !emailRequest.to || !emailRequest.subject || !emailRequest.html) {
      console.error("Missing required email fields");
      throw new Error("Missing required fields: from, to, subject, or html");
    }

    console.log(`Sending email from ${emailRequest.from} to ${emailRequest.to}`);
    console.log(`Subject: ${emailRequest.subject}`);
    
    try {
      // Use Supabase Auth's built-in email functionality
      // We'll use the raw email API which is accessible via the admin API
      const { error: emailError } = await supabaseAdmin.auth.admin.sendRawEmail({
        email: emailRequest.to,
        subject: emailRequest.subject,
        html_body: emailRequest.html,
        text_body: emailRequest.text,
      });
      
      if (emailError) {
        console.error("Error sending email via Supabase Auth:", emailError);
        throw new Error(`Email sending failed: ${emailError.message}`);
      }
      
      console.log("Email sent successfully via Supabase Auth");
      
      return new Response(
        JSON.stringify({
          success: true,
          data: { messageId: `supabase-auth-email-${Date.now()}` },
          message: "Email sent successfully via Supabase Auth"
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } catch (sendError) {
      console.error("Failed to send email:", sendError);
      throw new Error(`Email sending failed: ${sendError.message}`);
    }
  } catch (error) {
    console.error("Error in send-supabase-email function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to send email" 
      }),
      { 
        status: 200, // Using 200 to avoid parsing issues in the frontend
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
