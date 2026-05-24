import { create } from 'zustand';
import type { Booking, EventType, BookingStatus } from '@/types/booking';
import type { Customer, CustomerSource } from '@/types/customer';
import type { Payment, PaymentMode, PaymentType } from '@/types/payment';
import type { Lead, LeadStatus, LeadSource } from '@/types/lead';
import type { Hall } from '@/types/venue';
import type { Organization } from '@/types/organization';
import type { Expense, ExpenseCategory, ExpensePaymentMode } from '@/types/expense';
import type { StaffInvite, StaffRole } from '@/types/staff';
import type { Profile } from '@/types/auth';
import type { Notification, NotificationType, Feedback } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { formatDateReadable, formatCurrency, parseDatabaseError } from '@/lib/utils';
import {
  mockBookings as initialBookings,
  mockCustomers as initialCustomers,
  mockPayments as initialPayments,
  mockLeads as initialLeads,
  mockHalls as initialHalls,
  mockOrganization as initialOrg,
} from '@/lib/mock-data';
import { format, addDays, startOfMonth, addMonths, subDays } from 'date-fns';
import { toast } from 'sonner';

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function generateBookingNumber(): string {
  const year = new Date().getFullYear();
  const num = Math.floor(Math.random() * 99999) + 1;
  return `VP-${year}-${String(num).padStart(5, '0')}`;
}

