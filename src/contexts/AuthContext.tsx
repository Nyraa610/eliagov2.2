
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
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // First, set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event, newSession ? "Session exists" : "No session");
        
        // Update state synchronously first
        setSession(newSession);
        setUser(newSession?.user || null);
        
        // Then update loading state
        if (event === 'INITIAL_SESSION') {
          setIsLoading(false);
        }
      }
    );

    // Then check for an existing session
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        console.log("Get session result:", data.session ? "Session exists" : "No session");
        
        // Only set these if component is still mounted
        setSession(data.session);
        setUser(data.session?.user || null);
      } finally {
        // Always set loading to false when done
        setIsLoading(false);
      }
    };

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in handler
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      return { error };
    } catch (error) {
      return { error };
    }
  };

  // Sign out handler
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: "An unexpected error occurred",
      });
    }
  };

  const value = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signOut,
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
