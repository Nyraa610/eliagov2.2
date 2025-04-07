
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
    return {
      host: Deno.env.get("SMTP_HOST") || "smtp.gmail.com",
      port: parseInt(Deno.env.get("SMTP_PORT") || "587", 10),
      username: Deno.env.get("SMTP_USERNAME") || "olive@eliago.com",
      password: Deno.env.get("SMTP_PASSWORD") || "",
      from: Deno.env.get("EMAIL_FROM") || "olive@eliago.com",
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
  
  const client = new SmtpClient();
  
  try {
    const connectConfig: any = {
      hostname: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
    };
    
    // Gmail requires TLS
    await client.connectTLS(connectConfig);
    
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
    
    await client.close();
    
    return {
      success: true,
      messageId: emailResponse.messageId,
      recipients: allRecipients
    };
  } catch (error) {
    console.error("SMTP error:", error);
    
    try {
      await client.close();
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
    // Parse the email request
    const emailRequest: EmailRequest = await req.json();
    
    // Validate the request
    if (!emailRequest.to || !emailRequest.subject || !emailRequest.html) {
      throw new Error("Missing required fields: to, subject, or html");
    }
    
    // Send the email
    const result = await sendEmail(emailRequest);
    
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
