import type { StateCreator } from 'zustand';
import type { DataState } from '../data-store';
import type { Booking, EventType, BookingStatus } from '@/types/booking';
import type { Hall } from '@/types/venue';
import type { Payment, PaymentMode } from '@/types/payment';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { toast } from 'sonner';
import { formatDateReadable, formatCurrency, parseDatabaseError } from '@/lib/utils';
import { mockBookings as initialBookings, mockHalls as initialHalls } from '@/lib/mock-data';
import { format, addDays, startOfMonth, addMonths } from 'date-fns';
import { assertActiveSubscription } from '../data-store';

function uuid() {
  return self.crypto.randomUUID();
}

function generateBookingNumber(): string {
  const year = new Date().getFullYear();
  const num = Math.floor(Math.random() * 99999) + 1;
  return `VP-${year}-${String(num).padStart(5, '0')}`;
}

export interface VenueBookingSlice {
  bookings: Booking[];
  halls: Hall[];
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
    advance_payment_mode?: PaymentMode;
    advance_transaction_ref?: string;
    notes?: string;
    status?: BookingStatus;
  }) => Promise<{ success: boolean; booking?: Booking; error?: string }>;
  updateBooking: (id: string, data: Partial<Booking>) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
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
  deleteHall: (id: string) => Promise<void>;
  getHallById: (id: string) => Hall | undefined;
  getBookingById: (id: string) => Booking | undefined;
  getBookingsForDate: (date: string) => Booking[];
  getUpcomingBookings: (days?: number) => Booking[];
  getDashboardStats: () => {
    todaysEvents: number;
    tomorrowEvents: number;
    thisMonthRevenue: number;
    thisMonthBookings: number;
    pendingAmount: number;
    pendingCustomers: number;
  };
  checkAvailability: (hallId: string, eventDate: string, startTime: string, endTime: string, excludeBookingId?: string) => boolean;
}

export const createVenueBookingSlice: StateCreator<
  DataState,
  [],
  [],
  VenueBookingSlice
> = (set, get) => ({
  bookings: isSupabaseConfigured() ? [] : [...initialBookings],
  halls: isSupabaseConfigured() ? [] : [...initialHalls],

  // ─── Booking CRUD ────────────────────────────────────────
  createBooking: async (data) => {
    const state = get();
    if (!assertActiveSubscription(state.organization)) {
      return { success: false, error: 'Subscription or active trial is required' };
    }
    
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

        // Insert advance payment record in Supabase
        let newPayments = [...state.payments];
        if (data.advance_amount_paise && data.advance_amount_paise > 0) {
          const paymentData = {
            org_id: state.organization.id,
            booking_id: newBooking.id,
            amount_paise: data.advance_amount_paise,
            payment_type: 'advance',
            payment_mode: data.advance_payment_mode || 'cash',
            status: 'received',
            transaction_ref: data.advance_transaction_ref || null,
            notes: 'Advance at booking',
          };

          const { data: dbPayment, error: payError } = await supabase
            .from('payments')
            .insert(paymentData)
            .select()
            .single();

          if (payError) {
            console.error('Failed to create advance payment record in Supabase:', payError);
          } else if (dbPayment) {
            newPayments = [dbPayment, ...state.payments];
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
        payment_mode: data.advance_payment_mode || 'cash',
        status: 'received',
        transaction_ref: data.advance_transaction_ref || null,
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
    if (!assertActiveSubscription(state.organization)) return;
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
    if (!assertActiveSubscription(state.organization)) return;
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

  deleteBooking: async (id) => {
    const state = get();
    if (state.isOnline) {
      try {
        const { error } = await supabase.from('bookings').update({ deleted_at: new Date().toISOString() }).eq('id', id);
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
        throw err;
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

  deleteHall: async (id) => {
    const state = get();
    const hasBookings = state.bookings.some((b) => b.hall_id === id && b.status !== 'cancelled');
    if (hasBookings) {
      toast.error('Cannot delete space. There are active bookings associated with it. Please make it Inactive instead.');
      return;
    }

    if (state.isOnline) {
      try {
        const { error } = await supabase
          .from('halls')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
      } catch (err: any) {
        console.error('Database deleteHall failed:', err);
        toast.error(parseDatabaseError(err));
        return;
      }
    }

    set((s) => ({
      halls: s.halls.filter((h) => h.id !== id),
    }));
    toast.success('Venue space deleted.');
  },

  // ─── Queries ─────────────────────────────────────────────
  getHallById: (id) => get().halls.find((h) => h.id === id),
  getBookingById: (id) => get().bookings.find((b) => b.id === id),
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

  // ─── Conflict Check ──────────────────────────────────────
  checkAvailability: (hallId, eventDate, startTime, endTime, excludeBookingId) => {
    console.log('DEBUG: checkAvailability called with:', { hallId, eventDate, startTime, endTime, excludeBookingId });
    console.log('DEBUG: Store bookings list count:', get().bookings.length);
    
    const conflicts = get().bookings.filter((b) => {
      const hallMatch = b.hall_id === hallId;
      const dateMatch = b.event_date === eventDate;
      const notCancelled = b.status !== 'cancelled';
      const notExcluded = b.id !== excludeBookingId;
      const timeOverlap = startTime < b.end_time && endTime > b.start_time;
      
      const isConflict = hallMatch && dateMatch && notCancelled && notExcluded && timeOverlap;
      
      if (hallMatch && dateMatch) {
        console.log(`DEBUG: Booking ${b.booking_number} (${b.id}) match analysis:`, {
          hallMatch,
          dateMatch,
          notCancelled,
          notExcluded,
          timeOverlap,
          isConflict,
          b_times: `${b.start_time} - ${b.end_time}`,
          check_times: `${startTime} - ${endTime}`
        });
      }
      
      return isConflict;
    });
    
    console.log('DEBUG: Found conflicts count:', conflicts.length);
    return conflicts.length === 0;
  },
});
