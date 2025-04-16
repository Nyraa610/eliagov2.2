
import { supabase } from "@/integrations/supabase/client";
import { supabaseStorageService, UploadedDocument } from "./storage/supabaseStorageService";

export type StakeholderIdentification = {
  companyDescription: string;
  stakeholderTypes: string[];
  documents: string[];
};

export const stakeholderService = {
  /**
   * Upload documents related to stakeholders
   * @param files Array of files to upload
   * @returns Promise with array of uploaded document file names
   */
  async uploadStakeholderDocuments(files: File[]): Promise<UploadedDocument[]> {
    try {
      // Get company ID for the current user
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error("User not authenticated");
      }
      
      // Get user's profile to find their company ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', userData.user.id)
        .single();
        
      if (!profile || !profile.company_id) {
        throw new Error("User is not associated with a company");
      }
      
      // Define a folder path using the company ID
      const folderPath = `company-${profile.company_id}/stakeholders`;
      
      // Upload files using storage service
      return await supabaseStorageService.uploadDocuments(files, folderPath);
    } catch (error) {
      console.error("Error uploading stakeholder documents:", error);
      throw error;
    }
  },
  
  /**
   * Save identified stakeholders information
   * @param data Stakeholder identification data
   * @returns Promise indicating success
   */
  async saveIdentifiedStakeholders(data: StakeholderIdentification): Promise<void> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error("User not authenticated");
      }
      
      // Get current assessment progress
      const { data: progress, error: progressError } = await supabase
        .from('assessment_progress')
        .select('*')
        .eq('user_id', userData.user.id)
        .eq('assessment_type', 'stakeholder_mapping')
        .single();
        
      const formData = {
        identification: {
          companyDescription: data.companyDescription,
          stakeholderTypes: data.stakeholderTypes,
          documents: data.documents
        }
      };
      
      if (progressError || !progress) {
        // Create new assessment progress
        await supabase
          .from('assessment_progress')
          .insert({
            user_id: userData.user.id,
            assessment_type: 'stakeholder_mapping',
            status: 'in_progress',
            progress: 25,
            form_data: formData
          });
      } else {
        // Update existing assessment progress
        const existingData = progress.form_data || {};
        
        await supabase
          .from('assessment_progress')
          .update({
            progress: Math.max(progress.progress, 25),
            form_data: {
              ...existingData,
              identification: formData.identification
            }
          })
          .eq('id', progress.id);
      }
    } catch (error) {
      console.error("Error saving stakeholder identification:", error);
      throw error;
    }
  },
  
  /**
   * Auto-identify stakeholders based on company description
   * @param companyDescription Description of the company
   * @returns Object with identified stakeholders
   */
  async autoIdentifyStakeholders(companyDescription: string): Promise<{ stakeholders: string[] }> {
    // This is a simplified implementation - in a real app, you might use an AI service
    // to analyze the company description and identify relevant stakeholders
    
    const companyDescLower = companyDescription.toLowerCase();
    const identifiedStakeholders: string[] = [];
    
    // Simple keyword matching
    if (companyDescLower.includes("employee") || companyDescLower.includes("staff") || 
        companyDescLower.includes("personnel") || companyDescLower.includes("workforce")) {
      identifiedStakeholders.push("Employees");
    }
    
    if (companyDescLower.includes("investor") || companyDescLower.includes("shareholder") || 
        companyDescLower.includes("stock") || companyDescLower.includes("ownership")) {
      identifiedStakeholders.push("Shareholders/Investors");
    }
    
    if (companyDescLower.includes("customer") || companyDescLower.includes("client") || 
        companyDescLower.includes("consumer") || companyDescLower.includes("buyer")) {
      identifiedStakeholders.push("Customers/Clients");
    }
    
    if (companyDescLower.includes("supplier") || companyDescLower.includes("vendor") || 
        companyDescLower.includes("provider") || companyDescLower.includes("distributor")) {
      identifiedStakeholders.push("Suppliers/Vendors");
    }
    
    if (companyDescLower.includes("community") || companyDescLower.includes("neighborhood") || 
        companyDescLower.includes("local") || companyDescLower.includes("resident")) {
      identifiedStakeholders.push("Local Communities");
    }
    
    if (companyDescLower.includes("government") || companyDescLower.includes("authority") || 
        companyDescLower.includes("public sector") || companyDescLower.includes("official")) {
      identifiedStakeholders.push("Government Bodies");
    }
    
    if (companyDescLower.includes("regulator") || companyDescLower.includes("compliance") || 
        companyDescLower.includes("standard") || companyDescLower.includes("regulation")) {
      identifiedStakeholders.push("Regulators");
    }
    
    if (companyDescLower.includes("ngo") || companyDescLower.includes("non-profit") || 
        companyDescLower.includes("organization") || companyDescLower.includes("advocacy")) {
      identifiedStakeholders.push("NGOs/Civil Society Organizations");
    }
    
    return { stakeholders: identifiedStakeholders };
  }
};
