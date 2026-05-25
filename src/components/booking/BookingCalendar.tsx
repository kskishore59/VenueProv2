import { useState, useMemo } from 'react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  format, isSameMonth, isSameDay, isToday, addMonths, subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight, CalendarCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';
import { useDataStore } from '@/stores/data-store';
import type { Booking, BookingStatus } from '@/types/booking';
import { StatusBadge } from '@/components/shared/StatusBadge';

const STATUS_COLORS: Record<BookingStatus, string> = {
  confirmed: 'bg-brand-500',
  hold: 'bg-warning-500',
  inquiry: 'bg-gray-400',
  completed: 'bg-success-500',
  cancelled: 'bg-danger-500',
};

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function BookingCalendar() {
  const selectedDate = useUIStore((s) => s.selectedDate);
  const setSelectedDate = useUIStore((s) => s.setSelectedDate);
  const openQuickAdd = useUIStore((s) => s.openQuickAdd);
  const openBookingDrawer = useUIStore((s) => s.openBookingDrawer);

  const bookings = useDataStore((s) => s.bookings);
  const getCustomerById = useDataStore((s) => s.getCustomerById);

  const [currentMonth, setCurrentMonth] = useState(new Date());

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const bookingsByDate = useMemo(() => {
    const map: Record<string, Booking[]> = {};
    bookings.forEach((b) => {
      if (b.status === 'cancelled') return;
      const key = b.event_date;
      if (!map[key]) map[key] = [];
      map[key].push(b);
    });
    return map;
  }, [bookings]);

  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  return (
    <div className="bg-[#fafaf9] rounded-2xl w-full p-4 border border-gray-200 shadow-sm overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100/70">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-gray-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-xs font-semibold text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b border-gray-100/70">
        {DAY_NAMES.map((day) => (
          <div key={day} className="px-2 py-2.5 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, idx) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayBookings = bookingsByDate[dateKey] || [];
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);
          const maxShow = 2;

          const nonCancelledBookings = dayBookings.filter((b) => b.status !== 'cancelled');
          const primaryStatus = (() => {
            if (nonCancelledBookings.length === 0) return null;
            if (nonCancelledBookings.some((b) => b.status === 'confirmed')) return 'confirmed';
            if (nonCancelledBookings.some((b) => b.status === 'hold')) return 'hold';
            if (nonCancelledBookings.some((b) => b.status === 'completed')) return 'completed';
            return nonCancelledBookings[0].status;
          })();

          return (
            <div
              key={idx}
              onClick={() => {
                setSelectedDate(day);
                if (dayBookings.length === 0) {
                  openQuickAdd(dateKey);
                }
              }}
              className={cn(
                'calendar-day relative min-h-[80px] md:min-h-[100px] p-1.5 border-b border-r border-gray-100/70 cursor-pointer transition-all duration-200',
                !isCurrentMonth && 'bg-gray-100/30',
                isCurrentMonth && !primaryStatus && 'bg-white hover:bg-gray-50/50',

                // Color codes for status-based calendar cell backgrounds
                isCurrentMonth && primaryStatus === 'confirmed' && 'bg-brand-50/60 hover:bg-brand-50/80',
                isCurrentMonth && primaryStatus === 'hold' && 'bg-warning-50/60 hover:bg-warning-50/80',
                isCurrentMonth && primaryStatus === 'inquiry' && 'bg-gray-100/50 hover:bg-gray-100/70',
                isCurrentMonth && primaryStatus === 'completed' && 'bg-success-50/60 hover:bg-success-50/80',

                !isCurrentMonth && primaryStatus === 'confirmed' && 'bg-brand-50/30 hover:bg-brand-50/40',
                !isCurrentMonth && primaryStatus === 'hold' && 'bg-warning-50/30 hover:bg-warning-50/40',
                !isCurrentMonth && primaryStatus === 'inquiry' && 'bg-gray-150/40 hover:bg-gray-150/60',
                !isCurrentMonth && primaryStatus === 'completed' && 'bg-success-50/30 hover:bg-success-50/40',

                isSelected && 'ring-2 ring-brand-500 ring-inset z-10',
                isTodayDate && !isSelected && 'bg-blue-50/40',
              )}
            >
              {/* Date number */}
              <div className={cn(
                'flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold mb-1',
                isTodayDate && 'bg-brand-600 text-white shadow-2xs',
                !isTodayDate && isCurrentMonth && (
                  primaryStatus === 'confirmed' ? 'text-brand-800' :
                    primaryStatus === 'hold' ? 'text-warning-800' :
                      primaryStatus === 'completed' ? 'text-success-800' :
                        'text-gray-700'
                ),
                !isCurrentMonth && 'text-gray-300',
              )}>
                {format(day, 'd')}
              </div>

              {/* Booking pills */}
              <div className="space-y-0.5">
                {dayBookings.slice(0, maxShow).map((booking) => {
                  const customer = getCustomerById(booking.customer_id);
                  return (
                    <div
                      key={booking.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        openBookingDrawer(booking.id);
                      }}
                      className={cn(
                        'flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] md:text-[11px] font-medium truncate',
                        'transition-all duration-150 hover:opacity-80 cursor-pointer',
                        booking.status === 'confirmed' && 'bg-brand-100 text-brand-700',
                        booking.status === 'hold' && 'bg-warning-50 text-warning-600',
                        booking.status === 'inquiry' && 'bg-gray-100 text-gray-600',
                        booking.status === 'completed' && 'bg-success-50 text-success-500',
                      )}
                    >
                      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', STATUS_COLORS[booking.status])} />
                      <span className="truncate">{customer?.name.split(' ')[0] || 'Booking'}</span>
                    </div>
                  );
                })}
                {dayBookings.length > maxShow && (
                  <div className="px-1.5 text-[10px] font-semibold text-gray-400">
                    +{dayBookings.length - maxShow} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Status Legend */}
      <div className="flex items-center gap-4 px-5 py-3 border-t border-gray-100/70 bg-gray-100/20">
        <span className="text-[11px] font-medium text-gray-400">Status:</span>
        {(['confirmed', 'hold', 'inquiry', 'completed'] as BookingStatus[]).map((status) => (
          <div key={status} className="flex items-center gap-1.5">
            <span className={cn('w-2 h-2 rounded-full', STATUS_COLORS[status])} />
            <span className="text-[11px] text-gray-500 capitalize">{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
