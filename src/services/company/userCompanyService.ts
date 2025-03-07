
import { supabase } from "@/lib/supabase";
import { CompanyWithRole } from "./types";
import { companyMemberService } from "../companyMemberService";

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
          ...((item.companies as unknown) as CompanyWithRole),
          is_admin: item.is_admin
        } as CompanyWithRole;
      });
    } catch (error) {
      console.error("Exception in getUserCompanies:", error);
      throw error;
    }
  },
  
  async createUserCompany(company: Partial<CompanyWithRole>) {
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
      
      // Create company with a direct database insert
      console.log("Creating company via direct insert with name:", company.name);
      
      // Simplify the company data to minimize errors
      const companyData = {
        name: company.name.trim(),
        // Only include optional fields if they have values
        ...(company.country && { country: company.country }),
        ...(company.industry && { industry: company.industry }),
        ...(company.website && { website: company.website }),
        ...(company.registry_number && { registry_number: company.registry_number }),
        ...(company.registry_city && { registry_city: company.registry_city })
      };
      
      // First create the company
      console.log("Inserting company into database:", companyData);
      const { data, error } = await supabase
        .from('companies')
        .insert([companyData])
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
      
      // Then add the user as a company admin with a direct insert
      try {
        console.log("Adding user as company admin via direct insert. User ID:", userData.user.id, "Company ID:", data.id);
        
        const { error: memberError } = await supabase
          .from('company_members')
          .insert([{
            company_id: data.id,
            user_id: userData.user.id,
            is_admin: true
          }]);
          
        if (memberError) {
          console.error("Error adding user as company admin:", memberError);
          // We don't throw here since the company was created successfully
        } else {
          console.log("User added as company admin successfully");
        }
      } catch (memberError) {
        console.error("Exception adding user as company admin:", memberError);
        // We don't throw here since the company was created successfully
      }
      
      return data;
    } catch (error) {
      console.error("Exception in createUserCompany:", error);
      throw error;
    }
  }
};
