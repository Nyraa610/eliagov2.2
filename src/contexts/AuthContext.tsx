import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<Session | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log("AuthProvider: Setting up auth state listener");
    
    // Set up auth state listener FIRST (before checking existing session)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log(`AuthProvider: Auth state changed - Event: ${event}`);
        
        try {
          setSession(newSession);
          setUser(newSession?.user ?? null);
          
          if (event === 'SIGNED_OUT') {
            console.log("AuthProvider: User signed out");
            setUser(null);
            setSession(null);
          } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            console.log("AuthProvider: User signed in or token refreshed:", newSession?.user?.id);
          }
        } catch (error) {
          console.error("AuthProvider: Error in auth state change listener:", error);
        }
      }
    );

    // THEN check for existing session (initial load)
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        console.log("AuthProvider: Checking for existing session");
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("AuthProvider: Error getting session:", error.message);
          return;
        }
        
        if (data?.session) {
          console.log("AuthProvider: Found existing session for user:", data.session.user.id);
          setSession(data.session);
          setUser(data.session.user);
        } else {
          console.log("AuthProvider: No existing session found");
          setSession(null);
          setUser(null);
        }
      } catch (error) {
        console.error("AuthProvider: Exception checking auth status:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
    
    // Clean up subscription on unmount
    return () => {
      console.log("AuthProvider: Cleaning up auth listener");
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log("AuthProvider: Signing in user with email:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("AuthProvider: Sign in error:", error.message);
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.message,
        });
        return { error };
      }
      
      console.log("AuthProvider: User signed in successfully");
      return { error: null };
    } catch (error: any) {
      console.error("AuthProvider: Exception during sign in:", error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "An unexpected error occurred",
      });
      return { error };
    }
  };

  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    try {
      console.log("AuthContext: Attempting to sign up:", email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata || {},
        },
      });
      
      if (error) {
        console.error("AuthContext: Sign up error:", error.message);
        return { error };
      }
      
      console.log("AuthContext: Sign up successful:", data.user?.id);
      return { data, error: null };
    } catch (error: any) {
      console.error("AuthContext: Sign up exception:", error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    console.log("AuthProvider: Signing out user");
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("AuthProvider: Sign out error:", error.message);
        toast({
          variant: "destructive", 
          title: "Error signing out", 
          description: error.message
        });
      }
      
      // Explicitly clear state on sign out
      setUser(null);
      setSession(null);
      
      console.log("AuthProvider: User signed out successfully");
    } catch (error: any) {
      console.error("AuthProvider: Exception during sign out:", error);
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      console.log("AuthProvider: Refreshing session");
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error("AuthProvider: Error refreshing session:", error.message);
        return null;
      }
      
      if (data.session) {
        console.log("AuthProvider: Session refreshed successfully");
        setSession(data.session);
        setUser(data.session.user);
        return data.session;
      }
      
      return null;
    } catch (error) {
      console.error("AuthProvider: Exception refreshing session:", error);
      return null;
    }
  };

  const value = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
};
