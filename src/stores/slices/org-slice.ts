import type { StateCreator } from 'zustand';
import type { DataState } from '../data-store';
import type { Organization } from '@/types/organization';
import type { Profile } from '@/types/auth';
import type { StaffInvite, StaffRole } from '@/types/staff';
import type { Menu, MenuItem } from '@/types/menu';
import type { Expense } from '@/types/expense';
import type { Notification } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { toast } from 'sonner';
import { parseDatabaseError } from '@/lib/utils';
import {
  mockBookings as initialBookings,
  mockCustomers as initialCustomers,
  mockPayments as initialPayments,
  mockLeads as initialLeads,
  mockHalls as initialHalls,
  mockOrganization as initialOrg,
  mockMenus as initialMenus,
} from '@/lib/mock-data';
import { format, subDays, addMonths } from 'date-fns';
import { compressAndConvertToWebp } from '@/lib/image';

function uuid() {
  return self.crypto.randomUUID();
}

const mockStaffProfiles: Profile[] = [
  { id: 'user-001', org_id: 'org-demo-001', email: 'admin@shreemangalam.com', full_name: 'Rajesh Agarwal', role: 'owner', avatar_url: null, phone: '9876543210', is_active: true, created_at: new Date().toISOString() },
  { id: 'user-002', org_id: 'org-demo-001', email: 'manager@shreemangalam.com', full_name: 'Amit Patel', role: 'manager', avatar_url: null, phone: '9876543222', is_active: true, created_at: new Date().toISOString() },
  { id: 'user-003', org_id: 'org-demo-001', email: 'finance@shreemangalam.com', full_name: 'Nikhil Shah', role: 'finance', avatar_url: null, phone: '9876543233', is_active: true, created_at: new Date().toISOString() }
];

const mockStaffInvites: StaffInvite[] = [
  { id: 'inv-001', org_id: 'org-demo-001', email: 'staff1@shreemangalam.com', role: 'staff', invited_by: 'user-001', status: 'pending', created_at: new Date().toISOString() },
];

const mockExpenses: Expense[] = [
  { id: 'exp-001', org_id: 'org-demo-001', title: 'Catering for Sharma Wedding', category: 'catering', amount_paise: 12000000, expense_date: format(new Date(), 'yyyy-MM-dd'), payment_mode: 'bank_transfer', reference_number: 'TXN-98213', notes: 'Paid to vendor directly', receipt_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'exp-002', org_id: 'org-demo-001', title: 'Electrical repair work', category: 'maintenance', amount_paise: 850000, expense_date: format(subDays(new Date(), 2), 'yyyy-MM-dd'), payment_mode: 'cash', reference_number: null, notes: 'AC compressor gas top-up', receipt_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'exp-003', org_id: 'org-demo-001', title: 'Electricity Bill April', category: 'utilities', amount_paise: 4500000, expense_date: format(subDays(new Date(), 10), 'yyyy-MM-dd'), payment_mode: 'online', reference_number: 'MTR-9831', notes: 'Paid online via portal', receipt_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    org_id: 'org-demo-001',
    title: 'Follow-up Due Today 🎯',
    message: 'Inquiry from Priya Sharma requires follow-up today.',
    type: 'lead_followup',
    is_read: false,
    link_to: '/leads',
    created_at: new Date().toISOString(),
  },
  {
    id: 'notif-002',
    org_id: 'org-demo-001',
    title: 'Payment Received 💰',
    message: 'Advance payment of ₹50,000 recorded for booking VP-2026-0248.',
    type: 'payment_received',
    is_read: true,
    link_to: '/payments',
    created_at: subDays(new Date(), 1).toISOString(),
  },
  {
    id: 'notif-003',
    org_id: 'org-demo-001',
    title: 'Welcome to VenuePro! ⚙️',
    message: 'Start by configuring your halls and base pricing in Settings.',
    type: 'system',
    is_read: false,
    link_to: '/settings',
    created_at: subDays(new Date(), 3).toISOString(),
  }
];

