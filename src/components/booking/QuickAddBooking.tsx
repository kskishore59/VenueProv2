import { useState } from 'react';
import { X, Search, Check, CalendarDays, Users, MapPin, Clock, IndianRupee, Plus } from 'lucide-react';
import { cn, formatDate, validateIndianPhone } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';
import { useDataStore } from '@/stores/data-store';
import { eventTypes, eventTypeLabels, type EventType } from '@/types/booking';
import { paymentModeLabels, type PaymentMode } from '@/types/payment';
import { toast } from 'sonner';
import { DatePicker } from '@/components/shared/DatePicker';
import { TimePicker } from '@/components/shared/TimePicker';

export function QuickAddBooking() {
  const isOpen = useUIStore((s) => s.isQuickAddOpen);
  const quickAddDate = useUIStore((s) => s.quickAddDate);
  const closeQuickAdd = useUIStore((s) => s.closeQuickAdd);

  const customers = useDataStore((s) => s.customers);
  const halls = useDataStore((s) => s.halls);
  const createBooking = useDataStore((s) => s.createBooking);
  const createCustomer = useDataStore((s) => s.createCustomer);
  const checkAvailability = useDataStore((s) => s.checkAvailability);
  const searchCustomers = useDataStore((s) => s.searchCustomers);

  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [isNewCustomer, setIsNewCustomer] = useState(false);

  const [eventDate, setEventDate] = useState(quickAddDate || '');
  const [hallId, setHallId] = useState('');
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [guestCount, setGuestCount] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [advancePaymentMode, setAdvancePaymentMode] = useState<PaymentMode>('cash');
  const [advanceTransactionRef, setAdvanceTransactionRef] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('22:00');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCustomers = searchCustomers(customerSearch);
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const selectedHall = halls.find((h) => h.id === hallId);

  const isAvailable = hallId && eventDate ? checkAvailability(hallId, eventDate, startTime, endTime) : null;

  const handleSubmit = async () => {
    if (isSubmitting) return;
    let customerId = selectedCustomerId;

    setIsSubmitting(true);
    try {
      // Create new customer if needed
      if (isNewCustomer) {
        if (!newCustomerName.trim()) { toast.error('Customer name is required'); setIsSubmitting(false); return; }
        if (!validateIndianPhone(newCustomerPhone)) { toast.error('Enter a valid 10-digit phone number'); setIsSubmitting(false); return; }
        try {
          const newCust = await createCustomer({ name: newCustomerName.trim(), phone: newCustomerPhone });
          customerId = newCust.id;
        } catch (err) {
          toast.error('Failed to create customer');
          setIsSubmitting(false);
          return;
        }
      }

      if (!customerId) { toast.error('Please select or add a customer'); setIsSubmitting(false); return; }
      if (!eventDate) { toast.error('Please select an event date'); setIsSubmitting(false); return; }
      if (!hallId) { toast.error('Please select a hall'); setIsSubmitting(false); return; }

      const result = await createBooking({
        customer_id: customerId,
        hall_id: hallId,
        event_type: eventType,
        event_date: eventDate,
        start_time: startTime,
        end_time: endTime,
        guest_count: guestCount ? Number(guestCount) : undefined,
        total_amount_paise: totalAmount ? Number(totalAmount) * 100 : undefined,
        advance_amount_paise: advanceAmount ? Number(advanceAmount) * 100 : undefined,
        advance_payment_mode: advanceAmount ? advancePaymentMode : undefined,
        advance_transaction_ref: (advanceAmount && advanceTransactionRef.trim()) ? advanceTransactionRef.trim() : undefined,
        notes: notes || undefined,
      });

      if (result.success) {
        toast.success('Booking created successfully! 🎉', {
          description: `${result.booking?.booking_number} — ${formatDate(eventDate)}`,
        });
        handleClose();
      } else {
        toast.error(result.error || 'Failed to create booking');
        setIsSubmitting(false);
      }
    } catch (err) {
      toast.error('An error occurred during booking creation');
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    closeQuickAdd();
    setCustomerSearch(''); setSelectedCustomerId(null); setNewCustomerName('');
    setNewCustomerPhone(''); setIsNewCustomer(false); setEventDate('');
    setHallId(''); setEventType('wedding'); setGuestCount('');
    setTotalAmount(''); setAdvanceAmount('');
    setAdvancePaymentMode('cash'); setAdvanceTransactionRef('');
    setStartTime('10:00'); setEndTime('22:00'); setNotes(''); setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50 drawer-overlay" onClick={handleClose} />
      <div className="fixed top-0 right-0 h-full w-full sm:w-[460px] bg-white z-50 shadow-2xl flex flex-col drawer-content">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">New Booking</h2>
            <p className="text-xs text-gray-400 mt-0.5">Fill in the details below</p>
          </div>
          <button onClick={handleClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Customer */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Customer <span className="text-danger-500">*</span></label>
            {selectedCustomer && !isNewCustomer ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-50 border border-brand-100">
                <div className="w-10 h-10 rounded-lg bg-brand-500 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{selectedCustomer.name[0]}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{selectedCustomer.name}</p>
                  <p className="text-xs text-gray-500">{selectedCustomer.phone}</p>
                </div>
                <button id="btn-qa-change-customer" onClick={() => { setSelectedCustomerId(null); setCustomerSearch(''); }} className="text-xs text-brand-600 font-medium">Change</button>
              </div>
            ) : isNewCustomer ? (
              <div className="space-y-3 p-4 rounded-xl bg-green-50 border border-green-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-green-700">New Customer</span>
                  <button id="btn-qa-cancel-new-customer" onClick={() => setIsNewCustomer(false)} className="text-xs text-green-600 font-medium">Cancel</button>
                </div>
                <input id="input-qa-new-customer-name" type="text" placeholder="Customer name" value={newCustomerName} onChange={(e) => setNewCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-green-200 text-sm focus:ring-2 focus:ring-green-300 outline-none" />
                <input id="input-qa-new-customer-phone" type="tel" placeholder="Phone (10 digits)" value={newCustomerPhone} onChange={(e) => setNewCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-green-200 text-sm focus:ring-2 focus:ring-green-300 outline-none" />
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input id="input-qa-customer-search" type="text" placeholder="Search by name or phone..." value={customerSearch}
                    onChange={(e) => { setCustomerSearch(e.target.value); setShowCustomerDropdown(true); }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none" />
                </div>
                {showCustomerDropdown && customerSearch.length >= 2 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto animate-fade-in-down">
                    {filteredCustomers.length === 0 ? (
                      <div className="p-3 text-sm text-gray-400 text-center">No customers found</div>
                    ) : (
                      filteredCustomers.map((c) => (
                        <button key={c.id} onClick={() => { setSelectedCustomerId(c.id); setShowCustomerDropdown(false); setCustomerSearch(''); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                            <span className="text-xs font-bold text-gray-600">{c.name[0]}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{c.name}</p>
                            <p className="text-xs text-gray-400">{c.phone}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
                <button id="btn-qa-add-new-customer" onClick={() => { setIsNewCustomer(true); setShowCustomerDropdown(false); }}
                  className="flex items-center gap-2 mt-2 text-xs font-semibold text-brand-600 hover:text-brand-700">
                  <Plus className="w-3.5 h-3.5" /> Add new customer
                </button>
              </div>
            )}
          </div>

          {/* Date + Hall */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Event Date <span className="text-danger-500">*</span></label>
              <DatePicker id="input-qa-event-date" value={eventDate} onChange={setEventDate} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Hall <span className="text-danger-500">*</span></label>
              <select id="select-qa-hall-id" value={hallId} onChange={(e) => setHallId(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none appearance-none bg-white">
                <option value="">Select hall</option>
                {halls.filter((h) => h.is_active).map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Availability */}
          {isAvailable !== null && hallId && eventDate && (
            <div className={cn('flex items-center gap-2 px-3.5 py-2.5 rounded-xl border animate-fade-in',
              isAvailable ? 'bg-success-50 border-green-100' : 'bg-danger-50 border-red-100')}>
              {isAvailable ? <Check className="w-4 h-4 text-success-500" /> : <X className="w-4 h-4 text-danger-500" />}
              <span className={cn('text-xs font-semibold', isAvailable ? 'text-success-500' : 'text-danger-500')}>
                {isAvailable ? `${selectedHall?.name} available on ${formatDate(eventDate)}` : 'Hall not available at this time'}
              </span>
            </div>
          )}

          {/* Event Type + Guests */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Event Type</label>
              <select id="select-qa-event-type" value={eventType} onChange={(e) => setEventType(e.target.value as EventType)}
                className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none appearance-none bg-white">
                {eventTypes.map((et) => <option key={et} value={et}>{eventTypeLabels[et]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Guests</label>
              <input id="input-qa-guest-count" type="number" placeholder="300" value={guestCount} onChange={(e) => setGuestCount(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none" />
            </div>
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Start Time</label>
              <TimePicker id="input-qa-start-time" value={startTime} onChange={setStartTime} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">End Time</label>
              <TimePicker id="input-qa-end-time" value={endTime} onChange={setEndTime} />
            </div>
          </div>

          {/* Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Total (₹)</label>
              <input id="input-qa-total-amount" type="number" placeholder="3,50,000" value={totalAmount}
                onChange={(e) => { setTotalAmount(e.target.value); if (e.target.value) setAdvanceAmount(String(Math.round(Number(e.target.value) * 0.25))); }}
                className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Advance (₹)</label>
              <input id="input-qa-advance-amount" type="number" placeholder="87,500" value={advanceAmount} onChange={(e) => setAdvanceAmount(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none" />
            </div>
          </div>

          {/* Advance Payment Details */}
          {Number(advanceAmount) > 0 && (
            <div className="grid grid-cols-2 gap-3 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Advance Mode</label>
                <select id="select-qa-advance-mode" value={advancePaymentMode} onChange={(e) => setAdvancePaymentMode(e.target.value as PaymentMode)}
                  className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none appearance-none bg-white">
                  {Object.entries(paymentModeLabels).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Ref No.</label>
                <input id="input-qa-advance-ref" type="text" placeholder="TXN123456" value={advanceTransactionRef} onChange={(e) => setAdvanceTransactionRef(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none" />
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Notes</label>
            <textarea id="textarea-qa-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Any special requirements..."
              className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none resize-none" />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4 space-y-2.5">
          <button id="btn-qa-save-booking" onClick={handleSubmit} disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? 'Saving Booking...' : (
              <>
                <Check className="w-4 h-4" /> Save Booking
              </>
            )}
          </button>
          <button id="btn-qa-cancel" onClick={handleClose}
            className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
