import { X, CalendarDays, Clock, Users, MapPin, IndianRupee, Edit, Ban, CreditCard, FileText, Printer } from 'lucide-react';
import { cn, formatCurrency, formatDateReadable, formatTime, formatPhone, getInitials } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';
import { useDataStore } from '@/stores/data-store';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { WhatsAppButton } from '@/components/shared/WhatsAppButton';
import { eventTypeLabels } from '@/types/booking';
import { paymentModeLabels } from '@/types/payment';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import { hasPermission } from '@/lib/permissions';

export function BookingDrawer() {
  const isOpen = useUIStore((s) => s.isBookingDrawerOpen);
  const bookingId = useUIStore((s) => s.selectedBookingId);
  const closeBookingDrawer = useUIStore((s) => s.closeBookingDrawer);
  const openPaymentModal = useUIStore((s) => s.openPaymentModal);
  const openEditBooking = useUIStore((s) => s.openEditBooking);
  const showConfirm = useUIStore((s) => s.showConfirm);
  const openReceiptModal = useUIStore((s) => s.openReceiptModal);

  const booking = useDataStore((s) => (bookingId ? s.getBookingById(bookingId) : undefined));
  const getCustomerById = useDataStore((s) => s.getCustomerById);
  const getHallById = useDataStore((s) => s.getHallById);
  const getPaymentsForBooking = useDataStore((s) => s.getPaymentsForBooking);
  const cancelBooking = useDataStore((s) => s.cancelBooking);
  const updateBooking = useDataStore((s) => s.updateBooking);

  const role = useAuthStore((s) => s.profile?.role);
  const organization = useDataStore((s) => s.organization);

  const canUpdateBooking = hasPermission(role, 'bookings', 'update', organization?.settings);
  const canDeleteBooking = hasPermission(role, 'bookings', 'delete', organization?.settings);
  const canCreatePayment = hasPermission(role, 'payments', 'create', organization?.settings);
  const canReadPayments = hasPermission(role, 'payments', 'read', organization?.settings);

  if (!isOpen || !bookingId || !booking) return null;

  const customer = getCustomerById(booking.customer_id);
  const hall = getHallById(booking.hall_id);
  const payments = getPaymentsForBooking(booking.id);
  const totalPaid = payments.filter((p) => p.status === 'received').reduce((s, p) => s + p.amount_paise, 0);
  const balance = booking.total_amount_paise - totalPaid;
  const paidPercent = booking.total_amount_paise > 0 ? Math.min(100, Math.round((totalPaid / booking.total_amount_paise) * 100)) : 0;

  const handleCancelBooking = () => {
    showConfirm({
      title: 'Cancel Booking?',
      description: `This will cancel booking ${booking.booking_number} for ${customer?.name || 'this customer'}. This action cannot be undone.`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          await cancelBooking(bookingId);
          toast.success('Booking cancelled', { description: booking.booking_number });
          closeBookingDrawer();
        } catch (err: any) {
          toast.error(err.message || 'Failed to cancel booking');
        }
      },
    });
  };

  const handleMarkCompleted = async () => {
    try {
      await updateBooking(bookingId, { status: 'completed' });
      toast.success('Booking marked as completed ✅', { description: booking.booking_number });
    } catch (err: any) {
      toast.error(err.message || 'Failed to mark as completed');
    }
  };

  const handleEditBooking = () => {
    openEditBooking(bookingId);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50 drawer-overlay" onClick={closeBookingDrawer} />
      <div className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white z-50 shadow-2xl flex flex-col drawer-content">
        {/* Header */}
        <div className="relative px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-brand-50/50 to-white">
          <button onClick={closeBookingDrawer} className="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono text-gray-400">{booking.booking_number}</span>
            <StatusBadge type="booking" status={booking.status} pulse={booking.status === 'confirmed'} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 pr-10">{customer?.name || 'Unknown Customer'}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{eventTypeLabels[booking.event_type]} • {hall?.name}</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Quick info */}
          <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
            <div className="px-4 py-4 text-center">
              <CalendarDays className="w-4 h-4 text-gray-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-gray-900">{formatDateReadable(booking.event_date)}</p>
              <p className="text-[11px] text-gray-400">{formatTime(booking.start_time)} – {formatTime(booking.end_time)}</p>
            </div>
            <div className="px-4 py-4 text-center">
              <Users className="w-4 h-4 text-gray-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-gray-900">{booking.guest_count || '—'}</p>
              <p className="text-[11px] text-gray-400">Guests</p>
            </div>
            <div className="px-4 py-4 text-center">
              <MapPin className="w-4 h-4 text-gray-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-gray-900 truncate">{hall?.name}</p>
              <p className="text-[11px] text-gray-400">Venue</p>
            </div>
          </div>

          {/* Payment Summary */}
          {canReadPayments && (
            <div className="px-6 py-5 border-b border-gray-100">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Payment Summary</h4>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">Total Amount</span>
                <span className="text-lg font-extrabold text-gray-900">{formatCurrency(booking.total_amount_paise)}</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${paidPercent}%` }} />
              </div>
              <div className="flex items-center justify-between text-xs mb-4">
                <span className="text-success-500 font-semibold">Paid: {formatCurrency(totalPaid)} ({paidPercent}%)</span>
                <span className={cn('font-semibold', balance > 0 ? 'text-warning-500' : 'text-success-500')}>
                  {balance > 0 ? `Balance: ${formatCurrency(balance)}` : 'Fully Paid ✓'}
                </span>
              </div>
              <button
                onClick={() => openReceiptModal('invoice', booking.id)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-brand-200 hover:border-brand-350 text-brand-600 hover:bg-brand-50/40 text-xs font-bold transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Generate Booking Invoice</span>
              </button>
            </div>
          )}

          {/* Customer Card */}
          {customer && (
            <div className="px-6 py-5 border-b border-gray-100">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Customer</h4>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
                  <span className="text-sm font-bold text-brand-700">{getInitials(customer.name)}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{customer.name}</p>
                  <p className="text-xs text-gray-400">{formatPhone(customer.phone)}</p>
                </div>
                <WhatsAppButton phone={customer.phone} size="md" bookingId={booking.id} />
              </div>
            </div>
          )}

          {/* Payment History */}
          {canReadPayments && (
            <div className="px-6 py-5 border-b border-gray-100">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Payment History</h4>
              {payments.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No payments recorded yet</p>
              ) : (
                <div className="space-y-2.5">
                  {payments.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center',
                        p.status === 'received' ? 'bg-success-50' : 'bg-warning-50')}>
                        <IndianRupee className={cn('w-3.5 h-3.5',
                          p.status === 'received' ? 'text-success-500' : 'text-warning-500')} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(p.amount_paise)}</p>
                        <p className="text-[11px] text-gray-400">{paymentModeLabels[p.payment_mode]} • {p.paid_at ? formatDateReadable(p.paid_at) : 'Pending'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge type="payment" status={p.status} />
                        {p.status === 'received' && (
                          <button
                            onClick={() => openReceiptModal('receipt', p.id)}
                            className="p-1.5 rounded-lg border border-gray-150 hover:bg-gray-100 text-brand-600 hover:text-brand-700 transition-all"
                            title="Generate Receipt"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {booking.notes && (
            <div className="px-6 py-5">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Notes</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{booking.notes}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-100 px-6 py-4 space-y-2.5">
          {balance > 0 && booking.status !== 'cancelled' && canCreatePayment && (
            <button
              onClick={() => openPaymentModal(booking.id)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 active:scale-[0.98] transition-all shadow-sm"
            >
              <CreditCard className="w-4 h-4" />
              Collect Payment
            </button>
          )}
          {booking.status === 'confirmed' && canUpdateBooking && (
            <button
              onClick={handleMarkCompleted}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-success-50 text-success-500 text-sm font-semibold hover:bg-success-500/15 transition-colors"
            >
              ✓ Mark as Completed
            </button>
          )}
          <div className="flex gap-2">
            {booking.status !== 'cancelled' && booking.status !== 'completed' && canUpdateBooking && (
              <button onClick={handleEditBooking}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-colors">
                <Edit className="w-3.5 h-3.5" /> Edit
              </button>
            )}
            {booking.status !== 'cancelled' && booking.status !== 'completed' && canDeleteBooking && (
              <button onClick={handleCancelBooking}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-danger-500 bg-danger-50 text-sm font-medium hover:bg-danger-500/15 transition-colors">
                <Ban className="w-3.5 h-3.5" /> Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
