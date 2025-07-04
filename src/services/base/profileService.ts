
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
        .select('*, companies:company_id(*)')
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
      
      // Transform the data to match the UserProfile interface
      const profileData: UserProfile = {
        id: data.id,
        email: data.email,
        role: data.role,
        full_name: data.full_name,
        bio: data.bio,
        avatar_url: data.avatar_url,
        company_id: data.company_id,
        is_company_admin: data.is_company_admin
      };
      
      console.log("profileService: Profile data retrieved:", profileData);
      
      return profileData;
    } catch (error) {
      console.error("profileService: Exception fetching user profile:", error);
      return null;
    }
  },
  
  getAllProfiles: async () => {
    try {
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('*, companies:company_id(*)')
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
      console.log(`profileService: Updating user ${userId} role to ${role}`);
      
      // Use RPC call to ensure proper permissions
      const { data, error } = await supabaseClient.rpc('update_user_role', {
        user_id: userId,
        new_role: role
      });
        
      if (error) {
        console.error("profileService: Error updating user role:", error);
        throw error;
      }
      
      console.log(`profileService: Successfully updated user ${userId} role to ${role}`, data);
      return true;
    } catch (error) {
      console.error("profileService: Error updating user role:", error);
      
      // Try direct update as fallback
      try {
        console.log("profileService: Trying direct update as fallback");
        const { error: updateError } = await supabaseClient
          .from('profiles')
          .update({ role })
          .eq('id', userId);
          
        if (updateError) {
          console.error("profileService: Fallback update failed:", updateError);
          return false;
        }
        
        console.log("profileService: Fallback update succeeded");
        return true;
      } catch (fallbackError) {
        console.error("profileService: Fallback update exception:", fallbackError);
        return false;
      }
    }
  }
};
