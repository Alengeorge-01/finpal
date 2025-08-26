import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

/**
 * Helper functions for authentication and security
 */

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  } catch {
    return false;
  }
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
};

// Secure sign out from all devices
export const secureSignOut = async (): Promise<void> => {
  try {
    await supabase.auth.signOut({ scope: 'global' });
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Refresh session
export const refreshSession = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error refreshing session:', error);
    throw error;
  }
};

// Get user's financial data securely (with RLS)
export const getUserFinancialData = async (table: string) => {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('user_id', (await getCurrentUser())?.id);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching ${table} data:`, error);
    throw error;
  }
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
export const isStrongPassword = (password: string): { isValid: boolean; message: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  if (!/(?=.*[!@#$%^&*])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character (!@#$%^&*)' };
  }
  return { isValid: true, message: 'Password is strong' };
};
