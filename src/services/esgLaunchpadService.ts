
import { supabase } from "@/lib/supabase";
import { aiService } from "./aiService";
import { emailService } from "./emailService";
import { toast } from "sonner";

// Industry sector options
export const industrySectors = [
  { id: "manufacturing", label: "Manufacturing" },
  { id: "technology", label: "Technology & Software" },
  { id: "finance", label: "Financial Services" },
  { id: "healthcare", label: "Healthcare & Pharmaceuticals" },
  { id: "retail", label: "Retail & Consumer Goods" },
  { id: "energy", label: "Energy & Utilities" },
  { id: "construction", label: "Construction & Real Estate" },
  { id: "agriculture", label: "Agriculture & Food" },
  { id: "transport", label: "Transportation & Logistics" },
  { id: "hospitality", label: "Hospitality & Tourism" },
  { id: "education", label: "Education" },
  { id: "professional_services", label: "Professional Services" },
];

// ESG standards options
export const esgStandards = [
  { 
    id: "ecovadis", 
    label: "Ecovadis", 
    description: "A global sustainability ratings platform that assesses companies' ESG performance across 21 criteria in four areas: environment, labor & human rights, ethics, and sustainable procurement." 
  },
  { 
    id: "iso_26000", 
    label: "ISO 26000", 
    description: "An international standard providing guidance on social responsibility, helping organizations operate in an ethical and transparent way that contributes to sustainable development." 
  },
  { 
    id: "label_lucie", 
    label: "Label Lucie", 
    description: "A French CSR certification based on ISO 26000, recognizing organizations' commitments to sustainable development and socially responsible practices." 
  },
  { 
    id: "bcorp", 
    label: "B Corp", 
    description: "A certification for for-profit companies that meet rigorous standards of social and environmental performance, accountability, and transparency." 
  },
  { 
    id: "other", 
    label: "Other", 
    description: "Other ESG standards or frameworks that your organization follows." 
  },
];

export interface SectorProfile {
  id: string;
  name: string;
  description: string;
  key_risks: string[];
  key_opportunities: string[];
  procurement_impacts: string[];
  created_at?: string;
  updated_at?: string;
  is_ai_generated?: boolean;
}

export interface PeerSnapshot {
  id: string;
  sector_id: string;
  company_size: string;
  initiative_title: string;
  initiative_description: string;
  impact_area: string;
  results: string;
  created_at?: string;
}

export interface LaunchpadFormData {
  industry: string;
  followsStandards: boolean;
  selectedStandards: string[];
  email?: string;
  requestId?: string;
}

export interface ReportResult {
  reportContent: string;
  htmlContent?: string;
  pdfUrl?: string;
  emailSent?: boolean;
}

