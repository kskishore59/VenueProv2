import { useState } from 'react';
import { IndianRupee, TrendingUp, AlertCircle, Edit, FileText } from 'lucide-react';
import { cn, formatCurrency, formatDateReadable, exportToCSV } from '@/lib/utils';
import { useDataStore } from '@/stores/data-store';
import { useUIStore } from '@/stores/ui-store';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { paymentModeLabels } from '@/types/payment';
import { startOfMonth } from 'date-fns';

export default function Payments() {
  const [filter, setFilter] = useState<'all' | 'received' | 'pending'>('all');
  const openEditPayment = useUIStore((s) => s.openEditPayment);
  const openReceiptModal = useUIStore((s) => s.openReceiptModal);

  const payments = useDataStore((s) => s.payments);
  const bookings = useDataStore((s) => s.bookings);
  const getCustomerById = useDataStore((s) => s.getCustomerById);

  const filtered = payments.filter((p) => {
    if (filter === 'received') return p.status === 'received';
    if (filter === 'pending') return p.status === 'pending';
    return true;
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const thisMonth = startOfMonth(new Date());
  const thisMonthReceived = payments
    .filter((p) => p.status === 'received' && p.paid_at && new Date(p.paid_at) >= thisMonth)
    .reduce((s, p) => s + p.amount_paise, 0);
  const totalPending = bookings
    .filter((b) => b.status === 'confirmed' || b.status === 'hold')
    .reduce((sum, b) => {
      const paid = payments.filter((p) => p.booking_id === b.id && p.status === 'received').reduce((s, p) => s + p.amount_paise, 0);
      return sum + Math.max(0, b.total_amount_paise - paid);
    }, 0);

  const handleExport = () => {
    const csvData = filtered.map((p) => {
      const booking = bookings.find((b) => b.id === p.booking_id);
      const customer = booking ? getCustomerById(booking.customer_id) : null;
      return {
        'Payment ID': p.id,
        'Booking Number': booking?.booking_number || 'N/A',
        'Customer Name': customer?.name || 'Unknown',
        'Amount (Rs.)': (p.amount_paise / 100).toFixed(2),
        'Type': p.payment_type || 'installment',
        'Mode': paymentModeLabels[p.payment_mode] || p.payment_mode,
        'Status': p.status,
        'Transaction Ref': p.transaction_ref || 'N/A',
        'Paid At': p.paid_at ? formatDateReadable(p.paid_at) : 'N/A',
        'Notes': p.notes || '',
      };
    });

    exportToCSV(
      csvData,
      ['Payment ID', 'Booking Number', 'Customer Name', 'Amount (Rs.)', 'Type', 'Mode', 'Status', 'Transaction Ref', 'Paid At', 'Notes'],
      `payments_export_${new Date().toISOString().slice(0, 10)}.csv`
    );
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div><h1 className="text-2xl font-bold text-gray-900">Payments</h1><p className="text-sm text-gray-400 mt-0.5">Track all incoming payments</p></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-children">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 card-hover">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-success-50 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-success-500" /></div>
            <span className="text-sm text-gray-500 font-medium">This Month Collected</span>
          </div>
          <p className="text-2xl font-extrabold text-gray-900 number-animate">{formatCurrency(thisMonthReceived)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 card-hover">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-warning-50 flex items-center justify-center"><AlertCircle className="w-5 h-5 text-warning-500" /></div>
            <span className="text-sm text-gray-500 font-medium">Total Pending</span>
          </div>
          <p className="text-2xl font-extrabold text-gray-900 number-animate">{formatCurrency(totalPending)}</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {(['all', 'received', 'pending'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn('px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all',
                filter === f ? 'bg-brand-600 text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50')}>
              {f === 'all' ? 'All Payments' : f}
            </button>
          ))}
        </div>
        <button
          onClick={handleExport}
          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-1.5 transition-all shadow-2xs hover:shadow-xs active:scale-95"
        >
          <span>📥</span> Export CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="divide-y divide-gray-50">
          {filtered.map((payment) => {
            const booking = bookings.find((b) => b.id === payment.booking_id);
            const customer = booking ? getCustomerById(booking.customer_id) : null;
            return (
              <div key={payment.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                  payment.status === 'received' ? 'bg-success-50' : 'bg-warning-50')}>
                  <IndianRupee className={cn('w-4 h-4', payment.status === 'received' ? 'text-success-500' : 'text-warning-500')} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(payment.amount_paise)}</span>
                    <StatusBadge type="payment" status={payment.status} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{customer?.name || 'Unknown'}</span>
                    <span>•</span>
                    <span>{paymentModeLabels[payment.payment_mode]}</span>
                    {payment.transaction_ref && <><span>•</span><span className="font-mono text-gray-500">{payment.transaction_ref}</span></>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="hidden sm:block text-right mr-1">
                    <p className="text-xs text-gray-500">{payment.paid_at ? formatDateReadable(payment.paid_at) : '—'}</p>
                  </div>
                  {payment.status === 'received' && (
                    <button 
                      onClick={() => openReceiptModal('receipt', payment.id)} 
                      className="p-2 rounded-xl border border-gray-100 hover:bg-gray-50 text-brand-600 hover:text-brand-700 transition-all" 
                      title="Generate Receipt"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => openEditPayment(payment.id)} className="p-2 rounded-xl border border-gray-100 hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-all" title="Edit Payment">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
