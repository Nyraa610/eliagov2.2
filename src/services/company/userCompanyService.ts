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
      
      // First check if the user is a consultant or admin who should see all companies
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single();
      
      if (profileError) {
        console.error("Error checking user role:", profileError);
      } else if (profileData?.role === 'admin' || profileData?.role === 'consultant') {
        console.log(`User is ${profileData.role}, fetching all companies`);
        
        // Fetch all companies for consultants/admins
        const { data: allCompanies, error: companiesError } = await supabase
          .from('companies')
          .select('*')
          .order('name');
          
        if (companiesError) {
          console.error("Error fetching all companies:", companiesError);
          throw companiesError;
        }
        
        // Mark all companies with is_admin: true for consultants/admins
        const userCompanies = allCompanies.map(company => ({
          ...company,
          is_admin: true
        }));
        
        console.log(`Retrieved ${userCompanies.length} companies for ${profileData.role}`);
        return userCompanies as CompanyWithRole[];
      }
      
      console.log(`Fetching companies for regular user ID: ${userData.user.id}`);
      
      // For regular users, continue with normal company access logic
      // First try to get companies through the many-to-many relationship
      const { data: userCompanyRoles, error: rolesError } = await supabase
        .from('company_user_roles')
        .select('company_id, is_admin')
        .eq('user_id', userData.user.id);
        
      if (rolesError) {
        console.error("Error fetching user company roles:", rolesError);
        throw rolesError;
      }
      
      if (!userCompanyRoles || userCompanyRoles.length === 0) {
        console.log("User is not associated with any company through company_user_roles");
        
        // Fallback to profiles table for backward compatibility
        const { data: userProfiles, error: profilesError } = await supabase
          .from('profiles')
          .select('company_id, is_company_admin')
          .eq('id', userData.user.id)
          .maybeSingle();
          
        if (profilesError) {
          console.error("Error fetching user profile:", profilesError);
          throw profilesError;
        }
        
        if (!userProfiles || !userProfiles.company_id) {
          console.log("User is not associated with any company in profiles either");
          return [];
        }
        
        const companyIds = [userProfiles.company_id];
        console.log("Found company in profiles:", companyIds);
        
        // Fetch company details
        const { data: companies, error: companiesError } = await supabase
          .from('companies')
          .select('*')
          .in('id', companyIds);
          
        if (companiesError) {
          console.error("Error fetching companies:", companiesError);
          throw companiesError;
        }
        
        // Combine companies with admin status
        const userCompanies = companies.map(company => ({
          ...company,
          is_admin: userProfiles.is_company_admin || false
        }));
        
        console.log(`Retrieved ${userCompanies.length} companies for user via profiles:`, userCompanies);
        return userCompanies as CompanyWithRole[];
      }
      
      // Extract company IDs from company_user_roles
      const companyIds = userCompanyRoles.map(role => role.company_id);
      console.log("Found companies in company_user_roles:", companyIds);
      
      // Fetch company details
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .in('id', companyIds);
        
      if (companiesError) {
        console.error("Error fetching companies:", companiesError);
        throw companiesError;
      }
      
      // Combine companies with admin status
      const userCompanies = companies.map(company => {
        const role = userCompanyRoles.find(r => r.company_id === company.id);
        return {
          ...company,
          is_admin: role?.is_admin || false
        };
      });
      
      console.log(`Retrieved ${userCompanies.length} companies for user via company_user_roles:`, userCompanies);
      return userCompanies as CompanyWithRole[];
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
        throw companyError;
      }
      
      if (!createdCompany) {
        console.error("No data returned after company creation");
        throw new Error("Failed to create company: No data returned");
      }
      
      console.log("Company created successfully:", createdCompany);
      
      // Create a company_user_roles entry to link user with company
      const { error: roleError } = await supabase
        .from('company_user_roles')
        .insert({ 
          user_id: userData.user.id,
          company_id: createdCompany.id,
          is_admin: true
        });
        
      if (roleError) {
        console.error("Error creating company-user relationship:", roleError);
        
        // Clean up by deleting the company if we can't link it to the user
        try {
          await supabase.from('companies').delete().eq('id', createdCompany.id);
        } catch (cleanupError) {
          console.error("Failed to clean up company after relationship creation failure:", cleanupError);
        }
        
        throw roleError;
      }
      
      console.log("User linked to company successfully via company_user_roles");
      
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
