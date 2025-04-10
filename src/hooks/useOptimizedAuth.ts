
import { useState, useEffect } from "react";
import { useAuthState } from "./auth/useAuthState";
import { useAuthActions } from "./auth/useAuthActions";

/**
 * Main hook for authentication with optimized caching
 */
export function useOptimizedAuth() {
  const { user, session, isLoading, companyId } = useAuthState();
  const { signIn, signOut, refreshAuthState } = useAuthActions();

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    companyId,
    signIn,
    signOut,
    refreshAuthState,
  };
}
