import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

import { AuthResponse, SignUpWithPasswordCredentials } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  signOut: () => void;
  signUp: (credentials: SignUpWithPasswordCredentials) => Promise<AuthResponse>;
  signInWithPassword: (credentials: SignUpWithPasswordCredentials) => Promise<AuthResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
    })

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user,
    signOut: () => supabase.auth.signOut(),
    signUp: (credentials: SignUpWithPasswordCredentials) =>
      supabase.auth.signUp(credentials),
    signInWithPassword: (credentials: SignUpWithPasswordCredentials) =>
      supabase.auth.signInWithPassword(credentials),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
