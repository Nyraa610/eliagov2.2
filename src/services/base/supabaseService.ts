
import { supabase } from "@/lib/supabase";

export type UserRole = 'admin' | 'user';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
}

export const supabaseService = {
  supabase,
  
  // Auth methods
  getCurrentUser: async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.user || null;
  },
  
  getUserProfile: async (userId?: string): Promise<UserProfile | null> => {
    try {
      // If no userId provided, get current user
      let targetId = userId;
      
      if (!targetId) {
        const { data } = await supabase.auth.getSession();
        targetId = data.session?.user?.id;
      }
      
      if (!targetId) return null;
      
      console.log(`Getting profile for user ID: ${targetId}`);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetId)
        .single();
        
      if (error) {
        console.error("Error fetching profile:", error.message);
        throw error;
      }
      
      console.log("Profile data retrieved:", data);
      
      return data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  },
  
  getAllProfiles: async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error("Error fetching user profiles:", error);
      return { data: null, error };
    }
  },
  
  updateUserProfile: async (profileData: Partial<UserProfile>): Promise<UserProfile | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");
      
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single();
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error("Error updating user profile:", error);
      return null;
    }
  },
  
  updateUserRole: async (userId: string, role: UserRole): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error("Error updating user role:", error);
      return false;
    }
  },
  
  hasRole: async (role: UserRole): Promise<boolean> => {
    try {
      console.log(`Checking if user has role: ${role}`);
      const profile = await supabaseService.getUserProfile();
      console.log(`User profile:`, profile);
      
      if (!profile) {
        console.log("No profile found, user does not have required role");
        return false;
      }
      
      const hasRole = profile.role === role;
      console.log(`User has role ${role}: ${hasRole}`);
      return hasRole;
    } catch (error) {
      console.error("Error checking user role:", error);
      return false;
    }
  }
};

export const useSupabase = () => {
  return supabase;
};
