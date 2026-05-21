import { useState } from 'react';
import { X, IndianRupee, Check } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';
import { useDataStore } from '@/stores/data-store';
import type { PaymentMode } from '@/types/payment';
import { paymentModeLabels } from '@/types/payment';
import { toast } from 'sonner';

const paymentModes: PaymentMode[] = ['cash', 'upi', 'bank_transfer', 'cheque', 'card', 'online'];

export function RecordPaymentModal() {
  const isOpen = useUIStore((s) => s.isPaymentModalOpen);
  const bookingId = useUIStore((s) => s.paymentBookingId);
  const closePaymentModal = useUIStore((s) => s.closePaymentModal);

  const booking = useDataStore((s) => (bookingId ? s.getBookingById(bookingId) : undefined));
  const getCustomerById = useDataStore((s) => s.getCustomerById);
  const getPaymentsForBooking = useDataStore((s) => s.getPaymentsForBooking);
  const recordPayment = useDataStore((s) => s.recordPayment);

  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState<PaymentMode>('upi');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen || !bookingId || !booking) return null;

  const customer = getCustomerById(booking.customer_id);
  const payments = getPaymentsForBooking(booking.id);
  const totalPaid = payments.filter((p) => p.status === 'received').reduce((s, p) => s + p.amount_paise, 0);
  const balance = booking.total_amount_paise - totalPaid;

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      await recordPayment({
        booking_id: bookingId,
        amount_paise: Number(amount) * 100,
        payment_mode: mode,
        transaction_ref: reference || undefined,
        notes: notes || undefined,
      });

      toast.success(`Payment of ₹${Number(amount).toLocaleString('en-IN')} recorded! 💰`, {
        description: `${customer?.name} — via ${paymentModeLabels[mode]}`,
      });
      closePaymentModal();
      setAmount(''); setMode('upi'); setReference(''); setNotes('');
    } catch (err) {
      toast.error('Failed to record payment');
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 drawer-overlay" onClick={closePaymentModal} />
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="bg-white w-full sm:w-[440px] sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto shadow-2xl modal-content">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Record Payment</h3>
              <p className="text-xs text-gray-400 mt-0.5">{customer?.name} • Balance: {formatCurrency(balance)}</p>
            </div>
            <button onClick={closePaymentModal} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Amount (₹)</label>
              <div className="relative">
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="number" placeholder="50,000" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus
                  className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 text-xl font-bold text-gray-900 focus:ring-2 focus:ring-brand-200 focus:border-brand-400 outline-none transition-all" />
              </div>
              <div className="flex gap-2 mt-2">
                {[{ label: 'Full', value: balance / 100 }, { label: '50%', value: (balance / 100) * 0.5 }, { label: '25%', value: (balance / 100) * 0.25 }]
                  .map((preset) => (
                    <button key={preset.label} onClick={() => setAmount(String(Math.round(preset.value)))}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 transition-colors">
                      {preset.label}
                    </button>
                  ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Mode</label>
              <div className="grid grid-cols-3 gap-2">
                {paymentModes.map((m) => (
                  <button key={m} onClick={() => setMode(m)}
                    className={cn('px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border',
                      mode === m ? 'bg-brand-600 text-white border-brand-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50')}>
                    {paymentModeLabels[m]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Ref (optional)</label>
              <input type="text" placeholder="UPI ref / cheque no..." value={reference} onChange={(e) => setReference(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Notes (optional)</label>
              <textarea placeholder="Any notes..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all resize-none" />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 space-y-2.5">
            <button onClick={handleSubmit}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-success-500 text-white font-semibold text-sm hover:bg-success-600 active:scale-[0.98] transition-all shadow-sm">
              <Check className="w-4 h-4" /> Record Payment
            </button>
            <button onClick={closePaymentModal}
              className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
