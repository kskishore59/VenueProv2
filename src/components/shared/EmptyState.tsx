import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in',
      className,
    )}>
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-5">
        <Icon className="w-7 h-7 text-gray-400" />
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-1.5">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className={cn(
            'px-5 py-2.5 rounded-xl text-sm font-semibold',
            'bg-brand-600 text-white hover:bg-brand-700',
            'transition-all duration-200 active:scale-95',
            'shadow-sm hover:shadow-md',
          )}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
