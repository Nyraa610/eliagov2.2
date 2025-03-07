
import { supabase } from "@/lib/supabase";
import { Company } from "./types";

export const companyBaseService = {
  async getCompanies() {
    try {
      console.log("Fetching companies list");
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');
        
      if (error) {
        console.error("Error fetching companies:", error);
        throw error;
      }
      
      console.log(`Retrieved ${data?.length || 0} companies`);
      return data as Company[];
    } catch (error) {
      console.error("Exception in getCompanies:", error);
      throw error;
    }
  },
  
  async getCompany(id: string) {
    try {
      console.log(`Fetching company details for ID: ${id}`);
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        console.error("Error fetching company:", error);
        throw error;
      }
      
      console.log("Retrieved company details:", data?.name);
      return data as Company;
    } catch (error) {
      console.error(`Exception in getCompany(${id}):`, error);
      throw error;
    }
  },
  
  async createCompany(company: Partial<Company>) {
    try {
      console.log("Creating company:", company);
      
      // Check for required fields
      if (!company.name || company.name.trim() === '') {
        console.error("Company name is required but was empty");
        throw new Error("Company name is required");
      }
      
      // Create the company with only essential fields
      const companyData = {
        name: company.name.trim(),
        // Only include optional fields if they exist and are not empty
        ...(company.country && { country: company.country }),
        ...(company.industry && { industry: company.industry }),
        ...(company.website && { website: company.website }),
        ...(company.registry_number && { registry_number: company.registry_number }),
        ...(company.registry_city && { registry_city: company.registry_city })
      };
      
      console.log("Simplified company data for creation:", companyData);
      
      // Create the company
      const { data, error } = await supabase
        .from('companies')
        .insert([companyData])
        .select()
        .single();
          
      if (error) {
        console.error("Error creating company:", error);
        
        // Check for specific database errors
        if (error.message && (
            error.message.includes("infinite recursion") || 
            error.message.includes("policy for relation") ||
            error.message.includes("violates row-level security")
        )) {
          throw new Error("Database policy error. This might be due to an issue with user permissions. Please refresh and try again.");
        }
        
        throw error;
      }
      
      if (!data) {
        console.error("No data returned after company creation");
        throw new Error("Failed to create company: No data returned");
      }
      
      console.log("Company created successfully:", data);
      return data as Company;
    } catch (error) {
      console.error("Exception in createCompany:", error);
      throw error;
    }
  },
  
  async updateCompany(id: string, updates: Partial<Company>) {
    try {
      console.log(`Updating company ${id}:`, updates);
      
      const { data, error } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        console.error("Error updating company:", error);
        
        // Check for specific database errors
        if (error.message && (
            error.message.includes("infinite recursion") || 
            error.message.includes("policy for relation") ||
            error.message.includes("violates row-level security")
        )) {
          throw new Error("Database policy error. This might be due to an issue with user permissions. Please refresh and try again.");
        }
        
        throw error;
      }
      
      console.log("Company updated successfully:", data);
      return data as Company;
    } catch (error) {
      console.error(`Exception in updateCompany(${id}):`, error);
      throw error;
    }
  },
  
  async deleteCompany(id: string) {
    try {
      console.log(`Deleting company ${id}`);
      
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error("Error deleting company:", error);
        throw error;
      }
      
      console.log("Company deleted successfully");
      return true;
    } catch (error) {
      console.error(`Exception in deleteCompany(${id}):`, error);
      throw error;
    }
  },
};
