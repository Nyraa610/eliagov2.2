
import { supabase } from "@/lib/supabase";

export interface CompanyMember {
  id: string;
  company_id: string;
  user_id: string;
  role: string;
  is_admin: boolean;
  created_at: string;
}

export const companyMemberService = {
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
  }
};
