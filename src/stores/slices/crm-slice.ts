import type { StateCreator } from 'zustand';
import type { DataState } from '../data-store';
import type { Customer, CustomerSource } from '@/types/customer';
import type { Lead, LeadStatus, LeadSource } from '@/types/lead';
import type { EventType } from '@/types/booking';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { toast } from 'sonner';
import { parseDatabaseError } from '@/lib/utils';
import { mockCustomers as initialCustomers, mockLeads as initialLeads } from '@/lib/mock-data';
import { format, subDays } from 'date-fns';
import { assertActiveSubscription } from '../data-store';

function uuid() {
  return self.crypto.randomUUID();
}

export interface CrmSlice {
  customers: Customer[];
  leads: Lead[];
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
  searchCustomersServer: (query: string) => Promise<void>;
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
  }) => Promise<{ success: boolean; booking?: any; error?: string }>;
  getCustomerById: (id: string) => Customer | undefined;
  getLeadById: (id: string) => Lead | undefined;
  getFollowUpsDue: () => Lead[];
  searchCustomers: (query: string) => Customer[];
}

export const createCrmSlice: StateCreator<
  DataState,
  [],
  [],
  CrmSlice
> = (set, get) => ({
  customers: [...initialCustomers],
  leads: [...initialLeads],

  // ─── Customer CRUD ───────────────────────────────────────
  createCustomer: async (data) => {
    const state = get();
    if (!assertActiveSubscription(state.organization)) {
      throw new Error('Subscription required');
    }
    
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
        throw err;
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

  deleteCustomer: async (id) => {
    const state = get();
    const hasBookings = state.bookings.some((b) => b.customer_id === id && b.status !== 'cancelled');
    if (hasBookings) {
      toast.error('Cannot delete customer with active bookings.');
      return;
    }
    if (state.isOnline) {
      try {
        const { error } = await supabase.from('customers').update({ deleted_at: new Date().toISOString() }).eq('id', id);
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

  searchCustomersServer: async (query) => {
    if (!query.trim()) return;
    if (!isSupabaseConfigured()) return;
    try {
      const orgId = get().organization?.id;
      if (!orgId) return;

      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('org_id', orgId)
        .or(`name.ilike.%${query}%,phone.like.%${query}%`)
        .limit(50);

      if (error) throw error;

      if (data) {
        const current = get().customers;
        const merged = [...current];
        data.forEach((newCust: Customer) => {
          if (!merged.some((c) => c.id === newCust.id)) {
            merged.push(newCust);
          }
        });
        set({ customers: merged });
      }
    } catch (err) {
      console.error('Failed to search customers on server:', err);
    }
  },

  // ─── Lead CRUD ───────────────────────────────────────────
  createLead: async (data) => {
    const state = get();
    if (!assertActiveSubscription(state.organization)) {
      throw new Error('Subscription required');
    }
    
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
        throw err;
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

  deleteLead: async (id) => {
    const state = get();
    if (state.isOnline) {
      try {
        const { error } = await supabase.from('leads').update({ deleted_at: new Date().toISOString() }).eq('id', id);
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

  convertLeadToBooking: async (leadId, bookingData) => {
    const state = get();
    if (!assertActiveSubscription(state.organization)) {
      return { success: false, error: 'Subscription required' };
    }
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

  // ─── Queries ─────────────────────────────────────────────
  getCustomerById: (id) => get().customers.find((c) => c.id === id),
  getLeadById: (id) => get().leads.find((l) => l.id === id),

  getFollowUpsDue: () => {
    const todayISO = format(new Date(), 'yyyy-MM-dd');
    return get()
      .leads.filter(
        (l) => l.follow_up_date && l.follow_up_date <= todayISO && l.status !== 'won' && l.status !== 'lost'
      )
      .sort((a, b) => (a.follow_up_date || '').localeCompare(b.follow_up_date || ''));
  },

  searchCustomers: (query) => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return get().customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(query)
    );
  },
});
