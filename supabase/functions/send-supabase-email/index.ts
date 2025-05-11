
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    
    // Here we would normally send the actual email using Supabase or another service.
    // This is a placeholder implementation for development purposes
    
    // Mock successful response
    console.log("Email submitted successfully (mock implementation)");
    
    return new Response(
      JSON.stringify({
        success: true,
        data: { messageId: `mock-${Date.now()}` },
        message: "Email queued for sending"
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
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
