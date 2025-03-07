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
      
      // First get the list of company IDs the user belongs to
      const { data: memberships, error: membershipError } = await supabase
        .from('company_members')
        .select('company_id, is_admin')
        .eq('user_id', userData.user.id);
        
      if (membershipError) {
        console.error("Error fetching company memberships:", membershipError);
        throw membershipError;
      }
      
      if (!memberships || memberships.length === 0) {
        console.log("User is not a member of any companies");
        return [];
      }
      
      // Extract the company IDs
      const companyIds = memberships.map(m => m.company_id);
      console.log(`User belongs to ${companyIds.length} companies:`, companyIds);
      
      // Create a map of company_id to is_admin status
      const adminStatusMap = {};
      memberships.forEach(membership => {
        adminStatusMap[membership.company_id] = membership.is_admin;
      });
      
      // Fetch the companies by their IDs (no RLS recursion here)
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .in('id', companyIds)
        .order('name');
        
      if (companiesError) {
        console.error("Error fetching companies by IDs:", companiesError);
        throw companiesError;
      }
      
      // Combine the company data with the admin status
      const userCompanies = companies.map(company => ({
        ...company,
        is_admin: adminStatusMap[company.id] || false
      }));
      
      console.log(`Retrieved ${userCompanies.length} companies for user`);
      return userCompanies as CompanyWithRole[];
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
