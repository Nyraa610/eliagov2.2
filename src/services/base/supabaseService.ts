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
    try {
      console.log("supabaseService: Getting current user");
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("supabaseService: Error getting session:", error.message);
        throw error;
      }
      
      console.log("supabaseService: Session data:", data);
      return data.session?.user || null;
    } catch (error) {
      console.error("supabaseService: Exception getting current user:", error);
      throw error;
    }
  },
  
  getUserProfile: async (userId?: string): Promise<UserProfile | null> => {
    try {
      // If no userId provided, get current user
      let targetId = userId;
      
      if (!targetId) {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("supabaseService: Error getting session in getUserProfile:", error.message);
          throw error;
        }
        
        targetId = data.session?.user?.id;
        console.log("supabaseService: Got user ID from session:", targetId);
      }
      
      if (!targetId) {
        console.log("supabaseService: No user ID available, returning null profile");
        return null;
      }
      
      console.log(`supabaseService: Getting profile for user ID: ${targetId}`);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetId)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`supabaseService: No profile found for user ID: ${targetId}`);
          return null;
        }
        
        console.error("supabaseService: Error fetching profile:", error.message);
        throw error;
      }
      
      console.log("supabaseService: Profile data retrieved:", data);
      
      return data;
    } catch (error) {
      console.error("supabaseService: Exception fetching user profile:", error);
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
      console.error("supabaseService: Error fetching user profiles:", error);
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
      console.error("supabaseService: Error updating user profile:", error);
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
      console.error("supabaseService: Error updating user role:", error);
      return false;
    }
  },
  
  hasRole: async (role: UserRole): Promise<boolean> => {
    try {
      console.log(`supabaseService: Checking if user has role: ${role}`);
      
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("supabaseService: Error getting session in hasRole:", sessionError.message);
        throw sessionError;
      }
      
      if (!session || !session.session || !session.session.user) {
        console.log("supabaseService: No active session found in hasRole check");
        return false;
      }
      
      console.log(`supabaseService: Session user ID for role check: ${session.session.user.id}`);
      
      const profile = await supabaseService.getUserProfile(session.session.user.id);
      console.log(`supabaseService: User profile for role check:`, profile);
      
      if (!profile) {
        console.log("supabaseService: No profile found, user does not have required role");
        return false;
      }
      
      const hasRole = profile.role === role;
      console.log(`supabaseService: User has role ${role}: ${hasRole}`);
      return hasRole;
    } catch (error) {
      console.error("supabaseService: Error checking user role:", error);
      throw error;
    }
  },
  
  refreshSession: async () => {
    try {
      console.log("supabaseService: Refreshing session");
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error("supabaseService: Error refreshing session:", error.message);
        throw error;
      }
      
      console.log("supabaseService: Session refreshed successfully");
      return data.session;
    } catch (error) {
      console.error("supabaseService: Exception refreshing session:", error);
      throw error;
    }
  }
};

export const useSupabase = () => {
  return supabase;
};
