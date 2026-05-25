import { useState } from 'react';
import { getWhatsAppUrl } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { WhatsappTemplateModal } from './WhatsappTemplateModal';

export const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.37 5.054L2 22l5.132-1.347a9.936 9.936 0 0 0 4.88 1.28h.005c5.502 0 9.985-4.479 9.988-9.987C22 6.478 17.518 2 12.012 2zm5.835 14.288c-.24.672-1.214 1.272-1.665 1.342-.456.07-1.048.14-3.011-.64-2.505-1.01-4.14-3.57-4.26-3.73-.125-.16-1.002-1.32-1.002-2.52 0-1.2.626-1.79.845-2.04.223-.25.485-.31.646-.31.162 0 .324.004.464.01.146.007.342-.056.536.4.2.47.68 1.656.738 1.777.06.12.097.26.018.42-.078.16-.178.26-.297.394-.12.133-.25.28-.358.375-.12.1-.247.21-.106.45.142.24.63 1.03 1.353 1.67.93.824 1.708 1.08 1.95 1.2.24.12.38.1.522-.06.14-.17.61-.71.772-.95.163-.24.325-.2.548-.12.223.08 1.417.67 1.66.79.243.12.404.18.463.28.06.1.06.58-.18 1.25z"/>
  </svg>
);

interface WhatsAppButtonProps {
  phone: string;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'button';
  label?: string;
  className?: string;
  bookingId?: string;
  leadId?: string;
  customerId?: string;
}

export function WhatsAppButton({
  phone,
  message,
  size = 'sm',
  variant = 'icon',
  label = 'WhatsApp',
  className,
  bookingId,
  leadId,
  customerId,
}: WhatsAppButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const url = getWhatsAppUrl(phone, message);
  const hasContext = !!(bookingId || leadId || customerId);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasContext) {
      e.preventDefault();
      setIsModalOpen(true);
    }
  };

  const renderButton = () => {
    if (variant === 'icon') {
      return (
        <a
          href={url}
          onClick={handleClick}
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
          <WhatsAppIcon className={cn(
            size === 'sm' && 'w-5 h-5',
            size === 'md' && 'w-6 h-6',
            size === 'lg' && 'w-7 h-7',
          )} />
        </a>
      );
    }

    return (
      <a
        href={url}
        onClick={handleClick}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'inline-flex items-center gap-2 rounded-xl font-semibold transition-all duration-200',
          'bg-green-500 text-white hover:bg-green-600 hover:shadow-md active:scale-95 cursor-pointer',
          size === 'sm' && 'px-3 py-1.5 text-xs',
          size === 'md' && 'px-4 py-2 text-sm',
          size === 'lg' && 'px-5 py-2.5 text-sm',
          className,
        )}
      >
        <WhatsAppIcon className={cn(
          size === 'sm' && 'w-4.5 h-4.5',
          size === 'md' && 'w-5 h-5',
          size === 'lg' && 'w-5.5 h-5.5',
        )} />
        {label}
      </a>
    );
  };

  return (
    <>
      {renderButton()}
      {hasContext && isModalOpen && (
        <WhatsappTemplateModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          phone={phone}
          bookingId={bookingId}
          leadId={leadId}
          customerId={customerId}
        />
      )}
    </>
  );
}
