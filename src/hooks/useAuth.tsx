import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'household' | 'collector' | 'admin';

interface Profile {
  id: string;
  name: string;
  phone: string | null;
  location: string | null;
  total_points: number;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: AppRole | null;
  isLoading: boolean;
  signInWithPhone: (phone: string, metadata: { name: string; location?: string; role: AppRole }) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfileAndRole = async (userId: string) => {
    const [profileResult, roleResult] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase.from('user_roles').select('role').eq('user_id', userId).maybeSingle()
    ]);

    if (profileResult.data) {
      setProfile(profileResult.data);
    }
    if (roleResult.data) {
      setRole(roleResult.data.role as AppRole);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchProfileAndRole(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setRole(null);
        }
        setIsLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfileAndRole(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Mock phone auth - uses email under the hood with phone as identifier
  const signInWithPhone = async (
    phone: string,
    metadata: { name: string; location?: string; role: AppRole }
  ) => {
    const fakeEmail = `${phone}@ecosort.local`;
    const fakePassword = `ecosort_${phone}_secure`;
    const redirectUrl = `${window.location.origin}/`;

    // Try to sign in first (existing user)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: fakeEmail,
      password: fakePassword
    });

    if (!signInError) {
      // Existing user signed in successfully
      return { error: null };
    }

    // If sign in failed, try to create new account
    if (signInError.message.includes('Invalid login credentials')) {
      const { error: signUpError } = await supabase.auth.signUp({
        email: fakeEmail,
        password: fakePassword,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            ...metadata,
            phone
          }
        }
      });

      if (signUpError) {
        return { error: signUpError as Error };
      }

      return { error: null };
    }

    return { error: signInError as Error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        isLoading,
        signInWithPhone,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}