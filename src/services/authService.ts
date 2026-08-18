import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, UserRole } from '../types/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEMO_USER_KEY = '@swedishflow_demo_user';

export const DEMO_STUDENT: UserProfile = {
  id: 'demo-student-id-1',
  email: 'elev@exempel.se',
  fullName: 'Anna Lindqvist',
  role: 'student',
  targetGoal: 'Svenska A1',
  level: 'A1',
  isEmailVerified: true,
  createdAt: new Date().toISOString(),
};

export const DEMO_ADMIN: UserProfile = {
  id: 'demo-admin-id-1',
  email: 'admin@swedishflow.se',
  fullName: 'Admin SwedishFlow',
  role: 'admin',
  targetGoal: 'Administration',
  level: 'Admin',
  isEmailVerified: true,
  createdAt: new Date().toISOString(),
};

export const authService = {
  async getCurrentUser(): Promise<UserProfile | null> {
    if (!isSupabaseConfigured()) {
      const stored = await AsyncStorage.getItem(DEMO_USER_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return DEMO_STUDENT;
        }
      }
      return DEMO_STUDENT;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    return this.fetchProfile(
      session.user.id,
      session.user.email || '',
      session.user.user_metadata?.full_name || session.user.user_metadata?.name
    );
  },

  async fetchProfile(userId: string, email: string, metaName?: string): Promise<UserProfile> {
    if (!isSupabaseConfigured()) {
      return DEMO_STUDENT;
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { data: roleRow } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      const role: UserRole = (roleRow?.role as UserRole) || 'student';
      const fallbackName = role === 'admin'
        ? 'Administratör'
        : (metaName || (email ? email.split('@')[0] : 'SFI-elev'));

      return {
        id: userId,
        email: email || profile?.email || '',
        fullName: profile?.full_name || fallbackName,
        role,
        targetGoal: profile?.target_goal || (role === 'admin' ? 'Administration' : 'Svenska A1'),
        level: profile?.level || (role === 'admin' ? 'Admin' : 'A1'),
        isEmailVerified: true,
        createdAt: profile?.created_at,
        updatedAt: profile?.updated_at,
      };
    } catch (e) {
      console.warn('Could not fetch remote profile, using fallback:', e);
      return {
        id: userId,
        email,
        fullName: metaName || (email ? email.split('@')[0] : 'SFI-elev'),
        role: 'student',
        targetGoal: 'Svenska A1',
        level: 'A1',
        isEmailVerified: true,
      };
    }
  },

  async signUp(email: string, password: string, fullName: string): Promise<{ user: UserProfile | null; error: string | null }> {
    if (!isSupabaseConfigured()) {
      const newUser: UserProfile = {
        id: `demo-user-${Date.now()}`,
        email,
        fullName,
        role: 'student',
        targetGoal: 'Svenska A1',
        level: 'A1',
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(DEMO_USER_KEY, JSON.stringify(newUser));
      return { user: newUser, error: null };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (data.user) {
      const profile = await this.fetchProfile(data.user.id, email);
      return { user: profile, error: null };
    }

    return { user: null, error: 'Kunde inte skapa användare' };
  },

  async signIn(email: string, password: string): Promise<{ user: UserProfile | null; error: string | null }> {
    if (!isSupabaseConfigured()) {
      if (email.toLowerCase().includes('admin')) {
        await AsyncStorage.setItem(DEMO_USER_KEY, JSON.stringify(DEMO_ADMIN));
        return { user: DEMO_ADMIN, error: null };
      }
      const student = { ...DEMO_STUDENT, email };
      await AsyncStorage.setItem(DEMO_USER_KEY, JSON.stringify(student));
      return { user: student, error: null };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (data.user) {
      const profile = await this.fetchProfile(data.user.id, email);
      return { user: profile, error: null };
    }

    return { user: null, error: 'Inloggning misslyckades' };
  },

  async resetPassword(email: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { success: true, error: null };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, error: null };
  },

  async signOut(): Promise<void> {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    await AsyncStorage.removeItem(DEMO_USER_KEY);
  },

  async setDemoUser(role: 'student' | 'admin'): Promise<UserProfile> {
    const user = role === 'admin' ? DEMO_ADMIN : DEMO_STUDENT;
    await AsyncStorage.setItem(DEMO_USER_KEY, JSON.stringify(user));
    return user;
  },
};
