import { cn } from '@/lib/utils';

interface GlobalLoaderProps {
  message?: string;
  subtitle?: string;
  variant?: 'fullscreen' | 'overlay' | 'inline';
}

export function GlobalLoader({
  message = 'Loading VenuePro...',
  subtitle,
  variant = 'fullscreen',
}: GlobalLoaderProps) {
  if (variant === 'overlay') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-transparent backdrop-blur-[2px] pointer-events-none transition-all duration-300">
        <div className="bg-white/95 border border-gray-150 rounded-2xl shadow-2xl p-4 flex items-center gap-3.5 animate-scale-up pointer-events-auto max-w-sm">
          <div className="relative flex items-center justify-center">
            {/* Spinning external ring */}
            <div className="w-6 h-6 rounded-full border-[3px] border-brand-100 border-t-brand-600 animate-spin" />
            {/* Pulsing inner dot */}
            <div className="absolute w-2 h-2 bg-brand-600 rounded-full animate-ping" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-gray-800 font-sans tracking-tight leading-none">{message}</span>
            {subtitle && <span className="text-[10px] text-gray-450 font-medium mt-1 leading-none">{subtitle}</span>}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-3 font-sans">
        <div className="relative flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-3 border-brand-100 border-t-brand-600 animate-spin" />
          <div className="absolute w-2.5 h-2.5 bg-brand-600 rounded-full animate-pulse" />
        </div>
        <p className="text-xs font-bold text-gray-700 tracking-tight">{message}</p>
        {subtitle && <p className="text-[10px] text-gray-400 font-medium">{subtitle}</p>}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="relative w-full max-w-sm bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-2xl rounded-3xl p-8 text-center space-y-6 animate-scale-up">
        {/* Loader Illustration container */}
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
          {/* Animated Background Ring */}
          <div className="absolute inset-0 bg-brand-50 rounded-full border border-brand-100/50 animate-pulse-soft" />
          {/* Spinning gradient border */}
          <div className="absolute w-12 h-12 rounded-full border-4 border-slate-100 border-t-brand-600 border-r-indigo-500 animate-spin" />
          {/* Pulsing branding center */}
          <div className="absolute w-4 h-4 bg-brand-600 rounded-full shadow-sm animate-ping" />
          <div className="absolute w-3.5 h-3.5 bg-brand-600 rounded-full shadow-sm" />
        </div>

        <div className="space-y-2">
          <h3 className="text-base font-extrabold text-gray-900 tracking-tight leading-tight">
            {message}
          </h3>
          {subtitle && (
            <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