export interface OrgSlice {
  organization: Organization;
  staffProfiles: Profile[];
  pendingInvites: StaffInvite[];
  menus: Menu[];
  isLoading: boolean;
  isOnline: boolean;
  realtimeChannel: any | null;
  syncData: (silent?: boolean) => Promise<void>;
  clearData: () => void;
  updateOrganization: (data: Partial<Organization>) => Promise<void>;
  upgradeOrganization: (plan: 'starter' | 'pro' | 'enterprise') => Promise<void>;
  fetchStaff: () => Promise<void>;
  inviteStaff: (email: string, role: 'manager' | 'finance' | 'staff') => Promise<StaffInvite>;
  updateStaffRole: (id: string, role: StaffRole) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;
  cancelInvite: (id: string) => Promise<void>;
  uploadMedia: (file: File, bucket: string) => Promise<string>;
  createMenu: (data: {
    name: string;
    price_paise: number;
    food_type: 'veg' | 'non_veg' | 'both' | 'jain';
    category: string;
    tags: string[];
    items: MenuItem[];
    hall_ids: string[];
  }) => Promise<void>;
  updateMenu: (id: string, data: Partial<Menu>) => Promise<void>;
  deleteMenu: (id: string) => Promise<void>;
  applyPromoCode: (code: string) => Promise<void>;
}

export const createOrgSlice: StateCreator<
  DataState,
  [],
  [],
  OrgSlice
