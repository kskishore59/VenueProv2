import { create } from 'zustand';
import type { Booking, EventType, BookingStatus } from '@/types/booking';
import type { Customer, CustomerSource } from '@/types/customer';
import type { Payment, PaymentMode, PaymentType } from '@/types/payment';
import type { Lead, LeadStatus, LeadSource } from '@/types/lead';
import type { Hall } from '@/types/venue';
import type { Organization } from '@/types/organization';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  mockBookings as initialBookings,
  mockCustomers as initialCustomers,
  mockPayments as initialPayments,
  mockLeads as initialLeads,
  mockHalls as initialHalls,
  mockOrganization as initialOrg,
} from '@/lib/mock-data';
import { format, addDays, startOfMonth, addMonths } from 'date-fns';
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

interface DataState {
  // ─── Collections ─────────────────────────────────────────
  bookings: Booking[];
  customers: Customer[];
  payments: Payment[];
  leads: Lead[];
  halls: Hall[];
  organization: Organization;
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

  // ─── Customer CRUD ───────────────────────────────────────
  createCustomer: (data: {
    name: string;
    phone: string;
    email?: string;
    source?: CustomerSource;
    address?: string;
    notes?: string;
  }) => Promise<Customer>;
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<void>;

  // ─── Payment CRUD ────────────────────────────────────────
  recordPayment: (data: {
    booking_id: string;
    amount_paise: number;
    payment_mode: PaymentMode;
    payment_type?: PaymentType;
    transaction_ref?: string;
    notes?: string;
  }) => Promise<Payment>;

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
  }) => Promise<Hall>;
  updateHall: (id: string, data: Partial<Hall>) => Promise<void>;

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
}

export const useDataStore = create<DataState>()((set, get) => ({
  bookings: [...initialBookings],
  customers: [...initialCustomers],
  payments: [...initialPayments],
  leads: [...initialLeads],
  halls: [...initialHalls],
  organization: { ...initialOrg },
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
        isOnline: false,
      });
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
      const [orgRes, hallsRes, customersRes, bookingsRes, paymentsRes, leadsRes] = await Promise.all([
        supabase.from('organizations').select('*').eq('id', orgId).single(),
        supabase.from('halls').select('*').eq('org_id', orgId).order('display_order'),
        supabase.from('customers').select('*').eq('org_id', orgId),
        supabase.from('bookings').select('*').eq('org_id', orgId),
        supabase.from('payments').select('*').eq('org_id', orgId),
        supabase.from('leads').select('*').eq('org_id', orgId),
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
        isOnline: true,
      });

      toast.success('Successfully synchronized with Supabase backend! ⚡');
    } catch (err: any) {
      console.error('Sync failed, running in offline fallback mode:', err);
      toast.error(`Database connection failed: ${err.message || err}. Running in offline fallback.`);
      set({ isOnline: false });
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

        return { success: true, booking: newBooking };
      } catch (err: any) {
        console.error('Supabase createBooking failed:', err);
        return { success: false, error: `Database save failed: ${err.message || err}` };
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
        toast.error('Failed to save booking to backend database.');
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
    if (state.isOnline) {
      try {
        const { error } = await supabase
          .from('bookings')
          .update({ status: 'cancelled' })
          .eq('id', id);
        
        if (error) throw error;
      } catch (err) {
        console.error('Database cancelBooking failed:', err);
        toast.error('Failed to cancel booking in backend.');
        return;
      }
    }

    set((s) => ({
      bookings: s.bookings.map((b) =>
        b.id === id ? { ...b, status: 'cancelled' as BookingStatus, updated_at: new Date().toISOString() } : b
      ),
    }));
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
        toast.error('Failed to save customer to database.');
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
      gstin: null,
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
        toast.error('Failed to update customer details.');
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
        return dbPayment;
      } catch (err) {
        console.error('Database recordPayment failed:', err);
        toast.error('Failed to save payment record.');
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
        return dbLead;
      } catch (err) {
        console.error('Database createLead failed:', err);
        toast.error('Failed to record new lead.');
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
        toast.error('Failed to update lead settings.');
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
        toast.error('Failed to update lead status in database.');
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
          per_plate_veg_paise: null,
          per_plate_nonveg_paise: null,
          decoration_paise: null,
          overtime_per_hour_paise: null,
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
          is_active: true,
          display_order: state.halls.length + 1,
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
      } catch (err) {
        console.error('Database createHall failed:', err);
        toast.error('Failed to register hall details.');
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
        per_plate_veg_paise: null,
        per_plate_nonveg_paise: null,
        decoration_paise: null,
        overtime_per_hour_paise: null,
      },
      amenities: [],
      is_active: true,
      display_order: state.halls.length + 1,
      created_at: new Date().toISOString(),
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
      } catch (err) {
        console.error('Database updateHall failed:', err);
        toast.error('Failed to update hall configuration.');
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
      } catch (err) {
        console.error('Database updateOrganization failed:', err);
        toast.error('Failed to update organization details in DB.');
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
}));
