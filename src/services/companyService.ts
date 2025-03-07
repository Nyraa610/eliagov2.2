
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
    const { data, error } = await supabase
      .from('company_members')
      .select(`
        company_id,
        is_admin,
        companies:company_id (*)
      `)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
      
    if (error) {
      console.error("Error fetching user companies:", error);
      throw error;
    }
    
    // Transform the data to fix the type issue
    return data.map(item => {
      // Ensure we have all required Company properties
      const company = item.companies as Company;
      return {
        ...company,
        is_admin: item.is_admin
      } as CompanyWithRole;
    });
  },
  
  async createCompany(company: Partial<Company>) {
    const { data, error } = await supabase
      .from('companies')
      .insert([company])
      .select()
      .single();
      
    if (error) {
      console.error("Error creating company:", error);
      throw error;
    }
    
    // Add current user as an admin member
    const user = (await supabase.auth.getUser()).data.user;
    if (user) {
      await companyMemberService.addMember(data.id, user.id, true);
    }
    
    return data as Company;
  },
  
  async updateCompany(id: string, updates: Partial<Company>) {
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
  },
  
  async deleteCompany(id: string) {
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error("Error deleting company:", error);
      throw error;
    }
    
    return true;
  },
};
