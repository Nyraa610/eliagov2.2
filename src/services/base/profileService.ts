
import { supabaseClient } from "./supabaseClient";
import { UserProfile, UserRole } from "./profileTypes";

export const profileService = {
  getUserProfile: async (userId?: string): Promise<UserProfile | null> => {
    try {
      // If no userId provided, get current user
      let targetId = userId;
      
      if (!targetId) {
        const { data, error } = await supabaseClient.auth.getSession();
        
        if (error) {
          console.error("profileService: Error getting session in getUserProfile:", error.message);
          throw error;
        }
        
        targetId = data.session?.user?.id;
        console.log("profileService: Got user ID from session:", targetId);
      }
      
      if (!targetId) {
        console.log("profileService: No user ID available, returning null profile");
        return null;
      }
      
      console.log(`profileService: Getting profile for user ID: ${targetId}`);
      
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', targetId)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`profileService: No profile found for user ID: ${targetId}`);
          return null;
        }
        
        console.error("profileService: Error fetching profile:", error.message);
        throw error;
      }
      
      console.log("profileService: Profile data retrieved:", data);
      
      return data;
    } catch (error) {
      console.error("profileService: Exception fetching user profile:", error);
      return null;
    }
  },
  
  getAllProfiles: async () => {
    try {
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error("profileService: Error fetching user profiles:", error);
      return { data: null, error };
    }
  },
  
  updateUserProfile: async (profileData: Partial<UserProfile>): Promise<UserProfile | null> => {
    try {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) throw new Error("No authenticated user");
      
      const { data, error } = await supabaseClient
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single();
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error("profileService: Error updating user profile:", error);
      return null;
    }
  },
  
  updateUserRole: async (userId: string, role: UserRole): Promise<boolean> => {
    try {
      const { error } = await supabaseClient
        .from('profiles')
        .update({ role })
        .eq('id', userId);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error("profileService: Error updating user role:", error);
      return false;
    }
  }
};
