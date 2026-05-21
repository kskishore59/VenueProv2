import { AlertTriangle, Info, ShieldAlert, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';

const variantStyles = {
  danger: {
    icon: ShieldAlert,
    iconBg: 'bg-danger-50',
    iconColor: 'text-danger-500',
    button: 'bg-danger-500 hover:bg-danger-600',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-warning-50',
    iconColor: 'text-warning-500',
    button: 'bg-warning-500 hover:bg-warning-600',
  },
  info: {
    icon: Info,
    iconBg: 'bg-brand-50',
    iconColor: 'text-brand-600',
    button: 'bg-brand-600 hover:bg-brand-700',
  },
};

export function ConfirmDialog() {
  const { open, title, description, variant, onConfirm } = useUIStore((s) => s.confirmDialog);
  const closeConfirm = useUIStore((s) => s.closeConfirm);

  if (!open) return null;

  const style = variantStyles[variant];
  const Icon = style.icon;

  const handleConfirm = () => {
    onConfirm?.();
    closeConfirm();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[60] drawer-overlay" onClick={closeConfirm} />
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl modal-content p-6">
          <div className="flex items-start gap-4">
            <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', style.iconBg)}>
              <Icon className={cn('w-6 h-6', style.iconColor)} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
            </div>
            <button onClick={closeConfirm} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-3 mt-6 justify-end">
            <button
              onClick={closeConfirm}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className={cn(
                'px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-95',
                style.button,
              )}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