> = (set, get) => ({
  organization: { ...initialOrg },
  staffProfiles: [...mockStaffProfiles],
  pendingInvites: [...mockStaffInvites],
  menus: [...initialMenus],
  isLoading: false,
  isOnline: false,
  realtimeChannel: null,

  // ─── Sync Action ─────────────────────────────────────────
  syncData: async (silent = false) => {
    if (!isSupabaseConfigured()) {
      console.log('Using Local Mock Mode (no credentials provided). Seeding mock collections.');
      const localInventoryItems = localStorage.getItem('vp_inventory_items');
      const localAllocations = localStorage.getItem('vp_inventory_allocations');
      const currentOrg = get().organization;
      set({
        bookings: [...initialBookings],
        customers: [...initialCustomers],
        payments: [...initialPayments],
        leads: [...initialLeads],
        halls: [...initialHalls],
        menus: [...initialMenus],
        organization: currentOrg && currentOrg.id === 'mock-org-uuid-new' ? currentOrg : { ...initialOrg },
        expenses: [...mockExpenses],
        staffProfiles: [...mockStaffProfiles],
        pendingInvites: [...mockStaffInvites],
        notifications: [...mockNotifications],
        inventoryItems: localInventoryItems ? JSON.parse(localInventoryItems) : get().inventoryItems,
        inventoryAllocations: localAllocations ? JSON.parse(localAllocations) : get().inventoryAllocations,
        isOnline: false,
      });
      // Run background checks for followups/payment alerts
      setTimeout(() => {
        get().runBackgroundChecks();
      }, 1000);
      return;
    }

    set({ isLoading: true });

    try {
      // 1. Get authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('User session could not be established. Please login.');
      }

      // 2. Fetch User Profile (retries once for race conditions on trigger)
      let profile = null;
      const profileRes = await supabase
        .from('profiles')
        .select('org_id, full_name, role')
        .eq('id', user.id)
        .maybeSingle();

      if (profileRes.error) {
        throw new Error(`Profile fetch error: ${profileRes.error.message}`);
      }

      profile = profileRes.data;

      // Retry once after a delay if profiles table trigger was slow
      if (!profile) {
        let retries = 5;
        let delay = 100;
        for (let i = 0; i < retries; i++) {
          const retryRes = await supabase
            .from('profiles')
            .select('org_id, full_name, role')
            .eq('id', user.id)
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
          throw new Error('Database profile not created yet. Please reload the page.');
        }
      }

      const orgId = profile.org_id;
      if (import.meta.env.DEV) {
        console.log(`Connected to Supabase. Org ID: ${orgId}`);
      }

      // 3. Fetch all organization-scoped collections
      const dateOneYearAgo = format(subDays(new Date(), 365), 'yyyy-MM-dd');
      const timestampOneYearAgo = subDays(new Date(), 365).toISOString();

      // 3. Fetch all organization-scoped collections (range limited to last 365 days for performance)
      const [
        orgRes, hallsRes, customersRes, bookingsRes, paymentsRes, 
        leadsRes, expensesRes, staffRes, invitesRes, notificationsRes, 
        menusRes, inventoryRes, allocationsRes
      ] = await Promise.all([
        supabase.from('organizations').select('*').eq('id', orgId).single(),
        supabase.from('halls').select('*').eq('org_id', orgId).order('display_order'),
        supabase.from('customers').select('*').eq('org_id', orgId).order('created_at', { ascending: false }).limit(200),
        supabase.from('bookings').select('*').eq('org_id', orgId).gte('event_date', dateOneYearAgo),
        supabase.from('payments').select('*').eq('org_id', orgId).gte('created_at', timestampOneYearAgo),
        supabase.from('leads').select('*').eq('org_id', orgId).gte('created_at', timestampOneYearAgo),
        supabase.from('expenses').select('*').eq('org_id', orgId).gte('expense_date', dateOneYearAgo).order('expense_date', { ascending: false }),
        supabase.from('profiles').select('*').eq('org_id', orgId).order('created_at'),
        supabase.from('staff_invites').select('*').eq('org_id', orgId).order('created_at', { ascending: false }),
        supabase.from('notifications').select('*').eq('org_id', orgId).order('created_at', { ascending: false }),
        supabase.from('menus').select('*').eq('org_id', orgId).order('created_at', { ascending: false }),
        supabase.from('inventory_items').select('*').eq('org_id', orgId).order('name'),
        supabase.from('booking_inventory_allocations').select('*').eq('org_id', orgId)
      ]);

      if (orgRes.error) throw orgRes.error;
      if (hallsRes.error) throw hallsRes.error;
      if (customersRes.error) throw customersRes.error;
      if (bookingsRes.error) throw bookingsRes.error;
      if (paymentsRes.error) throw paymentsRes.error;
      if (leadsRes.error) throw leadsRes.error;
      if (menusRes && menusRes.error) throw menusRes.error;
      if (inventoryRes.error) throw inventoryRes.error;
      if (allocationsRes.error) throw allocationsRes.error;

      // Seed default halls if organization has none
      let hallsData = hallsRes.data || [];
      if (hallsData.length === 0) {
        console.log('New organization detected. Seeding default halls...');
        const seedHalls = initialHalls.map((h, i) => ({
          name: h.name,
          org_id: orgId,
          type: h.type,
          capacity_min: h.capacity_min,
          capacity_max: h.capacity_max,
          area_sqft: h.area_sqft,
          pricing: h.pricing,
          amenities: h.amenities,
          is_active: h.is_active,
          display_order: i + 1,
        }));
        
        const { data: insertedHalls, error: seedError } = await supabase
          .from('halls')
          .insert(seedHalls)
          .select();
        
        if (seedError) {
          console.error('Failed to seed halls:', seedError);
        } else if (insertedHalls) {
          hallsData = insertedHalls;
        }
      }

      // Format time strings from Supabase (slice "HH:MM:SS" -> "HH:MM")
      const formattedBookings = (bookingsRes.data || []).map((b: any) => ({
        ...b,
        start_time: b.start_time ? b.start_time.slice(0, 5) : '09:00',
        end_time: b.end_time ? b.end_time.slice(0, 5) : '22:00',
      }));

      // Update local state with fetched database collections
      set({
        organization: orgRes.data,
        halls: hallsData,
        customers: customersRes.data || [],
        bookings: formattedBookings,
        payments: paymentsRes.data || [],
        leads: leadsRes.data || [],
        expenses: expensesRes.data || [],
        menus: menusRes?.data || [],
        staffProfiles: staffRes.data || [],
        pendingInvites: invitesRes.data || [],
        notifications: notificationsRes.data || [],
        inventoryItems: inventoryRes.data || [],
        inventoryAllocations: allocationsRes.data || [],
        isOnline: true,
      });

      // Setup Real-time Postgres changes subscription
      const existingChannel = get().realtimeChannel;
      if (existingChannel) {
        supabase.removeChannel(existingChannel);
      }

      const channel = supabase
        .channel('public-db-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', filter: `org_id=eq.${orgId}` },
          (payload: any) => {
            const { table, eventType, new: newRow, old: oldRow } = payload;
            const rowOrgId = newRow?.org_id || oldRow?.org_id;
            if (rowOrgId && rowOrgId !== orgId) return;

            // Format time strings if bookings table
            if (table === 'bookings' && newRow) {
              if (newRow.start_time) newRow.start_time = newRow.start_time.slice(0, 5);
              if (newRow.end_time) newRow.end_time = newRow.end_time.slice(0, 5);
            }

            // Real-time changes logic with mapping
            if (table === 'organizations' && newRow) {
              set((s: any) => ({
                organization: { ...s.organization, ...newRow }
              }));
              return;
            }

            const tableToKeyMap: Record<string, string> = {
              profiles: 'staffProfiles',
              staff_invites: 'pendingInvites',
              bookings: 'bookings',
              customers: 'customers',
              payments: 'payments',
              leads: 'leads',
              halls: 'halls',
              expenses: 'expenses',
              menus: 'menus',
              notifications: 'notifications',
              inventory_items: 'inventoryItems',
              booking_inventory_allocations: 'inventoryAllocations',
            };

            const collectionName = tableToKeyMap[table];
            if (!collectionName) return;

            set((s: any) => {
              if (!s[collectionName]) return {};

              const list = [...s[collectionName]];
              if (eventType === 'INSERT') {
                if (!list.some((item) => item.id === newRow.id)) {
                  return { [collectionName]: [newRow, ...list] };
                }
              } else if (eventType === 'UPDATE') {
                const index = list.findIndex((item) => item.id === newRow.id);
                if (index !== -1) {
                  list[index] = { ...list[index], ...newRow };
                  return { [collectionName]: list };
                }
              } else if (eventType === 'DELETE') {
                return { [collectionName]: list.filter((item) => item.id !== oldRow.id) };
              }
              return {};
            });
          }
        )
        .subscribe();

      set({ realtimeChannel: channel });

      // Run background checks for followups/payment alerts
      setTimeout(() => {
        get().runBackgroundChecks();
      }, 1000);

      if (!silent) {
        toast.success('Connection successful');
      }
    } catch (err: any) {
      console.error('Sync failed, running in offline fallback mode:', err);
      toast.error('Database offline. Running in local fallback.');
      set({
        notifications: [...mockNotifications],
        isOnline: false
      });
      setTimeout(() => {
        get().runBackgroundChecks();
      }, 1000);
    } finally {
      set({ isLoading: false });
    }
  },

  // ─── Data Purging ────────────────────────────────────────
  clearData: () => {
    const channel = get().realtimeChannel;
    if (channel) {
      supabase.removeChannel(channel);
    }
    set({
      bookings: [],
      customers: [],
      payments: [],
      leads: [],
      halls: [],
      menus: [],
      expenses: [],
      staffProfiles: [],
      pendingInvites: [],
      notifications: [],
      inventoryItems: [],
      inventoryAllocations: [],
      organization: {
        id: '',
        name: '',
        slug: '',
        gstin: null,
        address: null,
        city: null,
        state: null,
        phone: null,
        email: null,
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
        plan: 'free',
        trial_ends_at: null,
        subscription_status: null,
        created_at: '',
      },
      isOnline: false,
      realtimeChannel: null,
    });
  },

  // ─── Organization ────────────────────────────────────────
  updateOrganization: async (data) => {
    const state = get();
    if (state.isOnline) {
      try {
        const { error } = await supabase
          .from('organizations')
          .update(data)
          .eq('id', state.organization.id);
        
        if (error) throw error;
      } catch (err: any) {
        console.error('Database updateOrganization failed:', err);
        toast.error(parseDatabaseError(err));
        return;
      }
    }

    set((s) => ({ organization: { ...s.organization, ...data } }));
  },

  upgradeOrganization: async (plan) => {
    const state = get();
    const isMock = !isSupabaseConfigured();
    if (state.isOnline && !isMock) {
      try {
        const { error } = await supabase
          .from('organizations')
          .update({
            plan,
            subscription_status: 'active',
            trial_ends_at: null,
          })
          .eq('id', state.organization.id);
        
        if (error) throw error;
      } catch (err: any) {
        console.error('Database upgradeOrganization failed:', err);
        toast.error(parseDatabaseError(err));
        return;
      }
    }

    set((s) => ({
      organization: {
        ...s.organization,
        plan,
        subscription_status: 'active',
        trial_ends_at: null,
      },
    }));
    toast.success(`Successfully upgraded to the ${plan.toUpperCase()} plan! 🎉`);
  },

  // ─── Staff CRUD ──────────────────────────────────────────
  fetchStaff: async () => {
    const state = get();
    if (state.isOnline) {
      try {
        const [profilesRes, invitesRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('org_id', state.organization.id).order('created_at'),
          supabase.from('staff_invites').select('*').eq('org_id', state.organization.id).order('created_at', { ascending: false }),
        ]);
        if (profilesRes.error) throw profilesRes.error;
        if (invitesRes.error) throw invitesRes.error;
        set({
          staffProfiles: profilesRes.data || [],
          pendingInvites: invitesRes.data || [],
        });
      } catch (err) {
        console.error('Database fetchStaff failed:', err);
      }
    }
  },

  inviteStaff: async (email, role) => {
    const state = get();
    const { data: { user } } = await supabase.auth.getUser();
    const invitedBy = user?.id || '';
    
    if (state.isOnline) {
      try {
        const { data: dbInvite, error } = await supabase
          .from('staff_invites')
          .insert({
            org_id: state.organization.id,
            email,
            role,
            invited_by: invitedBy || null,
            status: 'pending',
          })
          .select()
          .single();
        if (error) throw error;
        set((s) => ({ pendingInvites: [dbInvite, ...s.pendingInvites] }));
        toast.success(`Invitation created! Click the mail icon next to it to send or copy link.`);
        return dbInvite;
      } catch (err: any) {
        console.error('Database inviteStaff failed:', err);
        toast.error(parseDatabaseError(err));
        throw err;
      }
    }
    
    const localInvite: StaffInvite = {
      id: uuid(),
      org_id: state.organization.id,
      email,
      role,
      invited_by: invitedBy,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    set((s) => ({ pendingInvites: [localInvite, ...s.pendingInvites] }));
    toast.success(`Invitation created! Click the mail icon next to it to send or copy link.`);
    return localInvite;
  },

  updateStaffRole: async (id, role) => {
    const state = get();
    if (state.isOnline) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ role })
          .eq('id', id);
        if (error) throw error;
      } catch (err: any) {
        console.error('Database updateStaffRole failed:', err);
        toast.error(parseDatabaseError(err));
        return;
      }
    }
    set((s) => ({
      staffProfiles: s.staffProfiles.map((p) => p.id === id ? { ...p, role } : p),
    }));
    toast.success('Staff role updated.');
  },

  deleteStaff: async (id) => {
    const state = get();
    if (state.isOnline) {
      try {
        const { error } = await supabase.from('profiles').delete().eq('id', id);
        if (error) throw error;
      } catch (err: any) {
        console.error('Database deleteStaff failed:', err);
        toast.error(parseDatabaseError(err));
        return;
      }
    }
    set((s) => ({
      staffProfiles: s.staffProfiles.filter((p) => p.id !== id),
    }));
    toast.success('Staff member removed.');
  },

  cancelInvite: async (id) => {
    const state = get();
    if (state.isOnline) {
      try {
        const { error } = await supabase.from('staff_invites').delete().eq('id', id);
        if (error) throw error;
      } catch (err: any) {
        console.error('Database cancelInvite failed:', err);
        toast.error(parseDatabaseError(err));
        return;
      }
    }
    set((s) => ({
      pendingInvites: s.pendingInvites.filter((i) => i.id !== id),
    }));
    toast.success('Invitation cancelled.');
  },

  // ─── Upload Media ────────────────────────────────────────
  uploadMedia: async (file, bucket) => {
    const state = get();
    if (state.isOnline) {
      try {
        let uploadFile: File | Blob = file;
        let fileExt = file.name.split('.').pop() || 'jpg';
        
        // Compress and convert to webp if it's an image (excluding SVG)
        if (file.type.startsWith('image/') && file.type !== 'image/svg+xml') {
          const webpBlob = await compressAndConvertToWebp(file);
          uploadFile = new File([webpBlob], `${file.name.split('.')[0]}.webp`, { type: 'image/webp' });
          fileExt = 'webp';
        }

        const fileName = `${uuid()}.${fileExt}`;
        const filePath = `${state.organization.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, uploadFile);
        
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);
          
        return data.publicUrl;
      } catch (err: any) {
        console.error('File upload failed:', err);
        toast.error(`Upload failed: ${err.message || err}. Using fallback.`);
      }
    }
    
    const label = bucket === 'receipts' ? 'Receipt Placeholder' : 'Media Placeholder';
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui,sans-serif" font-size="14" font-weight="bold" fill="%239ca3af">${label}</text></svg>`;
  },

  // ─── Menu CRUD ───────────────────────────────────────────
  createMenu: async (data) => {
    const state = get();
    const newMenuData = {
      ...data,
      org_id: state.organization.id,
    };
    if (state.isOnline) {
      try {
        const { data: dbMenu, error } = await supabase
          .from('menus')
          .insert(newMenuData)
          .select()
          .single();
        if (error) throw error;
        set((s) => ({ menus: [dbMenu, ...s.menus] }));
        return;
      } catch (err: any) {
        console.error('Database createMenu failed:', err);
        toast.error(parseDatabaseError(err));
        throw err;
      }
    }
    const localMenu: Menu = {
      id: uuid(),
      org_id: state.organization.id,
      name: data.name,
      price_paise: data.price_paise,
      food_type: data.food_type as any,
      category: data.category,
      tags: data.tags,
      items: data.items,
      hall_ids: data.hall_ids,
      created_at: new Date().toISOString(),
    };
    set((s) => ({ menus: [localMenu, ...s.menus] }));
  },

  updateMenu: async (id, data) => {
    const state = get();
    if (state.isOnline) {
      try {
        const { error } = await supabase
          .from('menus')
          .update(data)
          .eq('id', id);
        if (error) throw error;
      } catch (err: any) {
        console.error('Database updateMenu failed:', err);
        toast.error(parseDatabaseError(err));
        return;
      }
    }
    set((s) => ({
      menus: s.menus.map((m) => (m.id === id ? { ...m, ...data } : m)),
    }));
  },

  deleteMenu: async (id) => {
    const state = get();
    if (state.isOnline) {
      try {
        const { error } = await supabase
          .from('menus')
          .delete()
          .eq('id', id);
        if (error) throw error;
      } catch (err: any) {
        console.error('Database deleteMenu failed:', err);
        toast.error(parseDatabaseError(err));
        return;
      }
    }
    set((s) => ({
      menus: s.menus.filter((m) => m.id !== id),
    }));
  },

  // ─── Coupon extension ────────────────────────────────────
  applyPromoCode: async (code) => {
    const state = get();
    const cleanCode = code.trim().toUpperCase();
    
    // Validate promo code
    let monthsToAdd: number;
    
    if (state.isOnline) {
      try {
        const { data, error } = await supabase
          .from('promo_codes')
          .select('*')
          .eq('code', cleanCode)
          .eq('is_active', true)
          .single();
        
        if (error || !data) {
          toast.error('Invalid or expired promo code. Please check and try again.');
          throw new Error('Invalid promo code');
        }
        
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          toast.error('Promo code has expired.');
          throw new Error('Promo code expired');
        }
        
        monthsToAdd = data.months_to_add;
      } catch (err: any) {
        if (err.message === 'Invalid promo code' || err.message === 'Promo code expired') {
          throw err;
        }
        console.error('Failed to validate promo code:', err);
        // Fallback to local hardcoded checks in case table query fails
        if (cleanCode === 'TRIAL1M') {
          monthsToAdd = 1;
        } else if (cleanCode === 'TRIAL2M') {
          monthsToAdd = 2;
        } else if (cleanCode === 'TRIAL3M') {
          monthsToAdd = 3;
        } else {
          toast.error('Invalid promo code. Please check and try again.');
          throw new Error('Invalid promo code', { cause: err });
        }
      }
    } else {
      // Local/offline checking
      const { useAdminStore } = await import('../admin-store');
      const mockPromoCodes = useAdminStore.getState().allPromoCodes;
      const foundMock = mockPromoCodes.find(p => p.code === cleanCode && p.is_active && (!p.expires_at || new Date(p.expires_at) > new Date()));
      
      if (foundMock) {
        monthsToAdd = foundMock.months_to_add;
      } else if (cleanCode === 'TRIAL1M') {
        monthsToAdd = 1;
      } else if (cleanCode === 'TRIAL2M') {
        monthsToAdd = 2;
      } else if (cleanCode === 'TRIAL3M') {
        monthsToAdd = 3;
      } else {
        toast.error('Invalid promo code. Please check and try again.');
        throw new Error('Invalid promo code');
      }
    }

    // Check if already applied
    const applied = state.organization.promo_codes_applied || [];
    if (applied.includes(cleanCode)) {
      toast.error(`Promo code "${cleanCode}" has already been redeemed for this organization.`);
      throw new Error('Promo code already applied');
    }

    // Calculate trial ends date
    const currentEndsAt = state.organization.trial_ends_at;
    const baseDate = (currentEndsAt && new Date(currentEndsAt) > new Date()) 
      ? new Date(currentEndsAt) 
      : new Date();
    
    const newEndsAt = addMonths(baseDate, monthsToAdd).toISOString();
    const updatedApplied = [...applied, cleanCode];

    if (state.isOnline) {
      try {
        const { error } = await supabase
          .from('organizations')
          .update({
            trial_ends_at: newEndsAt,
            subscription_status: 'trial',
            plan: state.organization.plan === 'free' ? 'pro' : state.organization.plan,
            promo_codes_applied: updatedApplied,
          })
          .eq('id', state.organization.id);
        
        if (error) throw error;
      } catch (err: any) {
        console.error('Database applyPromoCode failed:', err);
        toast.error(parseDatabaseError(err));
        throw err;
      }
    }

    set((s) => ({
      organization: {
        ...s.organization,
        trial_ends_at: newEndsAt,
        subscription_status: 'trial',
        plan: s.organization.plan === 'free' ? 'pro' : s.organization.plan,
        promo_codes_applied: updatedApplied,
      },
    }));

    toast.success(`Promo applied! 🎁 Free trial extended by ${monthsToAdd} month(s).`);
  },
});
