export interface Payment {
  id: string;
  org_id: string;
  booking_id: string;
  amount_paise: number;
  payment_type: PaymentType;
  payment_mode: PaymentMode;
  status: PaymentStatus;
  transaction_ref: string | null;
  due_date: string | null;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
}

export type PaymentType = 'advance' | 'installment' | 'final' | 'refund';

export type PaymentMode =
  | 'cash'
  | 'upi'
  | 'bank_transfer'
  | 'cheque'
  | 'card'
  | 'online';

export type PaymentStatus = 'pending' | 'received' | 'failed' | 'refunded';

export const paymentModeLabels: Record<PaymentMode, string> = {
  cash: 'Cash',
  upi: 'UPI',
  bank_transfer: 'Bank Transfer',
  cheque: 'Cheque',
  card: 'Card',
  online: 'Online',
};

export const paymentStatusConfig: Record<PaymentStatus, { label: string; color: string; bg: string }> = {
  pending:  { label: 'Pending',  color: '#C27803', bg: '#FEF3C7' },
  received: { label: 'Received', color: '#057A55', bg: '#D1FAE5' },
  failed:   { label: 'Failed',   color: '#C81E1E', bg: '#FEE2E2' },
  refunded: { label: 'Refunded', color: '#6B7280', bg: '#F3F4F6' },
};

export const paymentTypeLabels: Record<PaymentType, string> = {
  advance: 'Advance',
  installment: 'Installment',
  final: 'Final Payment',
  refund: 'Refund',
};
