export interface Organization {
  id: string;
  name: string;
  slug: string;
  gstin: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  terms_and_conditions: string | null;
  settings: OrgSettings;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  trial_ends_at?: string | null;
  subscription_status?: 'trial' | 'active' | 'past_due' | 'canceled' | 'expired' | null;
  promo_codes_applied?: string[] | null;
  created_at: string;
}

export interface OrgSettings {
  currency: string;
  timezone: string;
  date_format: string;
  default_advance_percent: number;
  gst_enabled: boolean;
  whatsapp_enabled: boolean;
  sms_enabled: boolean;
  email_notifications: boolean;
  permissions?: Record<string, Record<string, Record<string, boolean>>>;
}

export const defaultOrgSettings: OrgSettings = {
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  date_format: 'dd/MM/yyyy',
  default_advance_percent: 25,
  gst_enabled: true,
  whatsapp_enabled: true,
  sms_enabled: false,
  email_notifications: true,
};
