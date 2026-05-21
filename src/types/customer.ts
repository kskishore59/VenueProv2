export interface Customer {
  id: string;
  org_id: string;
  name: string;
  phone: string;
  email: string | null;
  whatsapp: string | null;
  gstin: string | null;
  address: string | null;
  notes: string | null;
  source: CustomerSource;
  tags: string[];
  total_bookings: number;
  total_spent_paise: number;
  created_at: string;
}

export type CustomerSource =
  | 'walk_in'
  | 'phone_call'
  | 'whatsapp'
  | 'google'
  | 'referral'
  | 'social_media'
  | 'justdial'
  | 'website'
  | 'other';

export const customerSourceLabels: Record<CustomerSource, string> = {
  walk_in: 'Walk-in',
  phone_call: 'Phone Call',
  whatsapp: 'WhatsApp',
  google: 'Google',
  referral: 'Referral',
  social_media: 'Social Media',
  justdial: 'JustDial',
  website: 'Website',
  other: 'Other',
};
