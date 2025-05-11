
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get environment-based email configuration
const getEmailConfig = () => {
  const isDevelopment = Deno.env.get("ENVIRONMENT") === "development";
  
  if (isDevelopment) {
    return {
      from: Deno.env.get("DEV_EMAIL_FROM") || "dev@example.com",
      fromName: Deno.env.get("DEV_EMAIL_FROM_NAME") || "ELIA GO Development"
    };
  } else {
    return {
      from: Deno.env.get("EMAIL_FROM") || "no-reply@eliago.com",
      fromName: Deno.env.get("EMAIL_FROM_NAME") || "ELIA GO"
    };
  }
};

// Function to send email using Supabase's built-in email service
async function sendEmail(emailData) {
  try {
    const config = getEmailConfig();
    console.log("[EMAIL:config][info] Using Supabase email sender:", `${config.fromName} <${config.from}>`);
    
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
    
    const recipients = Array.isArray(emailData.to) ? emailData.to : [emailData.to];
    
    console.log("[EMAIL:delivery][info] Sending email to recipients", {
      recipientCount: recipients.length,
      subject: emailData.subject
    });
    
    // Log specific details before attempting to send
    console.log("[EMAIL:delivery][info] Email details before sending", {
      from: `${config.fromName} <${config.from}>`,
      to: recipients,
      subject: emailData.subject,
      hasHtml: !!emailData.html,
      hasAttachments: false
    });
    
    // Send email using Supabase's built-in email sender
    // This uses the email provider configured in the Supabase project settings
    const { error } = await supabaseAdmin.auth.admin.sendEmail(
      emailData.to,
      {
        subject: emailData.subject,
        html: emailData.html,
        textContent: emailData.text
      }
    );
    
    if (error) {
      console.log("[EMAIL:error][error] Email error:", error.message);
      throw error;
    }
    
    console.log("[EMAIL:delivery][info] Email sent successfully");
    
    return {
      success: true,
      messageId: `supabase-email-${Date.now()}`,
      recipients
    };
  } catch (error) {
    console.log("[EMAIL:error][error] Email error:", error.message, {
      errorName: error.name,
      errorStack: error.stack
    });
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[EMAIL:request][info] Email request received");
    
    // Parse the email request
    const emailData = await req.json();
    
    // Validate the request
    if (!emailData.to || !emailData.subject || !emailData.html) {
      console.log("[EMAIL:validation][error] Missing required fields in email request");
      throw new Error("Missing required fields: to, subject, or html");
    }
    
    console.log("[EMAIL:request][info] Processing email request with subject:", emailData.subject);
    
    // Send the email
    const result = await sendEmail(emailData);
    
    console.log("[EMAIL:response][info] Email processed successfully");
    
    return new Response(
      JSON.stringify({ success: true, data: result }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.log("[EMAIL:response][error] Error sending email:", error.message, {
      errorName: error.name,
      errorStack: error.stack
    });
    
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
