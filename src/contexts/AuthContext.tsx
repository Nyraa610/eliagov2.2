
import React, { createContext, useContext } from "react";
import { User, Session } from "@supabase/supabase-js";
import { useOptimizedAuth } from "@/hooks/useOptimizedAuth";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  loading: boolean; // Added for backward compatibility
  isAuthenticated: boolean;
  companyId: string | null;
  hasRole: (role: string) => boolean; // Added missing method
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<{ error: any | null }>;
  refreshAuthState: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useOptimizedAuth();
  
  // Add missing properties to auth object
  const authWithRole = {
    ...auth,
    loading: auth.isLoading, // Alias for backward compatibility
    hasRole: (role: string) => {
      // Simple implementation - in a real app, this would check user roles
      // For now, we'll assume admin role if the user is authenticated
      return !!auth.user && role === "admin";
    }
  };

  return <AuthContext.Provider value={authWithRole}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
};
