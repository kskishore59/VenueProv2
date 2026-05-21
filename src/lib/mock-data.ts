import type { Organization } from '@/types/organization';
import type { Hall } from '@/types/venue';
import type { Customer } from '@/types/customer';
import type { Booking } from '@/types/booking';
import type { Payment } from '@/types/payment';
import type { Lead } from '@/types/lead';
import type { Profile } from '@/types/auth';
import {
  addDays, subDays, format, startOfMonth, addMonths, subMonths,
} from 'date-fns';

const ORG_ID = 'org-demo-001';
const today = new Date();
const todayISO = format(today, 'yyyy-MM-dd');

// ─── Organization ───────────────────────────────────────────
export const mockOrganization: Organization = {
  id: ORG_ID,
  name: 'Shree Mangalam Banquets',
  slug: 'shree-mangalam',
  gstin: '36AABCS1234R1ZM',
  address: '12-2-831, Mehdipatnam, Hyderabad',
  city: 'Hyderabad',
  state: 'Telangana',
  phone: '9876543210',
  email: 'info@shreemangalam.com',
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
  plan: 'pro',
  created_at: '2024-01-15T00:00:00Z',
};

// ─── Profile ────────────────────────────────────────────────
export const mockProfile: Profile = {
  id: 'user-001',
  org_id: ORG_ID,
  email: 'admin@shreemangalam.com',
  full_name: 'Rajesh Agarwal',
  avatar_url: null,
  role: 'owner',
  phone: '9876543210',
  is_active: true,
  created_at: '2024-01-15T00:00:00Z',
};

// ─── Halls ──────────────────────────────────────────────────
export const mockHalls: Hall[] = [
  {
    id: 'hall-001',
    org_id: ORG_ID,
    name: 'Grand Ballroom',
    type: 'banquet_hall',
    capacity_min: 100,
    capacity_max: 500,
    area_sqft: 8000,
    pricing: { base_price_paise: 25000000, per_plate_veg_paise: 80000, per_plate_nonveg_paise: 100000, decoration_paise: 5000000, overtime_per_hour_paise: 2000000 },
    amenities: ['AC', 'Stage', 'Sound System', 'Lighting', 'Parking'],
    is_active: true,
    display_order: 1,
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'hall-002',
    org_id: ORG_ID,
    name: 'Silver Hall',
    type: 'banquet_hall',
    capacity_min: 50,
    capacity_max: 200,
    area_sqft: 3500,
    pricing: { base_price_paise: 12000000, per_plate_veg_paise: 70000, per_plate_nonveg_paise: 90000, decoration_paise: 3000000, overtime_per_hour_paise: 1500000 },
    amenities: ['AC', 'Sound System', 'Parking'],
    is_active: true,
    display_order: 2,
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'hall-003',
    org_id: ORG_ID,
    name: 'Garden Lawn',
    type: 'lawn',
    capacity_min: 100,
    capacity_max: 800,
    area_sqft: 15000,
    pricing: { base_price_paise: 18000000, per_plate_veg_paise: 75000, per_plate_nonveg_paise: 95000, decoration_paise: 8000000, overtime_per_hour_paise: 2500000 },
    amenities: ['Open Air', 'Stage', 'Parking', 'Generator'],
    is_active: true,
    display_order: 3,
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'hall-004',
    org_id: ORG_ID,
    name: 'Board Room',
    type: 'boardroom',
    capacity_min: 10,
    capacity_max: 40,
    area_sqft: 600,
    pricing: { base_price_paise: 3000000, per_plate_veg_paise: null, per_plate_nonveg_paise: null, decoration_paise: null, overtime_per_hour_paise: 500000 },
    amenities: ['AC', 'Projector', 'Whiteboard', 'WiFi'],
    is_active: true,
    display_order: 4,
    created_at: '2024-01-15T00:00:00Z',
  },
];

