
import { supabaseClient, useSupabase } from "./supabaseClient";
import { authService } from "./authService";
import { profileService } from "./profileService";
import { roleService } from "./roleService";
import { UserProfile, UserRole } from "./profileTypes";

// Re-export all types and services for backward compatibility
export { UserProfile, UserRole };
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
  hasRole: roleService.hasRole
};
