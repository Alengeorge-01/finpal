'use client'; // This store is now used in client components

import { create } from 'zustand';
import posthog from 'posthog-js'; // Import posthog-js

interface AuthState {
  status: 'loading' | 'authenticated' | 'unauthenticated';
  accessToken: string | null;
  login: (access: string, refresh: string) => void;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  accessToken: null,
  login: (access, refresh) => {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    set({ status: 'authenticated', accessToken: access });

    // Identify the user in PostHog
    // We can use a part of the token or a user ID from the token in the future
    posthog.identify(access.slice(-10)); 
  },
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ status: 'unauthenticated', accessToken: null });

    // Reset PostHog identification on logout
    posthog.reset();
  },
  checkAuth: () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      set({ status: 'authenticated', accessToken: token });
      // Also identify the user when the app loads and they are already logged in
      posthog.identify(token.slice(-10));
    } else {
      set({ status: 'unauthenticated', accessToken: null });
    }
  },
}));