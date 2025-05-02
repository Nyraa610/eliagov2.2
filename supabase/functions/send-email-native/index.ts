
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

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
    
    logEvent('request', 'info', `Processing email request with subject: ${emailRequest.subject}`);
    
    // Convert recipients to arrays
    const recipients = Array.isArray(emailRequest.to) 
      ? emailRequest.to 
      : [emailRequest.to];
    
    const ccRecipients = emailRequest.cc 
      ? (Array.isArray(emailRequest.cc) ? emailRequest.cc : [emailRequest.cc]) 
      : [];
      
    const bccRecipients = emailRequest.bcc 
      ? (Array.isArray(emailRequest.bcc) ? emailRequest.bcc : [emailRequest.bcc]) 
      : [];
    
    // Send email using Supabase's built-in email service
    const { data, error } = await supabaseAdmin.functions.invoke('send-email-v2', {
      body: {
        to: recipients.join(','),
        cc: ccRecipients.length > 0 ? ccRecipients.join(',') : undefined,
        bcc: bccRecipients.length > 0 ? bccRecipients.join(',') : undefined,
        subject: emailRequest.subject,
        html: emailRequest.html,
        text: emailRequest.text || undefined,
        reply_to: emailRequest.replyTo || undefined,
      }
    });
    
    if (error) {
      logEvent('delivery', 'error', `Email error: ${error.message}`, {
        errorName: error.name,
        errorMessage: error.message
      });
      throw error;
    }
    
    logEvent('response', 'info', "Email processed successfully");
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          messageId: `supabase-email-${Date.now()}`,
          recipients: [...recipients, ...ccRecipients, ...bccRecipients]
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: any) {
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
