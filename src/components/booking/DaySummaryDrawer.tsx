import { useMemo } from 'react';
import { X, CalendarDays, Clock, MapPin, Users, IndianRupee, Plus } from 'lucide-react';
import { cn, formatCurrency, formatTime, getInitials } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { useUIStore } from '@/stores/ui-store';
import { useDataStore } from '@/stores/data-store';
import { useAuthStore } from '@/stores/auth-store';
import { hasPermission } from '@/lib/permissions';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { eventTypeLabels } from '@/types/booking';
import type { Booking, BookingStatus } from '@/types/booking';

const STATUS_STRIPE_COLORS: Record<BookingStatus, string> = {
  confirmed: 'bg-brand-500',
  hold: 'bg-warning-500',
  inquiry: 'bg-gray-400',
  completed: 'bg-success-500',
  cancelled: 'bg-danger-500',
};

export function DaySummaryDrawer() {
  const isOpen = useUIStore((s) => s.isDaySummaryOpen);
  const dateKey = useUIStore((s) => s.daySummaryDate);
  const closeDaySummary = useUIStore((s) => s.closeDaySummary);
  const openBookingDrawer = useUIStore((s) => s.openBookingDrawer);
  const openQuickAdd = useUIStore((s) => s.openQuickAdd);

  const bookings = useDataStore((s) => s.bookings);
  const getCustomerById = useDataStore((s) => s.getCustomerById);
  const getHallById = useDataStore((s) => s.getHallById);

  const role = useAuthStore((s) => s.profile?.role);
  const organization = useDataStore((s) => s.organization);
  const canCreateBooking = hasPermission(role, 'bookings', 'create', organization?.settings);

  const dayBookings = useMemo(() => {
    if (!dateKey) return [];
    return bookings
      .filter((b) => b.event_date === dateKey && b.status !== 'cancelled')
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [bookings, dateKey]);

  // Group bookings by hall for visual separation
  const hallGroups = useMemo(() => {
    const groups: Record<string, Booking[]> = {};
    dayBookings.forEach((b) => {
      if (!groups[b.hall_id]) groups[b.hall_id] = [];
      groups[b.hall_id].push(b);
    });
    return groups;
  }, [dayBookings]);

  if (!isOpen || !dateKey) return null;

  const formattedDate = (() => {
    try {
      return format(parseISO(dateKey), 'EEEE, d MMM yyyy');
    } catch {
      return dateKey;
    }
  })();

  const handleCardClick = (bookingId: string) => {
    closeDaySummary();
    openBookingDrawer(bookingId);
  };

  const handleAddBooking = () => {
    closeDaySummary();
    openQuickAdd(dateKey);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-50 drawer-overlay" onClick={closeDaySummary} />

      {/* Drawer Panel */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white z-50 shadow-2xl flex flex-col drawer-content">
        {/* Header */}
        <div className="relative px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-indigo-50/60 to-white">
          <button
            onClick={closeDaySummary}
            className="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays className="w-4 h-4 text-brand-600" />
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Day Summary</span>
          </div>
          <h2 className="text-lg font-extrabold text-gray-900 pr-10">{formattedDate}</h2>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-100">
              {dayBookings.length} {dayBookings.length === 1 ? 'event' : 'events'}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-50 text-gray-500 border border-gray-150">
              {Object.keys(hallGroups).length} {Object.keys(hallGroups).length === 1 ? 'hall' : 'halls'}
            </span>
          </div>
        </div>

        {/* Scrollable Booking Cards */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {dayBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="text-3xl mb-3">📭</span>
              <p className="text-sm font-semibold text-gray-500">No active events on this date</p>
              <p className="text-xs text-gray-400 mt-1">Cancelled bookings are hidden from this view.</p>
            </div>
          ) : (
            Object.entries(hallGroups).map(([hallId, hallBookings]) => {
              const hall = getHallById(hallId);
              return (
                <div key={hallId} className="space-y-2">
                  {/* Hall Group Header */}
                  {Object.keys(hallGroups).length > 1 && (
                    <div className="flex items-center gap-2 px-1 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{hall?.name || 'Unknown Hall'}</span>
                      <div className="flex-1 h-px bg-gray-100" />
                    </div>
                  )}

                  {/* Booking Cards */}
                  {hallBookings.map((booking) => {
                    const customer = getCustomerById(booking.customer_id);
                    const hall = getHallById(booking.hall_id);
                    return (
                      <div
                        key={booking.id}
                        onClick={() => handleCardClick(booking.id)}
                        className="group relative flex overflow-hidden rounded-2xl border border-gray-150 bg-white shadow-2xs hover:shadow-md hover:border-brand-200 transition-all duration-200 cursor-pointer active:scale-[0.99]"
                      >
                        {/* Left Status Stripe */}
                        <div className={cn('w-1.5 flex-shrink-0', STATUS_STRIPE_COLORS[booking.status])} />

                        {/* Card Content */}
                        <div className="flex-1 p-4 min-w-0">
                          {/* Top Row: Name + Status */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center flex-shrink-0 border border-brand-100/50">
                                <span className="text-xs font-bold text-brand-700">
                                  {customer ? getInitials(customer.name) : '?'}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate group-hover:text-brand-700 transition-colors">
                                  {customer?.name || 'Unknown Customer'}
                                </p>
                                <p className="text-[11px] text-gray-400 font-medium truncate">
                                  {eventTypeLabels[booking.event_type]}
                                </p>
                              </div>
                            </div>
                            <StatusBadge type="booking" status={booking.status} />
                          </div>

                          {/* Info Grid */}
                          <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-50">
                            {/* Time */}
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                              <span className="text-[11px] font-semibold text-gray-600">
                                {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
                              </span>
                            </div>

                            {/* Hall */}
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                              <span className="text-[11px] font-semibold text-gray-600 truncate">
                                {hall?.name || '—'}
                              </span>
                            </div>

                            {/* Guests */}
                            <div className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                              <span className="text-[11px] font-semibold text-gray-600">
                                {booking.guest_count || '—'} guests
                              </span>
                            </div>
                          </div>

                          {/* Amount Row */}
                          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-50">
                            <div className="flex items-center gap-1.5">
                              <IndianRupee className="w-3.5 h-3.5 text-gray-300" />
                              <span className="text-xs font-extrabold text-gray-900">
                                {formatCurrency(booking.total_amount_paise)}
                              </span>
                            </div>
                            <span className="text-[10px] font-semibold text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              View Details →
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {canCreateBooking && (
          <div className="border-t border-gray-100 px-6 py-4">
            <button
              onClick={handleAddBooking}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 active:scale-[0.98] transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Booking on {formattedDate.split(',')[0]}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
