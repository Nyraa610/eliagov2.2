
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeliverableUploadRequest {
  companyId: string;
  documentName: string;
  uploadedBy: string;
  documentUrl: string;
}

const sendEmail = async (to: string, subject: string, message: string) => {
  // Send email using your email service
  try {
    // Depending on your email provider, you might use different methods
    // This example assumes you have a separate email service
    const emailApi = Deno.env.get("EMAIL_API_ENDPOINT");
    
    if (!emailApi) {
      console.error("EMAIL_API_ENDPOINT environment variable not set");
      return false;
    }
    
    const response = await fetch(emailApi, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("EMAIL_API_KEY")}`,
      },
      body: JSON.stringify({
        to,
        subject,
        message,
      }),
    });
    
    if (!response.ok) {
      console.error("Failed to send email:", await response.text());
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Get environment variables
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Environment variables are not set");
    return new Response(
      JSON.stringify({ error: "Server configuration error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  try {
    // Parse the request body
    const { companyId, documentName, uploadedBy, documentUrl } = await req.json() as DeliverableUploadRequest;
    
    // Create a Supabase client with the service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the company information
    const { data: companyData, error: companyError } = await supabase
      .from("companies")
      .select("name")
      .eq("id", companyId)
      .single();
    
    if (companyError) {
      console.error("Error fetching company:", companyError);
      return new Response(
        JSON.stringify({ error: "Error fetching company" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get the uploader's information
    const { data: uploaderData, error: uploaderError } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", uploadedBy)
      .single();
    
    if (uploaderError) {
      console.error("Error fetching uploader:", uploaderError);
    }
    
    // Get all users associated with this company
    const { data: companyUsers, error: userError } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .eq("company_id", companyId);
    
    if (userError) {
      console.error("Error fetching company users:", userError);
      return new Response(
        JSON.stringify({ error: "Error fetching company users" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Create notifications for all users
    const notifications = companyUsers.map(user => ({
      title: "New Deliverable Available",
      message: `A new deliverable "${documentName}" has been uploaded for ${companyData.name}`,
      recipient_id: user.id,
      notification_type: "deliverable_created",
      company_id: companyId,
      sender_id: uploadedBy,
      is_read: false,
      metadata: JSON.stringify({
        documentName,
        documentUrl,
        uploaderName: uploaderData?.full_name || "A consultant",
      })
    }));
    
    // Insert notifications into the database
    const { error: notificationError } = await supabase
      .from("notifications")
      .insert(notifications);
    
    if (notificationError) {
      console.error("Error creating notifications:", notificationError);
    }
    
    // Send email notifications
    const emailSubject = `New Deliverable Available from Elia Go`;
    const emailMessage = `
      <h1>New Deliverable Available</h1>
      <p>Hello,</p>
      <p>A new deliverable "${documentName}" has been uploaded for ${companyData.name} by ${uploaderData?.full_name || "a consultant"}.</p>
      <p>You can view this document by logging into your Elia Go account.</p>
      <p>Best regards,<br>The Elia Go Team</p>
    `;
    
    // Send emails to all company users
    for (const user of companyUsers) {
      if (user.email) {
        await sendEmail(user.email, emailSubject, emailMessage);
      }
    }
    
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
