export interface Lead {
  id: string;
  org_id: string;
  name: string;
  phone: string;
  email: string | null;
  event_type: string | null;
  tentative_date: string | null;
  budget_min_paise: number | null;
  budget_max_paise: number | null;
  source: LeadSource;
  status: LeadStatus;
  follow_up_date: string | null;
  assigned_to: string | null;
  notes: string | null;
  hall_preference: string | null;
  guest_count: number | null;
  created_at: string;
  updated_at: string;
}

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'visit_scheduled'
  | 'negotiation'
  | 'won'
  | 'lost';

export type LeadSource =
  | 'walk_in'
  | 'phone_call'
  | 'whatsapp'
  | 'google'
  | 'referral'
  | 'social_media'
  | 'justdial'
  | 'website'
  | 'other';

export const leadStatusConfig: Record<LeadStatus, { label: string; color: string; bg: string; icon: string }> = {
  new:             { label: 'New',             color: '#3B82F6', bg: '#DBEAFE', icon: '🆕' },
  contacted:       { label: 'Contacted',       color: '#8B5CF6', bg: '#EDE9FE', icon: '📞' },
  visit_scheduled: { label: 'Visit Scheduled', color: '#F59E0B', bg: '#FEF3C7', icon: '🗓' },
  negotiation:     { label: 'Negotiation',     color: '#EC4899', bg: '#FCE7F3', icon: '🤝' },
  won:             { label: 'Won',             color: '#057A55', bg: '#D1FAE5', icon: '✅' },
  lost:            { label: 'Lost',            color: '#C81E1E', bg: '#FEE2E2', icon: '❌' },
};

export const leadStatusFlow: LeadStatus[] = [
  'new', 'contacted', 'visit_scheduled', 'negotiation', 'won', 'lost',
];

export const leadSourceLabels: Record<LeadSource, string> = {
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
