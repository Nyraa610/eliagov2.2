
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

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
    
    const emailRequest: EmailRequest = await req.json();
    
    // Validate required fields
    if (!emailRequest.from || !emailRequest.to || !emailRequest.subject || !emailRequest.html) {
      console.error("Missing required email fields");
      throw new Error("Missing required fields: from, to, subject, or html");
    }

    console.log(`Sending email from ${emailRequest.from} to ${emailRequest.to}`);
    console.log(`Subject: ${emailRequest.subject}`);
    
    // Get SMTP configuration from environment variables
    const smtpHost = Deno.env.get("SMTP_HOST");
    const smtpPort = parseInt(Deno.env.get("SMTP_PORT") || "587");
    const smtpUser = Deno.env.get("SMTP_USERNAME");
    const smtpPassword = Deno.env.get("SMTP_PASSWORD");
    const secure = (Deno.env.get("SMTP_SECURE") || "false") === "true";

    // Check if we have all required SMTP configuration
    if (!smtpHost || !smtpUser || !smtpPassword) {
      console.error("Missing SMTP configuration");
      console.error(`SMTP_HOST: ${smtpHost ? "Set" : "Not set"}`);
      console.error(`SMTP_USERNAME: ${smtpUser ? "Set" : "Not set"}`);
      console.error(`SMTP_PASSWORD: ${smtpPassword ? "Length: " + smtpPassword.length : "Not set"}`);
      throw new Error("SMTP configuration is incomplete. Please set SMTP_HOST, SMTP_USERNAME, and SMTP_PASSWORD.");
    }

    console.log(`Connecting to SMTP server at ${smtpHost}:${smtpPort}`);

    // Configure SMTP client
    const client = new SmtpClient();
    
    try {
      await client.connectTLS({
        hostname: smtpHost,
        port: smtpPort,
        username: smtpUser,
        password: smtpPassword,
      });
      
      console.log("Successfully connected to SMTP server");
    } catch (connectionError) {
      console.error("Failed to connect to SMTP server:", connectionError);
      throw new Error(`SMTP connection error: ${connectionError.message}`);
    }

    // Parse CC and BCC recipients if provided
    const ccRecipients = emailRequest.cc ? emailRequest.cc.split(',') : [];
    const bccRecipients = emailRequest.bcc ? emailRequest.bcc.split(',') : [];

    // Send the email
    try {
      const sendResult = await client.send({
        from: emailRequest.from,
        to: [emailRequest.to],
        cc: ccRecipients,
        bcc: bccRecipients,
        subject: emailRequest.subject,
        content: emailRequest.html,
        html: emailRequest.html,
      });
      
      console.log("Email sent successfully:", sendResult);
      
      // Close the SMTP connection
      await client.close();
      
      return new Response(
        JSON.stringify({
          success: true,
          data: { messageId: sendResult.messageId || `smtp-${Date.now()}` },
          message: "Email sent successfully"
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
