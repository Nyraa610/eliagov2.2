
import { supabase } from "@/lib/supabase";
import { companyMemberService } from "./companyMemberService";

export interface Company {
  id: string;
  name: string;
  logo_url?: string | null;
  industry?: string | null;
  country?: string | null;
  website?: string | null;
  registry_number?: string | null;
  registry_city?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyWithRole extends Company {
  is_admin: boolean;
}

export const companyService = {
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
      
      const { data, error } = await supabase
        .from('company_members')
        .select(`
          company_id,
          is_admin,
          companies:company_id (*)
        `)
        .eq('user_id', userData.user.id);
        
      if (error) {
        console.error("Error fetching user companies:", error);
        throw error;
      }
      
      console.log(`Retrieved ${data?.length || 0} companies for user`);
      
      // Transform the data to fix the type issue
      return data.map(item => {
        return {
          ...((item.companies as unknown) as Company),
          is_admin: item.is_admin
        } as CompanyWithRole;
      });
    } catch (error) {
      console.error("Exception in getUserCompanies:", error);
      throw error;
    }
  },
  
  async createCompany(company: Partial<Company>) {
    try {
      console.log("Creating company:", company);
      
      // Check for required fields
      if (!company.name || company.name.trim() === '') {
        throw new Error("Company name is required");
      }
      
      // Get authenticated user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Error getting authenticated user:", userError);
        throw userError;
      }
      
      if (!userData.user) {
        throw new Error("Authentication required");
      }
      
      console.log("Authenticated user:", userData.user.id);
      
      // First try to insert the company
      let companyResult;
      try {
        const { data, error } = await supabase
          .from('companies')
          .insert([company])
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
        
        companyResult = data;
        console.log("Company created successfully:", data);
      } catch (companyError) {
        console.error("Company creation failed:", companyError);
        throw companyError;
      }
      
      // Then try to add the user as a company admin in a separate try/catch
      // This way if the company was created but adding the member fails,
      // we still return the company
      try {
        console.log("Adding user as company admin:", userData.user.id);
        await companyMemberService.addMember(companyResult.id, userData.user.id, true);
        console.log("User added as company admin successfully");
      } catch (memberError) {
        console.error("Error adding user as company admin:", memberError);
        // We don't throw here since the company was created successfully
        // Just log the error and continue
      }
      
      return companyResult as Company;
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