// ─── Customers ──────────────────────────────────────────────
export const mockCustomers: Customer[] = [
  { id: 'cust-001', org_id: ORG_ID, name: 'Rahul Sharma', phone: '9876543211', email: 'rahul.sharma@gmail.com', whatsapp: '9876543211', gstin: null, address: 'Banjara Hills, Hyderabad', notes: 'Regular customer, prefers Grand Ballroom', source: 'referral', tags: ['vip', 'wedding'], total_bookings: 3, total_spent_paise: 95000000, created_at: '2024-03-10T00:00:00Z' },
  { id: 'cust-002', org_id: ORG_ID, name: 'Priya Reddy', phone: '9123456789', email: 'priya.reddy@yahoo.com', whatsapp: '9123456789', gstin: null, address: 'Jubilee Hills, Hyderabad', notes: null, source: 'whatsapp', tags: ['engagement'], total_bookings: 1, total_spent_paise: 35000000, created_at: '2024-06-15T00:00:00Z' },
  { id: 'cust-003', org_id: ORG_ID, name: 'Arun Kumar Patel', phone: '8765432109', email: null, whatsapp: '8765432109', gstin: null, address: 'Secunderabad', notes: 'Wants budget options', source: 'walk_in', tags: ['wedding'], total_bookings: 2, total_spent_paise: 60000000, created_at: '2024-08-20T00:00:00Z' },
  { id: 'cust-004', org_id: ORG_ID, name: 'Meena Devi Gupta', phone: '7654321098', email: 'meena.gupta@outlook.com', whatsapp: '7654321098', gstin: null, address: 'Kukatpally, Hyderabad', notes: 'Daughter\'s wedding in December', source: 'phone_call', tags: ['wedding', 'vip'], total_bookings: 1, total_spent_paise: 45000000, created_at: '2024-09-05T00:00:00Z' },
  { id: 'cust-005', org_id: ORG_ID, name: 'TCS Hyderabad (Suresh)', phone: '9988776655', email: 'suresh.k@tcs.com', whatsapp: null, gstin: '36AABCT1332L1ZH', address: 'Gachibowli, Hyderabad', notes: 'Corporate events — quarterly', source: 'google', tags: ['corporate', 'recurring'], total_bookings: 4, total_spent_paise: 42000000, created_at: '2024-02-01T00:00:00Z' },
  { id: 'cust-006', org_id: ORG_ID, name: 'Venkat Rao', phone: '6543210987', email: null, whatsapp: '6543210987', gstin: null, address: 'Ameerpet, Hyderabad', notes: null, source: 'justdial', tags: ['birthday'], total_bookings: 1, total_spent_paise: 15000000, created_at: '2024-10-12T00:00:00Z' },
  { id: 'cust-007', org_id: ORG_ID, name: 'Anita Deshmukh', phone: '9876501234', email: 'anita.d@gmail.com', whatsapp: '9876501234', gstin: null, address: 'Madhapur, Hyderabad', notes: 'Referred by Rahul Sharma', source: 'referral', tags: ['reception'], total_bookings: 1, total_spent_paise: 28000000, created_at: '2024-11-01T00:00:00Z' },
  { id: 'cust-008', org_id: ORG_ID, name: 'Mohammed Irfan', phone: '8899776655', email: null, whatsapp: '8899776655', gstin: null, address: 'Old City, Hyderabad', notes: 'Nikah ceremony + reception', source: 'whatsapp', tags: ['wedding'], total_bookings: 1, total_spent_paise: 55000000, created_at: '2025-01-10T00:00:00Z' },
  { id: 'cust-009', org_id: ORG_ID, name: 'Lakshmi Narayan', phone: '7788990011', email: 'lakshmi.n@gmail.com', whatsapp: '7788990011', gstin: null, address: 'Dilsukhnagar, Hyderabad', notes: null, source: 'social_media', tags: ['pooja'], total_bookings: 2, total_spent_paise: 20000000, created_at: '2025-02-14T00:00:00Z' },
  { id: 'cust-010', org_id: ORG_ID, name: 'Sanjay Mittal', phone: '9112233445', email: 'sanjay.m@hotmail.com', whatsapp: '9112233445', gstin: '36AABCM5678R1ZK', address: 'Begumpet, Hyderabad', notes: 'Owns chain of restaurants — bulk bookings', source: 'referral', tags: ['corporate', 'vip'], total_bookings: 5, total_spent_paise: 120000000, created_at: '2024-01-20T00:00:00Z' },
];

// ─── Bookings ───────────────────────────────────────────────
function d(offset: number): string {
  return format(addDays(today, offset), 'yyyy-MM-dd');
}

