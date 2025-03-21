
import React, { createContext, useContext } from "react";
import { User, Session } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/use-toast";
import { useAuthState } from "@/hooks/useAuthState";
import { authService } from "@/services/auth/authService";

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
  const { user, session, isLoading, isAuthenticated } = useAuthState();
  const { toast } = useToast();

  // Sign in handler
  const signIn = async (email: string, password: string) => {
    return authService.signIn(email, password);
  };

  // Sign up handler
  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    return authService.signUp(email, password, metadata);
  };

  // Sign out handler
  const signOut = async () => {
    try {
      const { error } = await authService.signOut();
      if (error) {
        toast({
          variant: "destructive",
          title: "Error signing out",
          description: error.message || "An unexpected error occurred",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: "An unexpected error occurred",
      });
    }
  };

  // Refresh session handler
  const refreshSession = async () => {
    try {
      const { session, error } = await authService.refreshSession();
      
      if (error) {
        return null;
      }
      
      return session;
    } catch (error) {
      return null;
    }
  };

  const value = {
    user,
    session,
    isLoading,
    isAuthenticated,
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
