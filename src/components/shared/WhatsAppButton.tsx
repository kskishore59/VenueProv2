import { MessageCircle } from 'lucide-react';
import { getWhatsAppUrl } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface WhatsAppButtonProps {
  phone: string;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'button';
  label?: string;
  className?: string;
}

export function WhatsAppButton({
  phone,
  message,
  size = 'sm',
  variant = 'icon',
  label = 'WhatsApp',
  className,
}: WhatsAppButtonProps) {
  const url = getWhatsAppUrl(phone, message);

  if (variant === 'icon') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'inline-flex items-center justify-center rounded-lg transition-all duration-200',
          'bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 hover:scale-105 active:scale-95',
          size === 'sm' && 'p-1.5',
          size === 'md' && 'p-2',
          size === 'lg' && 'p-2.5',
          className,
        )}
        title={`Chat on WhatsApp: ${phone}`}
      >
        <MessageCircle className={cn(
          size === 'sm' && 'w-3.5 h-3.5',
          size === 'md' && 'w-4 h-4',
          size === 'lg' && 'w-5 h-5',
        )} />
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center gap-2 rounded-xl font-semibold transition-all duration-200',
        'bg-green-500 text-white hover:bg-green-600 hover:shadow-md active:scale-95',
        size === 'sm' && 'px-3 py-1.5 text-xs',
        size === 'md' && 'px-4 py-2 text-sm',
        size === 'lg' && 'px-5 py-2.5 text-sm',
        className,
      )}
    >
      <MessageCircle className="w-4 h-4" />
      {label}
    </a>
  );
}
