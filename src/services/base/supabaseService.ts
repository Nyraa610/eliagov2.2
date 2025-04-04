
import { supabaseClient, useSupabase } from "./supabaseClient";
import { authService } from "./authService";
import { profileService } from "./profileService";
import { roleService } from "./roleService";

// Re-export all types and services for backward compatibility
export type { UserProfile, UserRole } from "./profileTypes";
export { useSupabase };

// Combine all services into the main supabaseService for backward compatibility
export const supabaseService = {
  supabase: supabaseClient,
  
  // Auth methods
  getCurrentUser: authService.getCurrentUser,
  signOut: authService.signOut,
  refreshSession: authService.refreshSession,
  
  // Profile methods
  getUserProfile: profileService.getUserProfile,
  getAllProfiles: profileService.getAllProfiles,
  updateUserProfile: profileService.updateUserProfile,
  updateUserRole: profileService.updateUserRole,
  
  // Role methods
  hasRole: roleService.hasRole,
  
  // Admin methods
  createUserProfile: async (profileData: { 
    email: string, 
    role: string, 
    id?: string,
    password?: string
  }) => {
    try {
      // First check if the current user has admin permission
      const hasAdminRole = await roleService.hasRole('admin');
      if (!hasAdminRole) {
        return { 
          data: null, 
          error: { message: "Permission denied. Only admins can create user profiles." } 
        };
      }
      
      // First create the auth user, then create the profile
      const password = profileData.password || Math.random().toString(36).slice(-10) + "Aa1!"; // Generate secure random password
      
      // Create the user in auth.users first
      const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
        email: profileData.email,
        password: password,
        email_confirm: true // Auto-confirm email
      });
      
      if (authError) {
        console.error("Error creating auth user:", authError);
        return { 
          data: null, 
          error: { message: `Failed to create user: ${authError.message}` } 
        };
      }
      
      // Now create the profile using the new user's ID
      const userId = authData.user.id;
      
      // Call the admin_create_profile function with the user ID from auth
      const { data, error } = await supabaseClient.rpc('admin_create_profile', {
        p_id: userId,
        p_email: profileData.email,
        p_role: profileData.role
      });
      
      if (error) {
        console.error("Error in admin_create_profile RPC:", error);
        return { data: null, error };
      }
      
      return { 
        data, 
        error: null,
        authUser: authData.user
      };
    } catch (error: any) {
      console.error("Exception in createUserProfile:", error);
      return { 
        data: null, 
        error: { message: error.message || "Failed to create user profile" } 
      };
    }
  }
};
