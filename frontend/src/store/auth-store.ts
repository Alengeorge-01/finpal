'use client'; // This store is now used in client components

import { create } from 'zustand';
import posthog from 'posthog-js';

interface AuthState {
  status: 'loading' | 'authenticated' | 'unauthenticated';
  accessToken: string | null;
  login: (access: string, refresh: string) => void;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'loading',
  accessToken: null,

  login: (access, refresh) => {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    set({ 
      status: 'authenticated', 
      accessToken: access
    });

    // Identify the user in PostHog
    posthog.identify(access.slice(-10)); 
  },

  logout: () => {
    // Clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    set({ 
      status: 'unauthenticated', 
      accessToken: null
    });

    // Reset PostHog identification on logout
    posthog.reset();
  },

  checkAuth: () => {
    // Check Django JWT
    const token = localStorage.getItem('accessToken');
    if (token) {
      set({ 
        status: 'authenticated', 
        accessToken: token
      });
      posthog.identify(token.slice(-10));
    } else {
      set({ 
        status: 'unauthenticated', 
        accessToken: null
      });
    }
  },
}));