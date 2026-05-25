import { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimePickerProps {
  value: string; // HH:MM
  onChange: (val: string) => void;
  id?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function TimePicker({ value, onChange, id, placeholder = 'Select time', required, className }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse value (HH:MM) into 12h pieces
  const [hour, setHour] = useState('09');
  const [minute, setMinute] = useState('00');
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');

  useEffect(() => {
    if (value) {
      const parts = value.split(':');
      if (parts.length >= 2) {
        let h = parseInt(parts[0], 10);
        const m = parts[1].slice(0, 2);
        
        let p: 'AM' | 'PM' = 'AM';
        if (h >= 12) {
          p = 'PM';
          if (h > 12) h -= 12;
        } else if (h === 0) {
          h = 12;
        }
        
        setHour(String(h).padStart(2, '0'));
        setMinute(m);
        setPeriod(p);
      }
    }
  }, [value]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTimeChange = (newHour: string, newMin: string, newPeriod: 'AM' | 'PM') => {
    setHour(newHour);
    setMinute(newMin);
    setPeriod(newPeriod);

    // Convert to 24h format (HH:MM)
    let h = parseInt(newHour, 10);
    if (newPeriod === 'PM' && h < 12) h += 12;
    if (newPeriod === 'AM' && h === 12) h = 0;

    const formatted24h = `${String(h).padStart(2, '0')}:${newMin}`;
    onChange(formatted24h);
  };

  const hoursList = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minutesList = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

  const displayValue = value ? `${hour}:${minute} ${period}` : '';

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <div className="relative">
        <input
          type="text"
          id={id}
          value={displayValue}
          onClick={() => setIsOpen(!isOpen)}
          readOnly
          placeholder={placeholder}
          required={required}
          className={cn(
            "w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all cursor-pointer bg-white shadow-sm",
            "focus:ring-2 focus:ring-brand-200 focus:border-brand-500"
          )}
        />
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="absolute inset-y-0 right-0 flex items-center pr-3.5 cursor-pointer text-gray-400 hover:text-brand-600 transition-colors"
        >
          <Clock className="w-4 h-4" />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-60 bg-white border border-gray-150 rounded-2xl shadow-xl p-3 flex flex-col gap-3 animate-scale-in">
          <div className="grid grid-cols-3 gap-2 text-center h-40">
            {/* Hours Column */}
            <div className="overflow-y-auto custom-scrollbar flex flex-col gap-1 border-r border-gray-100 pr-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase mb-1 block sticky top-0 bg-white py-0.5">Hr</span>
              {hoursList.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => handleTimeChange(h, minute, period)}
                  className={cn(
                    "py-1 rounded-lg text-xs font-semibold transition-all",
                    hour === h ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {h}
                </button>
              ))}
            </div>

            {/* Minutes Column */}
            <div className="overflow-y-auto custom-scrollbar flex flex-col gap-1 border-r border-gray-100 pr-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase mb-1 block sticky top-0 bg-white py-0.5">Min</span>
              {minutesList.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleTimeChange(hour, m, period)}
                  className={cn(
                    "py-1 rounded-lg text-xs font-semibold transition-all",
                    minute === m ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* AM/PM Column */}
            <div className="flex flex-col gap-1.5 justify-center pl-1">
              <button
                type="button"
                onClick={() => handleTimeChange(hour, minute, 'AM')}
                className={cn(
                  "py-2 rounded-lg text-xs font-bold transition-all",
                  period === 'AM' ? "bg-brand-600 text-white shadow-2xs" : "text-gray-600 hover:bg-gray-50"
                )}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => handleTimeChange(hour, minute, 'PM')}
                className={cn(
                  "py-2 rounded-lg text-xs font-bold transition-all",
                  period === 'PM' ? "bg-brand-600 text-white shadow-2xs" : "text-gray-600 hover:bg-gray-50"
                )}
              >
                PM
              </button>
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-700 transition-colors border border-gray-150"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
