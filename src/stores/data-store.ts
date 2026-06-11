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
import type { Notification, NotificationType } from '@/types';
import type { Menu, MenuItem } from '@/types/menu';

import { toast } from 'sonner';

// Import slice creators
import { createVenueBookingSlice } from './slices/venue-booking-slice';
import { createCrmSlice } from './slices/crm-slice';
import { createFinanceSlice } from './slices/finance-slice';
import { createNotificationSlice } from './slices/notification-slice';
import { createOrgSlice } from './slices/org-slice';
import { createInventorySlice, type InventorySlice } from './slices/inventory-slice';


export function isSubscriptionLocked(organization: any): boolean {
  if (!organization) return false;
  
  const status = organization.subscription_status;
  const endsAtStr = organization.trial_ends_at;
  
  // Active plan is never locked
  if (status === 'active') return false;
  
  const now = new Date();
  
  if (status === 'trial' && endsAtStr) {
    const trialEnds = new Date(endsAtStr);
    return now > trialEnds;
  }
  
  if ((status === 'expired' || status === 'canceled') && endsAtStr) {
    const ends = new Date(endsAtStr);
    return now > ends;
  }
  
  if (status === 'expired' || status === 'canceled') {
    return true;
  }
  
  return false;
}

export function assertActiveSubscription(organization: any): boolean {
  if (isSubscriptionLocked(organization)) {
    const label = organization?.subscription_status === 'trial' ? 'trial' : 'subscription';
    toast.error(`Action Blocked: Your ${label} has ended. Please upgrade to a paid plan to perform this action. 🔒`, {
      description: 'You are in read-only mode. Upgrade from settings or header CTA to resume full workspace operations.',
      duration: 5000,
    });
    return false;
  }
  return true;
}

export interface DataState {
  // ─── Collections ─────────────────────────────────────────
  bookings: Booking[];
  customers: Customer[];
  payments: Payment[];
  leads: Lead[];
  halls: Hall[];
  menus: Menu[];
  organization: Organization;
  expenses: Expense[];
  staffProfiles: Profile[];
  pendingInvites: StaffInvite[];
  isLoading: boolean;
  isOnline: boolean;
  realtimeChannel: any | null;

  // ─── Sync Action ─────────────────────────────────────────
  syncData: (silent?: boolean) => Promise<void>;

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
    advance_payment_mode?: PaymentMode;
    advance_transaction_ref?: string;
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
  searchCustomersServer: (query: string) => Promise<void>;

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
  deleteHall: (id: string) => Promise<void>;

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
  upgradeOrganization: (plan: 'starter' | 'pro' | 'enterprise') => Promise<void>;

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

  // ─── Menu CRUD ───────────────────────────────────────────
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

  // ─── Coupon extension ────────────────────────────────────
  applyPromoCode: (code: string) => Promise<void>;

  // ─── Background Checks ───────────────────────────────────
  runBackgroundChecks: () => Promise<void>;
}

export interface DataState extends OrgSliceState, InventorySlice {}
interface OrgSliceState {
  // ─── Collections ─────────────────────────────────────────
  bookings: Booking[];
  customers: Customer[];
  payments: Payment[];
  leads: Lead[];
  halls: Hall[];
  menus: Menu[];
  organization: Organization;
  expenses: Expense[];
  staffProfiles: Profile[];
  pendingInvites: StaffInvite[];
  isLoading: boolean;
  isOnline: boolean;
  realtimeChannel: any | null;

  // ─── Sync Action ─────────────────────────────────────────
  syncData: (silent?: boolean) => Promise<void>;

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
    advance_payment_mode?: PaymentMode;
    advance_transaction_ref?: string;
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
  searchCustomersServer: (query: string) => Promise<void>;

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
  deleteHall: (id: string) => Promise<void>;

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
  upgradeOrganization: (plan: 'starter' | 'pro' | 'enterprise') => Promise<void>;

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

  // ─── Menu CRUD ───────────────────────────────────────────
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

  // ─── Coupon extension ────────────────────────────────────
  applyPromoCode: (code: string) => Promise<void>;

  // ─── Background Checks ───────────────────────────────────
  runBackgroundChecks: () => Promise<void>;
}

export const useDataStore = create<DataState>()((...a) => ({
  ...createVenueBookingSlice(...a),
  ...createCrmSlice(...a),
  ...createFinanceSlice(...a),
  ...createNotificationSlice(...a),
  ...createOrgSlice(...a),
  ...createInventorySlice(...a),
}));
