import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types/auth';
import { authService } from '../services/authService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface ExtendedUserProfile extends UserProfile {
  isDemo?: boolean;
}

interface AuthContextType {
  user: ExtendedUserProfile | null;
  role: UserRole;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: ExtendedUserProfile | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string; user?: ExtendedUserProfile | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: (role?: 'student' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isDemo = !isSupabaseConfigured();

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const currentUser = await authService.getCurrentUser();
        if (mounted) {
          if (currentUser) {
            setUser({ ...currentUser, isDemo });
          } else {
            setUser(null);
          }
        }
      } catch (err) {
        console.warn('Auth init warning:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initAuth();

    if (isSupabaseConfigured()) {
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            const profile = await authService.fetchProfile(
              session.user.id,
              session.user.email || '',
              session.user.user_metadata?.full_name || session.user.user_metadata?.name
            );
            if (mounted) setUser({ ...profile, isDemo: false });
          } else {
            if (mounted) setUser(null);
          }
          if (mounted) setIsLoading(false);
        }
      );

      return () => {
        mounted = false;
        authListener.subscription.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const { user: authedUser, error: authErr } = await authService.signIn(email, password);
      if (authErr || !authedUser) {
        setError(authErr || 'Inloggning misslyckades');
        setIsLoading(false);
        return { success: false, error: authErr || 'Inloggning misslyckades', user: null };
      }
      const extendedUser: ExtendedUserProfile = { ...authedUser, isDemo };
      setUser(extendedUser);
      setIsLoading(false);
      return { success: true, user: extendedUser };
    } catch (e: any) {
      const msg = e?.message || 'Ett oväntat fel uppstod';
      setError(msg);
      setIsLoading(false);
      return { success: false, error: msg, user: null };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const { user: newUser, error: authErr } = await authService.signUp(email, password, fullName);
      if (authErr || !newUser) {
        setError(authErr || 'Kunde inte skapa konto');
        setIsLoading(false);
        return { success: false, error: authErr || 'Kunde inte skapa konto', user: null };
      }
      const extendedUser: ExtendedUserProfile = { ...newUser, isDemo };
      setUser(extendedUser);
      setIsLoading(false);
      return { success: true, user: extendedUser };
    } catch (e: any) {
      const msg = e?.message || 'Ett oväntat fel uppstod';
      setError(msg);
      setIsLoading(false);
      return { success: false, error: msg, user: null };
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    await authService.signOut();
    setUser(null);
    setIsLoading(false);
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const res = await authService.resetPassword(email);
    return {
      success: res.success,
      error: res.error || undefined,
    };
  };

  const loginAsDemo = async (role: 'student' | 'admin' = 'student') => {
    setIsLoading(true);
    const demoUser = await authService.setDemoUser(role);
    setUser({ ...demoUser, isDemo: true });
    setIsLoading(false);
  };

  const role: UserRole = user?.role || 'student';
  const isAdmin = role === 'admin';
  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAdmin,
        isAuthenticated,
        isLoading,
        isDemoMode: isDemo,
        error,
        signIn,
        signUp,
        signOut,
        resetPassword,
        loginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