export const mockBookings: Booking[] = [
  // Today's events
  { id: 'bk-001', org_id: ORG_ID, hall_id: 'hall-001', customer_id: 'cust-001', booking_number: 'VP-2025-00042', event_type: 'wedding', event_date: todayISO, start_time: '10:00', end_time: '22:00', guest_count: 350, status: 'confirmed', total_amount_paise: 35000000, advance_amount_paise: 8750000, notes: 'Sharma Wedding — Grand decoration required', created_at: subDays(today, 30).toISOString(), updated_at: subDays(today, 5).toISOString() },
  { id: 'bk-002', org_id: ORG_ID, hall_id: 'hall-004', customer_id: 'cust-005', booking_number: 'VP-2025-00043', event_type: 'conference', event_date: todayISO, start_time: '09:00', end_time: '17:00', guest_count: 30, status: 'confirmed', total_amount_paise: 3500000, advance_amount_paise: 3500000, notes: 'TCS quarterly review — projector setup by 8:30am', created_at: subDays(today, 15).toISOString(), updated_at: subDays(today, 3).toISOString() },

  // Tomorrow
  { id: 'bk-003', org_id: ORG_ID, hall_id: 'hall-002', customer_id: 'cust-002', booking_number: 'VP-2025-00044', event_type: 'engagement', event_date: d(1), start_time: '17:00', end_time: '22:00', guest_count: 150, status: 'confirmed', total_amount_paise: 18000000, advance_amount_paise: 4500000, notes: 'Engagement ceremony — flowers and stage required', created_at: subDays(today, 20).toISOString(), updated_at: subDays(today, 7).toISOString() },

  // This week
  { id: 'bk-004', org_id: ORG_ID, hall_id: 'hall-001', customer_id: 'cust-004', booking_number: 'VP-2025-00045', event_type: 'wedding', event_date: d(3), start_time: '08:00', end_time: '23:00', guest_count: 450, status: 'confirmed', total_amount_paise: 45000000, advance_amount_paise: 11250000, notes: 'Gupta Wedding — Full day booking, catering included', created_at: subDays(today, 60).toISOString(), updated_at: subDays(today, 10).toISOString() },
  { id: 'bk-005', org_id: ORG_ID, hall_id: 'hall-003', customer_id: 'cust-003', booking_number: 'VP-2025-00046', event_type: 'sangeet', event_date: d(2), start_time: '18:00', end_time: '23:00', guest_count: 200, status: 'confirmed', total_amount_paise: 22000000, advance_amount_paise: 5500000, notes: 'Sangeet night — DJ and lighting setup', created_at: subDays(today, 25).toISOString(), updated_at: subDays(today, 8).toISOString() },

  // Next week
  { id: 'bk-006', org_id: ORG_ID, hall_id: 'hall-002', customer_id: 'cust-006', booking_number: 'VP-2025-00047', event_type: 'birthday', event_date: d(7), start_time: '14:00', end_time: '20:00', guest_count: 80, status: 'confirmed', total_amount_paise: 15000000, advance_amount_paise: 3750000, notes: '50th birthday celebration', created_at: subDays(today, 14).toISOString(), updated_at: subDays(today, 4).toISOString() },
  { id: 'bk-007', org_id: ORG_ID, hall_id: 'hall-001', customer_id: 'cust-007', booking_number: 'VP-2025-00048', event_type: 'reception', event_date: d(10), start_time: '11:00', end_time: '22:00', guest_count: 300, status: 'hold', total_amount_paise: 28000000, advance_amount_paise: 0, notes: 'Reception — awaiting advance payment confirmation', created_at: subDays(today, 10).toISOString(), updated_at: subDays(today, 2).toISOString() },

  // Later this month
  { id: 'bk-008', org_id: ORG_ID, hall_id: 'hall-003', customer_id: 'cust-008', booking_number: 'VP-2025-00049', event_type: 'wedding', event_date: d(14), start_time: '09:00', end_time: '23:00', guest_count: 500, status: 'confirmed', total_amount_paise: 55000000, advance_amount_paise: 13750000, notes: 'Nikah + reception — full lawn setup', created_at: subDays(today, 45).toISOString(), updated_at: subDays(today, 12).toISOString() },
  { id: 'bk-009', org_id: ORG_ID, hall_id: 'hall-002', customer_id: 'cust-009', booking_number: 'VP-2025-00050', event_type: 'pooja', event_date: d(18), start_time: '06:00', end_time: '12:00', guest_count: 100, status: 'confirmed', total_amount_paise: 8000000, advance_amount_paise: 2000000, notes: 'Satyanarayan Pooja — morning slot', created_at: subDays(today, 8).toISOString(), updated_at: subDays(today, 1).toISOString() },
  { id: 'bk-010', org_id: ORG_ID, hall_id: 'hall-001', customer_id: 'cust-010', booking_number: 'VP-2025-00051', event_type: 'corporate', event_date: d(21), start_time: '10:00', end_time: '18:00', guest_count: 200, status: 'inquiry', total_amount_paise: 20000000, advance_amount_paise: 0, notes: 'Annual conference — pending final confirmation', created_at: subDays(today, 3).toISOString(), updated_at: subDays(today, 1).toISOString() },

  // Past bookings (completed)
  { id: 'bk-011', org_id: ORG_ID, hall_id: 'hall-001', customer_id: 'cust-001', booking_number: 'VP-2025-00035', event_type: 'reception', event_date: d(-5), start_time: '11:00', end_time: '22:00', guest_count: 400, status: 'completed', total_amount_paise: 38000000, advance_amount_paise: 9500000, notes: 'Completed successfully', created_at: subDays(today, 40).toISOString(), updated_at: subDays(today, 5).toISOString() },
  { id: 'bk-012', org_id: ORG_ID, hall_id: 'hall-002', customer_id: 'cust-003', booking_number: 'VP-2025-00036', event_type: 'mehendi', event_date: d(-3), start_time: '14:00', end_time: '21:00', guest_count: 120, status: 'completed', total_amount_paise: 12000000, advance_amount_paise: 3000000, notes: 'Mehendi + music night', created_at: subDays(today, 35).toISOString(), updated_at: subDays(today, 3).toISOString() },
  { id: 'bk-013', org_id: ORG_ID, hall_id: 'hall-003', customer_id: 'cust-010', booking_number: 'VP-2025-00037', event_type: 'corporate', event_date: d(-10), start_time: '09:00', end_time: '17:00', guest_count: 150, status: 'completed', total_amount_paise: 18000000, advance_amount_paise: 18000000, notes: 'Product launch event', created_at: subDays(today, 50).toISOString(), updated_at: subDays(today, 10).toISOString() },

  // Cancelled
  { id: 'bk-014', org_id: ORG_ID, hall_id: 'hall-002', customer_id: 'cust-009', booking_number: 'VP-2025-00038', event_type: 'anniversary', event_date: d(5), start_time: '18:00', end_time: '23:00', guest_count: 60, status: 'cancelled', total_amount_paise: 10000000, advance_amount_paise: 2500000, notes: 'Customer requested cancellation due to family emergency', created_at: subDays(today, 20).toISOString(), updated_at: subDays(today, 6).toISOString() },

  // Next month
  { id: 'bk-015', org_id: ORG_ID, hall_id: 'hall-001', customer_id: 'cust-010', booking_number: 'VP-2025-00052', event_type: 'wedding', event_date: format(addDays(startOfMonth(addMonths(today, 1)), 14), 'yyyy-MM-dd'), start_time: '08:00', end_time: '23:00', guest_count: 450, status: 'confirmed', total_amount_paise: 48000000, advance_amount_paise: 12000000, notes: 'Daughter\'s wedding — VIP treatment', created_at: subDays(today, 60).toISOString(), updated_at: subDays(today, 15).toISOString() },
];

