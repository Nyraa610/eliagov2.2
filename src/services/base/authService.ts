
import { supabaseClient } from "./supabaseClient";

export const authService = {
  getCurrentUser: async () => {
    try {
      const { data, error } = await supabaseClient.auth.getSession();
      
      if (error) {
        console.error("authService: Error getting session:", error.message);
        throw error;
      }
      
      return data.session?.user || null;
    } catch (error) {
      console.error("authService: Exception getting current user:", error);
      throw error;
    }
  },
  
  signOut: async () => {
    try {
      const { error } = await supabaseClient.auth.signOut();
      
      if (error) {
        console.error("authService: Error signing out:", error.message);
        throw error;
      }
      
      // Clear any cached user data
      localStorage.removeItem('sb-auth-token');
      return true;
    } catch (error) {
      console.error("authService: Exception signing out:", error);
      throw error;
    }
  },
  
  refreshSession: async () => {
    try {
      const { data, error } = await supabaseClient.auth.refreshSession();
      
      if (error) {
        console.error("authService: Error refreshing session:", error.message);
        throw error;
      }
      
      return data.session;
    } catch (error) {
      console.error("authService: Exception refreshing session:", error);
      throw error;
    }
  }
};
