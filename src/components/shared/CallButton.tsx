import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Phone, Copy, Check, X, ExternalLink } from 'lucide-react';
import { cn, formatPhone } from '@/lib/utils';
import { toast } from 'sonner';

interface CallButtonProps {
  phone: string;
  leadName?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'button';
  label?: string;
  className?: string;
}

export function CallButton({
  phone,
  leadName = 'Customer',
  size = 'sm',
  variant = 'icon',
  label = 'Call',
  className,
}: CallButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Checks both userAgent and screen width for mobile experience
  const isMobileDevice = () => {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';
    return /Mobi|Android|iPhone|iPad/i.test(ua) || window.innerWidth < 768;
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(true);
      toast.success('Phone number copied to clipboard! 📋');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy phone number');
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // If it's a mobile device, let the default tel: navigation handle it
    if (isMobileDevice()) {
      return;
    }
    
    // Otherwise, intercept and show the premium desktop modal
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const cleanPhone = phone.replace(/\D/g, '');
  const telUrl = `tel:${phone}`;

  const renderButton = () => {
    if (variant === 'icon') {
      return (
        <a
          href={telUrl}
          onClick={handleClick}
          className={cn(
            'inline-flex items-center justify-center rounded-lg transition-all duration-200',
            'bg-brand-50 text-brand-600 hover:bg-brand-100 hover:text-brand-700 hover:scale-105 active:scale-95 border border-brand-100/30',
            size === 'sm' && 'p-1.5',
            size === 'md' && 'p-2',
            size === 'lg' && 'p-2.5',
            className
          )}
          title={`Call Lead: ${phone}`}
        >
          <Phone className={cn(
            size === 'sm' && 'w-3.5 h-3.5',
            size === 'md' && 'w-4.5 h-4.5',
            size === 'lg' && 'w-5 h-5'
          )} />
        </a>
      );
    }

    return (
      <a
        href={telUrl}
        onClick={handleClick}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 border cursor-pointer',
          'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:shadow-xs active:scale-95',
          size === 'sm' && 'px-3 py-1.5 text-xs',
          size === 'md' && 'px-4 py-2.5 text-sm',
          size === 'lg' && 'px-5 py-3 text-sm',
          className
        )}
      >
        <Phone className={cn(
          size === 'sm' && 'w-3.5 h-3.5',
          size === 'md' && 'w-4 h-4',
          size === 'lg' && 'w-4 h-4'
        )} />
        {label}
      </a>
    );
  };

  return (
    <>
      {renderButton()}

      {isModalOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4 transition-opacity animate-fade-in"
          onClick={(e) => {
            e.stopPropagation();
            setIsModalOpen(false);
          }}
        >
          <div 
            className="bg-white border border-slate-100 rounded-3xl shadow-2xl p-6 w-full max-w-sm text-center relative animate-scale-up pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-slate-100 transition-colors text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Circular Phone Icon */}
            <div className="w-16 h-16 bg-brand-50 border border-brand-100 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-600 animate-pulse-soft">
              <Phone className="w-8 h-8" />
            </div>

            {/* Lead Name & Details */}
            <h3 className="text-base font-bold text-slate-800">Call Lead</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">Dialing options for: <span className="font-bold text-slate-700">{leadName}</span></p>

            {/* Formatted Phone Number */}
            <div className="my-5 p-3.5 bg-slate-55 rounded-2xl border border-slate-100 text-lg font-extrabold text-slate-900 tracking-wide font-mono">
              {formatPhone(phone)}
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-success-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Number</span>
                  </>
                )}
              </button>

              <a
                href={telUrl}
                onClick={() => setIsModalOpen(false)}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs hover:shadow-sm active:scale-[0.98] transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Dialer</span>
              </a>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
