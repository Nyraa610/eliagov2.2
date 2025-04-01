
import { supabase } from "@/lib/supabase";

/**
 * Service for managing company folders in storage
 */
export const companyFolderService = {
  /**
   * Initialize company folder in storage
   * @param companyId Company ID
   * @param companyName Optional company name for logging
   * @returns Promise<boolean> indicating success
   */
  async initializeCompanyFolder(companyId: string, companyName?: string): Promise<boolean> {
    try {
      // First try to check if the company folder already exists
      const { data: files, error: listError } = await supabase.storage
        .from('company_documents_storage')
        .list(companyId);
      
      // If folder exists, we're done
      if (!listError && files?.length > 0) {
        console.log(`Company folder for ${companyId} already exists`);
        return true;
      }
      
      // If we can't list (likely due to folder not existing), invoke the edge function
      const { data, error } = await supabase.functions.invoke('initialize-company-storage', {
        body: { companyId, companyName }
      });
      
      if (error) {
        console.error('Error initializing company folder:', error);
        // Fallback to direct creation if the function fails
        return await this.createCompanyFolderDirectly(companyId);
      }
      
      console.log('Company folder initialized:', data);
      return true;
    } catch (error) {
      console.error('Error in initializeCompanyFolder:', error);
      // Try direct creation as fallback
      return await this.createCompanyFolderDirectly(companyId);
    }
  },
  
  /**
   * Direct fallback method to create company folder without edge function
   * This is used if the edge function call fails
   */
  async createCompanyFolderDirectly(companyId: string): Promise<boolean> {
    try {
      // Upload a zero-byte file to create the directory
      const { error } = await supabase.storage
        .from('company_documents_storage')
        .upload(`${companyId}/.folder`, new Blob([]), {
          contentType: 'application/x-directory',
          upsert: true
        });
        
      if (error) {
        console.error('Error in direct folder creation:', error);
        return false;
      }
      
      // Also create personal subfolder
      await supabase.storage
        .from('company_documents_storage')
        .upload(`personal/${companyId}/.folder`, new Blob([]), {
          contentType: 'application/x-directory',
          upsert: true
        });
        
      return true;
    } catch (error) {
      console.error('Error in createCompanyFolderDirectly:', error);
      return false;
    }
  },
  
  /**
   * Create folder for all existing companies
   * This is useful for initializing the system
   */
  async initializeAllCompanyFolders(): Promise<void> {
    try {
      const { data: companies, error } = await supabase
        .from('companies')
        .select('id, name');
        
      if (error) {
        console.error('Error fetching companies:', error);
        return;
      }
      
      // Process each company
      for (const company of companies) {
        await this.initializeCompanyFolder(company.id, company.name);
        console.log(`Initialized folder for company: ${company.name}`);
      }
    } catch (error) {
      console.error('Error initializing all company folders:', error);
    }
  }
};
