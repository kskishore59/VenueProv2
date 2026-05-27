import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6 text-center bg-white rounded-3xl border border-slate-100/80 shadow-2xs hover:shadow-xs transition-shadow duration-300 max-w-lg mx-auto',
        className
      )}
    >
      {/* Icon frame with micro-glow */}
      <div className="relative mb-5 flex items-center justify-center">
        <div className="absolute inset-0 rounded-2xl bg-brand-500/10 blur-md scale-95" />
        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/60 border border-slate-200/50 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform duration-300">
          <Icon className="w-6 h-6 text-slate-400" />
        </div>
      </div>

      <h3 className="text-sm font-bold text-slate-800 mb-1 font-display tracking-tight">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed font-semibold">{description}</p>
      
      {action && (
        <button
          onClick={action.onClick}
          className={cn(
            'px-5 py-2.5 rounded-xl text-xs font-bold text-white',
            'bg-brand-600 hover:bg-brand-700 active:scale-95',
            'transition-all duration-200 shadow-sm shadow-brand-100',
          )}
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
