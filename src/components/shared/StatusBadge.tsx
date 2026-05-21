import type { BookingStatus } from '@/types/booking';
import type { LeadStatus } from '@/types/lead';
import type { PaymentStatus } from '@/types/payment';
import { bookingStatusConfig } from '@/types/booking';
import { leadStatusConfig } from '@/types/lead';
import { paymentStatusConfig } from '@/types/payment';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  type: 'booking' | 'lead' | 'payment';
  status: string;
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export function StatusBadge({ type, status, size = 'sm', pulse = false }: StatusBadgeProps) {
  let config: { label: string; color: string; bg: string };

  if (type === 'booking') {
    config = bookingStatusConfig[status as BookingStatus] || { label: status, color: '#6B7280', bg: '#F3F4F6' };
  } else if (type === 'lead') {
    const leadConfig = leadStatusConfig[status as LeadStatus];
    config = leadConfig || { label: status, color: '#6B7280', bg: '#F3F4F6' };
  } else {
    config = paymentStatusConfig[status as PaymentStatus] || { label: status, color: '#6B7280', bg: '#F3F4F6' };
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold rounded-full transition-all',
        size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs',
      )}
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      {pulse && (
        <span
          className="w-1.5 h-1.5 rounded-full animate-pulse-soft"
          style={{ backgroundColor: config.color }}
        />
      )}
      {config.label}
    </span>
  );
}
