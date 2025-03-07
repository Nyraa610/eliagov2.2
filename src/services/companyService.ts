
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
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name');
      
    if (error) {
      console.error("Error fetching companies:", error);
      throw error;
    }
    
    return data as Company[];
  },
  
  async getCompany(id: string) {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error("Error fetching company:", error);
      throw error;
    }
    
    return data as Company;
  },
  
  async getUserCompanies() {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Error getting authenticated user:", userError);
        throw userError;
      }
      
      if (!userData.user) {
        throw new Error("No authenticated user found");
      }
      
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
      
      // Transform the data to fix the type issue
      return data.map(item => {
        return {
          ...((item.companies as unknown) as Company),
          is_admin: item.is_admin
        } as CompanyWithRole;
      });
    } catch (error) {
      console.error("Error in getUserCompanies:", error);
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
      
      // Attempt to insert the company
      const { data, error } = await supabase
        .from('companies')
        .insert([company])
        .select()
        .single();
        
      if (error) {
        console.error("Error creating company:", error);
        throw error;
      }
      
      if (!data) {
        console.error("No data returned after company creation");
        throw new Error("Failed to create company: No data returned");
      }
      
      console.log("Company created successfully:", data);
      
      // Add current user as an admin member
      console.log("Adding user as company admin:", userData.user.id);
      await companyMemberService.addMember(data.id, userData.user.id, true);
      console.log("User added as company admin successfully");
      
      return data as Company;
    } catch (error) {
      console.error("Error in createCompany:", error);
      throw error;
    }
  },
  
  async updateCompany(id: string, updates: Partial<Company>) {
    try {
      const { data, error } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        console.error("Error updating company:", error);
        throw error;
      }
      
      return data as Company;
    } catch (error) {
      console.error("Error in updateCompany:", error);
      throw error;
    }
  },
  
  async deleteCompany(id: string) {
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error("Error deleting company:", error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error("Error in deleteCompany:", error);
      throw error;
    }
  },
};
