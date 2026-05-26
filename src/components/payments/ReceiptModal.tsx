import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, Check } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useDataStore } from '@/stores/data-store';
import { formatCurrency, formatDateReadable, formatTime, formatPhone } from '@/lib/utils';
import { paymentModeLabels, type Payment } from '@/types/payment';
import { eventTypeLabels, type Booking } from '@/types/booking';

interface PrintSheetContentProps {
  mode: 'receipt' | 'invoice';
  receiptNum: string;
  dateStr: string;
  targetPayment?: Payment;
  targetBooking: Booking;
  customer: any;
  hall: any;
  organization: any;
  taxableValue: number;
  cgst: number;
  sgst: number;
  totalAmount: number;
  gstEnabled: boolean;
  bookingPayments: Payment[];
  totalPaid: number;
  balanceDue: number;
}

function PrintSheetContent({
  mode,
  receiptNum,
  dateStr,
  targetPayment,
  targetBooking,
  customer,
  hall,
  organization,
  taxableValue,
  cgst,
  sgst,
  totalAmount,
  gstEnabled,
  bookingPayments,
  totalPaid,
  balanceDue,
}: PrintSheetContentProps) {
  return (
    <div className="flex flex-col justify-between h-full min-h-[297mm] print:min-h-0 print:h-auto bg-white p-8 md:p-12 print:p-0 text-gray-800 text-[13px] font-sans">
      <div>
        {/* Paper Header: Organization Info */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start border-b border-gray-200 pb-6 print:pb-4 gap-4 print:gap-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              {organization.logo_url ? (
                <img src={organization.logo_url} alt="Logo" className="w-12 h-12 object-contain rounded-lg flex-shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-extrabold text-sm shadow-xs">
                  {organization.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <h1 className="text-lg font-black text-gray-900 tracking-tight">
                {organization.name}
              </h1>
            </div>
            {organization.address && (
              <p className="text-gray-500 whitespace-pre-line leading-relaxed max-w-sm text-xs">
                {organization.address}
              </p>
            )}
          </div>
          <div className="text-left sm:text-right space-y-1 text-xs">
            {organization.gstin && (
              <p className="font-semibold text-gray-700">
                GSTIN: <span className="font-mono">{organization.gstin}</span>
              </p>
            )}
            {organization.phone && <p className="text-gray-500">Phone: {formatPhone(organization.phone)}</p>}
            {organization.email && <p className="text-gray-500">Email: {organization.email}</p>}
          </div>
        </div>

        {/* Receipt Title and Metadata */}
        <div className="my-8 print:my-4 flex flex-col sm:flex-row sm:justify-between gap-4 print:gap-2">
          <div>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              {mode === 'receipt' ? 'Payment Receipt' : 'Booking Invoice'}
            </h2>
            <p className="text-xl font-extrabold text-gray-900 mt-1">
              {receiptNum}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 sm:text-right text-xs">
            <span className="text-gray-400">Date:</span>
            <span className="font-semibold text-gray-800">{dateStr}</span>
            {mode === 'receipt' && targetPayment?.paid_at && (
              <>
                <span className="text-gray-400">Payment Date:</span>
                <span className="font-semibold text-gray-800">{formatDateReadable(targetPayment.paid_at)}</span>
              </>
            )}
            <span className="text-gray-400">Booking Ref:</span>
            <span className="font-semibold text-gray-800 font-mono">{targetBooking.booking_number}</span>
          </div>
        </div>

        {/* Client / Venue reference cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 print:gap-4 p-4 print:p-3 rounded-xl bg-gray-50/50 border border-gray-100 mb-8 print:mb-4 text-xs">
          <div>
            <h4 className="font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To</h4>
            {customer ? (
              <div className="space-y-1">
                <p className="font-bold text-gray-900">{customer.name}</p>
                <p className="text-gray-500">{formatPhone(customer.phone)}</p>
                {customer.email && <p className="text-gray-500">{customer.email}</p>}
                {customer.address && <p className="text-gray-500">{customer.address}</p>}
              </div>
            ) : (
              <p className="text-gray-500">Anonymous Customer</p>
            )}
          </div>
          <div>
            <h4 className="font-bold text-gray-400 uppercase tracking-wider mb-2">Event Schedule</h4>
            <div className="space-y-1">
              <p className="font-bold text-gray-900">{eventTypeLabels[targetBooking.event_type]}</p>
              <p className="text-gray-700">
                Date: <span className="font-semibold">{formatDateReadable(targetBooking.event_date)}</span>
              </p>
              <p className="text-gray-500">
                Timings: {formatTime(targetBooking.start_time)} – {formatTime(targetBooking.end_time)}
              </p>
              <p className="text-gray-500">
                Venue: {hall?.name || 'Default Space'}
              </p>
            </div>
          </div>
        </div>

        {/* Particulars Table */}
        <table className="w-full text-left border-collapse mb-8 print:mb-4">
          <thead>
            <tr className="border-b border-gray-200 text-xs font-bold text-gray-400 uppercase">
              <th className="py-2.5 print:py-1.5">Particulars / Description</th>
              <th className="py-2.5 print:py-1.5 text-right w-32">SAC Code</th>
              <th className="py-2.5 print:py-1.5 text-right w-36">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mode === 'receipt' && targetPayment ? (
              <tr>
                <td className="py-4 print:py-2">
                  <p className="font-bold text-gray-900 capitalize">
                    {targetPayment.payment_type} Payment
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 animate-pulse-soft">
                    Received via {paymentModeLabels[targetPayment.payment_mode]}
                    {targetPayment.transaction_ref && ` (Ref: ${targetPayment.transaction_ref})`}
                  </p>
                </td>
                <td className="py-4 print:py-2 text-right font-mono text-xs text-gray-500">996331</td>
                <td className="py-4 print:py-2 text-right font-semibold text-gray-950">
                  {formatCurrency(targetPayment.amount_paise)}
                </td>
              </tr>
            ) : (
              <tr>
                <td className="py-4 print:py-2">
                  <p className="font-bold text-gray-900">
                    Hall Booking Services — {hall?.name || 'Venue Rental'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Booking charges for {eventTypeLabels[targetBooking.event_type]} on {formatDateReadable(targetBooking.event_date)}
                    {targetBooking.guest_count && ` (Guests: ${targetBooking.guest_count})`}
                  </p>
                </td>
                <td className="py-4 print:py-2 text-right font-mono text-xs text-gray-500">996331</td>
                <td className="py-4 print:py-2 text-right font-semibold text-gray-950">
                  {formatCurrency(targetBooking.total_amount_paise)}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Subtotals & Taxes Computation */}
        <div className="flex justify-end mb-8 print:mb-4">
          <div className="w-full sm:w-64 space-y-2 print:space-y-1 border-t border-gray-200 pt-4 print:pt-2 text-xs">
            {gstEnabled ? (
              <>
                <div className="flex justify-between text-gray-500">
                  <span>Taxable Value:</span>
                  <span>{formatCurrency(taxableValue)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>CGST (9%):</span>
                  <span>{formatCurrency(cgst)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>SGST (9%):</span>
                  <span>{formatCurrency(sgst)}</span>
                </div>
              </>
            ) : null}
            <div className="flex justify-between text-base font-black text-gray-900 border-t border-gray-150 pt-2 print:pt-1.5">
              <span>Total Amount:</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Log of payments and balances (Only for Booking Invoice) */}
        {mode === 'invoice' && (
          <div className="border-t border-gray-200 pt-6 print:pt-3 mt-6 print:mt-3">
            <h3 className="font-bold text-gray-900 text-xs mb-3 uppercase tracking-wider">Payments Log</h3>
            {bookingPayments.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No payments logged yet.</p>
            ) : (
              <div className="space-y-1.5 print:space-y-1 mb-6 print:mb-3">
                {bookingPayments.map((p, idx) => (
                  <div key={p.id} className="flex justify-between text-xs text-gray-600">
                    <span>
                      Installment #{idx + 1} ({paymentModeLabels[p.payment_mode]}) — {p.paid_at ? formatDateReadable(p.paid_at) : 'Paid'}
                    </span>
                    <span className="font-semibold text-gray-800">
                      {formatCurrency(p.amount_paise)}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="p-3 print:p-2 bg-gray-50 rounded-xl flex items-center justify-between border border-gray-100 text-xs mt-4 print:mt-2">
              <div className="font-bold text-success-600">
                Total Paid: {formatCurrency(totalPaid)}
              </div>
              <div className={`font-black ${balanceDue > 0 ? 'text-warning-600' : 'text-success-600'}`}>
                {balanceDue > 0 ? `Outstanding Balance: ${formatCurrency(balanceDue)}` : 'Fully Paid ✓'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* T&C and Signatures */}
      <div className="border-t border-gray-200 pt-8 print:pt-3 mt-12 print:mt-4 text-[11px] print:text-[10px] text-gray-450 leading-relaxed space-y-6 print:space-y-3">
        <div>
          <h4 className="font-bold text-gray-500 uppercase tracking-wider mb-1">Terms & Conditions</h4>
          {organization.terms_and_conditions ? (
            <p className="whitespace-pre-line leading-relaxed text-gray-500">{organization.terms_and_conditions}</p>
          ) : (
            <ol className="list-decimal pl-4 space-y-0.5 text-gray-450">
              <li>Rental includes basic space access for the specified timing buffer only. Overtime fee applies.</li>
              <li>Advance booking deposit (minimum 25%) is non-refundable upon cancellation.</li>
              <li>Full balance payment must be settled at least 7 days prior to the event execution.</li>
              <li>Any physical damages caused to the venue property will be fully billable to the client.</li>
            </ol>
          )}
        </div>
        
        {/* Signature Blocks */}
        <div className="flex justify-between items-end pt-8 print:pt-4">
          <div className="text-center w-36">
            <div className="border-b border-gray-200 h-8 print:h-6 mb-1.5 print:mb-1" />
            <p className="font-semibold text-gray-500">Customer Signature</p>
          </div>
          <div className="text-center w-40">
            <div className="border-b border-gray-200 h-8 print:h-6 mb-1.5 print:mb-1 flex items-center justify-center">
              <Check className="w-4 h-4 text-success-500 opacity-60 no-print" />
            </div>
            <p className="font-semibold text-gray-700">Authorized Signatory</p>
            <p className="text-[9px] text-gray-400 mt-0.5">{organization.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReceiptModal() {
  const isOpen = useUIStore((s) => s.isReceiptModalOpen);
  const mode = useUIStore((s) => s.receiptMode);
  const paymentId = useUIStore((s) => s.receiptPaymentId);
  const bookingId = useUIStore((s) => s.receiptBookingId);
  const closeReceiptModal = useUIStore((s) => s.closeReceiptModal);

  const organization = useDataStore((s) => s.organization);
  const bookings = useDataStore((s) => s.bookings);
  const payments = useDataStore((s) => s.payments);
  const getCustomerById = useDataStore((s) => s.getCustomerById);
  const getHallById = useDataStore((s) => s.getHallById);

  // Auto-close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeReceiptModal();
    };
    if (isOpen) window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeReceiptModal]);

  if (!isOpen) return null;

  // Retrieve relevant records
  let targetPayment: Payment | undefined;
  let targetBooking: Booking | undefined;

  if (mode === 'receipt' && paymentId) {
    const foundPayment = payments.find((p) => p.id === paymentId);
    targetPayment = foundPayment;
    if (foundPayment) {
      targetBooking = bookings.find((b) => b.id === foundPayment.booking_id);
    }
  } else if (mode === 'invoice' && bookingId) {
    targetBooking = bookings.find((b) => b.id === bookingId);
  }

  if (!targetBooking) return null;

  const customer = getCustomerById(targetBooking.customer_id);
  const hall = getHallById(targetBooking.hall_id);

  // Compute values
  const dateStr = formatDateReadable(new Date().toISOString());
  const receiptNum = mode === 'receipt' && targetPayment
    ? `REC-${targetPayment.id.slice(0, 8).toUpperCase()}`
    : `INV-${targetBooking.booking_number}`;

  // GST calculations
  const gstEnabled = organization.settings.gst_enabled && organization.gstin;
  
  let taxableValue = 0;
  let cgst = 0;
  let sgst = 0;
  let totalAmount = 0;

  if (mode === 'receipt' && targetPayment) {
    totalAmount = targetPayment.amount_paise;
    if (gstEnabled) {
      taxableValue = Math.round(totalAmount / 1.18);
      const remainingGst = totalAmount - taxableValue;
      cgst = Math.round(remainingGst / 2);
      sgst = remainingGst - cgst;
    } else {
      taxableValue = totalAmount;
    }
  } else {
    totalAmount = targetBooking.total_amount_paise;
    if (gstEnabled) {
      taxableValue = Math.round(totalAmount / 1.18);
      const remainingGst = totalAmount - taxableValue;
      cgst = Math.round(remainingGst / 2);
      sgst = remainingGst - cgst;
    } else {
      taxableValue = totalAmount;
    }
  }

  // Payment logs
  const bookingPayments = payments.filter((p) => p.booking_id === targetBooking.id && p.status === 'received');
  const totalPaid = bookingPayments.reduce((sum, p) => sum + p.amount_paise, 0);
  const balanceDue = targetBooking.total_amount_paise - totalPaid;

  const handlePrint = () => {
    window.print();
  };

  const sharedProps = {
    mode: mode || 'receipt',
    receiptNum,
    dateStr,
    targetPayment,
    targetBooking,
    customer,
    hall,
    organization,
    taxableValue,
    cgst,
    sgst,
    totalAmount,
    gstEnabled: !!gstEnabled,
    bookingPayments,
    totalPaid,
    balanceDue,
  };

  return (
    <>
      {/* Print Stylesheet */}
      <style>{`
        /* Hide print root on screen */
        #print-root {
          display: none;
        }

        @media print {
          /* Hide standard React container completely */
          #root {
            display: none !important;
          }

          /* Force print-root to render in black-and-white print output */
          #print-root {
            display: block !important;
            background: white !important;
            color: black !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          #receipt-print-sheet {
            display: block !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 12mm !important;
            background: white !important;
            color: black !important;
            border: none !important;
            box-shadow: none !important;
          }

          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Screen Backdrop */}
      <div 
        className="receipt-modal-backdrop no-print fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-start md:items-center justify-center p-2 sm:p-4 overflow-y-auto"
        onClick={closeReceiptModal}
      >
        {/* Modal Container */}
        <div 
          className="receipt-modal-container relative bg-gray-50/95 backdrop-blur-xl border border-gray-200/50 rounded-3xl w-full max-w-3xl shadow-2xl flex flex-col overflow-hidden my-4 md:my-0 h-auto md:max-h-[95vh] animate-scale-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Action Header */}
          <div className="flex items-center justify-between px-4 py-3.5 sm:px-6 sm:py-4 bg-white border-b border-gray-150 sticky top-0 z-10 gap-3 rounded-t-3xl">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 capitalize truncate">
                {mode === 'receipt' ? 'Payment Receipt' : 'Booking Invoice'}
              </h3>
              <p className="hidden sm:block text-xs text-gray-400 font-medium mt-0.5">
                Generate, download or print digital register copies
              </p>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 active:scale-95 transition-all rounded-xl shadow-xs shrink-0"
              >
                <Printer className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Print<span className="hidden sm:inline"> / Save PDF</span></span>
              </button>
              <button
                onClick={closeReceiptModal}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Document Preview Area */}
          <div className="receipt-print-wrapper flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 flex justify-center bg-gray-100/50 rounded-b-3xl">
            <div 
              id="receipt-screen-sheet"
              className="bg-white w-full max-w-[210mm] shadow-md border border-gray-150 rounded-2xl overflow-hidden"
            >
              <PrintSheetContent {...sharedProps} />
            </div>
          </div>
        </div>
      </div>

      {/* Print Portal */}
      {createPortal(
        <div id="receipt-print-sheet">
          <PrintSheetContent {...sharedProps} />
        </div>,
        document.getElementById('print-root')!
      )}
    </>
  );
}
