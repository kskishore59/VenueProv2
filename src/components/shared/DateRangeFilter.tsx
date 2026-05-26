import { useState, useRef, useEffect } from 'react';
import {
  format, startOfDay, endOfDay, startOfWeek, endOfWeek,
  startOfMonth, endOfMonth, addDays, subDays, parseISO, isValid
} from 'date-fns';
import { Calendar, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DatePicker } from './DatePicker';

export type DateRangePreset = 'all' | 'today' | 'week' | 'month' | 'next30' | 'custom';

interface DateRangeFilterProps {
  onChange: (startDate: string | null, endDate: string | null, preset: DateRangePreset) => void;
  initialPreset?: DateRangePreset;
  align?: 'left' | 'right';
  className?: string;
}

export function DateRangeFilter({
  onChange,
  initialPreset = 'all',
  align = 'right',
  className,
}: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [preset, setPreset] = useState<DateRangePreset>(initialPreset);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePresetSelect = (selectedPreset: DateRangePreset) => {
    setPreset(selectedPreset);
    if (selectedPreset !== 'custom') {
      const { start, end } = calculateRangeDates(selectedPreset);
      onChange(start, end, selectedPreset);
      setIsOpen(false);
    }
  };

  const handleApplyCustom = () => {
    if (customStart && customEnd) {
      onChange(customStart, customEnd, 'custom');
      setIsOpen(false);
    }
  };

  const calculateRangeDates = (p: DateRangePreset): { start: string | null; end: string | null } => {
    const now = new Date();
    switch (p) {
      case 'today': {
        const d = format(now, 'yyyy-MM-dd');
        return { start: d, end: d };
      }
      case 'week': {
        const start = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        const end = format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        return { start, end };
      }
      case 'month': {
        const start = format(startOfMonth(now), 'yyyy-MM-dd');
        const end = format(endOfMonth(now), 'yyyy-MM-dd');
        return { start, end };
      }
      case 'next30': {
        const start = format(now, 'yyyy-MM-dd');
        const end = format(addDays(now, 30), 'yyyy-MM-dd');
        return { start, end };
      }
      case 'all':
      default:
        return { start: null, end: null };
    }
  };

  const getLabel = () => {
    switch (preset) {
      case 'today':
        return 'Today';
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      case 'next30':
        return 'Next 30 Days';
      case 'custom':
        if (customStart && customEnd) {
          const s = format(parseISO(customStart), 'dd MMM');
          const e = format(parseISO(customEnd), 'dd MMM');
          return `${s} – ${e}`;
        }
        return 'Custom Range';
      case 'all':
      default:
        return 'All Time';
    }
  };

  const presets: { value: DateRangePreset; label: string }[] = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'next30', label: 'Next 30 Days' },
    { value: 'custom', label: 'Custom Range...' },
  ];

  return (
    <div className={cn("relative z-30", className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 active:scale-98 transition-all text-xs font-semibold text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
      >
        <Calendar className="w-4 h-4 text-brand-600" />
        <span>{getLabel()}</span>
        <ChevronDown className={cn("w-3.5 h-3.5 text-gray-400 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className={cn(
          "absolute mt-1.5 w-64 bg-white border border-gray-150 rounded-2xl shadow-xl p-2.5 animate-scale-up",
          align === 'left' ? "left-0 origin-top-left" : "left-0 origin-top-left sm:left-auto sm:right-0 sm:origin-top-right"
        )}>
          <div className="space-y-0.5 mb-2 border-b border-gray-50 pb-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2">Filter Date Range</span>
          </div>

          <div className="space-y-0.5">
            {presets.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => handlePresetSelect(item.value)}
                className={cn(
                  "w-full text-left px-2 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors",
                  preset === item.value
                    ? "bg-brand-50 text-brand-700"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <span>{item.label}</span>
                {preset === item.value && <Check className="w-3.5 h-3.5 text-brand-600" />}
              </button>
            ))}
          </div>

          {preset === 'custom' && (
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-3 animate-fade-in">
              <div className="space-y-2">
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Start Date</label>
                  <DatePicker
                    value={customStart}
                    onChange={setCustomStart}
                    placeholder="YYYY-MM-DD"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">End Date</label>
                  <DatePicker
                    value={customEnd}
                    onChange={setCustomEnd}
                    placeholder="YYYY-MM-DD"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleApplyCustom}
                disabled={!customStart || !customEnd}
                className="w-full py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-xs"
              >
                Apply Range
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
