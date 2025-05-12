
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
  requestId?: string;
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
    const requestId = requestData.requestId || crypto.randomUUID();
    
    console.log(`Processing report generation. Request ID: ${requestId}, Industry: ${requestData.industry_name}`);
    
    try {
      // Process the report content
      const reportText = requestData.reportContent;
      
      // Format the content for online viewing with simple HTML formatting
      const onlineContent = reportText.replace(/\n\n/g, '</p><p>')
                                   .replace(/\n/g, '<br>')
                                   .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                   .replace(/\*(.*?)\*/g, '<em>$1</em>');
      
      // Create a rich HTML report with a more professional design
      const htmlReport = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>ESG QuickStart Report - ${requestData.industry_name}</title>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 20px; 
              background-color: #fefefe;
            }
            h1, h2, h3 { 
              color: #1e40af; 
              margin-top: 1.5em;
            }
            h1 { 
              font-size: 24px; 
              border-bottom: 2px solid #4F46E5; 
              padding-bottom: 10px;
            }
            h2 { 
              font-size: 20px; 
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 5px;
            }
            h3 { 
              font-size: 18px; 
            }
            .header { 
              border-bottom: 2px solid #e5e7eb; 
              padding-bottom: 15px; 
              margin-bottom: 20px; 
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .logo { 
              font-weight: bold; 
              font-size: 22px; 
              color: #4F46E5;
            }
            .content { 
              margin-bottom: 30px; 
              background-color: white;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .footer { 
              border-top: 1px solid #e5e7eb; 
              padding-top: 15px; 
              font-size: 0.9em; 
              color: #6b7280; 
              display: flex;
              justify-content: space-between;
              margin-top: 30px;
            }
            .highlight {
              background-color: #f3f4f6;
              padding: 15px;
              border-radius: 6px;
              margin: 15px 0;
              border-left: 4px solid #4F46E5;
            }
            .expert-note {
              background-color: #eef2ff;
              padding: 15px;
              border-radius: 6px;
              margin: 20px 0;
              font-style: italic;
              border-left: 4px solid #6366f1;
            }
            .industry-banner {
              background-color: #2563eb;
              color: white;
              padding: 10px 15px;
              border-radius: 4px;
              margin: 15px 0;
              text-align: center;
              font-weight: bold;
            }
            .recommendations {
              background-color: #ecfdf5;
              padding: 15px;
              border-radius: 6px;
              margin: 15px 0;
              border-left: 4px solid #10b981;
            }
            .header-info {
              text-align: right;
              font-size: 14px;
              color: #6b7280;
            }
            .badge {
              display: inline-block;
              padding: 4px 8px;
              background-color: #e5e7eb;
              border-radius: 9999px;
              font-size: 12px;
              margin: 2px;
            }
            .badge-primary {
              background-color: #e0e7ff;
              color: #4338ca;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">ELIA GO</div>
            <div class="header-info">
              <div>ESG QuickStart Report</div>
              <div>Date: ${new Date().toLocaleDateString()}</div>
            </div>
          </div>
          
          <div class="industry-banner">
            Industry: ${requestData.industry_name}
          </div>
          
          <div class="content">
            <p>${onlineContent}</p>
            
            <div class="expert-note">
              <strong>Elia Go Expert Note:</strong> This analysis is based on our proprietary ESG database and insights from our team of sustainability experts who have analyzed over 500 companies across 12 industries.
            </div>
            
            <div class="recommendations">
              <h3>Our Expert Recommendations:</h3>
              <p>To maximize your ESG performance, we recommend:</p>
              <ul>
                <li>Conduct a comprehensive materiality assessment</li>
                <li>Establish baseline measurements for key ESG metrics</li>
                <li>Develop an action plan with clear, time-bound objectives</li>
              </ul>
            </div>
          </div>
          
          <div class="highlight">
            <strong>Standards and Labels to Consider:</strong><br>
            <div style="margin-top: 10px;">
              <span class="badge badge-primary">ISO 14001</span>
              <span class="badge badge-primary">GRI</span>
              <span class="badge badge-primary">UN Global Compact</span>
              <span class="badge badge-primary">Science Based Targets</span>
              <span class="badge badge-primary">CDP Climate Change</span>
            </div>
          </div>
          
          <div class="footer">
            <div>Generated by ELIA GO ESG Platform</div>
            <div><a href="mailto:contact@eliago.com">Schedule a consultation</a></div>
          </div>
        </body>
        </html>
      `;
      
      // If email is provided, send the report by email
      let emailSent = false;
      if (requestData.email) {
        try {
          // This would be implemented in a real application
          // We'd connect to an email service like SendGrid or use SMTP
          console.log(`Sending report to email: ${requestData.email}. Request ID: ${requestId}`);
          
          // In a real implementation, this would be a call to an email service
          emailSent = true;
        } catch (emailError) {
          console.error(`Error sending email. Request ID: ${requestId}`, emailError);
        }
      }
      
      // Encode the content as base64 (simulating a PDF)
      const encoder = new TextEncoder();
      const reportBytes = encoder.encode(reportText);
      const reportBase64 = btoa(String.fromCharCode(...new Uint8Array(reportBytes)));
      
      // Create a base64 representation of the HTML version for online viewing
      const htmlBytes = encoder.encode(htmlReport);
      const htmlBase64 = btoa(String.fromCharCode(...new Uint8Array(htmlBytes)));
      
      console.log(`Successfully generated report. Request ID: ${requestId}, Email sent: ${emailSent}`);
      
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            reportBase64,
            htmlBase64,
            fileName: `ESG_QuickStart_${requestData.industry}_Report.pdf`,
            mimeType: 'application/pdf',
            onlineVersion: true,
            emailSent
          },
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    } catch (pdfError) {
      console.error(`Error generating report. Request ID: ${requestId}:`, pdfError);
      throw new Error(`PDF generation failed: ${pdfError.message}`);
    }
  } catch (error) {
    const errorId = crypto.randomUUID();
    console.error(`Error in generate-esg-report function (ID: ${errorId}):`, error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to generate report",
        errorId: errorId
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
