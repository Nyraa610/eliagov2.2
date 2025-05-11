
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "https://esm.sh/resend@1.0.0";

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
    
    // Get the Resend API key from environment variables
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      logEvent('config', 'error', "Missing Resend API key");
      throw new Error("Server configuration error: Missing Resend API key");
    }
    
    const resend = new Resend(resendApiKey);
    
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
    
    // Log the email configuration we're using
    logEvent('config', 'info', "Using Resend email service", {
      hasResendApiKey: !!resendApiKey,
      recipients: recipients.join(','),
      hasCC: ccRecipients.length > 0,
      hasBCC: bccRecipients.length > 0
    });
    
    // Send email using Resend
    const startTime = Date.now();
    const emailResponse = await resend.emails.send({
      from: 'ELIA GO <no-reply@eliago.com>',
      to: recipients,
      cc: ccRecipients.length > 0 ? ccRecipients : undefined,
      bcc: bccRecipients.length > 0 ? bccRecipients : undefined,
      subject: emailRequest.subject,
      html: emailRequest.html,
      text: emailRequest.text
    });
    
    const responseTime = Date.now() - startTime;
    
    if (!emailResponse || emailResponse.error) {
      logEvent('delivery', 'error', `Email error: ${emailResponse?.error?.message || 'Unknown error'}`, {
        errorDetails: emailResponse?.error,
        responseTimeMs: responseTime
      });
      throw new Error(emailResponse?.error?.message || 'Failed to send email');
    }
    
    logEvent('response', 'info', "Email sent successfully", {
      responseTimeMs: responseTime,
      recipients: recipients.length,
      messageId: emailResponse.data?.id
    });
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          messageId: emailResponse.data?.id || `email-${Date.now()}`,
          recipients: [...recipients, ...ccRecipients, ...bccRecipients],
          responseTime: responseTime
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
      errorStack: error.stack,
      errorDetails: error.details || {}
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
