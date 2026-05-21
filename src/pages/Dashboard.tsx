import { useMemo } from 'react';
import { CalendarCheck, IndianRupee, AlertCircle, Clock, ArrowRight, PhoneIncoming } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { BookingCalendar } from '@/components/booking/BookingCalendar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { WhatsAppButton } from '@/components/shared/WhatsAppButton';
import { cn, formatCurrency, formatDateReadable, formatTime, getRelativeTime } from '@/lib/utils';
import { useDataStore } from '@/stores/data-store';
import { useUIStore } from '@/stores/ui-store';
import { eventTypeLabels, type EventType } from '@/types/booking';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { ErrorFallback } from '@/components/shared/ErrorFallback';

export default function Dashboard() {
  const bookings = useDataStore((s) => s.bookings);
  const payments = useDataStore((s) => s.payments);
  const leads = useDataStore((s) => s.leads);

  const getDashboardStats = useDataStore((s) => s.getDashboardStats);
  const getUpcomingBookings = useDataStore((s) => s.getUpcomingBookings);
  const getFollowUpsDue = useDataStore((s) => s.getFollowUpsDue);
  const getCustomerById = useDataStore((s) => s.getCustomerById);
  const getHallById = useDataStore((s) => s.getHallById);

  const openBookingDrawer = useUIStore((s) => s.openBookingDrawer);
  const openLeadDrawer = useUIStore((s) => s.openLeadDrawer);

  const stats = useMemo(() => getDashboardStats(), [getDashboardStats, bookings, payments]);
  const upcoming = useMemo(() => getUpcomingBookings(7), [getUpcomingBookings, bookings]);
  const followUps = useMemo(() => getFollowUpsDue(), [getFollowUpsDue, leads]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        <StatCard
          icon={CalendarCheck}
          label="Today's Events"
          value={String(stats.todaysEvents)}
          sublabel={`${stats.tomorrowEvents} event${stats.tomorrowEvents !== 1 ? 's' : ''} tomorrow`}
          color="blue"
          delay={50}
        />
        <StatCard
          icon={IndianRupee}
          label="This Month Revenue"
          value={stats.thisMonthRevenue}
          sublabel={`${stats.thisMonthBookings} booking${stats.thisMonthBookings !== 1 ? 's' : ''}`}
          color="green"
          delay={100}
        />
        <StatCard
          icon={AlertCircle}
          label="Pending Collections"
          value={stats.pendingAmount}
          sublabel={`${stats.pendingCustomers} customer${stats.pendingCustomers !== 1 ? 's' : ''} owe money`}
          color="amber"
          delay={150}
        />
      </div>

      {/* Calendar */}
      <ErrorBoundary
        fallback={(error, reset) => (
          <ErrorFallback
            error={error}
            reset={reset}
            variant="widget"
            title="Failed to Load Booking Calendar"
          />
        )}
      >
        <BookingCalendar />
      </ErrorBoundary>


      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming Events */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                <Clock className="w-4 h-4 text-brand-600" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Upcoming (7 days)</h3>
            </div>
            <span className="text-xs font-medium text-gray-400">{upcoming.length} events</span>
          </div>
          <div className="divide-y divide-gray-50 max-h-[360px] overflow-y-auto">
            {upcoming.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-400">No upcoming events this week</div>
            ) : (
              upcoming.map((booking) => {
                const customer = getCustomerById(booking.customer_id);
                const hall = getHallById(booking.hall_id);
                return (
                  <div key={booking.id} onClick={() => openBookingDrawer(booking.id)}
                    className="flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors group">
                    <div className="flex-shrink-0 w-12 h-14 rounded-xl bg-gradient-to-b from-brand-50 to-brand-100/50 flex flex-col items-center justify-center border border-brand-100">
                      <span className="text-[10px] font-bold text-brand-400 uppercase">
                        {formatDateReadable(booking.event_date).split(' ')[1]}
                      </span>
                      <span className="text-lg font-extrabold text-brand-700 -mt-0.5">
                        {formatDateReadable(booking.event_date).split(' ')[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-gray-900 truncate">{customer?.name || 'Unknown'}</span>
                        <StatusBadge type="booking" status={booking.status} />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{hall?.name}</span>
                        <span>•</span>
                        <span>{formatTime(booking.start_time)} – {formatTime(booking.end_time)}</span>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-700">{formatCurrency(booking.total_amount_paise)}</span>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-brand-500 transition-colors" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Follow-ups Due */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-warning-50 flex items-center justify-center">
                <PhoneIncoming className="w-4 h-4 text-warning-500" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Follow-ups Due</h3>
            </div>
            <span className="text-xs font-medium text-gray-400">{followUps.length} pending</span>
          </div>
          <div className="divide-y divide-gray-50 max-h-[360px] overflow-y-auto">
            {followUps.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-400">All caught up! No follow-ups due.</div>
            ) : (
              followUps.map((lead) => (
                <div key={lead.id} onClick={() => openLeadDrawer(lead.id)}
                  className="flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-amber-700">{lead.name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-gray-900 truncate">{lead.name}</span>
                      <StatusBadge type="lead" status={lead.status} />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{lead.event_type ? eventTypeLabels[lead.event_type as EventType] || lead.event_type : 'Event'}</span>
                      {lead.follow_up_date && (
                        <>
                          <span>•</span>
                          <span className="text-warning-500 font-medium">Due {getRelativeTime(lead.follow_up_date + 'T00:00:00Z')}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <WhatsAppButton phone={lead.phone} size="sm" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
