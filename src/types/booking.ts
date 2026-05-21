import type { Customer } from './customer';
import type { Hall } from './venue';
import type { Payment } from './payment';

export interface Booking {
  id: string;
  org_id: string;
  hall_id: string;
  customer_id: string;
  booking_number: string;
  event_type: EventType;
  event_date: string; // ISO date
  start_time: string; // HH:mm
  end_time: string;   // HH:mm
  guest_count: number | null;
  status: BookingStatus;
  total_amount_paise: number;
  advance_amount_paise: number;
  notes: string | null;
  created_at: string;
  updated_at: string;

  // Joined relations (optional)
  hall?: Hall;
  customer?: Customer;
  payments?: Payment[];
}

export type BookingStatus =
  | 'inquiry'
  | 'hold'
  | 'confirmed'
  | 'completed'
  | 'cancelled';

export type EventType =
  | 'wedding'
  | 'reception'
  | 'engagement'
  | 'mehendi'
  | 'haldi'
  | 'sangeet'
  | 'birthday'
  | 'anniversary'
  | 'corporate'
  | 'conference'
  | 'pooja'
  | 'other';

export const bookingStatusConfig: Record<BookingStatus, { label: string; color: string; bg: string }> = {
  inquiry:   { label: 'Inquiry',   color: '#6B7280', bg: '#F3F4F6' },
  hold:      { label: 'Hold',      color: '#C27803', bg: '#FEF3C7' },
  confirmed: { label: 'Confirmed', color: '#1A56DB', bg: '#DBEAFE' },
  completed: { label: 'Completed', color: '#057A55', bg: '#D1FAE5' },
  cancelled: { label: 'Cancelled', color: '#C81E1E', bg: '#FEE2E2' },
};

export const bookingStatusFlow: BookingStatus[] = [
  'inquiry', 'hold', 'confirmed', 'completed', 'cancelled',
];

export const eventTypeLabels: Record<EventType, string> = {
  wedding: 'Wedding',
  reception: 'Reception',
  engagement: 'Engagement',
  mehendi: 'Mehendi',
  haldi: 'Haldi',
  sangeet: 'Sangeet',
  birthday: 'Birthday',
  anniversary: 'Anniversary',
  corporate: 'Corporate Event',
  conference: 'Conference',
  pooja: 'Pooja / Ceremony',
  other: 'Other',
};

export const eventTypes: EventType[] = [
  'wedding', 'reception', 'engagement', 'mehendi', 'haldi', 'sangeet',
  'birthday', 'anniversary', 'corporate', 'conference', 'pooja', 'other',
];
