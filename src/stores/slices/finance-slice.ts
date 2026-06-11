import type { StateCreator } from 'zustand';
import type { DataState } from '../data-store';
import type { Payment, PaymentMode, PaymentType } from '@/types/payment';
import type { Expense, ExpenseCategory, ExpensePaymentMode } from '@/types/expense';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { toast } from 'sonner';
import { formatCurrency, parseDatabaseError } from '@/lib/utils';
import { mockPayments as initialPayments } from '@/lib/mock-data';
import { format, subDays } from 'date-fns';
import { assertActiveSubscription } from '../data-store';

function uuid() {
  return self.crypto.randomUUID();
}

const mockExpenses: Expense[] = [
  { id: 'exp-001', org_id: 'org-demo-001', title: 'Catering for Sharma Wedding', category: 'catering', amount_paise: 12000000, expense_date: format(new Date(), 'yyyy-MM-dd'), payment_mode: 'bank_transfer', reference_number: 'TXN-98213', notes: 'Paid to vendor directly', receipt_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'exp-002', org_id: 'org-demo-001', title: 'Electrical repair work', category: 'maintenance', amount_paise: 850000, expense_date: format(subDays(new Date(), 2), 'yyyy-MM-dd'), payment_mode: 'cash', reference_number: null, notes: 'AC compressor gas top-up', receipt_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'exp-003', org_id: 'org-demo-001', title: 'Electricity Bill April', category: 'utilities', amount_paise: 4500000, expense_date: format(subDays(new Date(), 10), 'yyyy-MM-dd'), payment_mode: 'online', reference_number: 'MTR-9831', notes: 'Paid online via portal', receipt_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

export interface FinanceSlice {
  payments: Payment[];
  expenses: Expense[];
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
  getPaymentsForBooking: (bookingId: string) => Payment[];
}

export const createFinanceSlice: StateCreator<
  DataState,
  [],
  [],
  FinanceSlice
> = (set, get) => ({
  payments: isSupabaseConfigured() ? [] : [...initialPayments],
  expenses: isSupabaseConfigured() ? [] : [...mockExpenses],

  // ─── Payment CRUD ────────────────────────────────────────
  recordPayment: async (data) => {
    const state = get();
    if (!assertActiveSubscription(state.organization)) {
      throw new Error('Subscription required');
    }
    
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
        throw err;
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

  deletePayment: async (id) => {
    const state = get();
    if (state.isOnline) {
      try {
        const { error } = await supabase.from('payments').update({ deleted_at: new Date().toISOString() }).eq('id', id);
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
        const { error } = await supabase.from('expenses').update({ deleted_at: new Date().toISOString() }).eq('id', id);
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

  // ─── Queries ─────────────────────────────────────────────
  getPaymentsForBooking: (bookingId) => get().payments.filter((p) => p.booking_id === bookingId),
});
