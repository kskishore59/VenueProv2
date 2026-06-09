import { useState, useMemo } from 'react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  format, isSameMonth, isSameDay, isToday, addMonths, subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Sun, Moon, Plus, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';
import { useDataStore } from '@/stores/data-store';
import type { Booking, BookingStatus } from '@/types/booking';

const STATUS_COLORS: Record<BookingStatus, string> = {
  confirmed: 'bg-brand-500',
  hold: 'bg-warning-500',
  inquiry: 'bg-slate-400',
  completed: 'bg-success-500',
  cancelled: 'bg-rose-500',
};

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function BookingCalendar() {
  const selectedDate = useUIStore((s) => s.selectedDate);
  const setSelectedDate = useUIStore((s) => s.setSelectedDate);
  const openQuickAdd = useUIStore((s) => s.openQuickAdd);
  const openBookingDrawer = useUIStore((s) => s.openBookingDrawer);
  const openDaySummary = useUIStore((s) => s.openDaySummary);

  const bookings = useDataStore((s) => s.bookings);
  const halls = useDataStore((s) => s.halls);
  const getCustomerById = useDataStore((s) => s.getCustomerById);
  const getHallById = useDataStore((s) => s.getHallById);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedHallId, setSelectedHallId] = useState<string>('all');
  const [calendarView, setLocalCalendarView] = useState<'month' | 'week'>('month');

  // Filter bookings based on selected hall
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (b.status === 'cancelled') return false;
      if (selectedHallId !== 'all' && b.hall_id !== selectedHallId) return false;
      return true;
    });
  }, [bookings, selectedHallId]);

  // Group bookings by date key
  const bookingsByDate = useMemo(() => {
    const map: Record<string, Booking[]> = {};
    filteredBookings.forEach((b) => {
      const key = b.event_date;
      if (!map[key]) map[key] = [];
      map[key].push(b);
    });
    return map;
  }, [filteredBookings]);

  // Calculate grid days
  const calendarDays = useMemo(() => {
    if (calendarView === 'month') {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
      const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
      return eachDayOfInterval({ start: calStart, end: calEnd });
    } else {
      // Week View: Get the 7 days of the week for the active date
      const calStart = startOfWeek(currentMonth, { weekStartsOn: 1 });
      const calEnd = endOfWeek(currentMonth, { weekStartsOn: 1 });
      return eachDayOfInterval({ start: calStart, end: calEnd });
    }
  }, [currentMonth, calendarView]);

  // Title formatting in header
  const dateTitle = useMemo(() => {
    if (calendarView === 'month') {
      return format(currentMonth, 'MMMM yyyy');
    } else {
      const start = startOfWeek(currentMonth, { weekStartsOn: 1 });
      const end = endOfWeek(currentMonth, { weekStartsOn: 1 });
      if (start.getMonth() === end.getMonth()) {
        return `${format(start, 'MMMM d')} – ${format(end, 'd, yyyy')}`;
      } else {
        return `${format(start, 'MMMM d')} – ${format(end, 'MMMM d, yyyy')}`;
      }
    }
  }, [currentMonth, calendarView]);

  // Next / Prev actions
  const handlePrev = () => {
    if (calendarView === 'month') {
      setCurrentMonth(subMonths(currentMonth, 1));
    } else {
      const d = new Date(currentMonth);
      d.setDate(d.getDate() - 7);
      setCurrentMonth(d);
    }
  };

  const handleNext = () => {
    if (calendarView === 'month') {
      setCurrentMonth(addMonths(currentMonth, 1));
    } else {
      const d = new Date(currentMonth);
      d.setDate(d.getDate() + 7);
      setCurrentMonth(d);
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  // Helper to check shift timing (Morning vs Evening slots)
  const getSlotInfo = (startTime: string) => {
    const hour = parseInt(startTime.split(':')[0], 10);
    if (hour < 15) {
      return { label: 'Morning', icon: <Sun className="w-3 h-3 text-amber-500 inline mr-0.5" />, color: 'bg-amber-50 text-amber-800 border-amber-100' };
    }
    return { label: 'Evening', icon: <Moon className="w-3 h-3 text-indigo-500 inline mr-0.5" />, color: 'bg-indigo-50 text-indigo-800 border-indigo-100' };
  };

  return (
    <div className="bg-[#fafaf9] rounded-2xl w-full p-4 border border-gray-200/80 shadow-xs relative animate-fade-in-up">
      {/* Calendar Header / Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-5 py-4 border-b border-gray-100/70">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <h3 className="text-lg font-black text-gray-900 tracking-tight font-display min-w-[150px]">
            {dateTitle}
          </h3>

          {/* Hall Filter Selector */}
          <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-xl border border-gray-200 shadow-2xs shrink-0">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={selectedHallId}
              onChange={(e) => setSelectedHallId(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-transparent outline-none cursor-pointer border-none p-0 pr-6"
            >
              <option value="all">All Venues / Halls</option>
              {halls.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          {/* Calendar View Toggle Slider */}
          <div className="bg-slate-100 p-0.5 rounded-xl border border-slate-200/60 flex items-center shrink-0">
            <button
              onClick={() => setLocalCalendarView('month')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-transparent border-none cursor-pointer",
                calendarView === 'month' ? "bg-white text-slate-800 shadow-2xs" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Month
            </button>
            <button
              onClick={() => setLocalCalendarView('week')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-transparent border-none cursor-pointer",
                calendarView === 'week' ? "bg-white text-slate-800 shadow-2xs" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Week View
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={goToToday}
              className="px-3.5 py-1.5 text-xs font-bold text-brand-600 bg-brand-50 border border-brand-100 rounded-xl hover:bg-brand-100 transition-colors shadow-2xs"
            >
              Today
            </button>
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-slate-500 shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-slate-500 shadow-2xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Day Names Row */}
      <div className="grid grid-cols-7 border-b border-gray-100/70 bg-slate-50/50">
        {DAY_NAMES.map((day) => (
          <div key={day} className="px-2 py-3 text-center text-[10px] font-black tracking-wider text-slate-400 uppercase">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 bg-slate-100/10">
        {calendarDays.map((day, idx) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayBookings = bookingsByDate[dateKey] || [];
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);
          const maxShow = calendarView === 'week' ? 5 : 2;

          const primaryStatus = (() => {
            if (dayBookings.length === 0) return null;
            if (dayBookings.some((b) => b.status === 'confirmed')) return 'confirmed';
            if (dayBookings.some((b) => b.status === 'hold')) return 'hold';
            if (dayBookings.some((b) => b.status === 'completed')) return 'completed';
            return dayBookings[0].status;
          })();

          return (
            <div
              key={idx}
              onClick={() => {
                setSelectedDate(day);
                if (dayBookings.length === 0) {
                  openQuickAdd(dateKey);
                } else {
                  openDaySummary(dateKey);
                }
              }}
              className={cn(
                'calendar-day relative p-2 border-b border-r border-gray-150/60 cursor-pointer transition-all duration-200 group flex flex-col justify-between',
                calendarView === 'week' ? 'min-h-[220px] md:min-h-[260px]' : 'min-h-[90px] md:min-h-[115px]',
                !isCurrentMonth && 'bg-gray-100/30 opacity-70',
                isCurrentMonth && !primaryStatus && 'bg-white hover:bg-slate-50/40',

                // Color highlights for date cells
                isCurrentMonth && primaryStatus === 'confirmed' && 'bg-brand-50/30 hover:bg-brand-50/50',
                isCurrentMonth && primaryStatus === 'hold' && 'bg-warning-50/30 hover:bg-warning-50/50',
                isCurrentMonth && primaryStatus === 'inquiry' && 'bg-slate-100/40 hover:bg-slate-100/60',
                isCurrentMonth && primaryStatus === 'completed' && 'bg-success-50/30 hover:bg-success-50/50',

                isSelected && 'ring-2 ring-brand-500 ring-inset z-10',
                isTodayDate && !isSelected && 'bg-blue-50/40',
              )}
            >
              {/* Tooltip Card for hover details */}
              {dayBookings.length > 0 && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[220px] md:w-[260px] bg-slate-900/95 text-white backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-lg z-50 pointer-events-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 hidden md:block text-left">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1.5 mb-2 flex items-center justify-between">
                    <span>📅 Day Schedule</span>
                    <span className="bg-brand-500/20 text-brand-400 px-1.5 py-0.5 rounded font-mono text-[9px] font-black">
                      {dayBookings.length} {dayBookings.length === 1 ? 'Event' : 'Events'}
                    </span>
                  </div>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-0.5 scrollbar-thin scrollbar-thumb-slate-700">
                    {dayBookings.map((booking) => {
                      const customer = getCustomerById(booking.customer_id);
                      const hall = getHallById(booking.hall_id);
                      const slotInfo = getSlotInfo(booking.start_time);
                      return (
                        <div key={booking.id} className="text-[10px] border-b border-slate-800 pb-1.5 last:border-0 last:pb-0 font-sans">
                          <div className="flex justify-between items-center gap-1">
                            <span className="font-extrabold truncate text-white">{customer?.name}</span>
                            <span className={cn("text-[8px] px-1 py-0.2 rounded font-black uppercase border shrink-0 scale-90", slotInfo.color)}>
                              {booking.status}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-400 font-semibold mt-0.5">
                            <span className="flex items-center gap-0.5">{slotInfo.icon} {booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}</span>
                            <span className="truncate max-w-[80px]">{hall?.name}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                {/* Date header block */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className={cn(
                    'flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold font-display',
                    isTodayDate && 'bg-brand-650 text-white shadow-sm shadow-brand-500/20',
                    !isTodayDate && isCurrentMonth && (
                      primaryStatus === 'confirmed' ? 'text-brand-800' :
                        primaryStatus === 'hold' ? 'text-warning-800' :
                          primaryStatus === 'completed' ? 'text-success-800' :
                            'text-slate-800'
                    ),
                    !isCurrentMonth && 'text-slate-300',
                  )}>
                    {format(day, 'd')}
                  </div>

                  {/* Tiny Quick Add Trigger on Cell Hover */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openQuickAdd(dateKey);
                    }}
                    className="w-5.5 h-5.5 rounded-full bg-slate-100 hover:bg-brand-600 hover:text-white flex items-center justify-center text-slate-400 opacity-0 group-hover:opacity-100 transition-all shadow-3xs cursor-pointer border-none hidden sm:flex"
                    title="Log New Booking"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Booking lists or detailed cards */}
                <div className="space-y-1">
                  {dayBookings.slice(0, maxShow).map((booking) => {
                    const customer = getCustomerById(booking.customer_id);
                    const hall = getHallById(booking.hall_id);
                    const slotInfo = getSlotInfo(booking.start_time);

                    if (calendarView === 'week') {
                      // Detailed Card view for Week View
                      return (
                        <div
                          key={booking.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            openBookingDrawer(booking.id);
                          }}
                          className={cn(
                            'p-2 rounded-xl border text-[10px] md:text-[11px] space-y-1 transition-all hover:-translate-y-0.5 hover:shadow-2xs cursor-pointer',
                            booking.status === 'confirmed' && 'bg-brand-50 border-brand-100 text-brand-850',
                            booking.status === 'hold' && 'bg-warning-50 border-warning-100 text-warning-850',
                            booking.status === 'inquiry' && 'bg-slate-50 border-slate-200 text-slate-700',
                            booking.status === 'completed' && 'bg-success-50 border-success-100 text-success-850',
                          )}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-extrabold truncate max-w-[80px]">{customer?.name}</span>
                            <span className={cn("text-[8px] px-1 py-0.5 rounded font-black uppercase border shrink-0 scale-90", slotInfo.color)}>
                              {slotInfo.icon}{slotInfo.label}
                            </span>
                          </div>
                          <p className="text-[9px] text-slate-400 font-bold">
                            {booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}
                          </p>
                          <div className="flex justify-between items-center text-[8px] text-slate-400 font-bold border-t border-slate-100/50 pt-1 mt-1">
                            <span className="truncate max-w-[50px]">{hall?.name}</span>
                            <span>{booking.guest_count}p</span>
                          </div>
                        </div>
                      );
                    }

                    // Simple Pill view for Month View
                    return (
                      <div
                        key={booking.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          openBookingDrawer(booking.id);
                        }}
                        className={cn(
                          'flex items-center justify-between gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold truncate transition-all hover:scale-102 cursor-pointer',
                          booking.status === 'confirmed' && 'bg-brand-100 text-brand-800',
                          booking.status === 'hold' && 'bg-warning-100 text-warning-800',
                          booking.status === 'inquiry' && 'bg-slate-100 text-slate-650',
                          booking.status === 'completed' && 'bg-success-100 text-success-800',
                        )}
                      >
                        <div className="flex items-center gap-1 min-w-0">
                          <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', STATUS_COLORS[booking.status])} />
                          <span className="truncate">{customer?.name.split(' ')[0] || 'Booking'}</span>
                        </div>
                        <span className="text-[8px] opacity-70 shrink-0 font-medium">{slotInfo.icon}</span>
                      </div>
                    );
                  })}

                  {dayBookings.length > maxShow && (
                    <div className="px-1 text-[9px] font-black text-slate-400 hover:underline">
                      +{dayBookings.length - maxShow} more slots
                    </div>
                  )}
                </div>
              </div>

              {/* Hall indicator dots at the bottom of the cell (only in month view) */}
              {calendarView === 'month' && dayBookings.length > 0 && (
                <div className="flex gap-1 overflow-hidden h-1.5 mt-2">
                  {dayBookings.slice(0, 4).map((b) => (
                    <span key={b.id} className={cn('w-1.5 h-1.5 rounded-full', STATUS_COLORS[b.status])} title={b.booking_number} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Status Legend & Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-3 border-t border-gray-100/70 bg-slate-50/50">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Status Colors:</span>
          {(['confirmed', 'hold', 'inquiry', 'completed'] as BookingStatus[]).map((status) => (
            <div key={status} className="flex items-center gap-1.5">
              <span className={cn('w-2 h-2 rounded-full', STATUS_COLORS[status])} />
              <span className="text-[11px] text-slate-600 font-bold capitalize">{status}</span>
            </div>
          ))}
        </div>
        
        <div className="text-[10px] text-slate-400 font-bold flex items-center gap-3">
          <span>☀️ = Morning Shift</span>
          <span>🌙 = Evening Shift</span>
          <span>(Click slots to manage/book)</span>
        </div>
      </div>
    </div>
  );
}
