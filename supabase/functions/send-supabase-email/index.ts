
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type EmailConfig = {
  from: string;
  fromName: string;
};

// Get environment-based email configuration
const getEmailConfig = (): EmailConfig => {
  const isDevelopment = Deno.env.get("ENVIRONMENT") === "development";
  
  if (isDevelopment) {
    return {
      from: Deno.env.get("DEV_EMAIL_FROM") || "dev@example.com",
      fromName: Deno.env.get("DEV_EMAIL_FROM_NAME") || "ELIA GO Development"
    };
  } else {
    return {
      from: "no-reply@eliago.com",  // This should match your verified sender in Supabase
      fromName: Deno.env.get("EMAIL_FROM_NAME") || "ELIA GO"
    };
  }
};

interface EmailRequest {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: string; // Base64 encoded content
    contentType: string;
  }>;
}

// Structured logging helper
const logEvent = (category: string, level: 'info' | 'warn' | 'error', message: string, details?: any) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    category,
    level,
    message,
    ...(details && { details })
  };
  
  console.log(`[EMAIL:${category}][${level}] ${message}`);
  if (details) {
    console.log(JSON.stringify(details, null, 2));
  }
};

// Send email using Supabase's admin API
async function sendEmail(emailRequest: EmailRequest) {
  const config = getEmailConfig();
  
  logEvent('config', 'info', `Using Supabase email sender: ${config.fromName} <${config.from}>`, {
    from: config.from,
    fromName: config.fromName,
  });
  
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
  
  try {
    const recipients = Array.isArray(emailRequest.to) 
      ? emailRequest.to 
      : [emailRequest.to];
    
    const ccRecipients = emailRequest.cc 
      ? (Array.isArray(emailRequest.cc) ? emailRequest.cc : [emailRequest.cc]) 
      : [];
      
    const bccRecipients = emailRequest.bcc 
      ? (Array.isArray(emailRequest.bcc) ? emailRequest.bcc : [emailRequest.bcc]) 
      : [];
    
    const allRecipients = [...recipients, ...ccRecipients, ...bccRecipients];
    
    logEvent('delivery', 'info', `Sending email to recipients`, {
      recipientCount: recipients.length,
      subject: emailRequest.subject
    });
    
    // Log specific details before attempting to send
    logEvent('delivery', 'info', `Email details before sending`, {
      from: `${config.fromName} <${config.from}>`,
      to: recipients,
      subject: emailRequest.subject,
      hasHtml: !!emailRequest.html,
      hasAttachments: !!emailRequest.attachments && emailRequest.attachments.length > 0
    });
    
    // Use service role to access email send API
    const { error } = await supabaseAdmin.functions.invoke('send-email-v2', {
      body: {
        from: `${config.fromName} <${config.from}>`,
        to: recipients.join(','),
        cc: ccRecipients.join(',') || undefined,
        bcc: bccRecipients.join(',') || undefined,
        subject: emailRequest.subject,
        html: emailRequest.html,
        text: emailRequest.text || undefined,
        reply_to: emailRequest.replyTo || undefined,
      }
    });
    
    if (error) {
      throw error;
    }
    
    logEvent('delivery', 'info', `Email sent successfully`);
    
    return {
      success: true,
      messageId: `supabase-email-${new Date().getTime()}`,
      recipients: allRecipients
    };
  } catch (error) {
    logEvent('error', 'error', `Email error: ${error.message}`, {
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
    logEvent('request', 'info', "Email request received");
    
    // Parse the email request
    const emailRequest: EmailRequest = await req.json();
    
    // Validate the request
    if (!emailRequest.to || !emailRequest.subject || !emailRequest.html) {
      logEvent('validation', 'error', "Missing required fields in email request");
      throw new Error("Missing required fields: to, subject, or html");
    }
    
    logEvent('request', 'info', `Processing email request with subject: ${emailRequest.subject}`);
    
    // Send the email
    const result = await sendEmail(emailRequest);
    
    logEvent('response', 'info', "Email processed successfully");
    
    return new Response(
      JSON.stringify({ success: true, data: result }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    logEvent('response', 'error', `Error sending email: ${error.message}`, {
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
