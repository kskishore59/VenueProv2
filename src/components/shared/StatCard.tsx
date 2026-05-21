import { type ReactNode } from 'react';
import { cn, formatCurrency } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sublabel: string;
  trend?: { value: number; positive: boolean };
  color: 'blue' | 'green' | 'amber' | 'rose';
  delay?: number;
  children?: ReactNode;
}

const colorMap = {
  blue: {
    iconBg: 'bg-brand-50',
    iconColor: 'text-brand-600',
    gradient: 'from-brand-500/5 to-transparent',
    accent: 'bg-brand-500',
  },
  green: {
    iconBg: 'bg-success-50',
    iconColor: 'text-success-500',
    gradient: 'from-success-500/5 to-transparent',
    accent: 'bg-success-500',
  },
  amber: {
    iconBg: 'bg-warning-50',
    iconColor: 'text-warning-500',
    gradient: 'from-warning-500/5 to-transparent',
    accent: 'bg-warning-500',
  },
  rose: {
    iconBg: 'bg-danger-50',
    iconColor: 'text-danger-500',
    gradient: 'from-danger-500/5 to-transparent',
    accent: 'bg-danger-500',
  },
};

export function StatCard({ icon: Icon, label, value, sublabel, color, delay = 0, children }: StatCardProps) {
  const colors = colorMap[color];

  const displayValue = typeof value === 'number'
    ? formatCurrency(value)
    : value;

  return (
    <div
      className={cn(
        'relative bg-white rounded-2xl border border-gray-100 p-5 overflow-hidden',
        'card-hover group cursor-default',
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Subtle gradient accent */}
      <div className={cn('absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl rounded-bl-full opacity-60', colors.gradient)} />

      {/* Top accent line */}
      <div className={cn('absolute top-0 left-0 right-0 h-0.5', colors.accent, 'opacity-40')} />

      <div className="relative">
        {/* Icon + Label */}
        <div className="flex items-center gap-3 mb-4">
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110',
            colors.iconBg,
          )}>
            <Icon className={cn('w-5 h-5', colors.iconColor)} />
          </div>
          <span className="text-[13px] font-medium text-gray-500">{label}</span>
        </div>

        {/* Value */}
        <div className="number-animate">
          <span className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            {displayValue}
          </span>
        </div>

        {/* Sublabel */}
        <p className="text-[12.5px] text-gray-400 mt-1.5 font-medium">{sublabel}</p>

        {children}
      </div>
    </div>
  );
}