export const esgLaunchpadService = {
  /**
   * Get sector profile data for a specific industry
   */
  getSectorProfile: async (industryId: string): Promise<SectorProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('sector_profiles')
        .select('*')
        .eq('id', industryId)
        .single();
      
      if (error) {
        console.error("Error fetching sector profile:", error);
        
        // If no profile exists, generate one using AI
        return await esgLaunchpadService.generateSectorProfile(industryId);
      }
      
      return data as SectorProfile;
    } catch (error) {
      console.error("Exception in getSectorProfile:", error);
      return null;
    }
  },
  
  /**
   * Generate a sector profile using AI if one doesn't exist
   */
  generateSectorProfile: async (industryId: string): Promise<SectorProfile | null> => {
    try {
      // Find industry name from the ID
      const industry = industrySectors.find(sector => sector.id === industryId);
      if (!industry) return null;
      
      // Generate profile using AI
      const prompt = `Generate a comprehensive ESG (Environmental, Social, Governance) sector profile for the ${industry.label} industry. Include:
      1. A brief description of the sector's ESG context (2-3 sentences)
      2. 4-5 key ESG risks specific to this sector
      3. 4-5 key ESG opportunities specific to this sector
      4. 3 major procurement-chain impacts for this sector
      Format the response as a JSON object with keys: description, key_risks (array), key_opportunities (array), and procurement_impacts (array).`;
      
      const response = await aiService.analyzeContent({
        type: 'esg-assistant',
        content: prompt
      });
      
      let profileData: any;
      try {
        profileData = JSON.parse(response.result);
      } catch (e) {
        console.error("Failed to parse AI response as JSON:", e);
        return null;
      }
      
      // Create a new profile
      const newProfile: SectorProfile = {
        id: industryId,
        name: industry.label,
        description: profileData.description || "",
        key_risks: profileData.key_risks || [],
        key_opportunities: profileData.key_opportunities || [],
        procurement_impacts: profileData.procurement_impacts || [],
        is_ai_generated: true
      };
      
      // Store the generated profile
      const { error } = await supabase
        .from('sector_profiles')
        .insert(newProfile);
      
      if (error) {
        console.error("Error saving generated sector profile:", error);
      }
      
      return newProfile;
    } catch (error) {
      console.error("Exception in generateSectorProfile:", error);
      return null;
    }
  },
  
  /**
   * Get peer snapshots for a specific industry
   */
  getPeerSnapshots: async (industryId: string): Promise<PeerSnapshot[]> => {
    try {
      const { data, error } = await supabase
        .from('peer_snapshots')
        .select('*')
        .eq('sector_id', industryId)
        .limit(3);
      
      if (error) {
        console.error("Error fetching peer snapshots:", error);
        
        // If no snapshots exist, generate them using AI
        return await esgLaunchpadService.generatePeerSnapshots(industryId);
      }
      
      return data as PeerSnapshot[];
    } catch (error) {
      console.error("Exception in getPeerSnapshots:", error);
      return [];
    }
  },
  
  /**
   * Generate peer snapshots using AI if none exist
   */
  generatePeerSnapshots: async (industryId: string): Promise<PeerSnapshot[]> => {
    try {
      // Find industry name from the ID
      const industry = industrySectors.find(sector => sector.id === industryId);
      if (!industry) return [];
      
      // Generate snapshots using AI
      const prompt = `Generate 3 anonymized but realistic ESG initiative snapshots for companies in the ${industry.label} industry. For each snapshot, include:
      1. A company size (small, medium, or large)
      2. Initiative title (brief)
      3. Initiative description (1-2 sentences)
      4. Primary impact area (Environmental, Social, or Governance)
      5. Results achieved (1 sentence)
      Format the response as a JSON array with objects having keys: company_size, initiative_title, initiative_description, impact_area, and results.`;
      
      const response = await aiService.analyzeContent({
        type: 'esg-assistant',
        content: prompt
      });
      
      let snapshotsData: any[];
      try {
        snapshotsData = JSON.parse(response.result);
      } catch (e) {
        console.error("Failed to parse AI response as JSON:", e);
        return [];
      }
      
      // Create new snapshots
      const newSnapshots: PeerSnapshot[] = snapshotsData.map(item => ({
        id: crypto.randomUUID(),
        sector_id: industryId,
        company_size: item.company_size || "",
        initiative_title: item.initiative_title || "",
        initiative_description: item.initiative_description || "",
        impact_area: item.impact_area || "",
        results: item.results || ""
      }));
      
      // Store the generated snapshots
      if (newSnapshots.length > 0) {
        const { error } = await supabase
          .from('peer_snapshots')
          .insert(newSnapshots);
        
        if (error) {
          console.error("Error saving generated peer snapshots:", error);
        }
      }
      
      return newSnapshots;
    } catch (error) {
      console.error("Exception in generatePeerSnapshots:", error);
      return [];
    }
  },
  
  /**
   * Generate a QuickStart report based on user inputs
   */
  generateQuickStartReport: async (formData: LaunchpadFormData): Promise<ReportResult | null> => {
    try {
      // Find industry name from the ID
      const industry = industrySectors.find(sector => sector.id === formData.industry);
      if (!industry) return null;
      
      // Get sector profile
      const profile = await esgLaunchpadService.getSectorProfile(formData.industry);
      if (!profile) return null;
      
      // Log request ID if available for tracking
      if (formData.requestId) {
        console.log(`Processing QuickStart report generation. Request ID: ${formData.requestId}`);
      }
      
      // Create content for the report using AI
      const standardsList = formData.selectedStandards
        .map(id => esgStandards.find(std => std.id === id)?.label || id)
        .join(", ");
      
      const prompt = `Generate a one-page QuickStart ESG report for a company in the ${industry.label} industry.
      ${formData.followsStandards ? `They currently follow these standards: ${standardsList}` : "They don't currently follow any ESG standards."}
      Include:
      1. A brief introduction to ESG relevance for their industry
      2. Key risks and opportunities specific to their sector
      3. How they compare to sector norms based on their standards adoption
      4. 3 specific next step recommendations
      5. A call to action to schedule an expert consultation
      Format the response as markdown with clear sections.`;
      
      console.log(`Sending AI request for report generation. Request ID: ${formData.requestId || 'not specified'}`);
      const response = await aiService.analyzeContent({
        type: 'esg-assessment',
        content: prompt
      });
      
      console.log(`AI response received. Request ID: ${formData.requestId || 'not specified'}`);
      
      const reportContent = response.result;
      
      let emailSent = false;
      let htmlContent = "";
      
      // Generate HTML content for the report (fallback if edge function fails)
      const simpleHtmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>ESG QuickStart Report - ${industry.label}</title>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1, h2, h3 { color: #1e40af; }
            .header { border-bottom: 1px solid #e5e7eb; padding-bottom: 15px; margin-bottom: 20px; }
            .content { margin-bottom: 30px; }
            .footer { border-top: 1px solid #e5e7eb; padding-top: 15px; font-size: 0.9em; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ESG QuickStart Report</h1>
            <p>Industry: ${industry.label}</p>
          </div>
          <div class="content">
            <p>${reportContent.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>
          </div>
          <div class="footer">
            <p>Generated by ELIA GO ESG Platform</p>
          </div>
        </body>
        </html>
      `;
      
      // First try the edge function approach
      try {
        console.log(`Calling edge function for report formatting. Request ID: ${formData.requestId || 'not specified'}`);
        
        // Call the edge function to generate the report and send email
        const result = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-esg-report`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            industry: formData.industry,
            industry_name: industry.label,
            followsStandards: formData.followsStandards,
            selectedStandards: formData.selectedStandards,
            reportContent,
            email: formData.email,
            requestId: formData.requestId
          })
        });
        
        console.log(`Edge function response received. Request ID: ${formData.requestId || 'not specified'}`);
        
        const data = await result.json();
        
        if (data.success) {
          console.log(`Edge function successful. Request ID: ${formData.requestId || 'not specified'}`);
          
          if (formData.email) {
            emailSent = true;
          }
          
          // Decode HTML content if available
          if (data.data.htmlBase64) {
            try {
              const decodedHtml = atob(data.data.htmlBase64);
              htmlContent = decodedHtml;
            } catch (decodeError) {
              console.error("Error decoding HTML content:", decodeError);
              htmlContent = simpleHtmlContent;
            }
          } else {
            htmlContent = simpleHtmlContent;
          }
        } else {
          console.error("Error from edge function:", data.error);
          htmlContent = simpleHtmlContent;
          
          // Try direct email if the edge function failed but email was requested
          if (formData.email) {
            await esgLaunchpadService.sendReportByEmail(formData.email, reportContent, industry.label);
            emailSent = true;
          }
        }
      } catch (error) {
        console.error("Error calling generate-esg-report function:", error);
        console.log("Falling back to simple HTML generation");
        
        htmlContent = simpleHtmlContent;
        
        // Try direct email if the edge function failed but email was requested
        if (formData.email) {
          await esgLaunchpadService.sendReportByEmail(formData.email, reportContent, industry.label);
          emailSent = true;
        }
      }
      
      return {
        reportContent,
        htmlContent,
        emailSent
      };
    } catch (error) {
      console.error("Exception in generateQuickStartReport:", error);
      return null;
    }
  },
  
  /**
   * Send the QuickStart report via email
   */
  sendReportByEmail: async (email: string, report: string, industryName: string): Promise<boolean> => {
    try {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Your ESG QuickStart Report</h1>
          <p>Thank you for using ELIA GO's ESG Launchpad! Here's your personalized QuickStart report for the ${industryName} industry.</p>
          <div style="background-color: #f7f7f7; padding: 20px; border-radius: 5px; margin: 20px 0;">
            ${report.replace(/\n/g, '<br>')}
          </div>
          <p><strong>Next Steps:</strong> To dive deeper into your ESG strategy, consider scheduling a call with one of our ESG experts.</p>
          <p><a href="mailto:contact@eliago.com" style="color: #4F46E5;">Contact us</a> to set up your consultation.</p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">
            This report is generated based on industry benchmarks and the information you provided. 
            For a more detailed assessment, please consider our full ESG diagnostic services.
          </p>
        </div>
      `;
      
      const result = await emailService.sendEmail({
        to: email,
        subject: "Your ESG QuickStart Report from ELIA GO",
        html
      });
      
      return result.success;
    } catch (error) {
      console.error("Error sending report email:", error);
      return false;
    }
  }
};
