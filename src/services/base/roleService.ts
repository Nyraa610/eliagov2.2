
import { supabaseClient } from "./supabaseClient";
import { UserRole } from "./profileTypes";

export const roleService = {
  hasRole: async (role: UserRole): Promise<boolean> => {
    try {
      console.log(`roleService: Checking if user has role: ${role}`);
      
      const { data: session, error: sessionError } = await supabaseClient.auth.getSession();
      
      if (sessionError) {
        console.error("roleService: Error getting session in hasRole:", sessionError.message);
        throw sessionError;
      }
      
      if (!session || !session.session || !session.session.user) {
        console.log("roleService: No active session found in hasRole check");
        return false;
      }
      
      console.log(`roleService: Session user ID for role check: ${session.session.user.id}`);
      
      // First check if the user is admin or consultant - they should have access to everything
      const { data: profileData, error: profileError } = await supabaseClient
        .from('profiles')
        .select('role')
        .eq('id', session.session.user.id)
        .single();
      
      if (profileError) {
        console.error("roleService: Error fetching profile in hasRole:", profileError.message);
        return false;
      }
      
      if (!profileData) {
        console.log("roleService: No profile found, user does not have required role");
        return false;
      }
      
      // If user is admin or consultant, return true for any role check
      if (profileData.role === 'admin' || profileData.role === 'consultant') {
        console.log(`roleService: User is ${profileData.role}, granting access to ${role} role`);
        return true;
      }
      
      // Otherwise check for the specific requested role
      const hasRole = profileData.role === role;
      console.log(`roleService: User has role ${role}: ${hasRole}`);
      return hasRole;
    } catch (error) {
      console.error("roleService: Error checking user role:", error);
      throw error;
    }
  }
};
