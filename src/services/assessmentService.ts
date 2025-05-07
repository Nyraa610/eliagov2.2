
import { supabase } from "@/lib/supabase";

// Type for assessment results
export type AssessmentType = 
  | 'rse_diagnostic' 
  | 'carbon_evaluation' 
  | 'materiality_analysis' 
  | 'action_plan' 
  | 'iro_analysis'
  | 'value_chain';

// Generic type for status
export type AssessmentStatus = 'not-started' | 'in-progress' | 'waiting-for-approval' | 'blocked' | 'completed';

// Type for assessment progress
export type AssessmentProgress = {
  status: AssessmentStatus;
  progress: number;
  form_data?: any;
};

// Type for document templates
export type DocumentTemplateTypes = 
  | 'esg-diagnostic' 
  | 'carbon-evaluation' 
  | 'materiality_analysis' 
  | 'action-plan' 
  | 'iro';

export const assessmentService = {
  // Get assessment results by type
  getAssessmentResults: async (assessmentType: string) => {
    try {
      console.log(`Fetching results for assessment type: ${assessmentType}`);
      
      const { data, error } = await supabase
        .from('assessment_progress')
        .select('form_data')
        .eq('assessment_type', assessmentType)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle(); // Using maybeSingle instead of single to avoid errors if no data exists
      
      if (error) {
        console.error("Error fetching assessment results:", error);
        return null;
      }
      
      console.log("Assessment results data:", data?.form_data);
      return data?.form_data || null;
    } catch (error) {
      console.error("Failed to get assessment results:", error);
      return null;
    }
  },

  // Get assessment progress
  getAssessmentProgress: async (assessmentType: AssessmentType): Promise<AssessmentProgress | null> => {
    try {
      const { data, error } = await supabase
        .from('assessment_progress')
        .select('status, progress, form_data')
        .eq('assessment_type', assessmentType)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle(); // Using maybeSingle instead of single
      
      if (error) {
        console.error("Error fetching assessment progress:", error);
        return { status: 'not-started', progress: 0 };
      }
      
      return data as AssessmentProgress || { status: 'not-started', progress: 0 };
    } catch (error) {
      console.error("Failed to get assessment progress:", error);
      return { status: 'not-started', progress: 0 };
    }
  },

  // Save assessment progress
  saveAssessmentProgress: async (
    assessmentType: string, 
    status: AssessmentStatus, 
    progress: number, 
    form_data?: any
  ): Promise<boolean> => {
    try {
      console.log(`Saving progress for ${assessmentType}:`, { status, progress, form_data });
      
      // Get user ID from session
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        console.error("No authenticated user found");
        return false;
      }

      const userId = session.session.user.id;
      
      const { error } = await supabase
        .from('assessment_progress')
        .upsert({
          user_id: userId,
          assessment_type: assessmentType,
          status,
          progress,
          form_data,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id, assessment_type'
        });

      if (error) {
        console.error("Error saving assessment progress:", error);
        return false;
      }
      
      console.log(`Successfully saved progress for ${assessmentType}`);
      return true;
    } catch (error) {
      console.error("Failed to save assessment progress:", error);
      return false;
    }
  },

  // Get document template
  getDocumentTemplate: async (assessmentType: string): Promise<any> => {
    try {
      console.log(`Getting document template for: ${assessmentType}`);
      
      // Try to get existing document data first
      const existingData = await assessmentService.getAssessmentResults(assessmentType);
      if (existingData?.documentData) {
        console.log("Found existing document data:", existingData.documentData);
        return existingData.documentData;
      }
      
      // Default template data
      const templateData = {
        title: "Sustainability Assessment and Action Plan",
        companyName: "",
        industry: "",
        date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        preparedBy: "Prepared by Elia Go",
        executiveSummary: {
          summary: "This executive summary provides an overview of the sustainability assessment findings and recommended actions."
        },
        approach: {
          description: "The Elia Go methodology combines international standards with Mediterranean-specific insights to deliver actionable sustainability recommendations."
        },
        esgAssessment: {
          introduction: "This ESG assessment provides a comprehensive review of current sustainability practices and identifies areas for improvement, using the ISO 26000 framework as a reference for responsible business conduct.",
          pillars: [
            {
              name: "Organizational Governance",
              assessment: "Formal governance structure with sustainability oversight."
            },
            {
              name: "Human Rights",
              assessment: "Strong policies in place with room for enhanced implementation."
            },
            {
              name: "Labor Practices",
              assessment: "Good employee relations with opportunity for more formal training."
            },
            {
              name: "Environment",
              assessment: "Basic environmental management with substantial improvement opportunities."
            },
            {
              name: "Fair Operating Practices",
              assessment: "Ethical business practices need more formal documentation."
            },
            {
              name: "Consumer Issues",
              assessment: "Strong customer focus with potential for improvement in sustainability communication."
            },
            {
              name: "Community Involvement",
              assessment: "Some community engagement with room for strategic expansion."
            }
          ]
        },
        carbonFootprint: {
          introduction: "This section provides a snapshot of the organization's carbon footprint across all relevant emission scopes.",
          summary: "Based on our assessment, the total carbon footprint is approximately X tonnes CO2e annually.",
          recommendations: "Key areas for emission reduction include energy efficiency improvements, renewable energy adoption, and optimizing transportation logistics."
        },
        riskOpportunity: {
          introduction: "This matrix highlights the key sustainability risks and opportunities identified during the assessment.",
          risks: [
            { title: "Regulatory Risk", description: "Increasing compliance requirements for sustainability reporting." },
            { title: "Resource Scarcity", description: "Potential supply chain disruptions due to water scarcity in Mediterranean regions." },
            { title: "Climate Change Impact", description: "Physical risk to assets from extreme weather events." }
          ],
          opportunities: [
            { title: "Energy Efficiency", description: "Potential for significant cost reduction through energy efficiency measures." },
            { title: "Green Marketing", description: "Growing consumer preference for sustainable products and services." },
            { title: "Circular Economy", description: "Opportunities for waste reduction and resource recovery." }
          ]
        },
        actionPlan: {
          objective: "Develop and implement a comprehensive sustainability strategy that reduces environmental impact while enhancing business performance.",
          keyActions: [
            "Establish formal sustainability governance and reporting structure",
            "Implement energy efficiency measures across all locations",
            "Develop and roll out supplier sustainability assessment program",
            "Launch employee engagement campaign on sustainability topics"
          ],
          benefits: "This approach integrates sustainability into core business operations, leading to cost savings, improved reputation, enhanced compliance, and better prepared for future regulations.",
          roadmap: [
            { timeframe: "Immediate (1-3 months)", actions: "Form sustainability committee, conduct baseline assessments" },
            { timeframe: "Short-term (3-6 months)", actions: "Implement quick wins in energy efficiency, develop policies" },
            { timeframe: "Medium-term (6-12 months)", actions: "Roll out supplier program, staff training" },
            { timeframe: "Long-term (1-2 years)", actions: "Renewable energy transition, circular economy initiatives" }
          ]
        },
        financialImpact: {
          introduction: "This section outlines the projected financial impacts of implementing the recommended sustainability actions.",
          summary: "Based on our analysis, implementing the full action plan is expected to result in net positive financial returns within 2-3 years through cost savings and new business opportunities.",
          details: "Key financial benefits include reduced energy costs (15-20% savings potential), waste management savings (10-15%), and potential new revenue from sustainable products and services."
        }
      };
      
      console.log("Returning default template data");
      return templateData;
    } catch (error) {
      console.error("Failed to get document template:", error);
      return null; 
    }
  },
  
  saveDocumentData: async (assessmentType: string, documentData: any): Promise<boolean> => {
    try {
      console.log(`Saving document data for ${assessmentType}:`, documentData);
      
      // Get existing assessment data
      const existingData = await assessmentService.getAssessmentResults(assessmentType) || {};
      
      // Update the document data in the form_data object
      const updatedData = {
        ...existingData,
        documentData: documentData
      };
      
      // Save back to assessment_progress table
      const success = await assessmentService.saveAssessmentProgress(
        assessmentType, 
        'completed', 
        100, 
        updatedData
      );
      
      return success;
    } catch (error) {
      console.error("Failed to save document data:", error);
      return false;
    }
  },

  exportDocument: async (assessmentType: string, documentData: any, format: 'pdf' | 'word', filename: string): Promise<boolean> => {
    try {
      console.log(`Exporting ${assessmentType} as ${format}:`, { documentData, filename });
      
      // In a real implementation, this would call an API to generate the document
      // For now, just create a simple text file for download
      const content = JSON.stringify(documentData, null, 2);
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error(`Failed to export document as ${format}:`, error);
      return false;
    }
  }
};
