
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestData {
  industry: string;
  industry_name: string;
  followsStandards: boolean;
  selectedStandards: string[];
  reportContent: string;
  email?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Generating ESG QuickStart report");
    
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

    // Parse the request body
    const requestData: RequestData = await req.json();
    
    // Create a PDF representation of the report
    // This is simplified - in a real implementation, we'd use a PDF library
    // For now, we'll return a base64 encoded representation of the content
    
    try {
      // In a real implementation, we would generate a proper PDF here
      // For now, we'll just simulate a PDF by returning the content
      const reportText = requestData.reportContent;
      
      // If email is provided, send the report by email
      if (requestData.email) {
        try {
          // This would be implemented in a real application
          // We'd connect to an email service like SendGrid or use SMTP
          console.log(`Sending report to email: ${requestData.email}`);
          
          // In a real implementation, this would be a call to an email service
          // For now, we'll simulate success
        } catch (emailError) {
          console.error("Error sending email:", emailError);
          // Continue with returning the report even if email fails
        }
      }
      
      // Encode the content as base64 (simulating a PDF)
      const encoder = new TextEncoder();
      const reportBytes = encoder.encode(reportText);
      const reportBase64 = btoa(String.fromCharCode(...new Uint8Array(reportBytes)));
      
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            reportBase64,
            fileName: `ESG_QuickStart_${requestData.industry}_Report.pdf`,
            mimeType: 'application/pdf' // In reality this would be correct
          },
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    } catch (pdfError) {
      console.error("Error generating PDF:", pdfError);
      throw new Error(`PDF generation failed: ${pdfError.message}`);
    }
  } catch (error) {
    console.error("Error in generate-esg-report function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to generate report" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
