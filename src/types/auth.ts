export type UserRole = 'student' | 'admin' | 'teacher';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  targetGoal: string;
  level: string;
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthSessionState {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean; // True when running locally without Supabase credentials configured
  error: string | null;
}
