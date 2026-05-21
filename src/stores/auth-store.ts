import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types/auth';
import { useDataStore } from './data-store';
import { mockProfile } from '@/lib/mock-data';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  sessionChecked: boolean;
  isLoading: boolean;
  error: string | null;

  checkSession: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, orgName: string) => Promise<{ sessionCreated: boolean }>;
  signOut: () => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  profile: null,
  sessionChecked: false,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  checkSession: async () => {
    if (get().sessionChecked) return;

    set({ isLoading: true, error: null });

    // Handle Local Mock Mode
    if (!isSupabaseConfigured()) {
      console.log('Auth: Operating in Local Mock Mode. Seeding mock user session.');
      // Simulate slight network delay for modern experience
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // Seed with mock data
      const mockUser = {
        id: mockProfile.id,
        email: mockProfile.email,
        user_metadata: { full_name: mockProfile.full_name, org_name: 'Alpha Grand Palace' },
      } as unknown as User;

      set({
        user: mockUser,
        profile: mockProfile,
        sessionChecked: true,
        isLoading: false,
      });

      // Trigger local mock sync
      await useDataStore.getState().syncData();
      return;
    }

    try {
      // 1. Get the current active session user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        set({ user: null, profile: null, sessionChecked: true, isLoading: false });
        return;
      }

      // 2. Fetch the corresponding profile in the database
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError || !profile) {
        console.warn('Auth: Session user found but database profile does not exist.');
        // Sign out to clean corrupted auth states
        await supabase.auth.signOut();
        set({ user: null, profile: null, sessionChecked: true, isLoading: false });
        return;
      }

      // 3. Populate store state
      set({
        user,
        profile,
        sessionChecked: true,
        isLoading: false,
      });

      // 4. Trigger workspace data download
      await useDataStore.getState().syncData();
    } catch (err: any) {
      console.error('Auth: checkSession failed', err);
      set({
        user: null,
        profile: null,
        sessionChecked: true,
        isLoading: false,
        error: err.message || 'Session checking failed.',
      });
    }
  },

  signIn: async (email, password) => {
    set({ isLoading: true, error: null });

    // Handle Local Mock Mode
    if (!isSupabaseConfigured()) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      if (!email.includes('@') || password.length < 4) {
        set({ isLoading: false, error: 'Invalid email or password format.' });
        throw new Error('Invalid email or password format.');
      }

      const mockUser = {
        id: mockProfile.id,
        email: email,
        user_metadata: { full_name: mockProfile.full_name, org_name: 'Alpha Grand Palace' },
      } as unknown as User;

      set({
        user: mockUser,
        profile: {
          ...mockProfile,
          email: email,
        },
        isLoading: false,
      });

      await useDataStore.getState().syncData();
      return;
    }

    try {
      // 1. Sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.user) {
        throw new Error(authError?.message || 'Invalid login credentials.');
      }

      // 2. Fetch User Profile (Retry once for race conditions on trigger creation)
      let profile = null;
      const profileRes = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (profileRes.error) {
        throw new Error(`Profile fetch failed: ${profileRes.error.message}`);
      }

      profile = profileRes.data;

      if (!profile) {
        // Wait and retry once
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const retryRes = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .maybeSingle();

        if (retryRes.error || !retryRes.data) {
          throw new Error('User profile record could not be found. Please contact support.');
        }
        profile = retryRes.data;
      }

      // 3. Set store state
      set({
        user: authData.user,
        profile,
        isLoading: false,
      });

      // 4. Sync workspace data
      await useDataStore.getState().syncData();
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Login failed.' });
      throw err;
    }
  },

  signUp: async (email, password, fullName, orgName) => {
    set({ isLoading: true, error: null });

    // Handle Local Mock Mode
    if (!isSupabaseConfigured()) {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const mockUser = {
        id: 'mock-user-uuid-new',
        email: email,
        user_metadata: { full_name: fullName, org_name: orgName },
      } as unknown as User;

      set({
        user: mockUser,
        profile: {
          id: 'mock-user-uuid-new',
          org_id: 'mock-org-uuid-new',
          email: email,
          full_name: fullName,
          avatar_url: null,
          role: 'owner',
          phone: null,
          is_active: true,
          created_at: new Date().toISOString(),
        },
        isLoading: false,
      });

      await useDataStore.getState().syncData();
      return { sessionCreated: true };
    }

    try {
      // 1. Register with Supabase and pass raw_user_meta_data
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            org_name: orgName,
            role: 'owner',
          },
        },
      });

      if (authError) {
        throw authError;
      }

      // 2. Check if a session was created automatically (email confirmation might be disabled)
      const { session, user } = authData;

      if (session && user) {
        // Fetch newly created profile
        let profile = null;
        // Wait briefly for trigger execution
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        const profileRes = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileRes.data) {
          profile = profileRes.data;
        } else {
          // Retry once
          await new Promise((resolve) => setTimeout(resolve, 1500));
          const retryRes = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          if (retryRes.data) {
            profile = retryRes.data;
          }
        }

        set({
          user,
          profile,
          isLoading: false,
        });

        // Trigger workspace sync
        await useDataStore.getState().syncData();
        return { sessionCreated: true };
      }

      // If email confirmation is enabled, session won't be active yet
      set({ isLoading: false });
      return { sessionCreated: false };
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Registration failed.' });
      throw err;
    }
  },

  signOut: async () => {
    set({ isLoading: true, error: null });

    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Auth: Supabase signOut error', err);
      }
    }

    // Reset auth store
    set({
      user: null,
      profile: null,
      isLoading: false,
    });

    // Clear data collections in data-store
    useDataStore.getState().clearData();
  },

  resendVerificationEmail: async (email) => {
    set({ isLoading: true, error: null });
    if (!isSupabaseConfigured()) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      set({ isLoading: false });
      return;
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: window.location.origin + '/login',
        },
      });

      if (error) {
        throw error;
      }

      set({ isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Failed to resend confirmation email.' });
      throw err;
    }
  },
}));
