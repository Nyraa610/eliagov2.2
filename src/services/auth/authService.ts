
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// Maintain a single active listener
let activeAuthListener: { subscription: { unsubscribe: () => void } } | null = null;

/**
 * Core authentication service functions
 */
export const authService = {
  /**
   * Sign in with email and password
   */
  signIn: async (email: string, password: string) => {
    try {
      console.log("Attempting sign in for:", email);
      
      // Get the site key from Supabase
      const { data: { hcaptcha } } = await supabase.auth.getSettings();
      const siteKey = hcaptcha?.siteKey;
      
      if (!siteKey) {
        console.error("HCAPTCHA site key is missing");
        return { error: new Error("HCAPTCHA configuration missing") };
      }

      // For preview environment - use a fake captcha token
      // In production, you would use the actual captcha verification
      const captchaToken = "10000000-aaaa-bbbb-cccc-000000000001";
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          captchaToken
        }
      });
      
      if (error) {
        console.error("Sign in error:", error.message);
        return { error };
      }
      
      console.log("Sign in successful");
      return { error: null };
    } catch (error) {
      console.error("Exception during sign in:", error);
      return { error };
    }
  },

  /**
   * Sign up with email and password
   */
  signUp: async (email: string, password: string, metadata?: Record<string, any>) => {
    try {
      // Format metadata to ensure we have consistent keys
      const formattedMetadata = {
        first_name: metadata?.firstName || "",
        last_name: metadata?.lastName || "",
        phone: metadata?.phone || "",
        company: metadata?.company || "",
        country: metadata?.country || "",
        department: metadata?.department || "",
        persona: metadata?.persona || "",
        marketing_consent: metadata?.marketingConsent || false,
      };

      // For preview environment - use a fake captcha token
      // In production, you would use the actual captcha verification
      const captchaToken = "10000000-aaaa-bbbb-cccc-000000000001";

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: formattedMetadata,
          captchaToken
        },
      });
      
      if (error) {
        console.error("Sign up error:", error.message);
        return { error };
      }
      
      return { error: null };
    } catch (error) {
      console.error("Exception during sign up:", error);
      return { error };
    }
  },

  /**
   * Sign out the current user
   */
  signOut: async () => {
    try {
      await supabase.auth.signOut();
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  /**
   * Get the current session (with cache mechanism)
   */
  getSession: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        return { session: null, error };
      }
      
      return { session: data.session, error: null };
    } catch (error) {
      return { session: null, error };
    }
  },

  /**
   * Refresh the current session
   */
  refreshSession: async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        return { session: null, error };
      }
      
      return { session: data.session, error: null };
    } catch (error) {
      return { session: null, error };
    }
  },

  /**
   * Subscribe to auth state changes
   * This creates only one active subscription to prevent multiple redundant listeners
   */
  onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
    // If there's an active listener, unsubscribe first
    if (activeAuthListener) {
      activeAuthListener.subscription.unsubscribe();
    }
    
    // Create a new listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
    
    // Store the new listener
    activeAuthListener = {
      subscription: subscription
    };
    
    // Return an object with unsubscribe method to match the expected return type
    return {
      unsubscribe: () => {
        if (activeAuthListener) {
          activeAuthListener.subscription.unsubscribe();
          activeAuthListener = null;
        }
      }
    };
  }
};
