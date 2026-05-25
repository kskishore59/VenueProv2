import { useState, useMemo, useRef, useEffect } from 'react';
import {
  format, startOfMonth, endOfMonth, startOfWeek,
  endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO, isValid
} from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (val: string) => void;
  id?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function DatePicker({ value, onChange, id, placeholder = 'Select date', required, className }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const parsed = parseISO(value);
    return isValid(parsed) ? parsed : new Date();
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync currentMonth when value changes
  useEffect(() => {
    const parsed = parseISO(value);
    if (isValid(parsed)) {
      setCurrentMonth(parsed);
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

  const selectedDate = useMemo(() => {
    const parsed = parseISO(value);
    return isValid(parsed) ? parsed : null;
  }, [value]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const DAY_NAMES = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const handleSelect = (day: Date) => {
    const formatted = format(day, 'yyyy-MM-dd');
    onChange(formatted);
    setIsOpen(false);
  };

  const displayValue = selectedDate ? format(selectedDate, 'dd-MM-yyyy') : '';

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
          <Calendar className="w-4 h-4" />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-[280px] bg-white border border-gray-150 rounded-2xl shadow-xl p-3.5 animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-800">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-1 rounded-lg hover:bg-gray-150 transition-colors text-gray-500"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-1 rounded-lg hover:bg-gray-150 transition-colors text-gray-500"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Week Days */}
          <div className="grid grid-cols-7 text-center mb-1">
            {DAY_NAMES.map((name, i) => (
              <span key={i} className="text-[10px] font-semibold text-gray-400 uppercase">
                {name}
              </span>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {calendarDays.map((day, idx) => {
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSel = selectedDate ? isSameDay(day, selectedDate) : false;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelect(day)}
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-all",
                    isCurrentMonth ? "text-gray-700 hover:bg-gray-100" : "text-gray-300 hover:bg-gray-50/50",
                    isSel && "!bg-brand-600 !text-white shadow-2xs",
                  )}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
