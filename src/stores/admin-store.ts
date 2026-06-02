import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Organization } from '@/types/organization';
import type { Profile } from '@/types/auth';
import type { Payment } from '@/types/payment';
import { useDataStore } from './data-store';
import { toast } from 'sonner';

// Extended payment type to include organization context for platform audits
export interface AdminPayment extends Payment {
  organization?: {
    name: string;
  };
}

interface AdminState {
  allOrganizations: Organization[];
  allProfiles: Profile[];
  allPayments: AdminPayment[];
  isLoading: boolean;
  error: string | null;

  syncAdminData: () => Promise<void>;
  updateOrganizationDetails: (orgId: string, data: Partial<Organization>) => Promise<void>;
  updateUserProfile: (profileId: string, data: Partial<Profile>) => Promise<void>;
  createOrganizationAdmin: (orgName: string, ownerName: string, ownerEmail: string, plan: string) => Promise<void>;
}

const defaultMockSettings = {
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  date_format: 'dd/MM/yyyy',
  default_advance_percent: 25,
  gst_enabled: true,
  whatsapp_enabled: true,
  sms_enabled: false,
  email_notifications: true
};

// Generate rich mock data for local testing
const seedMockOrganizations = (): Organization[] => [
  {
    id: 'org-shree-mangalam',
    name: 'Shree Mangalam Banquet',
    slug: 'shree-mangalam-banquet',
    gstin: '07AAAAA1111A1Z1',
    address: 'Sector 10, Dwarka',
    city: 'New Delhi',
    state: 'Delhi',
    phone: '9876543210',
    email: 'owner1@shreemangalam.com',
    logo_url: null,
    terms_and_conditions: null,
    settings: defaultMockSettings,
    plan: 'pro',
    subscription_status: 'active',
    trial_ends_at: null,
    created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString() // 6 months ago
  },
  {
    id: 'org-alpha-palace',
    name: 'Alpha Grand Palace',
    slug: 'alpha-grand-palace',
    gstin: null,
    address: 'MG Road, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    phone: '9876543211',
    email: 'owner2@alphapalace.com',
    logo_url: null,
    terms_and_conditions: null,
    settings: defaultMockSettings,
    plan: 'pro',
    subscription_status: 'trial',
    trial_ends_at: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(), // 9 days left
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
  },
  {
    id: 'org-royal-heritage',
    name: 'Royal Heritage Banquet',
    slug: 'royal-heritage-banquet',
    gstin: '24BBBBB2222B2Z2',
    address: 'Vastrapur',
    city: 'Ahmedabad',
    state: 'Gujarat',
    phone: '9876543212',
    email: 'owner3@royalheritage.com',
    logo_url: null,
    terms_and_conditions: null,
    settings: defaultMockSettings,
    plan: 'starter',
    subscription_status: 'active',
    trial_ends_at: null,
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() // 3 months ago
  },
  {
    id: 'org-golden-lawn',
    name: 'Golden Leaf Lawn',
    slug: 'golden-leaf-lawn',
    gstin: null,
    address: 'Hadapsar',
    city: 'Pune',
    state: 'Maharashtra',
    phone: '9876543213',
    email: 'owner4@goldenleaf.com',
    logo_url: null,
    terms_and_conditions: null,
    settings: defaultMockSettings,
    plan: 'pro',
    subscription_status: 'expired',
    trial_ends_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // Expired 6 days ago
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'org-capital-board',
    name: 'Capital Board Rooms & Hub',
    slug: 'capital-board-rooms',
    gstin: '27CCCCC3333C3Z3',
    address: 'Bandra Kurla Complex',
    city: 'Mumbai',
    state: 'Maharashtra',
    phone: '9876543214',
    email: 'owner5@capitalboard.com',
    logo_url: null,
    terms_and_conditions: null,
    settings: defaultMockSettings,
    plan: 'enterprise',
    subscription_status: 'active',
    trial_ends_at: null,
    created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year ago
  },
  {
    id: 'org-elite-terrace',
    name: 'Elite Rooftops & Terraces',
    slug: 'elite-rooftops',
    gstin: null,
    address: 'Jubilee Hills',
    city: 'Hyderabad',
    state: 'Telangana',
    phone: '9876543215',
    email: 'owner6@eliteterraces.com',
    logo_url: null,
    terms_and_conditions: null,
    settings: defaultMockSettings,
    plan: 'pro',
    subscription_status: 'canceled',
    trial_ends_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const seedMockProfiles = (): Profile[] => [
  { id: 'usr-admin-1', org_id: 'org-shree-mangalam', email: 'owner1@shreemangalam.com', full_name: 'Rajesh Agarwal', role: 'owner', phone: '9876543210', is_active: true, avatar_url: null, created_at: new Date().toISOString() },
  { id: 'usr-admin-2', org_id: 'org-shree-mangalam', email: 'manager1@shreemangalam.com', full_name: 'Amit Patel', role: 'manager', phone: '9876543220', is_active: true, avatar_url: null, created_at: new Date().toISOString() },
  { id: 'usr-admin-3', org_id: 'org-alpha-palace', email: 'owner2@alphapalace.com', full_name: 'Siddharth Roy', role: 'owner', phone: '9876543211', is_active: true, avatar_url: null, created_at: new Date().toISOString() },
  { id: 'usr-admin-4', org_id: 'org-royal-heritage', email: 'owner3@royalheritage.com', full_name: 'Vikram Mehta', role: 'owner', phone: '9876543212', is_active: true, avatar_url: null, created_at: new Date().toISOString() },
  { id: 'usr-admin-5', org_id: 'org-royal-heritage', email: 'finance3@royalheritage.com', full_name: 'Nikhil Shah', role: 'finance', phone: '9876543222', is_active: true, avatar_url: null, created_at: new Date().toISOString() },
  { id: 'usr-admin-6', org_id: 'org-golden-lawn', email: 'owner4@goldenleaf.com', full_name: 'Meera Deshmukh', role: 'owner', phone: '9876543213', is_active: false, avatar_url: null, created_at: new Date().toISOString() },
  { id: 'usr-admin-7', org_id: 'org-capital-board', email: 'owner5@capitalboard.com', full_name: 'Anil Ambani', role: 'owner', phone: '9876543214', is_active: true, avatar_url: null, created_at: new Date().toISOString() },
  { id: 'usr-admin-8', org_id: 'org-elite-terrace', email: 'owner6@eliteterraces.com', full_name: 'Prakash Rao', role: 'owner', phone: '9876543215', is_active: true, avatar_url: null, created_at: new Date().toISOString() }
];

const seedMockPayments = (): AdminPayment[] => [
  { id: 'pay-adm-1', org_id: 'org-shree-mangalam', booking_id: 'b-001', amount_paise: 1499900, payment_type: 'final', payment_mode: 'online', status: 'received', transaction_ref: 'SUB-TXN-101', paid_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), created_at: new Date().toISOString(), due_date: null, notes: null },
  { id: 'pay-adm-2', org_id: 'org-shree-mangalam', booking_id: 'b-002', amount_paise: 1499900, payment_type: 'final', payment_mode: 'online', status: 'received', transaction_ref: 'SUB-TXN-102', paid_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), created_at: new Date().toISOString(), due_date: null, notes: null },
  { id: 'pay-adm-3', org_id: 'org-royal-heritage', booking_id: 'b-003', amount_paise: 999900, payment_type: 'final', payment_mode: 'online', status: 'received', transaction_ref: 'SUB-TXN-103', paid_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), created_at: new Date().toISOString(), due_date: null, notes: null },
  { id: 'pay-adm-4', org_id: 'org-capital-board', booking_id: 'b-004', amount_paise: 5000000, payment_type: 'final', payment_mode: 'bank_transfer', status: 'received', transaction_ref: 'SUB-TXN-ENT-01', paid_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), created_at: new Date().toISOString(), due_date: null, notes: null },
  { id: 'pay-adm-5', org_id: 'org-elite-terrace', booking_id: 'b-005', amount_paise: 1499900, payment_type: 'final', payment_mode: 'card', status: 'refunded', transaction_ref: 'SUB-TXN-105', paid_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(), created_at: new Date().toISOString(), due_date: null, notes: null }
];

