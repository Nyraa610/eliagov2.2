
import { supabase } from "@/lib/supabase";
import { Company, CompanyWithRole } from "./types";

export const userCompanyService = {
  async getUserCompanies() {
    try {
      console.log("Fetching user companies");
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Error getting authenticated user:", userError);
        throw userError;
      }
      
      if (!userData.user) {
        console.error("No authenticated user found");
        throw new Error("No authenticated user found");
      }
      
      console.log(`Fetching companies for user ID: ${userData.user.id}`);
      
      // Get the user profile including company info
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id, is_company_admin')
        .eq('id', userData.user.id)
        .single();
        
      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        throw profileError;
      }
      
      if (!profile || !profile.company_id) {
        console.log("User is not associated with any company");
        return [];
      }
      
      // Fetch the company details
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', profile.company_id)
        .single();
        
      if (companyError) {
        console.error("Error fetching company by ID:", companyError);
        throw companyError;
      }
      
      // Combine the company data with admin status
      const userCompany = {
        ...company,
        is_admin: profile.is_company_admin || false
      };
      
      console.log(`Retrieved company for user:`, userCompany);
      return [userCompany] as CompanyWithRole[];
    } catch (error) {
      console.error("Exception in getUserCompanies:", error);
      throw error;
    }
  },
  
  async createUserCompany(company: Partial<Company>) {
    try {
      console.log("Creating company for user:", company);
      
      // Get authenticated user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Error getting authenticated user:", userError);
        throw userError;
      }
      
      if (!userData.user) {
        console.error("Authentication required - no user found");
        throw new Error("Authentication required");
      }
      
      console.log("Authenticated user:", userData.user.id);
      
      // Ensure we have at least a company name
      if (!company.name || company.name.trim() === '') {
        console.error("Company name is required but was empty");
        throw new Error("Company name is required");
      }
      
      // First create the company
      console.log("Creating company in database with name:", company.name);
      
      // Simplify the company data to minimize errors
      const companyInsertData = {
        name: company.name.trim(),
        // Only include optional fields if they have values
        ...(company.country && { country: company.country }),
        ...(company.industry && { industry: company.industry }),
        ...(company.website && { website: company.website }),
        ...(company.registry_number && { registry_number: company.registry_number }),
        ...(company.registry_city && { registry_city: company.registry_city })
      };
      
      const { data: createdCompany, error: companyError } = await supabase
        .from('companies')
        .insert([companyInsertData])
        .select()
        .single();
        
      if (companyError) {
        console.error("Error creating company:", companyError);
        
        if (companyError.message && companyError.message.includes("violates row-level security")) {
          throw new Error("Permission denied: You don't have access to create a company");
        }
        
        throw companyError;
      }
      
      if (!createdCompany) {
        console.error("No data returned after company creation");
        throw new Error("Failed to create company: No data returned");
      }
      
      console.log("Company created successfully:", createdCompany);
      
      // Update the user's profile with the company information
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          company_id: createdCompany.id,
          is_company_admin: true
        })
        .eq('id', userData.user.id);
        
      if (profileError) {
        console.error("Error updating user profile with company:", profileError);
        // If we fail to update the profile, try to clean up by deleting the company
        try {
          await supabase.from('companies').delete().eq('id', createdCompany.id);
        } catch (cleanupError) {
          console.error("Failed to clean up company after profile update failure:", cleanupError);
        }
        throw profileError;
      }
      
      console.log("User profile updated with company info successfully");
      
      // Initialize storage for the company
      try {
        console.log("Initializing storage for new company");
        await supabase.functions.invoke('initialize-company-storage', {
          body: { 
            companyId: createdCompany.id, 
            companyName: createdCompany.name 
          }
        });
        console.log("Storage initialization triggered");
      } catch (storageError) {
        console.warn("Failed to initialize storage buckets - this is non-fatal:", storageError);
        // Continue anyway - storage will be initialized when needed
      }
      
      return createdCompany as Company;
    } catch (error) {
      console.error("Exception in createUserCompany:", error);
      throw error;
    }
  }
};
