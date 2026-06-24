import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { User, Session, Subscription } from '@supabase/supabase-js';
import type { AccountType } from '@/types/auth';
import type { AdminRole } from '@/types/admin';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  accountType: AccountType;
  adminRole: AdminRole | null;
  initialize: () => Promise<() => void>;
  sendOtp: (email: string) => Promise<{ error: string | null }>;
  verifyOtp: (
    email: string,
    token: string,
  ) => Promise<{ error: string | null }>;
  refreshAccount: () => Promise<{
    accountType: AccountType;
    adminRole: AdminRole | null;
  }>;
  logout: () => Promise<void>;
}

const resolveAccount = async (
  userId: string,
): Promise<{
  accountType: AccountType;
  adminRole: AdminRole | null;
}> => {
  const { data: admin, error: adminErr } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', userId)
    .eq('is_active', true)
    .maybeSingle();

  if (adminErr && adminErr.code !== 'PGRST116') {
    console.warn('err resolving admin account', adminErr.message);
  }

  if (admin) {
    return {
      accountType: 'admin',
      adminRole: admin.role as AdminRole,
    };
  }

  return { accountType: null, adminRole: null };
};

const resolveForUser = async (
  user: User | null,
): Promise<{
  accountType: AccountType;
  adminRole: AdminRole | null;
}> => {
  if (!user || !user.email) {
    return { accountType: null, adminRole: null };
  }
  return resolveAccount(user.id);
};

const useAuth = create<AuthState>((set, get) => {
  const applyResolvedAccount = (
    session: Session | null,
    user: User | null,
    resolved: {
      accountType: AccountType;
      adminRole: AdminRole | null;
    },
  ) => {
    set({
      session,
      user,
      accountType: resolved.accountType,
      adminRole: resolved.adminRole,
    });
  };

  let activeSubscription: Subscription | null = null;
  let initializeSeq = 0;

  return {
    user: null,
    session: null,
    isLoading: true,
    accountType: null,
    adminRole: null,

    initialize: async () => {
      const seq = ++initializeSeq;
      const { data: sessionData } = await supabase.auth.getSession();
      if (seq !== initializeSeq) return () => {};
      const user = sessionData.session?.user ?? null;
      const resolved = await resolveForUser(user);
      if (seq !== initializeSeq) return () => {};

      set({
        session: sessionData.session,
        user,
        accountType: resolved.accountType,
        adminRole: resolved.adminRole,
        isLoading: false,
      });

      activeSubscription?.unsubscribe();
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        const nextUser = session?.user ?? null;
        set({ session, user: nextUser });

        window.setTimeout(() => {
          void (async () => {
            const nextResolved = await resolveForUser(nextUser);
            const current = get().session;
            if (current?.access_token !== session?.access_token) return;
            applyResolvedAccount(session, nextUser, nextResolved);
          })();
        }, 0);
      });
      const mySubscription = data.subscription;
      activeSubscription = mySubscription;

      return () => {
        if (activeSubscription === mySubscription) {
          mySubscription.unsubscribe();
          activeSubscription = null;
        }
      };
    },

    sendOtp: async (email: string) => {
      const { error } = await supabase.auth.signInWithOtp({ email });
      return { error: error?.message ?? null };
    },

    verifyOtp: async (email: string, token: string) => {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });
      if (error) return { error: error.message };

      const user = data.session?.user ?? null;
      const resolved = await resolveForUser(user);
      applyResolvedAccount(data.session, user, resolved);
      return { error: null };
    },

    refreshAccount: async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user ?? null;
      if (!user || !user.email) {
        applyResolvedAccount(data.session, null, {
          accountType: null,
          adminRole: null,
        });
        return { accountType: null, adminRole: null };
      }
      const resolved = await resolveAccount(user.id);
      applyResolvedAccount(data.session, user, resolved);
      return resolved;
    },

    logout: async () => {
      await supabase.auth.signOut();
      set({ user: null, session: null, accountType: null, adminRole: null });
    },
  };
});

export { useAuth };
