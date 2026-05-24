export type NotificationType =
  | 'booking_created'
  | 'booking_cancelled'
  | 'payment_due'
  | 'payment_received'
  | 'lead_followup'
  | 'system';

export interface Notification {
  id: string;
  org_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  link_to: string | null;
  created_at: string;
}
