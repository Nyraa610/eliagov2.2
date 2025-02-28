
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
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },
  
  getUserProfile: async (userId?: string): Promise<UserProfile | null> => {
    try {
      // If no userId provided, get current user
      const targetId = userId || (await supabase.auth.getUser()).data.user?.id;
      
      if (!targetId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetId)
        .single();
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
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
  
  hasRole: async (role: UserRole): Promise<boolean> => {
    try {
      const profile = await supabaseService.getUserProfile();
      return profile?.role === role;
    } catch (error) {
      console.error("Error checking user role:", error);
      return false;
    }
  }
};

export const useSupabase = () => {
  return supabase;
};