// ─── Payments ───────────────────────────────────────────────
export const mockPayments: Payment[] = [
  // bk-001 (Sharma Wedding - ₹3.5L, ₹87.5K advance)
  { id: 'pay-001', org_id: ORG_ID, booking_id: 'bk-001', amount_paise: 8750000, payment_type: 'advance', payment_mode: 'upi', status: 'received', transaction_ref: 'UPI-REF-87234', due_date: null, paid_at: subDays(today, 28).toISOString(), notes: '25% advance received', created_at: subDays(today, 28).toISOString() },
  { id: 'pay-002', org_id: ORG_ID, booking_id: 'bk-001', amount_paise: 15000000, payment_type: 'installment', payment_mode: 'bank_transfer', status: 'received', transaction_ref: 'NEFT-44521', due_date: null, paid_at: subDays(today, 14).toISOString(), notes: 'Second installment', created_at: subDays(today, 14).toISOString() },

  // bk-002 (TCS Conference - ₹35K, fully paid)
  { id: 'pay-003', org_id: ORG_ID, booking_id: 'bk-002', amount_paise: 3500000, payment_type: 'advance', payment_mode: 'bank_transfer', status: 'received', transaction_ref: 'NEFT-TCS-1234', due_date: null, paid_at: subDays(today, 12).toISOString(), notes: 'Full payment (corporate)', created_at: subDays(today, 12).toISOString() },

  // bk-003 (Engagement - ₹1.8L, ₹45K advance)
  { id: 'pay-004', org_id: ORG_ID, booking_id: 'bk-003', amount_paise: 4500000, payment_type: 'advance', payment_mode: 'cash', status: 'received', transaction_ref: null, due_date: null, paid_at: subDays(today, 18).toISOString(), notes: 'Cash advance', created_at: subDays(today, 18).toISOString() },

  // bk-004 (Gupta Wedding - ₹4.5L, ₹1.125L advance)
  { id: 'pay-005', org_id: ORG_ID, booking_id: 'bk-004', amount_paise: 11250000, payment_type: 'advance', payment_mode: 'upi', status: 'received', transaction_ref: 'UPI-GPY-55678', due_date: null, paid_at: subDays(today, 55).toISOString(), notes: 'Advance via GPay', created_at: subDays(today, 55).toISOString() },
  { id: 'pay-006', org_id: ORG_ID, booking_id: 'bk-004', amount_paise: 20000000, payment_type: 'installment', payment_mode: 'cheque', status: 'received', transaction_ref: 'CHQ-887234', due_date: null, paid_at: subDays(today, 20).toISOString(), notes: 'Cheque cleared', created_at: subDays(today, 20).toISOString() },

  // bk-005 (Sangeet - ₹2.2L, ₹55K advance)
  { id: 'pay-007', org_id: ORG_ID, booking_id: 'bk-005', amount_paise: 5500000, payment_type: 'advance', payment_mode: 'upi', status: 'received', transaction_ref: 'UPI-REF-23456', due_date: null, paid_at: subDays(today, 22).toISOString(), notes: 'Advance received', created_at: subDays(today, 22).toISOString() },

  // bk-008 (Irfan Wedding - ₹5.5L, ₹1.375L advance)
  { id: 'pay-008', org_id: ORG_ID, booking_id: 'bk-008', amount_paise: 13750000, payment_type: 'advance', payment_mode: 'bank_transfer', status: 'received', transaction_ref: 'NEFT-92345', due_date: null, paid_at: subDays(today, 40).toISOString(), notes: 'Bank transfer advance', created_at: subDays(today, 40).toISOString() },

  // bk-011 (Completed - Sharma Reception - ₹3.8L, fully paid)
  { id: 'pay-009', org_id: ORG_ID, booking_id: 'bk-011', amount_paise: 9500000, payment_type: 'advance', payment_mode: 'upi', status: 'received', transaction_ref: 'UPI-REF-77777', due_date: null, paid_at: subDays(today, 38).toISOString(), notes: null, created_at: subDays(today, 38).toISOString() },
  { id: 'pay-010', org_id: ORG_ID, booking_id: 'bk-011', amount_paise: 28500000, payment_type: 'final', payment_mode: 'bank_transfer', status: 'received', transaction_ref: 'NEFT-88821', due_date: null, paid_at: subDays(today, 5).toISOString(), notes: 'Final settlement', created_at: subDays(today, 5).toISOString() },

  // bk-013 (Completed - Corporate event - ₹1.8L, fully paid)
  { id: 'pay-011', org_id: ORG_ID, booking_id: 'bk-013', amount_paise: 18000000, payment_type: 'advance', payment_mode: 'bank_transfer', status: 'received', transaction_ref: 'NEFT-CORP-001', due_date: null, paid_at: subDays(today, 48).toISOString(), notes: 'Full advance — corporate account', created_at: subDays(today, 48).toISOString() },

  // Pending payments
  { id: 'pay-012', org_id: ORG_ID, booking_id: 'bk-006', amount_paise: 3750000, payment_type: 'advance', payment_mode: 'cash', status: 'received', transaction_ref: null, due_date: null, paid_at: subDays(today, 10).toISOString(), notes: 'Cash advance', created_at: subDays(today, 10).toISOString() },
  { id: 'pay-013', org_id: ORG_ID, booking_id: 'bk-009', amount_paise: 2000000, payment_type: 'advance', payment_mode: 'upi', status: 'received', transaction_ref: 'UPI-REF-99123', due_date: null, paid_at: subDays(today, 7).toISOString(), notes: null, created_at: subDays(today, 7).toISOString() },
];

