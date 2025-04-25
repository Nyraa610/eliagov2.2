
/**
 * Utility functions for environment detection and configuration
 */

/**
 * Get the current environment (development, staging, production)
 */
export const getCurrentEnvironment = (): string => {
  return import.meta.env.VITE_APP_ENV || import.meta.env.MODE || 'development';
};

/**
 * Check if the app is running in development mode
 */
export const isDevelopment = (): boolean => {
  return getCurrentEnvironment() === 'development';
};

/**
 * Check if the app is running in staging mode
 */
export const isStaging = (): boolean => {
  return getCurrentEnvironment() === 'staging';
};

/**
 * Check if the app is running in production mode
 */
export const isProduction = (): boolean => {
  return getCurrentEnvironment() === 'production';
};

/**
 * Get environment-specific configuration
 * @param devValue Value for development environment
 * @param stagingValue Value for staging environment
 * @param prodValue Value for production environment
 */
export const getEnvConfig = <T>(devValue: T, stagingValue: T, prodValue: T): T => {
  if (isProduction()) {
    return prodValue;
  }
  if (isStaging()) {
    return stagingValue;
  }
  return devValue;
};
