import { useMemo, useState } from 'react';
import {
  CalendarCheck, IndianRupee, AlertCircle, Clock, ArrowRight,
  PhoneIncoming, Building2, Percent, Award
} from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { BookingCalendar } from '@/components/booking/BookingCalendar';
import { DaySummaryDrawer } from '@/components/booking/DaySummaryDrawer';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { WhatsAppButton } from '@/components/shared/WhatsAppButton';
import { CallButton } from '@/components/shared/CallButton';
import { cn, formatCurrency, formatDateReadable, formatTime, getRelativeTime } from '@/lib/utils';
import { useDataStore } from '@/stores/data-store';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { eventTypeLabels, type EventType } from '@/types/booking';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { ErrorFallback } from '@/components/shared/ErrorFallback';
import { DateRangeFilter, type DateRangePreset } from '@/components/shared/DateRangeFilter';

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

  const profile = useAuthStore((s) => s.profile);
  const organization = useDataStore((s) => s.organization);

  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null; preset: DateRangePreset }>({
    start: null,
    end: null,
    preset: 'all',
  });

  const stats = useMemo(() => getDashboardStats(), [getDashboardStats, bookings, payments]);

  const activeStats = useMemo(() => {
    if (dateRange.preset === 'all') {
      const totalLeads = leads.length;
      const wonLeads = leads.filter((l) => l.status === 'won').length;
      const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;
      const activeBookings = bookings.filter((b) => b.status !== 'cancelled').length;

      return {
        eventsLabel: "Today's Events",
        eventsValue: String(stats.todaysEvents),
        eventsSub: `${stats.tomorrowEvents} event${stats.tomorrowEvents !== 1 ? 's' : ''} tomorrow`,
        revenueLabel: "This Month Revenue",
        revenueValue: stats.thisMonthRevenue,
        revenueSub: `${stats.thisMonthBookings} booking${stats.thisMonthBookings !== 1 ? 's' : ''}`,
        pendingLabel: "Pending Collections",
        pendingValue: stats.pendingAmount,
        pendingSub: `${stats.pendingCustomers} customer${stats.pendingCustomers !== 1 ? 's' : ''} owe money`,
        inquiriesLabel: "Total Inquiries",
        inquiriesValue: String(totalLeads),
        inquiriesSub: `${leads.filter((l) => l.status === 'new').length} new in pipeline`,
        conversionLabel: "Lead Conversion Rate",
        conversionValue: `${conversionRate}%`,
        conversionSub: `${wonLeads} deals won`,
        bookingsLabel: "Total Bookings",
        bookingsValue: String(activeBookings),
        bookingsSub: `${bookings.filter((b) => b.status === 'confirmed').length} active bookings`,
      };
    }

    const rangeEventsList = bookings.filter((b) => {
      if (b.status === 'cancelled') return false;
      if (dateRange.start && b.event_date < dateRange.start) return false;
      if (dateRange.end && b.event_date > dateRange.end) return false;
      return b.status === 'confirmed' || b.status === 'completed';
    });

    const rangeBookingsList = bookings.filter((b) => {
      if (b.status === 'cancelled') return false;
      if (dateRange.start && b.event_date < dateRange.start) return false;
      if (dateRange.end && b.event_date > dateRange.end) return false;
      return true;
    });

    const rangeRevenueVal = payments
      .filter((p) => {
        if (!p.paid_at || p.status !== 'received') return false;
        const paidDate = p.paid_at.slice(0, 10);
        if (dateRange.start && paidDate < dateRange.start) return false;
        if (dateRange.end && paidDate > dateRange.end) return false;
        return true;
      })
      .reduce((sum, p) => sum + p.amount_paise, 0);

    const rangeOwed = rangeBookingsList
      .filter(b => b.status === 'confirmed' || b.status === 'hold')
      .reduce((sum, b) => sum + b.total_amount_paise, 0);
    const rangePaid = payments
      .filter((p) => p.status === 'received' && rangeBookingsList.some((b) => b.id === p.booking_id))
      .reduce((sum, p) => sum + p.amount_paise, 0);
    const rangePending = rangeOwed - rangePaid;

    const rangePendingCustomers = new Set(
      rangeBookingsList
        .filter((b) => {
          if (b.status !== 'confirmed' && b.status !== 'hold') return false;
          const paid = payments
            .filter((p) => p.booking_id === b.id && p.status === 'received')
            .reduce((s, p) => s + p.amount_paise, 0);
          return paid < b.total_amount_paise;
        })
        .map((b) => b.customer_id)
    ).size;

    const rangeLeadsList = leads.filter((l) => {
      const createdDate = l.created_at.slice(0, 10);
      if (dateRange.start && createdDate < dateRange.start) return false;
      if (dateRange.end && createdDate > dateRange.end) return false;
      return true;
    });

    const rangeWonLeadsCount = rangeLeadsList.filter((l) => l.status === 'won').length;
    const rangeNewLeadsCount = rangeLeadsList.filter((l) => l.status === 'new').length;
    const rangeConversionVal = rangeLeadsList.length > 0
      ? Math.round((rangeWonLeadsCount / rangeLeadsList.length) * 100)
      : 0;

    const rangeTotalBookingsCount = bookings.filter((b) => {
      if (b.status === 'cancelled') return false;
      if (dateRange.start && b.event_date < dateRange.start) return false;
      if (dateRange.end && b.event_date > dateRange.end) return false;
      return true;
    }).length;

    return {
      eventsLabel: "Events in Selected Period",
      eventsValue: String(rangeEventsList.length),
      eventsSub: `${rangeBookingsList.length} booking${rangeBookingsList.length !== 1 ? 's' : ''} total`,
      revenueLabel: "Revenue in Selected Period",
      revenueValue: rangeRevenueVal,
      revenueSub: `${rangeBookingsList.length} booking${rangeBookingsList.length !== 1 ? 's' : ''}`,
      pendingLabel: "Outstanding Collections",
      pendingValue: rangePending,
      pendingSub: `${rangePendingCustomers} customer${rangePendingCustomers !== 1 ? 's' : ''} with balance`,
      inquiriesLabel: "Inquiries in Period",
      inquiriesValue: String(rangeLeadsList.length),
      inquiriesSub: `${rangeNewLeadsCount} new in period`,
      conversionLabel: "Period Conversion Rate",
      conversionValue: `${rangeConversionVal}%`,
      conversionSub: `${rangeWonLeadsCount} deals won`,
      bookingsLabel: "Bookings in Period",
      bookingsValue: String(rangeTotalBookingsCount),
      bookingsSub: `${bookings.filter((b) => b.status === 'confirmed' && (!dateRange.start || b.event_date >= dateRange.start) && (!dateRange.end || b.event_date <= dateRange.end)).length} active bookings`,
    };
  }, [dateRange, bookings, payments, leads, stats]);

  const upcoming = useMemo(() => getUpcomingBookings(7), [getUpcomingBookings, bookings]);
  const followUps = useMemo(() => getFollowUpsDue(), [getFollowUpsDue, leads]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">

      {/* Simple Space-Saving Header Welcome Message */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200/60 pb-5">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
            <span>Welcome back, {profile?.full_name || 'User'}!</span>
            <span className="text-base animate-pulse">👋</span>
          </h1>
          <p className="text-[11px] text-slate-500 font-semibold mt-0.5 flex items-center gap-1.5">
            <span>Managing</span>
            <span className="font-extrabold text-indigo-700 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 inline" />
              {organization?.name || 'Workspace'}
            </span>
            <span className="w-1 h-1 rounded-full bg-emerald-500" />
            <span className="text-slate-400 font-bold">Local Sync Active</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600">
            Role: <span className="capitalize text-slate-900 font-bold">{profile?.role || 'staff'}</span>
          </div>
          <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-200/60 text-xs font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>Connection Successful</span>
          </div>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/40 backdrop-blur-xs p-4 rounded-2xl border border-gray-150/40 shadow-3xs">
        <div>
          <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Performance Overview</h2>
          <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Real-time statistics for the selected interval.</p>
        </div>
        <DateRangeFilter
          onChange={(start, end, preset) => setDateRange({ start, end, preset })}
        />
      </div>

      {/* Stats Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        <StatCard
          icon={CalendarCheck}
          label={activeStats.eventsLabel}
          value={activeStats.eventsValue}
          sublabel={activeStats.eventsSub}
          color="blue"
          delay={50}
        />
        <StatCard
          icon={IndianRupee}
          label={activeStats.revenueLabel}
          value={activeStats.revenueValue}
          sublabel={activeStats.revenueSub}
          color="green"
          delay={100}
        />
        <StatCard
          icon={AlertCircle}
          label={activeStats.pendingLabel}
          value={activeStats.pendingValue}
          sublabel={activeStats.pendingSub}
          color="amber"
          delay={150}
        />
      </div>

      {/* Stats Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        <StatCard
          icon={PhoneIncoming}
          label={activeStats.inquiriesLabel}
          value={activeStats.inquiriesValue}
          sublabel={activeStats.inquiriesSub}
          color="blue"
          delay={200}
        />
        <StatCard
          icon={Percent}
          label={activeStats.conversionLabel}
          value={activeStats.conversionValue}
          sublabel={activeStats.conversionSub}
          color="green"
          delay={250}
        />
        <StatCard
          icon={Award}
          label={activeStats.bookingsLabel}
          value={activeStats.bookingsValue}
          sublabel={activeStats.bookingsSub}
          color="rose"
          delay={300}
        />
      </div>

      {/* Lists Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming Events */}
        <div className="bg-white rounded-2xl border shadow-3xs border-gray-150/80 overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                <Clock className="w-4 h-4 text-brand-600" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">Upcoming (7 days)</h3>
            </div>
            <span className="text-[10px] font-bold bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{upcoming.length} events</span>
          </div>
          <div className="divide-y divide-gray-100 max-h-[360px] overflow-y-auto">
            {upcoming.length === 0 ? (
              <div className="py-16 text-center text-xs text-gray-400 font-medium">No upcoming events this week</div>
            ) : (
              upcoming.map((booking) => {
                const customer = getCustomerById(booking.customer_id);
                const hall = getHallById(booking.hall_id);
                return (
                  <div key={booking.id} onClick={() => openBookingDrawer(booking.id)}
                    className="flex items-center gap-4 px-5 py-3 cursor-pointer hover:bg-gray-50/50 transition-colors group">
                    <div className="flex-shrink-0 w-11 h-12 rounded-xl bg-gradient-to-b from-brand-50 to-brand-100/40 flex flex-col items-center justify-center border border-brand-100/80">
                      <span className="text-[8px] font-bold text-brand-400 uppercase leading-none">
                        {formatDateReadable(booking.event_date).split(' ')[1]}
                      </span>
                      <span className="text-base font-extrabold text-brand-700 leading-none mt-1">
                        {formatDateReadable(booking.event_date).split(' ')[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-extrabold text-slate-800 truncate">{customer?.name || 'Unknown'}</span>
                        <StatusBadge type="booking" status={booking.status} />
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold">
                        <span className="truncate max-w-[120px]">{hall?.name}</span>
                        <span>•</span>
                        <span>{formatTime(booking.start_time)} – {formatTime(booking.end_time)}</span>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{formatCurrency(booking.total_amount_paise)}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-500 transition-colors" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Follow-ups Due */}
        <div className="bg-white rounded-2xl border shadow-3xs border-gray-150/80 overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-warning-50 flex items-center justify-center">
                <PhoneIncoming className="w-4 h-4 text-warning-500" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">Follow-ups Due</h3>
            </div>
            <span className="text-[10px] font-bold bg-amber-50 border border-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{followUps.length} pending</span>
          </div>
          <div className="divide-y divide-gray-100 max-h-[360px] overflow-y-auto">
            {followUps.length === 0 ? (
              <div className="py-16 text-center text-xs text-gray-400 font-medium">All caught up! No follow-ups due.</div>
            ) : (
              followUps.map((lead) => (
                <div key={lead.id} onClick={() => openLeadDrawer(lead.id)}
                  className="flex items-center gap-4 px-5 py-3 cursor-pointer hover:bg-gray-50/50 transition-colors group">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-50 to-orange-100/40 flex items-center justify-center flex-shrink-0 border border-amber-100/50">
                    <span className="text-xs font-bold text-amber-700">{lead.name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-extrabold text-slate-800 truncate">{lead.name}</span>
                      <StatusBadge type="lead" status={lead.status} />
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold">
                      <span>{lead.event_type ? eventTypeLabels[lead.event_type as EventType] || lead.event_type : 'Event'}</span>
                      {lead.follow_up_date && (
                        <>
                          <span>•</span>
                          <span className="text-warning-650 font-medium">Due {getRelativeTime(lead.follow_up_date + 'T00:00:00Z')}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <CallButton phone={lead.phone} leadName={lead.name} size="sm" />
                    <WhatsAppButton phone={lead.phone} size="sm" leadId={lead.id} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl border shadow-3xs border-gray-150/80 p-5">
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
          <DaySummaryDrawer />
        </ErrorBoundary>
      </div>

    </div>
  );
}
