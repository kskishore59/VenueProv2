import { useState, useEffect } from 'react';
import { X, IndianRupee, Check, Trash2 } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';
import { useDataStore } from '@/stores/data-store';
import type { PaymentMode } from '@/types/payment';
import { paymentModeLabels } from '@/types/payment';
import { toast } from 'sonner';

const paymentModes: PaymentMode[] = ['cash', 'upi', 'bank_transfer', 'cheque', 'card', 'online'];

export function EditPaymentModal() {
  const isOpen = useUIStore((s) => s.isEditPaymentOpen);
  const paymentId = useUIStore((s) => s.selectedEditPaymentId);
  const closeEditPayment = useUIStore((s) => s.closeEditPayment);
  const showConfirm = useUIStore((s) => s.showConfirm);

  const payments = useDataStore((s) => s.payments);
  const bookings = useDataStore((s) => s.bookings);
  const getCustomerById = useDataStore((s) => s.getCustomerById);
  const updatePayment = useDataStore((s) => s.updatePayment);
  const deletePayment = useDataStore((s) => s.deletePayment);

  const payment = payments.find((p) => p.id === paymentId);
  const booking = bookingIdToBooking(payment?.booking_id);

  function bookingIdToBooking(id?: string) {
    if (!id) return undefined;
    return bookings.find((b) => b.id === id);
  }

  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState<PaymentMode>('upi');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (payment) {
      setAmount(String(payment.amount_paise / 100));
      setMode(payment.payment_mode);
      setReference(payment.transaction_ref || '');
      setNotes(payment.notes || '');
    }
  }, [payment]);

  if (!isOpen || !paymentId || !payment) return null;

  const customer = booking ? getCustomerById(booking.customer_id) : undefined;

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsSaving(true);
    try {
      await updatePayment(paymentId, {
        amount_paise: Number(amount) * 100,
        payment_mode: mode,
        transaction_ref: reference || null,
        notes: notes || null,
      });
      closeEditPayment();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update payment');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    showConfirm({
      title: 'Delete Payment Record',
      description: `Are you sure you want to delete this payment record of ${formatCurrency(payment.amount_paise)}? This action cannot be undone.`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deletePayment(paymentId);
          closeEditPayment();
        } catch (err: any) {
          toast.error(err.message || 'Failed to delete payment');
        }
      },
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 drawer-overlay" onClick={closeEditPayment} />
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="bg-white w-full sm:w-[440px] sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto shadow-2xl modal-content">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Edit Payment</h3>
              <p className="text-xs text-gray-400 mt-0.5">{customer?.name} • Booking: {booking?.booking_number}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleDelete}
                className="p-2 rounded-xl hover:bg-rose-50 text-rose-500 transition-colors"
                title="Delete Payment"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button onClick={closeEditPayment} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="px-6 py-5 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Amount (₹)</label>
              <div className="relative">
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="number" placeholder="50,000" value={amount} onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 text-xl font-bold text-gray-900 focus:ring-2 focus:ring-brand-200 focus:border-brand-400 outline-none transition-all" />
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
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 active:scale-[0.98] transition-all shadow-sm">
              {isSaving ? (
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {isSaving ? 'Saving Changes...' : 'Save Changes'}
            </button>
            <button onClick={closeEditPayment}
              className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
