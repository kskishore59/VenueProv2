import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { cn, formatCurrency, formatDateReadable, formatTime, exportToCSV } from '@/lib/utils';
import { useDataStore } from '@/stores/data-store';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { WhatsAppButton } from '@/components/shared/WhatsAppButton';
import { useUIStore } from '@/stores/ui-store';
import { eventTypeLabels, type BookingStatus } from '@/types/booking';
import { useAuthStore } from '@/stores/auth-store';
import { hasPermission } from '@/lib/permissions';
import { DateRangeFilter } from '@/components/shared/DateRangeFilter';
import { EmptyState } from '@/components/shared/EmptyState';

const statusFilters: { value: BookingStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'hold', label: 'Hold' },
  { value: 'inquiry', label: 'Inquiry' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function Bookings() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({ start: null, end: null });
  const openBookingDrawer = useUIStore((s) => s.openBookingDrawer);
  const openQuickAdd = useUIStore((s) => s.openQuickAdd);

  const bookings = useDataStore((s) => s.bookings);
  const getCustomerById = useDataStore((s) => s.getCustomerById);
  const getHallById = useDataStore((s) => s.getHallById);
  
  const role = useAuthStore((s) => s.profile?.role);
  const organization = useDataStore((s) => s.organization);
  const canCreateBooking = hasPermission(role, 'bookings', 'create', organization?.settings);

  const filtered = bookings
    .filter((b) => {
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      if (dateRange.start && b.event_date < dateRange.start) return false;
      if (dateRange.end && b.event_date > dateRange.end) return false;
      if (search) {
        const customer = getCustomerById(b.customer_id);
        const searchLower = search.toLowerCase();
        return (
          customer?.name.toLowerCase().includes(searchLower) ||
          customer?.phone.includes(search) ||
          b.booking_number.toLowerCase().includes(searchLower)
        );
      }
      return true;
    })
    .sort((a, b) => b.event_date.localeCompare(a.event_date));

  const handleExport = () => {
    const csvData = filtered.map((b) => {
      const customer = getCustomerById(b.customer_id);
      const hall = getHallById(b.hall_id);
      return {
        'Booking ID': b.id,
        'Booking Number': b.booking_number,
        'Customer Name': customer?.name || 'Unknown',
        'Customer Phone': customer?.phone || 'N/A',
        'Hall Name': hall?.name || 'N/A',
        'Event Type': eventTypeLabels[b.event_type] || b.event_type,
        'Event Date': formatDateReadable(b.event_date),
        'Start Time': formatTime(b.start_time),
        'End Time': formatTime(b.end_time),
        'Guest Count': b.guest_count || 'N/A',
        'Status': b.status,
        'Total Amount (Rs.)': (b.total_amount_paise / 100).toFixed(2),
        'Advance Paid (Rs.)': (b.advance_amount_paise / 100).toFixed(2),
        'Notes': b.notes || '',
      };
    });

    exportToCSV(
      csvData,
      ['Booking ID', 'Booking Number', 'Customer Name', 'Customer Phone', 'Hall Name', 'Event Type', 'Event Date', 'Start Time', 'End Time', 'Guest Count', 'Status', 'Total Amount (Rs.)', 'Advance Paid (Rs.)', 'Notes'],
      `bookings_export_${new Date().toISOString().slice(0, 10)}.csv`
    );
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-sm text-gray-400 mt-0.5">{bookings.length} total bookings</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleExport}
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-1.5 transition-all shadow-2xs hover:shadow-xs active:scale-95 w-full sm:w-auto justify-center"
          >
            <span>📥</span> Export CSV
          </button>
          {canCreateBooking && (
            <button onClick={() => openQuickAdd()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 active:scale-95 transition-all shadow-sm w-full sm:w-auto justify-center">
              <Plus className="w-4 h-4" /> New Booking
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by name, phone, or booking number..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none bg-white shadow-sm" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <DateRangeFilter
            align="left"
            onChange={(start, end) => setDateRange({ start, end })}
          />
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {statusFilters.map((f) => (
              <button key={f.value} onClick={() => setStatusFilter(f.value)}
                className={cn('px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all',
                  statusFilter === f.value ? 'bg-brand-600 text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50')}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No bookings recorded yet"
          description="Create your first booking slot, lock availability calendars, and track advance deposits."
          action={canCreateBooking ? { label: "Create First Booking", onClick: () => openQuickAdd() } : undefined}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="hidden md:grid grid-cols-[1fr_120px_140px_100px_120px_120px_50px] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            <span>Customer / Event</span><span>Date</span><span>Hall</span><span>Guests</span><span>Amount</span><span>Status</span><span></span>
          </div>
          <div className="divide-y divide-gray-50">
            {filtered.map((booking) => {
              const customer = getCustomerById(booking.customer_id);
              const hall = getHallById(booking.hall_id);
              return (
                <div key={booking.id} onClick={() => openBookingDrawer(booking.id)}
                  className="grid grid-cols-2 md:grid-cols-[1fr_120px_140px_100px_120px_120px_50px] gap-x-4 gap-y-3.5 md:gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50/70 transition-all group">
                  <div className="flex items-center gap-3 col-span-2 md:col-span-1">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-brand-700">{customer?.name[0] || '?'}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{customer?.name}</p>
                      <p className="text-xs text-gray-400">{eventTypeLabels[booking.event_type]} • {booking.booking_number}</p>
                    </div>
                  </div>
                  <div className="flex items-center col-span-1">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{formatDateReadable(booking.event_date)}</p>
                      <p className="text-[11px] text-gray-400">{formatTime(booking.start_time)} – {formatTime(booking.end_time)}</p>
                    </div>
                  </div>
                  <div className="flex items-center col-span-1 md:col-span-1 justify-end md:justify-start text-right md:text-left">
                    <span className="text-sm text-gray-600 truncate">
                      <span className="md:hidden font-semibold text-gray-450 block text-[9px] uppercase tracking-wider mb-0.5">Venue</span>
                      {hall?.name}
                    </span>
                  </div>
                  <div className="flex items-center col-span-1">
                    <span className="text-sm text-gray-600">
                      <span className="md:hidden font-semibold text-gray-450 block text-[9px] uppercase tracking-wider mb-0.5">Guests</span>
                      {booking.guest_count || '—'}
                    </span>
                  </div>
                  <div className="flex items-center col-span-1 md:col-span-1 justify-end md:justify-start text-right md:text-left">
                    <span className="text-sm font-bold text-gray-900">
                      <span className="md:hidden font-semibold text-gray-450 block text-[9px] uppercase tracking-wider mb-0.5">Amount</span>
                      {formatCurrency(booking.total_amount_paise)}
                    </span>
                  </div>
                  <div className="flex items-center col-span-1">
                    <div>
                      <span className="md:hidden font-semibold text-gray-450 block text-[9px] uppercase tracking-wider mb-0.5">Status</span>
                      <StatusBadge type="booking" status={booking.status} />
                    </div>
                  </div>
                  <div className="flex items-center justify-end col-span-1">
                    <div>
                      <span className="md:hidden font-semibold text-gray-450 block text-[9px] uppercase tracking-wider mb-0.5 text-right opacity-0">Share</span>
                      {customer && <WhatsAppButton phone={customer.phone} size="sm" bookingId={booking.id} />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