export const useAdminStore = create<AdminState>()((set, get) => ({
  allOrganizations: [],
  allProfiles: [],
  allPayments: [],
  isLoading: false,
  error: null,

  syncAdminData: async () => {
    set({ isLoading: true, error: null });

    if (!isSupabaseConfigured()) {
      // Simulate short backend response
      await new Promise((resolve) => setTimeout(resolve, 600));
      
      const orgs = get().allOrganizations.length > 0 ? get().allOrganizations : seedMockOrganizations();
      const profiles = get().allProfiles.length > 0 ? get().allProfiles : seedMockProfiles();
      const payments = get().allPayments.length > 0 ? get().allPayments : seedMockPayments();

      // Map organization names directly onto payments for display
      const joinedPayments = payments.map(p => ({
        ...p,
        organization: {
          name: orgs.find(o => o.id === p.org_id)?.name || 'Unknown Venue'
        }
      }));

      set({
        allOrganizations: orgs,
        allProfiles: profiles,
        allPayments: joinedPayments,
        isLoading: false
      });
      return;
    }

    try {
      // Query all tables. The RLS policy will permit selection if role = 'super_admin'
      const [orgsRes, profilesRes, paymentsRes] = await Promise.all([
        supabase.from('organizations').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('payments').select('*, organizations(name)').order('paid_at', { ascending: false })
      ]);

      if (orgsRes.error) throw orgsRes.error;
      if (profilesRes.error) throw profilesRes.error;
      if (paymentsRes.error) throw paymentsRes.error;

      set({
        allOrganizations: orgsRes.data || [],
        allProfiles: profilesRes.data || [],
        allPayments: (paymentsRes.data as any[]) || [],
        isLoading: false
      });
    } catch (err: any) {
      console.error('SuperAdmin sync failed:', err);
      set({ isLoading: false, error: err.message || 'Failed to sync administrative data.' });
      toast.error(err.message || 'Failed to sync platform records.');
    }
  },

  updateOrganizationDetails: async (orgId, data) => {
    set({ isLoading: true });

    if (!isSupabaseConfigured()) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const orgs = get().allOrganizations.map(o => o.id === orgId ? { ...o, ...data } : o);
      set({ allOrganizations: orgs, isLoading: false });
      toast.success('Organization subscription updated locally! 🏢');
      
      // If we modified standard demo org, sync standard data-store
      const activeOrg = useDataStore.getState().organization;
      if (activeOrg && activeOrg.id === orgId) {
        useDataStore.setState({ organization: { ...activeOrg, ...data } });
      }
      return;
    }

    try {
      const { error } = await supabase
        .from('organizations')
        .update(data)
        .eq('id', orgId);

      if (error) throw error;

      toast.success('Organization updated successfully! 🏢');
      await get().syncAdminData();
      
      // Sync standard data-store in case this admin is also acting as the manager of that org
      const activeOrg = useDataStore.getState().organization;
      if (activeOrg && activeOrg.id === orgId) {
        await useDataStore.getState().syncData(true);
      }
    } catch (err: any) {
      set({ isLoading: false });
      toast.error(err.message || 'Failed to update organization plan.');
      throw err;
    }
  },

  updateUserProfile: async (profileId, data) => {
    set({ isLoading: true });

    if (!isSupabaseConfigured()) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const profiles = get().allProfiles.map(p => p.id === profileId ? { ...p, ...data } : p);
      set({ allProfiles: profiles, isLoading: false });
      toast.success('User profile updated locally! 👤');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', profileId);

      if (error) throw error;

      toast.success('User updated successfully! 👤');
      await get().syncAdminData();
    } catch (err: any) {
      set({ isLoading: false });
      toast.error(err.message || 'Failed to update user profile.');
      throw err;
    }
  },

  createOrganizationAdmin: async (orgName, ownerName, ownerEmail, plan) => {
    set({ isLoading: true });

    if (!isSupabaseConfigured()) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      const newOrgId = `org-mock-${Math.floor(Math.random() * 9999)}`;
      const newUserId = `usr-mock-${Math.floor(Math.random() * 9999)}`;
      
      const newOrg: Organization = {
        id: newOrgId,
        name: orgName,
        slug: orgName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        gstin: null,
        address: null,
        city: 'Mumbai',
        state: 'Maharashtra',
        phone: '9999999999',
        email: ownerEmail,
        logo_url: null,
        terms_and_conditions: null,
        settings: defaultMockSettings,
        plan: plan as any,
        subscription_status: 'active',
        trial_ends_at: null,
        created_at: new Date().toISOString()
      };

      const newProfile: Profile = {
        id: newUserId,
        org_id: newOrgId,
        email: ownerEmail,
        full_name: ownerName,
        role: 'owner',
        phone: '9999999999',
        is_active: true,
        avatar_url: null,
        created_at: new Date().toISOString()
      };

      set({
        allOrganizations: [newOrg, ...get().allOrganizations],
        allProfiles: [newProfile, ...get().allProfiles],
        isLoading: false
      });
      toast.success('Venue and administrator created locally! 🎉');
      return;
    }

    try {
      // In production mode, since auth creation requires Supabase auth.signUp,
      // we invoke an RPC function or utilize the supabase.rpc helper, 
      // or we instruct the admin to send an invite email.
      const { data, error } = await supabase.rpc('admin_create_organization_and_owner', {
        p_org_name: orgName,
        p_owner_name: ownerName,
        p_owner_email: ownerEmail,
        p_plan: plan
      });

      if (error) throw error;

      toast.success('Venue and administrator profile created successfully! 🎉');
      await get().syncAdminData();
    } catch (err: any) {
      set({ isLoading: false });
      console.error(err);
      toast.error(err.message || 'Failed to provision organization and owner.');
      throw err;
    }
  }
}));
