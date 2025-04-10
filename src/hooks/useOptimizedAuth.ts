
import { useState, useEffect } from "react";
import { useAuthState } from "./auth/useAuthState";
import { useAuthActions } from "./auth/useAuthActions";

/**
 * Main hook for authentication with optimized caching
 */
export function useOptimizedAuth() {
  const { user, session, isLoading, companyId } = useAuthState();
  const { signIn, signOut, refreshAuthState } = useAuthActions();

  // Add hasRole method
  const hasRole = (role: string) => {
    if (!user) return false;
    
    // In a real implementation, this would check the user's roles
    // For now, we'll implement a simple check - assuming all authenticated users have the role
    return true;
  };

  return {
    user,
    session,
    isLoading,
    loading: isLoading, // Alias for backward compatibility
    isAuthenticated: !!user,
    companyId,
    hasRole,
    signIn,
    signOut,
    refreshAuthState,
  };
}
