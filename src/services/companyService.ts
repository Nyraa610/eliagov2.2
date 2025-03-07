
import { supabase } from "@/lib/supabase";
import { storageService } from "./storageService";

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

export interface CompanyMember {
  id: string;
  company_id: string;
  user_id: string;
  role: string;
  is_admin: boolean;
  created_at: string;
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
    
    return data.map(item => ({
      ...item.companies,
      is_admin: item.is_admin
    })) as (Company & { is_admin: boolean })[];
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
      await this.addMember(data.id, user.id, true);
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
  
  async getMembers(companyId: string) {
    const { data, error } = await supabase
      .from('company_members')
      .select(`
        *,
        profiles:user_id (*)
      `)
      .eq('company_id', companyId);
      
    if (error) {
      console.error("Error fetching company members:", error);
      throw error;
    }
    
    return data.map(item => ({
      ...item,
      user: item.profiles
    }));
  },
  
  async addMember(companyId: string, userId: string, isAdmin: boolean = false) {
    const { data, error } = await supabase
      .from('company_members')
      .insert([{
        company_id: companyId,
        user_id: userId,
        is_admin: isAdmin
      }])
      .select()
      .single();
      
    if (error) {
      console.error("Error adding company member:", error);
      throw error;
    }
    
    return data as CompanyMember;
  },
  
  async updateMember(id: string, isAdmin: boolean) {
    const { data, error } = await supabase
      .from('company_members')
      .update({ is_admin: isAdmin })
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error("Error updating company member:", error);
      throw error;
    }
    
    return data as CompanyMember;
  },
  
  async removeMember(id: string) {
    const { error } = await supabase
      .from('company_members')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error("Error removing company member:", error);
      throw error;
    }
    
    return true;
  },
  
  async uploadLogo(companyId: string, file: File) {
    try {
      // First create a folder with the company ID
      const filePath = `${companyId}/${Date.now()}-${file.name}`;
      
      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('company_logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data } = supabase.storage
        .from('company_logos')
        .getPublicUrl(filePath);
        
      // Update company with new logo URL
      await this.updateCompany(companyId, { logo_url: data.publicUrl });
      
      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading company logo:", error);
      throw error;
    }
  }
};
