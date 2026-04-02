import { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User, AuthResponse, SignUpWithPasswordCredentials, Provider, OAuthResponse, UserIdentity } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { claimPendingInvitationsByEmail } from '@/services/cropShareService';

interface IAuthProvider {
  id: string;
  provider: string;
  created_at?: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  providers: IAuthProvider[];
  signOut: () => void;
  signUp: (credentials: SignUpWithPasswordCredentials) => Promise<AuthResponse>;
  signInWithPassword: (credentials: SignUpWithPasswordCredentials) => Promise<AuthResponse>;
  signInWithOAuth: (provider: Provider) => Promise<OAuthResponse>;
  unlinkProvider: (providerId: string) => Promise<void>;
  linkProvider: (provider: Provider) => Promise<AuthResponse>;
  refreshProviders: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<IAuthProvider[]>([]);

  const refreshProviders = async () => {
    if (!user) return;
    
    try {
      const { data: identities, error } = await supabase.auth.getUser();
      if (!error && identities.user?.identities) {
        const providerData = identities.user.identities.map<IAuthProvider>(identity => ({
          id: identity.id,
          provider: identity.provider,
          created_at: identity.created_at,
        }));
        setProviders(providerData);
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        if (session?.user) {
          await refreshProviders();
          if (_event === 'SIGNED_IN' && session.user.email) {
            claimPendingInvitationsByEmail(session.user.email, session.user.id).catch(console.error);
          }
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        if (session?.user) {
          await refreshProviders();
          if (session.user.email) {
            claimPendingInvitationsByEmail(session.user.email, session.user.id).catch(console.error);
          }
        }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user,
    loading,
    providers,
    signOut: () => supabase.auth.signOut(),
    signUp: (credentials: SignUpWithPasswordCredentials) =>
      supabase.auth.signUp(credentials),
    signInWithPassword: (credentials: SignUpWithPasswordCredentials) =>
      supabase.auth.signInWithPassword(credentials),
    signInWithOAuth: (provider: Provider) =>
      supabase.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.origin } }),
    unlinkProvider: async (providerId: string) => {
      try {
        const identity = { identity_id: providerId } as unknown as UserIdentity;
        const { error } = await supabase.auth.unlinkIdentity(identity);
        if (error) throw error;
        await refreshProviders();
      } catch (error) {
        console.error('Error unlinking provider:', error);
        throw error;
      }
    },
    linkProvider: async (provider: Provider) => {
      try {
        const { error } = await supabase.auth.linkIdentity({ provider, options: { redirectTo: window.location.origin } });
        if (error) throw error;
        await refreshProviders();
        return { data: { user: null, session: null }, error: null };
      } catch (error) {
        console.error('Error linking provider:', error);
        return { data: { user: null, session: null }, error: error as any };
      }
    },
    refreshProviders,
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
