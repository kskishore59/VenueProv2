import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ErrorFallbackProps {
  error: Error;
  reset: () => void;
  variant?: 'full' | 'widget';
  title?: string;
  message?: string;
}

export function ErrorFallback({
  error,
  reset,
  variant = 'full',
  title = 'Something went wrong',
  message = 'VenuePro encountered an unexpected error. Your data is safe in our system.',
}: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const textToCopy = `${error.name}: ${error.message}\n\nStack Trace:\n${error.stack || 'No stack trace available'}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success('Technical details copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  if (variant === 'widget') {
    return (
      <div className="flex flex-col items-center justify-center p-6 border border-rose-100 bg-rose-50/30 rounded-2xl text-center space-y-3 animate-fade-in-up">
        <div className="p-3 bg-rose-100 text-rose-600 rounded-full">
          <AlertTriangle className="w-6 h-6 animate-pulse" />
        </div>
        <div className="space-y-1">
          <h4 className="font-semibold text-ink text-sm">{title}</h4>
          <p className="text-xs text-slate max-w-xs">{error.message}</p>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 active:scale-95 transition-all rounded-lg shadow-sm"
        >
          <RefreshCw className="w-3 h-3" />
          Retry Widget
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="relative w-full max-w-xl bg-white/70 backdrop-blur-md border border-slate-200 shadow-2xl rounded-3xl overflow-hidden p-6 sm:p-8 md:p-10 text-center space-y-6 sm:space-y-8 animate-fade-in-up">
        {/* Decorative Background Blob */}
        <div className="absolute top-[-50px] left-[-50px] w-48 h-48 bg-rose-100 rounded-full filter blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute bottom-[-50px] right-[-50px] w-48 h-48 bg-blue-50 rounded-full filter blur-3xl opacity-60 pointer-events-none" />

        <div className="relative flex flex-col items-center space-y-4">
          <div className="relative p-4 bg-rose-50 rounded-full border border-rose-100">
            <AlertTriangle className="w-12 h-12 text-rose-600 animate-bounce" />
            <span className="absolute top-1 right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500"></span>
            </span>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">{title}</h1>
            <p className="text-sm sm:text-base text-slate max-w-md mx-auto">{message}</p>
          </div>
        </div>

        {/* Technical Error Details */}
        <div className="border border-slate-200 bg-slate-50/50 rounded-2xl overflow-hidden text-left transition-all duration-300">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between px-4 py-3 text-xs sm:text-sm font-semibold text-slate hover:bg-slate-50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              Technical Error Details
            </span>
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showDetails && (
            <div className="p-4 border-t border-slate-200 bg-slate-900 text-slate-100 font-mono text-[11px] sm:text-xs leading-relaxed overflow-x-auto max-h-60 space-y-3 relative">
              <button
                onClick={copyToClipboard}
                className="absolute top-3 right-3 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors rounded-lg border border-slate-700"
                title="Copy details"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <div className="font-semibold text-rose-400 pr-8">
                {error.name}: {error.message}
              </div>
              <pre className="whitespace-pre-wrap select-all font-mono opacity-85">
                {error.stack}
              </pre>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
          <button
            onClick={reset}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-blue hover:bg-blue/90 active:scale-98 transition-all rounded-xl shadow-lg shadow-blue/20"
          >
            <RefreshCw className="w-4 h-4 animate-spin-hover" />
            Try Again
          </button>
          <button
            onClick={handleGoHome}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 font-semibold text-slate hover:text-ink bg-slate-100 hover:bg-slate-200/80 active:scale-98 transition-all rounded-xl"
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
