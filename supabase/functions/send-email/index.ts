
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type EmailConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
  from: string;
  fromName: string;
};

// Get environment-based SMTP configuration
const getSmtpConfig = (): EmailConfig => {
  const isDevelopment = Deno.env.get("ENVIRONMENT") === "development";
  
  if (isDevelopment) {
    return {
      host: Deno.env.get("DEV_SMTP_HOST") || "localhost",
      port: parseInt(Deno.env.get("DEV_SMTP_PORT") || "1025", 10),
      username: Deno.env.get("DEV_SMTP_USERNAME") || "",
      password: Deno.env.get("DEV_SMTP_PASSWORD") || "",
      from: Deno.env.get("DEV_EMAIL_FROM") || "dev@example.com",
      fromName: Deno.env.get("DEV_EMAIL_FROM_NAME") || "ELIA GO Development"
    };
  } else {
    // Production configuration - Gmail setup with olive@eliago.com
    return {
      host: "smtp.gmail.com",
      port: 587,
      username: "olive@eliago.com",
      password: Deno.env.get("SMTP_APP_GMAIL_KEY") || "",
      from: "olive@eliago.com",
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
  
  console.log(`[SMTP:${category}][${level}] ${message}`);
  if (details) {
    console.log(JSON.stringify(details, null, 2));
  }
};

// Send email using SMTP
async function sendEmail(emailRequest: EmailRequest) {
  const config = getSmtpConfig();
  
  logEvent('config', 'info', `Using SMTP server ${config.host}:${config.port}`, {
    host: config.host,
    port: config.port,
    username: config.username,
    hasPassword: !!config.password
  });
  
  // Check if password is available (don't log the actual password)
  if (!config.password) {
    logEvent('auth', 'error', "SMTP password is not configured!");
    throw new Error("SMTP password is not available. Please check your configuration.");
  }
  
  const client = new SmtpClient();
  
  try {
    const connectConfig: any = {
      hostname: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
    };
    
    logEvent('connection', 'info', "Attempting TLS connection to SMTP server...");
    
    // Gmail requires TLS
    try {
      await client.connectTLS(connectConfig);
      logEvent('connection', 'info', "Successfully connected to SMTP server using TLS");
    } catch (connError) {
      logEvent('connection', 'error', `TLS connection error: ${connError.message}`, {
        errorName: connError.name,
        errorStack: connError.stack,
        config: {
          hostname: connectConfig.hostname,
          port: connectConfig.port,
          username: connectConfig.username,
          hasPassword: !!connectConfig.password
        }
      });
      throw new Error(`Failed to connect to SMTP server: ${connError.message}`);
    }
    
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
    
    // Process attachments if any
    const attachments = emailRequest.attachments?.map(attachment => ({
      filename: attachment.filename,
      content: Uint8Array.from(atob(attachment.content), c => c.charCodeAt(0)),
      contentType: attachment.contentType,
    })) || [];
    
    const emailResponse = await client.send({
      from: `${config.fromName} <${config.from}>`,
      to: recipients,
      cc: ccRecipients,
      bcc: bccRecipients,
      subject: emailRequest.subject,
      content: emailRequest.html,
      html: emailRequest.html,
      replyTo: emailRequest.replyTo || config.from,
      attachments: attachments,
    });
    
    logEvent('delivery', 'info', `Email sent successfully with message ID: ${emailResponse.messageId}`);
    
    await client.close();
    logEvent('connection', 'info', "SMTP connection closed");
    
    return {
      success: true,
      messageId: emailResponse.messageId,
      recipients: allRecipients
    };
  } catch (error) {
    logEvent('error', 'error', `SMTP error: ${error.message}`, {
      errorName: error.name,
      errorStack: error.stack
    });
    
    try {
      await client.close();
      logEvent('connection', 'info', "SMTP connection closed after error");
    } catch (closeError) {
      logEvent('connection', 'error', `Error closing SMTP connection: ${closeError.message}`);
    }
    
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
