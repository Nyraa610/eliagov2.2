
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
      
      // Get user's companies through the many-to-many relationship in profiles
      const { data: userProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('company_id, is_company_admin')
        .eq('id', userData.user.id);
        
      if (profilesError) {
        console.error("Error fetching user profiles:", profilesError);
        throw profilesError;
      }
      
      if (!userProfiles || userProfiles.length === 0) {
        console.log("User is not associated with any company");
        return [];
      }
      
      // Extract company IDs
      const companyIds = userProfiles.map(profile => profile.company_id).filter(id => id);
      
      if (companyIds.length === 0) {
        return [];
      }
      
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
        const profile = userProfiles.find(p => p.company_id === company.id);
        return {
          ...company,
          is_admin: profile?.is_company_admin || false
        };
      });
      
      console.log(`Retrieved ${userCompanies.length} companies for user:`, userCompanies);
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
        
        if (companyError.message && companyError.message.includes("violates row-level security")) {
          throw new Error("Permission denied: You don't have access to create a company. Please check with your administrator.");
        }
        
        throw companyError;
      }
      
      if (!createdCompany) {
        console.error("No data returned after company creation");
        throw new Error("Failed to create company: No data returned");
      }
      
      console.log("Company created successfully:", createdCompany);
      
      // Create a profile entry to link user with company
      const { error: profileInsertError } = await supabase
        .from('profiles')
        .insert({ 
          id: userData.user.id,
          email: userData.user.email,
          company_id: createdCompany.id,
          is_company_admin: true,
          role: 'user' // Default role
        });
        
      if (profileInsertError) {
        // If the profile already exists, update it
        if (profileInsertError.message?.includes("duplicate key value")) {
          // Just insert the company relationship
          const { error: relationshipError } = await supabase
            .from('company_user_roles')
            .insert({
              user_id: userData.user.id, 
              company_id: createdCompany.id, 
              is_admin: true
            });
            
          if (relationshipError) {
            console.error("Error creating company-user relationship:", relationshipError);
            
            // Clean up by deleting the company if we can't link it to the user
            try {
              await supabase.from('companies').delete().eq('id', createdCompany.id);
            } catch (cleanupError) {
              console.error("Failed to clean up company after relationship creation failure:", cleanupError);
            }
            
            throw relationshipError;
          }
        } else {
          console.error("Error creating user profile with company:", profileInsertError);
          
          // Clean up by deleting the company
          try {
            await supabase.from('companies').delete().eq('id', createdCompany.id);
          } catch (cleanupError) {
            console.error("Failed to clean up company after profile creation failure:", cleanupError);
          }
          
          throw profileInsertError;
        }
      }
      
      console.log("User linked to company successfully");
      
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