// ─── Leads ──────────────────────────────────────────────────
export const mockLeads: Lead[] = [
  { id: 'lead-001', org_id: ORG_ID, name: 'Suresh Verma', phone: '9876000111', email: 'suresh.v@gmail.com', event_type: 'wedding', tentative_date: format(addDays(today, 45), 'yyyy-MM-dd'), budget_min_paise: 30000000, budget_max_paise: 50000000, source: 'phone_call', status: 'contacted', follow_up_date: todayISO, assigned_to: null, notes: 'Wants to visit next Saturday. Son\'s wedding in Jan.', hall_preference: 'Grand Ballroom', guest_count: 300, created_at: subDays(today, 5).toISOString(), updated_at: subDays(today, 2).toISOString() },
  { id: 'lead-002', org_id: ORG_ID, name: 'Kavita Joshi', phone: '8765111222', email: null, event_type: 'reception', tentative_date: format(addDays(today, 60), 'yyyy-MM-dd'), budget_min_paise: 20000000, budget_max_paise: 35000000, source: 'whatsapp', status: 'new', follow_up_date: d(1), assigned_to: null, notes: 'Sent venue photos on WhatsApp. Waiting for response.', hall_preference: null, guest_count: 200, created_at: subDays(today, 2).toISOString(), updated_at: subDays(today, 2).toISOString() },
  { id: 'lead-003', org_id: ORG_ID, name: 'Deepak Choudhary', phone: '7654222333', email: 'deepak.c@company.com', event_type: 'corporate', tentative_date: format(addDays(today, 30), 'yyyy-MM-dd'), budget_min_paise: 15000000, budget_max_paise: 25000000, source: 'google', status: 'visit_scheduled', follow_up_date: d(2), assigned_to: null, notes: 'Annual team party. Visit scheduled Thursday 3pm.', hall_preference: 'Garden Lawn', guest_count: 150, created_at: subDays(today, 7).toISOString(), updated_at: subDays(today, 1).toISOString() },
  { id: 'lead-004', org_id: ORG_ID, name: 'Fatima Begum', phone: '9988333444', email: null, event_type: 'wedding', tentative_date: format(addMonths(today, 3), 'yyyy-MM-dd'), budget_min_paise: 40000000, budget_max_paise: 60000000, source: 'referral', status: 'negotiation', follow_up_date: d(-1), assigned_to: null, notes: 'Referred by Mohammed Irfan. Wants full-day lawn booking + catering.', hall_preference: 'Garden Lawn', guest_count: 500, created_at: subDays(today, 10).toISOString(), updated_at: subDays(today, 1).toISOString() },
  { id: 'lead-005', org_id: ORG_ID, name: 'Ravi Teja', phone: '6543444555', email: 'ravi.t@techcorp.in', event_type: 'conference', tentative_date: format(addDays(today, 15), 'yyyy-MM-dd'), budget_min_paise: 5000000, budget_max_paise: 8000000, source: 'website', status: 'contacted', follow_up_date: todayISO, assigned_to: null, notes: 'Tech meetup — needs Board Room + projector. Sent quote.', hall_preference: 'Board Room', guest_count: 35, created_at: subDays(today, 4).toISOString(), updated_at: subDays(today, 2).toISOString() },
  { id: 'lead-006', org_id: ORG_ID, name: 'Anjali Singh', phone: '8877555666', email: 'anjali.s@gmail.com', event_type: 'birthday', tentative_date: format(addDays(today, 20), 'yyyy-MM-dd'), budget_min_paise: 8000000, budget_max_paise: 15000000, source: 'social_media', status: 'new', follow_up_date: d(3), assigned_to: null, notes: 'Found us on Instagram. Wants small intimate birthday party.', hall_preference: 'Silver Hall', guest_count: 60, created_at: subDays(today, 1).toISOString(), updated_at: subDays(today, 1).toISOString() },
  { id: 'lead-007', org_id: ORG_ID, name: 'Gopal Krishna', phone: '9876666777', email: null, event_type: 'pooja', tentative_date: format(addDays(today, 25), 'yyyy-MM-dd'), budget_min_paise: 5000000, budget_max_paise: 10000000, source: 'walk_in', status: 'won', follow_up_date: null, assigned_to: null, notes: 'Converted to booking — Satyanarayan Pooja', hall_preference: 'Silver Hall', guest_count: 80, created_at: subDays(today, 15).toISOString(), updated_at: subDays(today, 8).toISOString() },
  { id: 'lead-008', org_id: ORG_ID, name: 'Nisha Kapoor', phone: '7766888999', email: 'nisha.k@yahoo.com', event_type: 'engagement', tentative_date: format(addDays(today, 35), 'yyyy-MM-dd'), budget_min_paise: 18000000, budget_max_paise: 25000000, source: 'justdial', status: 'lost', follow_up_date: null, assigned_to: null, notes: 'Went with competitor — price too high', hall_preference: 'Silver Hall', guest_count: 100, created_at: subDays(today, 20).toISOString(), updated_at: subDays(today, 12).toISOString() },
];

