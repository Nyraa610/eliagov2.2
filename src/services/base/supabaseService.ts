
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
    id: string 
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
      
      // Call the admin_create_profile function with parameters in the correct order (id, email, role)
      const { data, error } = await supabaseClient.rpc('admin_create_profile', {
        p_id: profileData.id,
        p_email: profileData.email,
        p_role: profileData.role
      });
      
      if (error) {
        console.error("Error in admin_create_profile RPC:", error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error("Exception in createUserProfile:", error);
      return { 
        data: null, 
        error: { message: error.message || "Failed to create user profile" } 
      };
    }
  }
};
