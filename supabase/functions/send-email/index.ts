
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

// Send email using SMTP
async function sendEmail(emailRequest: EmailRequest) {
  const config = getSmtpConfig();
  
  console.log(`Connecting to SMTP server ${config.host}:${config.port}`);
  console.log(`Using credentials for user: ${config.username}`);
  
  // Check if password is available (don't log the actual password)
  if (!config.password) {
    console.error("SMTP password is not configured!");
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
    
    console.log("Attempting TLS connection to SMTP server...");
    
    // Gmail requires TLS
    try {
      await client.connectTLS(connectConfig);
      console.log("Successfully connected to SMTP server using TLS");
    } catch (connError) {
      console.error("TLS connection error:", connError);
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
    
    console.log(`Sending email to recipients: ${recipients.join(', ')}`);
    
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
    
    console.log("Email sent successfully with message ID:", emailResponse.messageId);
    
    await client.close();
    console.log("SMTP connection closed");
    
    return {
      success: true,
      messageId: emailResponse.messageId,
      recipients: allRecipients
    };
  } catch (error) {
    console.error("SMTP error:", error);
    
    try {
      await client.close();
      console.log("SMTP connection closed after error");
    } catch (closeError) {
      console.error("Error closing SMTP connection:", closeError);
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
    console.log("Email request received");
    
    // Parse the email request
    const emailRequest: EmailRequest = await req.json();
    
    // Validate the request
    if (!emailRequest.to || !emailRequest.subject || !emailRequest.html) {
      console.error("Missing required fields in email request");
      throw new Error("Missing required fields: to, subject, or html");
    }
    
    console.log(`Processing email request with subject: ${emailRequest.subject}`);
    
    // Send the email
    const result = await sendEmail(emailRequest);
    
    console.log("Email processed successfully");
    
    return new Response(
      JSON.stringify({ success: true, data: result }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    
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
