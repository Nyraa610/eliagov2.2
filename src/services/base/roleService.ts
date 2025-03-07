
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
      
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('role')
        .eq('id', session.session.user.id)
        .single();
      
      console.log(`roleService: User profile for role check:`, data);
      
      if (error) {
        console.error("roleService: Error fetching profile in hasRole:", error.message);
        return false;
      }
      
      if (!data) {
        console.log("roleService: No profile found, user does not have required role");
        return false;
      }
      
      const hasRole = data.role === role;
      console.log(`roleService: User has role ${role}: ${hasRole}`);
      return hasRole;
    } catch (error) {
      console.error("roleService: Error checking user role:", error);
      throw error;
    }
  }
};
