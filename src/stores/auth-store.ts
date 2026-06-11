import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types/auth';
import { useDataStore } from './data-store';
import { mockProfile } from '@/lib/mock-data';
import { isSuperAdminEmail } from '@/lib/permissions';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  sessionChecked: boolean;
  isLoading: boolean;
  error: string | null;

  checkSession: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, orgName: string, promoCode?: string) => Promise<{ sessionCreated: boolean }>;
  signOut: () => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
  clearError: () => void;
  updateUserMetadata: (metadata: Record<string, any>) => Promise<void>;
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
      
      const sessionEmail = localStorage.getItem('venuepro_session_email') || mockProfile.email;
      const isSA = isSuperAdminEmail(sessionEmail);

      // Seed with mock data
      const mockUser = {
        id: isSA ? 'mock-super-admin-id' : mockProfile.id,
        email: sessionEmail,
        user_metadata: { full_name: isSA ? 'Platform Super Admin' : mockProfile.full_name, org_name: isSA ? 'VenuePro HQ' : 'Alpha Grand Palace' },
      } as unknown as User;

      set({
        user: mockUser,
        profile: {
          id: isSA ? 'mock-super-admin-id' : mockProfile.id,
          org_id: isSA ? 'mock-system-org-id' : mockProfile.org_id,
          email: sessionEmail,
          full_name: isSA ? 'Platform Super Admin' : mockProfile.full_name,
          role: isSA ? 'super_admin' : mockProfile.role,
          avatar_url: null,
          phone: isSA ? '9876543210' : mockProfile.phone,
          is_active: true,
          created_at: mockProfile.created_at,
        },
        sessionChecked: true,
        isLoading: false,
      });

      // Trigger local mock sync
      await useDataStore.getState().syncData(true);
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
      const { data: dbProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError || !dbProfile) {
        console.warn('Auth: Session user found but database profile does not exist.');
        // Sign out to clean corrupted auth states
        await supabase.auth.signOut();
        set({ user: null, profile: null, sessionChecked: true, isLoading: false });
        return;
      }

      let profile = dbProfile;
      if (profile && isSuperAdminEmail(profile.email || user.email)) {
        profile = { ...profile, role: 'super_admin' };
      }

      // 3. Populate store state
      set({
        user,
        profile,
        sessionChecked: true,
        isLoading: false,
      });

      // 4. Trigger workspace data download
      await useDataStore.getState().syncData(true);
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

      const isSA = isSuperAdminEmail(email);
      // Persist chosen email to localStorage so checkSession re-reads it
      localStorage.setItem('venuepro_session_email', email);

      const mockUser = {
        id: isSA ? 'mock-super-admin-id' : mockProfile.id,
        email: email,
        user_metadata: { full_name: isSA ? 'Platform Super Admin' : mockProfile.full_name, org_name: isSA ? 'VenuePro HQ' : 'Alpha Grand Palace' },
      } as unknown as User;

      set({
        user: mockUser,
        profile: {
          id: isSA ? 'mock-super-admin-id' : mockProfile.id,
          org_id: isSA ? 'mock-system-org-id' : mockProfile.org_id,
          email: email,
          full_name: isSA ? 'Platform Super Admin' : mockProfile.full_name,
          role: isSA ? 'super_admin' : 'owner',
          avatar_url: null,
          phone: isSA ? '9876543210' : mockProfile.phone,
          is_active: true,
          created_at: new Date().toISOString(),
        },
        isLoading: false,
      });

      await useDataStore.getState().syncData(true);
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
        let retries = 5;
        let delay = 100;
        for (let i = 0; i < retries; i++) {
          const retryRes = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .maybeSingle();
          if (retryRes.data) {
            profile = retryRes.data;
            break;
          }
          if (i < retries - 1) {
            await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)));
          }
        }
        if (!profile) {
          throw new Error('User profile record could not be found. Please contact support.');
        }
      }

      // Check if email qualifies as super admin
      if (profile && isSuperAdminEmail(profile.email || authData.user.email)) {
        profile = { ...profile, role: 'super_admin' };
      }

      // 3. Set store state
      set({
        user: authData.user,
        profile,
        isLoading: false,
      });

      // 4. Sync workspace data
      await useDataStore.getState().syncData(true);
    } catch (err: any) {
      let msg = err.message || 'Login failed.';
      if (err.message === 'Failed to fetch' || !navigator.onLine) {
        msg = 'Network connection failed. Please check your internet connection or try offline Demo Mode.';
      }
      set({ isLoading: false, error: msg });
      throw err;
    }
  },

  signUp: async (email, password, fullName, orgName, promoCode) => {
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

      // Calculate trial ends date
      let baseTrialDays = 14;
      let appliedCodes: string[] = [];
      let monthsToAdd = 0;
      if (promoCode) {
        const cleanCode = promoCode.trim().toUpperCase();
        
        // Import dynamically to avoid top-level cyclic import
        const { useAdminStore } = await import('./admin-store');
        const mockPromoCodes = useAdminStore.getState().allPromoCodes;
        const foundMock = mockPromoCodes.find(p => p.code === cleanCode && p.is_active && (!p.expires_at || new Date(p.expires_at) > new Date()));
        
        if (foundMock) {
          monthsToAdd = foundMock.months_to_add;
          appliedCodes.push(cleanCode);
        } else {
          if (cleanCode === 'TRIAL1M') monthsToAdd = 1;
          else if (cleanCode === 'TRIAL2M') monthsToAdd = 2;
          else if (cleanCode === 'TRIAL3M') monthsToAdd = 3;
          
          if (monthsToAdd > 0) {
            appliedCodes.push(cleanCode);
          }
        }
      }

      const trialEndsDate = new Date();
      trialEndsDate.setDate(trialEndsDate.getDate() + baseTrialDays);
      const finalTrialEndsDate = monthsToAdd > 0 
        ? new Date(trialEndsDate.setMonth(trialEndsDate.getMonth() + monthsToAdd)).toISOString() 
        : trialEndsDate.toISOString();

      // Initialize the mock organization state with the trial parameters
      useDataStore.setState({
        organization: {
          id: 'mock-org-uuid-new',
          name: orgName,
          slug: orgName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          gstin: null,
          address: null,
          city: null,
          state: null,
          phone: null,
          email: email,
          logo_url: null,
          terms_and_conditions: null,
          settings: {
            currency: 'INR',
            timezone: 'Asia/Kolkata',
            date_format: 'dd/MM/yyyy',
            default_advance_percent: 25,
            gst_enabled: true,
            whatsapp_enabled: true,
            sms_enabled: false,
            email_notifications: true,
          },
          plan: 'pro',
          created_at: new Date().toISOString(),
          trial_ends_at: finalTrialEndsDate,
          subscription_status: 'trial',
          promo_codes_applied: appliedCodes,
        }
      });

      await useDataStore.getState().syncData(true);
      return { sessionCreated: true };
    }

    try {
      // 1. Register with Supabase and pass raw_user_meta_data
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/login',
          data: {
            full_name: fullName,
            org_name: orgName,
            role: 'owner',
            promo_code: promoCode || null,
          },
        },
      });

      if (authError) {
        throw authError;
      }

      // 2. Check if a session was created automatically (email confirmation might be disabled)
      const { session, user } = authData;

      if (session && user) {
        // Fetch newly created profile with exponential backoff
        let profile = null;
        let retries = 5;
        let delay = 100;
        for (let i = 0; i < retries; i++) {
          const profileRes = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
          if (profileRes.data) {
            profile = profileRes.data;
            break;
          }
          if (i < retries - 1) {
            await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)));
          }
        }

        set({
          user,
          profile,
          isLoading: false,
        });

        // Trigger workspace sync
        await useDataStore.getState().syncData(true);
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

  updateUserMetadata: async (metadata) => {
    const user = get().user;
    if (!user) return;

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.updateUser({
          data: metadata
        });
        if (error) throw error;
        if (data.user) {
          set({ user: data.user });
        }
      } catch (err: any) {
        console.error('Auth: updateUserMetadata failed', err);
      }
    } else {
      set({
        user: {
          ...user,
          user_metadata: {
            ...user.user_metadata,
            ...metadata
          }
        }
      });
    }
  },
}));