const mockExpenses: Expense[] = [
  { id: 'exp-001', org_id: 'org-demo-001', title: 'Catering for Sharma Wedding', category: 'catering', amount_paise: 12000000, expense_date: format(new Date(), 'yyyy-MM-dd'), payment_mode: 'bank_transfer', reference_number: 'TXN-98213', notes: 'Paid to vendor directly', receipt_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'exp-002', org_id: 'org-demo-001', title: 'Electrical repair work', category: 'maintenance', amount_paise: 850000, expense_date: format(subDays(new Date(), 2), 'yyyy-MM-dd'), payment_mode: 'cash', reference_number: null, notes: 'AC compressor gas top-up', receipt_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'exp-003', org_id: 'org-demo-001', title: 'Electricity Bill April', category: 'utilities', amount_paise: 4500000, expense_date: format(subDays(new Date(), 10), 'yyyy-MM-dd'), payment_mode: 'online', reference_number: 'MTR-9831', notes: 'Paid online via portal', receipt_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const mockStaffProfiles: Profile[] = [
  { id: 'user-001', org_id: 'org-demo-001', email: 'admin@shreemangalam.com', full_name: 'Rajesh Agarwal', role: 'owner', avatar_url: null, phone: '9876543210', is_active: true, created_at: new Date().toISOString() },
  { id: 'user-002', org_id: 'org-demo-001', email: 'manager@shreemangalam.com', full_name: 'Amit Patel', role: 'manager', avatar_url: null, phone: '9876543222', is_active: true, created_at: new Date().toISOString() },
  { id: 'user-003', org_id: 'org-demo-001', email: 'finance@shreemangalam.com', full_name: 'Nikhil Shah', role: 'finance', avatar_url: null, phone: '9876543233', is_active: true, created_at: new Date().toISOString() }
];

const mockStaffInvites: StaffInvite[] = [
  { id: 'inv-001', org_id: 'org-demo-001', email: 'staff1@shreemangalam.com', role: 'staff', invited_by: 'user-001', status: 'pending', created_at: new Date().toISOString() },
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

interface DataState {
  // ─── Collections ─────────────────────────────────────────
  bookings: Booking[];
  customers: Customer[];
  payments: Payment[];
  leads: Lead[];
  halls: Hall[];
  organization: Organization;
  expenses: Expense[];
  staffProfiles: Profile[];
  pendingInvites: StaffInvite[];
  isLoading: boolean;
  isOnline: boolean;

  // ─── Sync Action ─────────────────────────────────────────
  syncData: () => Promise<void>;

  // ─── Booking CRUD ────────────────────────────────────────
  createBooking: (data: {
    customer_id: string;
    hall_id: string;
    event_type: EventType;
    event_date: string;
    start_time: string;
    end_time: string;
    guest_count?: number;
    total_amount_paise?: number;
    advance_amount_paise?: number;
    notes?: string;
    status?: BookingStatus;
  }) => Promise<{ success: boolean; booking?: Booking; error?: string }>;

  updateBooking: (id: string, data: Partial<Booking>) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;

  // ─── Customer CRUD ───────────────────────────────────────
  createCustomer: (data: {
    name: string;
    phone: string;
    email?: string;
    source?: CustomerSource;
    address?: string;
    gstin?: string;
    notes?: string;
  }) => Promise<Customer>;
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;

  // ─── Payment CRUD ────────────────────────────────────────
  recordPayment: (data: {
    booking_id: string;
    amount_paise: number;
    payment_mode: PaymentMode;
    payment_type?: PaymentType;
    transaction_ref?: string;
    notes?: string;
  }) => Promise<Payment>;
  updatePayment: (id: string, data: Partial<Payment>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;

  // ─── Lead CRUD ───────────────────────────────────────────
  createLead: (data: {
    name: string;
    phone: string;
    email?: string;
    event_type?: string;
    tentative_date?: string;
    budget_min_paise?: number;
    budget_max_paise?: number;
    source?: LeadSource;
    notes?: string;
    hall_preference?: string;
    guest_count?: number;
    follow_up_date?: string;
  }) => Promise<Lead>;
  updateLead: (id: string, data: Partial<Lead>) => Promise<void>;
  updateLeadStatus: (id: string, status: LeadStatus) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  convertLeadToBooking: (leadId: string, bookingData: {
    hall_id: string;
    event_date: string;
    start_time: string;
    end_time: string;
    total_amount_paise?: number;
    advance_amount_paise?: number;
  }) => Promise<{ success: boolean; booking?: Booking; error?: string }>;

  // ─── Hall CRUD ───────────────────────────────────────────
  createHall: (data: {
    name: string;
    type: string;
    capacity_min: number;
    capacity_max: number;
    area_sqft?: number;
    base_price_paise?: number;
    floor_number?: number;
    description?: string;
    capacity_comfortable?: number;
    hall_length?: number;
    hall_width?: number;
    hall_height?: number;
    ceiling_height?: number;
    floors_within_hall?: number;
    amenities_config?: any;
    facilities_config?: any;
    pricing_config?: any;
    media_config?: any;
    images?: string[];
    is_active?: boolean;
  }) => Promise<Hall>;
  updateHall: (id: string, data: Partial<Hall>) => Promise<void>;

  // ─── Expense CRUD ────────────────────────────────────────
  fetchExpenses: () => Promise<void>;
  createExpense: (data: {
    title: string;
    category: ExpenseCategory;
    amount_paise: number;
    expense_date: string;
    payment_mode: ExpensePaymentMode;
    reference_number?: string | null;
    notes?: string | null;
    receipt_url?: string | null;
  }) => Promise<Expense>;
  updateExpense: (id: string, data: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  // ─── Staff CRUD ──────────────────────────────────────────
  fetchStaff: () => Promise<void>;
  inviteStaff: (email: string, role: 'manager' | 'finance' | 'staff') => Promise<StaffInvite>;
  updateStaffRole: (id: string, role: StaffRole) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;
  cancelInvite: (id: string) => Promise<void>;

  // ─── Upload Media ────────────────────────────────────────
  uploadMedia: (file: File, bucket: string) => Promise<string>;

  // ─── Organization ────────────────────────────────────────
  updateOrganization: (data: Partial<Organization>) => Promise<void>;

  // ─── Queries ─────────────────────────────────────────────
  getCustomerById: (id: string) => Customer | undefined;
  getHallById: (id: string) => Hall | undefined;
  getBookingById: (id: string) => Booking | undefined;
  getLeadById: (id: string) => Lead | undefined;
  getPaymentsForBooking: (bookingId: string) => Payment[];
  getBookingsForDate: (date: string) => Booking[];
  getUpcomingBookings: (days?: number) => Booking[];
  getFollowUpsDue: () => Lead[];
  getDashboardStats: () => {
    todaysEvents: number;
    tomorrowEvents: number;
    thisMonthRevenue: number;
    thisMonthBookings: number;
    pendingAmount: number;
    pendingCustomers: number;
  };
  searchCustomers: (query: string) => Customer[];

  // ─── Conflict Check ──────────────────────────────────────
  checkAvailability: (hallId: string, eventDate: string, startTime: string, endTime: string, excludeBookingId?: string) => boolean;

  // ─── Data Purging ────────────────────────────────────────
  clearData: () => void;

  // ─── Notifications State ─────────────────────────────────
  notifications: Notification[];
  fetchNotifications: () => Promise<void>;
  createNotification: (data: {
    title: string;
    message: string;
    type: NotificationType;
    link_to?: string | null;
  }) => Promise<Notification>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;

  // ─── Feedback State ──────────────────────────────────────
  submitFeedback: (data: {
    rating: number;
    category: 'bug' | 'feature_request' | 'design' | 'other';
    message: string;
  }) => Promise<void>;

  // ─── Background Checks ───────────────────────────────────
  runBackgroundChecks: () => void;
}

export const useDataStore = create<DataState>()((set, get) => ({
  bookings: [...initialBookings],
  customers: [...initialCustomers],
  payments: [...initialPayments],
  leads: [...initialLeads],
  halls: [...initialHalls],
  organization: { ...initialOrg },
  expenses: [...mockExpenses],
  staffProfiles: [...mockStaffProfiles],
  pendingInvites: [...mockStaffInvites],
  notifications: [],
  isLoading: false,
  isOnline: false,

  // ─── Sync Action ─────────────────────────────────────────
  syncData: async () => {
    if (!isSupabaseConfigured()) {
      console.log('Using Local Mock Mode (no credentials provided). Seeding mock collections.');
      set({
        bookings: [...initialBookings],
        customers: [...initialCustomers],
        payments: [...initialPayments],
        leads: [...initialLeads],
        halls: [...initialHalls],
        organization: { ...initialOrg },
        expenses: [...mockExpenses],
        staffProfiles: [...mockStaffProfiles],
        pendingInvites: [...mockStaffInvites],
        notifications: [...mockNotifications],
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
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const retryRes = await supabase
          .from('profiles')
          .select('org_id, full_name, role')
          .eq('id', user.id)
          .maybeSingle();
        
        if (retryRes.error || !retryRes.data) {
          throw new Error('Database profile not created yet. Please reload the page.');
        }
        profile = retryRes.data;
      }

      const orgId = profile.org_id;
      console.log(`Connected to Supabase. Org ID: ${orgId}`);

      // 3. Fetch all organization-scoped collections
      const [orgRes, hallsRes, customersRes, bookingsRes, paymentsRes, leadsRes, expensesRes, staffRes, invitesRes, notificationsRes] = await Promise.all([
        supabase.from('organizations').select('*').eq('id', orgId).single(),
        supabase.from('halls').select('*').eq('org_id', orgId).order('display_order'),
        supabase.from('customers').select('*').eq('org_id', orgId),
        supabase.from('bookings').select('*').eq('org_id', orgId),
        supabase.from('payments').select('*').eq('org_id', orgId),
        supabase.from('leads').select('*').eq('org_id', orgId),
        supabase.from('expenses').select('*').eq('org_id', orgId).order('expense_date', { ascending: false }),
        supabase.from('profiles').select('*').eq('org_id', orgId).order('created_at'),
        supabase.from('staff_invites').select('*').eq('org_id', orgId).order('created_at', { ascending: false }),
        supabase.from('notifications').select('*').eq('org_id', orgId).order('created_at', { ascending: false }),
      ]);

      if (orgRes.error) throw orgRes.error;
      if (hallsRes.error) throw hallsRes.error;
      if (customersRes.error) throw customersRes.error;
      if (bookingsRes.error) throw bookingsRes.error;
      if (paymentsRes.error) throw paymentsRes.error;
      if (leadsRes.error) throw leadsRes.error;

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
        staffProfiles: staffRes.data || [],
        pendingInvites: invitesRes.data || [],
        notifications: notificationsRes.data || [],
        isOnline: true,
      });

      // Run background checks for followups/payment alerts
      setTimeout(() => {
        get().runBackgroundChecks();
      }, 1000);

      toast.success('Connection successful');
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
    set({
      bookings: [],
      customers: [],
      payments: [],
      leads: [],
      halls: [],
      expenses: [],
      staffProfiles: [],
      pendingInvites: [],
      notifications: [],
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
        created_at: '',
      },
      isOnline: false,
    });
  },

  // ─── Booking CRUD ────────────────────────────────────────
  createBooking: async (data) => {
    const state = get();
    
    // Client availability pre-check
    const isAvailable = state.checkAvailability(data.hall_id, data.event_date, data.start_time, data.end_time);
    if (!isAvailable) {
      return { success: false, error: 'This hall is already booked for the selected date and time.' };
    }

    if (state.isOnline) {
      try {
        const { data: rpcResult, error: rpcError } = await supabase.rpc('create_booking_safe', {
          p_org_id: state.organization.id,
          p_hall_id: data.hall_id,
          p_customer_id: data.customer_id,
          p_event_type: data.event_type,
          p_event_date: data.event_date,
          p_start_time: data.start_time,
          p_end_time: data.end_time,
          p_guest_count: data.guest_count || null,
          p_total_amount_paise: data.total_amount_paise || 0,
          p_advance_amount_paise: data.advance_amount_paise || 0,
          p_notes: data.notes || null,
          p_status: data.status || 'confirmed',
        });

        if (rpcError) throw rpcError;
        
        const result = rpcResult as any;
        if (!result.success) {
          return { success: false, error: result.message || 'Double booking conflict detected on server.' };
        }

        // Fetch the newly created booking to match schema structure
        const { data: newBooking, error: fetchError } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', result.booking_id)
          .single();

        if (fetchError || !newBooking) throw fetchError || new Error('Failed to retrieve created booking');

        // Format time string
        newBooking.start_time = newBooking.start_time.slice(0, 5);
        newBooking.end_time = newBooking.end_time.slice(0, 5);

        // Auto-insert local advance payment if created by the trigger/procedure
        let newPayments = [...state.payments];
        if (data.advance_amount_paise && data.advance_amount_paise > 0) {
          const { data: insertedPayments, error: payError } = await supabase
            .from('payments')
            .select('*')
            .eq('booking_id', newBooking.id);
          
          if (!payError && insertedPayments) {
            newPayments = [...insertedPayments, ...state.payments];
          }
        }

        set((s) => ({
          bookings: [newBooking, ...s.bookings],
          payments: newPayments,
        }));

        // Trigger notification
        const cust = state.getCustomerById(newBooking.customer_id);
        const hall = state.getHallById(newBooking.hall_id);
        await state.createNotification({
          title: 'Booking Confirmed 📅',
          message: `Booking ${newBooking.booking_number} for ${cust?.name || 'customer'} in ${hall?.name || 'hall'} on ${formatDateReadable(newBooking.event_date)} is confirmed.`,
          type: 'booking_created',
          link_to: '/bookings'
        });

        return { success: true, booking: newBooking };
      } catch (err: any) {
        console.error('Supabase createBooking failed:', err);
        return { success: false, error: parseDatabaseError(err) };
      }
    }

    // Offline / Fallback implementation
    const newBooking: Booking = {
      id: uuid(),
      org_id: state.organization.id,
      hall_id: data.hall_id,
      customer_id: data.customer_id,
      booking_number: generateBookingNumber(),
      event_type: data.event_type,
      event_date: data.event_date,
      start_time: data.start_time,
      end_time: data.end_time,
      guest_count: data.guest_count || null,
      status: data.status || 'confirmed',
      total_amount_paise: data.total_amount_paise || 0,
      advance_amount_paise: data.advance_amount_paise || 0,
      notes: data.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    set((s) => ({ bookings: [newBooking, ...s.bookings] }));

    // Trigger notification
    const cust = state.getCustomerById(newBooking.customer_id);
    const hall = state.getHallById(newBooking.hall_id);
    state.createNotification({
      title: 'Booking Confirmed 📅',
      message: `Booking ${newBooking.booking_number} for ${cust?.name || 'customer'} in ${hall?.name || 'hall'} on ${formatDateReadable(newBooking.event_date)} is confirmed.`,
      type: 'booking_created',
      link_to: '/bookings'
    });

    if (data.advance_amount_paise && data.advance_amount_paise > 0) {
      const advancePayment: Payment = {
        id: uuid(),
        org_id: state.organization.id,
        booking_id: newBooking.id,
        amount_paise: data.advance_amount_paise,
        payment_type: 'advance',
        payment_mode: 'cash',
        status: 'received',
        transaction_ref: null,
        due_date: null,
        paid_at: new Date().toISOString(),
        notes: 'Advance at booking',
        created_at: new Date().toISOString(),
      };
      set((s) => ({ payments: [advancePayment, ...s.payments] }));
    }

    return { success: true, booking: newBooking };
  },

  updateBooking: async (id, data) => {
    const state = get();
    if (state.isOnline) {
      try {
        const { error } = await supabase
          .from('bookings')
          .update(data)
          .eq('id', id);
        
        if (error) throw error;
      } catch (err) {
        console.error('Database updateBooking failed:', err);
        toast.error(parseDatabaseError(err));
        return;
      }
    }

    set((s) => ({
      bookings: s.bookings.map((b) =>
        b.id === id ? { ...b, ...data, updated_at: new Date().toISOString() } : b
      ),
    }));
  },

  cancelBooking: async (id) => {
    const state = get();
    const booking = state.bookings.find((b) => b.id === id);
    if (state.isOnline) {
      try {
        const { error } = await supabase
          .from('bookings')
          .update({ status: 'cancelled' })
          .eq('id', id);
        
        if (error) throw error;
      } catch (err) {
        console.error('Database cancelBooking failed:', err);
        toast.error(parseDatabaseError(err));
        return;
      }
    }

    set((s) => ({
      bookings: s.bookings.map((b) =>
        b.id === id ? { ...b, status: 'cancelled' as BookingStatus, updated_at: new Date().toISOString() } : b
      ),
    }));

    if (booking) {
      await state.createNotification({
        title: 'Booking Cancelled 🚫',
        message: `Booking ${booking.booking_number} for ${state.getCustomerById(booking.customer_id)?.name || 'customer'} has been cancelled.`,
        type: 'booking_cancelled',
        link_to: '/bookings'
      });
    }
  },

  // ─── Customer CRUD ───────────────────────────────────────
  createCustomer: async (data) => {
    const state = get();
    
    if (state.isOnline) {
      try {
        const newCustomerData = {
          org_id: state.organization.id,
          name: data.name,
          phone: data.phone,
          email: data.email || null,
          whatsapp: data.phone,
          gstin: data.gstin || null,
          address: data.address || null,
          notes: data.notes || null,
          source: data.source || 'walk_in',
          tags: [],
        };

        const { data: dbCustomer, error } = await supabase
          .from('customers')
          .insert(newCustomerData)
          .select()
          .single();

        if (error) throw error;
        if (!dbCustomer) throw new Error('No customer object returned');

        set((s) => ({ customers: [dbCustomer, ...s.customers] }));
        return dbCustomer;
      } catch (err: any) {
        console.error('Database createCustomer failed:', err);
        toast.error(parseDatabaseError(err));
      }
    }

    // Offline mode
    const newCustomer: Customer = {
      id: uuid(),
      org_id: state.organization.id,
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      whatsapp: data.phone,
      gstin: data.gstin || null,
      address: data.address || null,
      notes: data.notes || null,
      source: data.source || 'walk_in',
      tags: [],
      total_bookings: 0,
      total_spent_paise: 0,
      created_at: new Date().toISOString(),
    };
    set((s) => ({ customers: [newCustomer, ...s.customers] }));
    return newCustomer;
  },

  updateCustomer: async (id, data) => {
    const state = get();
    if (state.isOnline) {
      try {
        const { error } = await supabase
          .from('customers')
          .update(data)
          .eq('id', id);
        
        if (error) throw error;
      } catch (err) {
        console.error('Database updateCustomer failed:', err);
        toast.error(parseDatabaseError(err));
        return;
      }
    }

    set((s) => ({
      customers: s.customers.map((c) => (c.id === id ? { ...c, ...data } : c)),
    }));
  },

  // ─── Payment CRUD ────────────────────────────────────────
  recordPayment: async (data) => {
    const state = get();
    
    if (state.isOnline) {
      try {
        const paymentData = {
          org_id: state.organization.id,
          booking_id: data.booking_id,
          amount_paise: data.amount_paise,
          payment_type: data.payment_type || 'installment',
          payment_mode: data.payment_mode,
          status: 'received',
          transaction_ref: data.transaction_ref || null,
          notes: data.notes || null,
        };

        const { data: dbPayment, error } = await supabase
          .from('payments')
          .insert(paymentData)
          .select()
          .single();

        if (error) throw error;
        if (!dbPayment) throw new Error('No payment object returned');

        set((s) => ({ payments: [dbPayment, ...s.payments] }));

        // Trigger notification
        const booking = state.bookings.find((b) => b.id === dbPayment.booking_id);
        const custName = booking ? state.getCustomerById(booking.customer_id)?.name : 'Customer';
        await state.createNotification({
          title: 'Payment Received 💰',
          message: `Collected ${formatCurrency(dbPayment.amount_paise)} for ${custName}'s booking ${booking?.booking_number || ''}.`,
          type: 'payment_received',
          link_to: '/payments'
        });

        return dbPayment;
      } catch (err) {
        console.error('Database recordPayment failed:', err);
        toast.error(parseDatabaseError(err));
      }
    }

    // Offline mode
    const newPayment: Payment = {
      id: uuid(),
      org_id: state.organization.id,
      booking_id: data.booking_id,
      amount_paise: data.amount_paise,
      payment_type: data.payment_type || 'installment',
      payment_mode: data.payment_mode,
      status: 'received',
      transaction_ref: data.transaction_ref || null,
      due_date: null,
      paid_at: new Date().toISOString(),
      notes: data.notes || null,
      created_at: new Date().toISOString(),
    };
    set((s) => ({ payments: [newPayment, ...s.payments] }));

    // Trigger notification
    const booking = state.bookings.find((b) => b.id === newPayment.booking_id);
    const custName = booking ? state.getCustomerById(booking.customer_id)?.name : 'Customer';
    state.createNotification({
      title: 'Payment Received 💰',
      message: `Collected ${formatCurrency(newPayment.amount_paise)} for ${custName}'s booking ${booking?.booking_number || ''}.`,
      type: 'payment_received',
      link_to: '/payments'
    });

    return newPayment;
  },

  // ─── Lead CRUD ───────────────────────────────────────────
  createLead: async (data) => {
    const state = get();
    
    if (state.isOnline) {
      try {
        const leadData = {
          org_id: state.organization.id,
          name: data.name,
          phone: data.phone,
          email: data.email || null,
          event_type: data.event_type || null,
          tentative_date: data.tentative_date || null,
          budget_min_paise: data.budget_min_paise || null,
          budget_max_paise: data.budget_max_paise || null,
          source: data.source || 'walk_in',
          status: 'new',
          follow_up_date: data.follow_up_date || null,
          notes: data.notes || null,
          hall_preference: data.hall_preference || null,
          guest_count: data.guest_count || null,
        };

        const { data: dbLead, error } = await supabase
          .from('leads')
          .insert(leadData)
          .select()
          .single();

        if (error) throw error;
        if (!dbLead) throw new Error('No lead object returned');

        set((s) => ({ leads: [dbLead, ...s.leads] }));

        // Trigger notification
        await state.createNotification({
          title: 'New Inquiry Captured 🎯',
          message: `Lead from ${dbLead.name} (${dbLead.phone}) registered via ${dbLead.source}.`,
          type: 'lead_followup',
          link_to: '/leads'
        });

        return dbLead;
      } catch (err) {
        console.error('Database createLead failed:', err);
        toast.error(parseDatabaseError(err));
      }
    }

    // Offline mode
    const newLead: Lead = {
      id: uuid(),
      org_id: state.organization.id,
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      event_type: data.event_type || null,
      tentative_date: data.tentative_date || null,
      budget_min_paise: data.budget_min_paise || null,
      budget_max_paise: data.budget_max_paise || null,
      source: data.source || 'walk_in',
      status: 'new',
      follow_up_date: data.follow_up_date || null,
      assigned_to: null,
      notes: data.notes || null,
      hall_preference: data.hall_preference || null,
      guest_count: data.guest_count || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    set((s) => ({ leads: [newLead, ...s.leads] }));

    // Trigger notification
    state.createNotification({
      title: 'New Inquiry Captured 🎯',
      message: `Lead from ${newLead.name} (${newLead.phone}) registered via ${newLead.source}.`,
      type: 'lead_followup',
      link_to: '/leads'
    });

    return newLead;
  },

  updateLead: async (id, data) => {
    const state = get();
    if (state.isOnline) {
      try {
        const { error } = await supabase
          .from('leads')
          .update(data)
          .eq('id', id);
        
        if (error) throw error;
      } catch (err) {
        console.error('Database updateLead failed:', err);
        toast.error(parseDatabaseError(err));
        return;
      }
    }

    set((s) => ({
      leads: s.leads.map((l) =>
        l.id === id ? { ...l, ...data, updated_at: new Date().toISOString() } : l
      ),
    }));
  },

  updateLeadStatus: async (id, status) => {
    const state = get();
    if (state.isOnline) {
      try {
        const { error } = await supabase
          .from('leads')
          .update({ status })
          .eq('id', id);
        
        if (error) throw error;
      } catch (err) {
        console.error('Database updateLeadStatus failed:', err);
        toast.error(parseDatabaseError(err));
        return;
      }
    }

    set((s) => ({
      leads: s.leads.map((l) =>
        l.id === id ? { ...l, status, updated_at: new Date().toISOString() } : l
      ),
    }));
  },

  convertLeadToBooking: async (leadId, bookingData) => {
    const state = get();
    const lead = state.leads.find((l) => l.id === leadId);
    if (!lead) return { success: false, error: 'Lead not found' };

    // Find or create customer
    let customer = state.customers.find((c) => c.phone === lead.phone);
    if (!customer) {
      customer = await state.createCustomer({
        name: lead.name,
        phone: lead.phone,
        email: lead.email || undefined,
        source: lead.source,
      });
    }

    // Create the booking
    const result = await state.createBooking({
      customer_id: customer.id,
      hall_id: bookingData.hall_id,
      event_type: (lead.event_type as EventType) || 'other',
      event_date: bookingData.event_date,
      start_time: bookingData.start_time,
      end_time: bookingData.end_time,
      guest_count: lead.guest_count || undefined,
      total_amount_paise: bookingData.total_amount_paise,
      advance_amount_paise: bookingData.advance_amount_paise,
    });

    if (result.success) {
      // Mark lead as won
      await state.updateLeadStatus(leadId, 'won');
    }

    return result;
  },

  // ─── Hall CRUD ───────────────────────────────────────────
  createHall: async (data) => {
    const state = get();
    
    if (state.isOnline) {
      try {
        const pricing = {
          base_price_paise: data.base_price_paise || 0,
          per_plate_veg_paise: data.pricing_config?.catering_veg ? data.pricing_config.catering_veg * 100 : null,
          per_plate_nonveg_paise: data.pricing_config?.catering_nonveg ? data.pricing_config.catering_nonveg * 100 : null,
          decoration_paise: null,
          overtime_per_hour_paise: data.pricing_config?.overtime_rate ? data.pricing_config.overtime_rate * 100 : null,
        };

        const hallData = {
          org_id: state.organization.id,
          name: data.name,
          type: data.type,
          capacity_min: data.capacity_min,
          capacity_max: data.capacity_max,
          area_sqft: data.area_sqft || null,
          pricing,
          amenities: [],
          is_active: data.is_active !== false,
          display_order: state.halls.length + 1,
          floor_number: data.floor_number || 0,
          description: data.description || null,
          capacity_comfortable: data.capacity_comfortable || 0,
          hall_length: data.hall_length || null,
          hall_width: data.hall_width || null,
          hall_height: data.hall_height || null,
          ceiling_height: data.ceiling_height || null,
          floors_within_hall: data.floors_within_hall || 1,
          amenities_config: data.amenities_config || {},
          facilities_config: data.facilities_config || {},
          pricing_config: data.pricing_config || {},
          media_config: data.media_config || {},
          images: data.images || [],
        };

        const { data: dbHall, error } = await supabase
          .from('halls')
          .insert(hallData)
          .select()
          .single();

        if (error) throw error;
        if (!dbHall) throw new Error('No hall object returned');

        set((s) => ({ halls: [...s.halls, dbHall] }));
        return dbHall;
      } catch (err: any) {
        console.error('Database createHall failed:', err);
        toast.error(parseDatabaseError(err));
      }
    }

    // Offline mode
    const newHall: Hall = {
      id: uuid(),
      org_id: state.organization.id,
      name: data.name,
      type: data.type as Hall['type'],
      capacity_min: data.capacity_min,
      capacity_max: data.capacity_max,
      area_sqft: data.area_sqft || null,
      pricing: {
        base_price_paise: data.base_price_paise || 0,
        per_plate_veg_paise: data.pricing_config?.catering_veg ? data.pricing_config.catering_veg * 100 : null,
        per_plate_nonveg_paise: data.pricing_config?.catering_nonveg ? data.pricing_config.catering_nonveg * 100 : null,
        decoration_paise: null,
        overtime_per_hour_paise: data.pricing_config?.overtime_rate ? data.pricing_config.overtime_rate * 100 : null,
      },
      amenities: [],
      is_active: data.is_active !== false,
      display_order: state.halls.length + 1,
      created_at: new Date().toISOString(),
      floor_number: data.floor_number || 0,
      description: data.description || null,
      capacity_comfortable: data.capacity_comfortable || 0,
      hall_length: data.hall_length || null,
      hall_width: data.hall_width || null,
      hall_height: data.hall_height || null,
      ceiling_height: data.ceiling_height || null,
      floors_within_hall: data.floors_within_hall || 1,
      amenities_config: data.amenities_config || {},
      facilities_config: data.facilities_config || {},
      pricing_config: data.pricing_config || {},
      media_config: data.media_config || {},
      images: data.images || [],
    };
    set((s) => ({ halls: [...s.halls, newHall] }));
    return newHall;
  },

  updateHall: async (id, data) => {
    const state = get();
    if (state.isOnline) {
      try {
        const { error } = await supabase
          .from('halls')
          .update(data)
          .eq('id', id);
        
        if (error) throw error;
      } catch (err: any) {
        console.error('Database updateHall failed:', err);
        toast.error(parseDatabaseError(err));
        return;
      }
    }

    set((s) => ({
      halls: s.halls.map((h) => (h.id === id ? { ...h, ...data } : h)),
    }));
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

  // ─── Queries ─────────────────────────────────────────────
  getCustomerById: (id) => get().customers.find((c) => c.id === id),
  getHallById: (id) => get().halls.find((h) => h.id === id),
  getBookingById: (id) => get().bookings.find((b) => b.id === id),
  getLeadById: (id) => get().leads.find((l) => l.id === id),
  getPaymentsForBooking: (bookingId) => get().payments.filter((p) => p.booking_id === bookingId),
  getBookingsForDate: (date) => get().bookings.filter((b) => b.event_date === date && b.status !== 'cancelled'),

  getUpcomingBookings: (days = 7) => {
    const today = new Date();
    const todayISO = format(today, 'yyyy-MM-dd');
    const endDate = format(addDays(today, days), 'yyyy-MM-dd');
    return get()
      .bookings.filter(
        (b) => b.event_date >= todayISO && b.event_date <= endDate && b.status === 'confirmed'
      )
      .sort((a, b) => a.event_date.localeCompare(b.event_date));
  },

  getFollowUpsDue: () => {
    const todayISO = format(new Date(), 'yyyy-MM-dd');
    return get()
      .leads.filter(
        (l) => l.follow_up_date && l.follow_up_date <= todayISO && l.status !== 'won' && l.status !== 'lost'
      )
      .sort((a, b) => (a.follow_up_date || '').localeCompare(b.follow_up_date || ''));
  },

  getDashboardStats: () => {
    const state = get();
    const today = new Date();
    const todayISO = format(today, 'yyyy-MM-dd');
    const tomorrowISO = format(addDays(today, 1), 'yyyy-MM-dd');
    const thisMonth = startOfMonth(today);
    const monthStart = format(thisMonth, 'yyyy-MM-dd');
    const monthEnd = format(addDays(addMonths(thisMonth, 1), -1), 'yyyy-MM-dd');

    const todaysEvents = state.bookings.filter(
      (b) => b.event_date === todayISO && (b.status === 'confirmed' || b.status === 'completed')
    ).length;

    const tomorrowEvents = state.bookings.filter(
      (b) => b.event_date === tomorrowISO && (b.status === 'confirmed' || b.status === 'hold')
    ).length;

    const thisMonthRevenue = state.payments
      .filter((p) => {
        if (!p.paid_at || p.status !== 'received') return false;
        return new Date(p.paid_at) >= thisMonth;
      })
      .reduce((sum, p) => sum + p.amount_paise, 0);

    const thisMonthBookings = state.bookings.filter(
      (b) => b.event_date >= monthStart && b.event_date <= monthEnd && b.status !== 'cancelled'
    ).length;

    const activeBookings = state.bookings.filter(
      (b) => b.status === 'confirmed' || b.status === 'hold'
    );
    const totalOwed = activeBookings.reduce((sum, b) => sum + b.total_amount_paise, 0);
    const totalPaid = state.payments
      .filter((p) => p.status === 'received' && activeBookings.some((b) => b.id === p.booking_id))
      .reduce((sum, p) => sum + p.amount_paise, 0);
    const pendingAmount = totalOwed - totalPaid;

    const pendingCustomers = new Set(
      activeBookings
        .filter((b) => {
          const paid = state.payments
            .filter((p) => p.booking_id === b.id && p.status === 'received')
            .reduce((s, p) => s + p.amount_paise, 0);
          return paid < b.total_amount_paise;
        })
        .map((b) => b.customer_id)
    ).size;

    return {
      todaysEvents,
      tomorrowEvents,
      thisMonthRevenue,
      thisMonthBookings,
      pendingAmount,
      pendingCustomers,
    };
  },

  searchCustomers: (query) => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return get().customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(query)
    );
  },

  // ─── Conflict Check ──────────────────────────────────────
  checkAvailability: (hallId, eventDate, startTime, endTime, excludeBookingId) => {
    const conflicts = get().bookings.filter(
      (b) =>
        b.hall_id === hallId &&
        b.event_date === eventDate &&
        b.status !== 'cancelled' &&
        b.id !== excludeBookingId &&
        // Time overlap check
        startTime < b.end_time &&
        endTime > b.start_time
    );
    return conflicts.length === 0;
  },

  // ─── Booking delete ──────────────────────────────────────
  deleteBooking: async (id) => {
    const state = get();
    if (state.isOnline) {
      try {
        await supabase.from('payments').delete().eq('booking_id', id);
        const { error } = await supabase.from('bookings').delete().eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.error('Database deleteBooking failed:', err);
        toast.error(parseDatabaseError(err));
        return;
      }
    }
    set((s) => ({
      bookings: s.bookings.filter((b) => b.id !== id),
      payments: s.payments.filter((p) => p.booking_id !== id),
    }));
    toast.success('Booking deleted.');
  },

  // ─── Customer delete ─────────────────────────────────────
  deleteCustomer: async (id) => {
    const state = get();
    const hasBookings = state.bookings.some((b) => b.customer_id === id && b.status !== 'cancelled');
    if (hasBookings) {
      toast.error('Cannot delete customer with active bookings.');
      return;
    }
    if (state.isOnline) {
      try {
        const { error } = await supabase.from('customers').delete().eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.error('Database deleteCustomer failed:', err);
        toast.error(parseDatabaseError(err));
        return;
      }
    }
    set((s) => ({
      customers: s.customers.filter((c) => c.id !== id),
    }));
    toast.success('Customer deleted.');
  },

  // ─── Payment delete & update ─────────────────────────────
  deletePayment: async (id) => {
    const state = get();
    if (state.isOnline) {
      try {
        const { error } = await supabase.from('payments').delete().eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.error('Database deletePayment failed:', err);
        toast.error(parseDatabaseError(err));
        return;
      }
    }
    set((s) => ({
      payments: s.payments.filter((p) => p.id !== id),
    }));
    toast.success('Payment deleted.');
  },

  updatePayment: async (id, data) => {
    const state = get();
    if (state.isOnline) {
      try {
        const { error } = await supabase.from('payments').update(data).eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.error('Database updatePayment failed:', err);
        toast.error(parseDatabaseError(err));
        return;
      }
    }
    set((s) => ({
      payments: s.payments.map((p) => p.id === id ? { ...p, ...data } : p),
    }));
    toast.success('Payment updated.');
  },

  // ─── Lead delete ─────────────────────────────────────────
  deleteLead: async (id) => {
    const state = get();
    if (state.isOnline) {
      try {
        const { error } = await supabase.from('leads').delete().eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.error('Database deleteLead failed:', err);
        toast.error(parseDatabaseError(err));
        return;
      }
    }
    set((s) => ({
      leads: s.leads.filter((l) => l.id !== id),
    }));
    toast.success('Lead deleted.');
  },

  // ─── Expense CRUD ────────────────────────────────────────
  fetchExpenses: async () => {
    const state = get();
    if (state.isOnline) {
      try {
        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .eq('org_id', state.organization.id)
          .order('expense_date', { ascending: false });
        if (error) throw error;
        set({ expenses: data || [] });
      } catch (err) {
        console.error('Database fetchExpenses failed:', err);
      }
    }
  },

  createExpense: async (data) => {
    const state = get();
    const newExpenseData = {
      ...data,
      org_id: state.organization.id,
    };
    if (state.isOnline) {
      try {
        const { data: dbExpense, error } = await supabase
          .from('expenses')
          .insert(newExpenseData)
          .select()
          .single();
        if (error) throw error;
        set((s) => ({ expenses: [dbExpense, ...s.expenses] }));
        return dbExpense;
      } catch (err) {
        console.error('Database createExpense failed:', err);
        toast.error(parseDatabaseError(err));
        throw err;
      }
    }
    const localExpense: Expense = {
      id: uuid(),
      org_id: state.organization.id,
      title: data.title,
      category: data.category,
      amount_paise: data.amount_paise,
      expense_date: data.expense_date,
      payment_mode: data.payment_mode,
      reference_number: data.reference_number || null,
      notes: data.notes || null,
      receipt_url: data.receipt_url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    set((s) => ({ expenses: [localExpense, ...s.expenses] }));
    return localExpense;
  },

  updateExpense: async (id, data) => {
    const state = get();
    if (state.isOnline) {
      try {
        const { error } = await supabase.from('expenses').update(data).eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.error('Database updateExpense failed:', err);
        toast.error(parseDatabaseError(err));
        return;
      }
    }
    set((s) => ({
      expenses: s.expenses.map((e) => e.id === id ? { ...e, ...data, updated_at: new Date().toISOString() } : e),
    }));
    toast.success('Expense updated.');
  },

  deleteExpense: async (id) => {
    const state = get();
    if (state.isOnline) {
      try {
        const { error } = await supabase.from('expenses').delete().eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.error('Database deleteExpense failed:', err);
        toast.error(parseDatabaseError(err));
        return;
      }
    }
    set((s) => ({
      expenses: s.expenses.filter((e) => e.id !== id),
    }));
    toast.success('Expense deleted.');
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
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuid()}.${fileExt}`;
        const filePath = `${state.organization.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file);
        
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
    
    const categories: Record<string, string> = {
      'venuepro-media': 'wedding,banquet,hall',
      'receipts': 'receipt,invoice,bill'
    };
    const query = categories[bucket] || 'venue';
    const rand = Math.floor(Math.random() * 1000);
    return `https://images.unsplash.com/photo-${1500000000000 + rand}?q=80&w=1000&auto=format&fit=crop&sig=${rand}`;
  },

  // ─── Notifications CRUD ──────────────────────────────────
  fetchNotifications: async () => {
    const state = get();
    if (state.isOnline) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('org_id', state.organization.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        set({ notifications: data || [] });
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    } else {
      if (get().notifications.length === 0) {
        set({ notifications: [...mockNotifications] });
      }
    }
  },

  createNotification: async (data) => {
    const state = get();
    const newNotif: Notification = {
      id: uuid(),
      org_id: state.organization.id,
      title: data.title,
      message: data.message,
      type: data.type,
      is_read: false,
      link_to: data.link_to || null,
      created_at: new Date().toISOString()
    };

    if (state.isOnline) {
      try {
        const { data: dbNotif, error } = await supabase
          .from('notifications')
          .insert({
            org_id: state.organization.id,
            title: data.title,
            message: data.message,
            type: data.type,
            link_to: data.link_to || null,
            is_read: false
          })
          .select()
          .single();
        if (error) throw error;
        if (dbNotif) {
          set((s) => ({ notifications: [dbNotif, ...s.notifications] }));
          return dbNotif;
        }
      } catch (err) {
        console.error('Database createNotification failed:', err);
      }
    }

    set((s) => ({ notifications: [newNotif, ...s.notifications] }));
    return newNotif;
  },

  markNotificationRead: async (id) => {
    const state = get();
    if (state.isOnline) {
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.error('Database markNotificationRead failed:', err);
      }
    }
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      )
    }));
  },

  markAllNotificationsRead: async () => {
    const state = get();
    if (state.isOnline) {
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('org_id', state.organization.id)
          .eq('is_read', false);
        if (error) throw error;
      } catch (err) {
        console.error('Database markAllNotificationsRead failed:', err);
      }
    }
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, is_read: true }))
    }));
  },

  deleteNotification: async (id) => {
    const state = get();
    if (state.isOnline) {
      try {
        const { error } = await supabase
          .from('notifications')
          .delete()
          .eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.error('Database deleteNotification failed:', err);
      }
    }
    set((s) => ({
      notifications: s.notifications.filter((n) => n.id !== id)
    }));
  },

  // ─── Feedback Actions ────────────────────────────────────
  submitFeedback: async (data) => {
    const state = get();
    let userId = null;
    
    if (state.isOnline) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) userId = user.id;

        const { error } = await supabase
          .from('feedbacks')
          .insert({
            org_id: state.organization.id,
            user_id: userId,
            rating: data.rating,
            category: data.category,
            message: data.message
          });
        if (error) throw error;
        toast.success('Feedback submitted successfully! Thank you. ❤️');
      } catch (err: any) {
        console.error('Database submitFeedback failed:', err);
        toast.error(parseDatabaseError(err));
      }
    } else {
      console.log('Submitted Mock Feedback:', data);
      toast.success('Feedback recorded (Demo Mode)! Thank you. ❤️');
    }
  },

  // ─── Background Sync Checks ──────────────────────────────
  runBackgroundChecks: () => {
    const state = get();
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    
    // Check 1: Leads due for follow-up today
    const leadsDue = state.leads.filter(
      (l) => l.status !== 'won' && l.status !== 'lost' && l.follow_up_date === todayStr
    );
    leadsDue.forEach(async (lead) => {
      const exists = state.notifications.some(
        (n) => n.type === 'lead_followup' && n.link_to === '/leads' && n.message.includes(lead.name) && n.created_at.slice(0, 10) === todayStr
      );
      if (!exists) {
        await state.createNotification({
          title: 'Follow-up Due Today 🎯',
          message: `Inquiry from ${lead.name} (${lead.phone}) is scheduled for follow-up today.`,
          type: 'lead_followup',
          link_to: '/leads'
        });
      }
    });

    // Check 2: Bookings with pending balance payment due soon (within 3 days)
    const bookingsDue = state.bookings.filter(
      (b) => b.status === 'confirmed'
    );
    bookingsDue.forEach(async (b) => {
      const eventDate = new Date(b.event_date);
      const diffTime = eventDate.getTime() - new Date().getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 0 && diffDays <= 3) {
        const payments = state.getPaymentsForBooking(b.id);
        const totalPaid = payments.filter((p) => p.status === 'received').reduce((sum, p) => sum + p.amount_paise, 0);
        const balance = b.total_amount_paise - totalPaid;
        
        if (balance > 0) {
          const exists = state.notifications.some(
            (n) => n.type === 'payment_due' && n.message.includes(b.booking_number) && n.created_at.slice(0, 10) === todayStr
          );
          if (!exists) {
            await state.createNotification({
              title: 'Balance Payment Due ⏳',
              message: `Booking ${b.booking_number} is scheduled in ${diffDays} days and has a pending balance of ${formatCurrency(balance)}.`,
              type: 'payment_due',
              link_to: '/bookings'
            });
          }
        }
      }
    });
  }
}));
