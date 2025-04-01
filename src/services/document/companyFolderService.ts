
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
      console.log(`Initializing storage for company: ${companyName || companyId}`);
      
      // First try to invoke the edge function which has admin rights
      const { data, error } = await supabase.functions.invoke('initialize-company-storage', {
        body: { companyId, companyName }
      });
      
      if (error) {
        console.error('Error initializing company folder via edge function:', error);
        // Fallback to direct creation if the function fails
        return await this.createCompanyFolderDirectly(companyId);
      }
      
      console.log('Company folder initialized via edge function:', data);
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
        
      // Create value chain folder
      await supabase.storage
        .from('value_chain_documents')
        .upload(`value_chain/${companyId}/.folder`, new Blob([]), {
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