// ─── Dashboard Stats ────────────────────────────────────────
export function getDashboardStats() {
  const todaysEvents = mockBookings.filter(
    (b) => b.event_date === todayISO && (b.status === 'confirmed' || b.status === 'completed')
  );
  const tomorrowEvents = mockBookings.filter(
    (b) => b.event_date === d(1) && (b.status === 'confirmed' || b.status === 'hold')
  );

  const thisMonth = startOfMonth(today);
  const thisMonthPayments = mockPayments.filter((p) => {
    if (!p.paid_at || p.status !== 'received') return false;
    return new Date(p.paid_at) >= thisMonth;
  });
  const thisMonthRevenue = thisMonthPayments.reduce((sum, p) => sum + p.amount_paise, 0);
  const thisMonthBookings = mockBookings.filter(
    (b) => b.event_date >= format(thisMonth, 'yyyy-MM-dd') &&
           b.event_date <= format(addDays(addMonths(thisMonth, 1), -1), 'yyyy-MM-dd') &&
           b.status !== 'cancelled'
  );

  const activeBookings = mockBookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'hold'
  );
  const totalOwed = activeBookings.reduce((sum, b) => sum + b.total_amount_paise, 0);
  const totalPaid = mockPayments
    .filter((p) => p.status === 'received' && activeBookings.some((b) => b.id === p.booking_id))
    .reduce((sum, p) => sum + p.amount_paise, 0);
  const pendingAmount = totalOwed - totalPaid;
  const pendingCustomers = new Set(
    activeBookings
      .filter((b) => {
        const paid = mockPayments
          .filter((p) => p.booking_id === b.id && p.status === 'received')
          .reduce((s, p) => s + p.amount_paise, 0);
        return paid < b.total_amount_paise;
      })
      .map((b) => b.customer_id)
  ).size;

  return {
    todaysEvents: todaysEvents.length,
    tomorrowEvents: tomorrowEvents.length,
    thisMonthRevenue,
    thisMonthBookings: thisMonthBookings.length,
    pendingAmount,
    pendingCustomers,
  };
}

// ─── Helpers ────────────────────────────────────────────────
export function getBookingsForDate(date: string): Booking[] {
  return mockBookings.filter((b) => b.event_date === date && b.status !== 'cancelled');
}

export function getPaymentsForBooking(bookingId: string): Payment[] {
  return mockPayments.filter((p) => p.booking_id === bookingId);
}

export function getCustomerById(customerId: string): Customer | undefined {
  return mockCustomers.find((c) => c.id === customerId);
}

export function getHallById(hallId: string): Hall | undefined {
  return mockHalls.find((h) => h.id === hallId);
}

export function getUpcomingBookings(days: number = 7): Booking[] {
  const endDate = format(addDays(today, days), 'yyyy-MM-dd');
  return mockBookings
    .filter((b) => b.event_date >= todayISO && b.event_date <= endDate && b.status === 'confirmed')
    .sort((a, b) => a.event_date.localeCompare(b.event_date));
}

export function getFollowUpsDue(): Lead[] {
  return mockLeads
    .filter((l) => l.follow_up_date && l.follow_up_date <= todayISO && l.status !== 'won' && l.status !== 'lost')
    .sort((a, b) => (a.follow_up_date || '').localeCompare(b.follow_up_date || ''));
}
