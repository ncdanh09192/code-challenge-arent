/**
 * User roles used throughout the application
 * Centralized constants to prevent string duplication and typos
 */
export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

/**
 * Type for user roles (extracted from ROLES constant)
 */
export type UserRole = (typeof ROLES)[keyof typeof ROLES];
