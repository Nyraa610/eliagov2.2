
import { User, Session } from "@supabase/supabase-js";

// Global cache mechanism to prevent redundant calls across the application
type AuthStateCache = {
  user: User | null;
  session: Session | null;
  lastChecked: number;
  isLoading: boolean;
  companyId: string | null;
} | null;

// Cache expiry in milliseconds (5 minutes)
export const CACHE_EXPIRY = 5 * 60 * 1000;

// Singleton cache instance
let authStateCache: AuthStateCache = null;

/**
 * Get the current auth cache state
 */
export const getAuthCache = (): AuthStateCache => authStateCache;

/**
 * Update the auth cache with new values
 */
export const updateAuthCache = (
  user: User | null,
  session: Session | null,
  companyId: string | null,
  isLoading = false
): void => {
  authStateCache = {
    user,
    session,
    companyId,
    isLoading,
    lastChecked: Date.now(),
  };
};

/**
 * Clear the auth cache
 */
export const clearAuthCache = (): void => {
  authStateCache = null;
};

/**
 * Check if the auth state cache is valid
 */
export const isCacheValid = (): boolean => {
  return (
    authStateCache !== null &&
    Date.now() - authStateCache.lastChecked < CACHE_EXPIRY
  );
};
