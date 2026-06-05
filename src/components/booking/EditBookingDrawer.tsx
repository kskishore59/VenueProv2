import { useState, useEffect } from 'react';
import { X, Check, CalendarDays, MapPin, Clock, Users, IndianRupee, Boxes, Trash2, Plus, AlertTriangle } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';
import { useDataStore } from '@/stores/data-store';
import { eventTypes, eventTypeLabels, type EventType, type BookingStatus } from '@/types/booking';
import { toast } from 'sonner';
import { DatePicker } from '@/components/shared/DatePicker';
import { TimePicker } from '@/components/shared/TimePicker';
import { inventoryCategoryLabels } from '@/types/inventory';

const statusOptions: { value: BookingStatus; label: string }[] = [
  { value: 'inquiry', label: 'Inquiry' },
  { value: 'hold', label: 'Hold' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
];

export function EditBookingDrawer() {
  const isOpen = useUIStore((s) => s.isEditBookingOpen);
  const bookingId = useUIStore((s) => s.editBookingId);
  const closeEditBooking = useUIStore((s) => s.closeEditBooking);

  const booking = useDataStore((s) => (bookingId ? s.getBookingById(bookingId) : undefined));
  const updateBooking = useDataStore((s) => s.updateBooking);
  const halls = useDataStore((s) => s.halls);
  const checkAvailability = useDataStore((s) => s.checkAvailability);

  const [hallId, setHallId] = useState('');
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [status, setStatus] = useState<BookingStatus>('confirmed');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Inventory logic
  const fetchAllocationsForBooking = useDataStore((s) => s.fetchAllocationsForBooking);
  const allocateInventory = useDataStore((s) => s.allocateInventory);
  const checkInventoryAvailability = useDataStore((s) => s.checkInventoryAvailability);
  const inventoryItems = useDataStore((s) => s.inventoryItems);

  const [localAllocs, setLocalAllocs] = useState<{ inventory_item_id: string; quantity: number }[]>([]);

  useEffect(() => {
    async function loadAllocs() {
      if (bookingId) {
        const data = await fetchAllocationsForBooking(bookingId);
        setLocalAllocs((data || []).map(d => ({ inventory_item_id: d.inventory_item_id, quantity: d.quantity })));
      }
    }
    loadAllocs();
  }, [bookingId, fetchAllocationsForBooking]);

  // Sync form when booking loads
  useEffect(() => {
    if (booking) {
      setHallId(booking.hall_id);
      setEventType(booking.event_type);
      setEventDate(booking.event_date);
      setStartTime(booking.start_time);
      setEndTime(booking.end_time);
      setGuestCount(booking.guest_count ? String(booking.guest_count) : '');
      setTotalAmount(String(booking.total_amount_paise / 100));
      setStatus(booking.status);
      setNotes(booking.notes || '');
    }
  }, [booking]);

  if (!isOpen || !bookingId || !booking) return null;

  console.log('DEBUG: Availability Check Params in EditBookingDrawer:', {
    hallId,
    eventDate,
    startTime,
    endTime,
    bookingId
  });

  const isAvailable = hallId && eventDate && startTime && endTime
    ? checkAvailability(hallId, eventDate, startTime, endTime, bookingId)
    : true;

  console.log('DEBUG: isAvailable result:', isAvailable);

  const handleSave = async () => {
    if (!isAvailable) {
      toast.error('Hall is not available at the selected date/time');
      return;
    }

    // Validate inventory stock limit before saving
    for (const alloc of localAllocs) {
      const avail = checkInventoryAvailability(bookingId, eventDate, startTime, endTime, alloc.inventory_item_id, alloc.quantity);
      if (!avail.success) {
        const item = inventoryItems.find(i => i.id === alloc.inventory_item_id);
        toast.error(`Stock limit exceeded for "${item?.name || 'Item'}". Only ${avail.available} available.`);
        return;
      }
    }

    setIsSaving(true);
    try {
      await updateBooking(bookingId, {
        hall_id: hallId,
        event_type: eventType,
        event_date: eventDate,
        start_time: startTime,
        end_time: endTime,
        guest_count: guestCount ? Number(guestCount) : null,
        total_amount_paise: Number(totalAmount) * 100,
        status,
        notes: notes || null,
      });

      // Update allocations
      await allocateInventory(bookingId, localAllocs);

      toast.success('Booking updated! ✏️', { description: booking.booking_number });
      closeEditBooking();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update booking');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50 drawer-overlay" onClick={closeEditBooking} />
      <div className="fixed top-0 right-0 h-full w-full sm:w-[460px] bg-white z-50 shadow-2xl flex flex-col drawer-content">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Edit Booking</h2>
            <p className="text-xs text-gray-400 mt-0.5">{booking.booking_number}</p>
          </div>
          <button onClick={closeEditBooking} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Status</label>
            <div className="flex gap-2 flex-wrap">
              {statusOptions.map((opt) => (
                <button key={opt.value} onClick={() => setStatus(opt.value)}
                  className={cn('px-3.5 py-2 rounded-lg text-xs font-semibold transition-all border',
                    status === opt.value ? 'bg-brand-600 text-white border-brand-600 shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50')}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Event Date + Hall */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Event Date</label>
              <DatePicker id="input-eb-event-date" value={eventDate} onChange={setEventDate} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Hall</label>
              <select id="select-eb-hall-id" value={hallId} onChange={(e) => setHallId(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-300 outline-none transition-all appearance-none bg-white">
                {halls.filter((h) => h.is_active).map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Availability indicator */}
          {!isAvailable && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-danger-50 border border-red-100 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-danger-500" />
              <span className="text-xs font-semibold text-danger-500">
                Hall is not available at this date/time
              </span>
            </div>
          )}

          {/* Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Start</label>
              <TimePicker id="input-eb-start-time" value={startTime} onChange={setStartTime} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">End</label>
              <TimePicker id="input-eb-end-time" value={endTime} onChange={setEndTime} />
            </div>
          </div>

          {/* Event Type + Guests */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Event Type</label>
              <select id="select-eb-event-type" value={eventType} onChange={(e) => setEventType(e.target.value as EventType)}
                className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-300 outline-none transition-all appearance-none bg-white">
                {eventTypes.map((et) => <option key={et} value={et}>{eventTypeLabels[et]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Guests</label>
              <input id="input-eb-guest-count" type="number" value={guestCount} onChange={(e) => setGuestCount(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-300 outline-none transition-all" />
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Total Amount (₹)</label>
            <div className="relative">
              <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input id="input-eb-total-amount" type="number" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)}
                className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-300 outline-none transition-all" />
            </div>
          </div>

          {/* Resource & Inventory Allocations */}
          <div className="border-t border-gray-100 pt-4 space-y-3">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Boxes className="w-4 h-4 text-brand-600" />
              <span>Resource & Inventory Allocations</span>
            </h4>
            
            {/* List current local allocations */}
            {localAllocs.length > 0 && (
              <div className="space-y-2">
                {localAllocs.map((alloc, idx) => {
                  const item = inventoryItems.find(i => i.id === alloc.inventory_item_id);
                  if (!item) return null;
                  const avail = checkInventoryAvailability(bookingId, eventDate, startTime, endTime, alloc.inventory_item_id, alloc.quantity);
                  
                  return (
                    <div key={alloc.inventory_item_id} className="p-3 rounded-xl bg-gray-50/50 border border-gray-150 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-gray-800">{item.name}</p>
                          <p className="text-[10px] text-gray-400 capitalize mt-0.5">{inventoryCategoryLabels[item.category]}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setLocalAllocs(localAllocs.filter(la => la.inventory_item_id !== alloc.inventory_item_id));
                          }}
                          className="text-gray-400 hover:text-rose-600 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0">Quantity:</label>
                        <input
                          type="number"
                          min="1"
                          max={item.total_quantity}
                          value={alloc.quantity}
                          onChange={(e) => {
                            const newQty = parseInt(e.target.value, 10) || 1;
                            setLocalAllocs(localAllocs.map((la, i) => i === idx ? { ...la, quantity: newQty } : la));
                          }}
                          className="w-20 px-2 py-1 rounded-lg border border-gray-250 text-xs bg-white focus:ring-1 focus:ring-brand-500 outline-none text-right font-semibold"
                        />
                        <span className="text-[10px] text-gray-400 font-semibold">(Max Stock: {item.total_quantity})</span>
                      </div>

                      {!avail.success && (
                        <div className="flex items-center gap-1.5 text-[10px] text-rose-600 font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Stock conflict! Only {avail.available} available for this slot.</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Dropdown to add item allocation */}
            {inventoryItems.filter(item => !localAllocs.some(la => la.inventory_item_id === item.id)).length > 0 ? (
              <div className="flex gap-2 items-center bg-gray-50/50 p-2.5 border border-gray-150 rounded-xl">
                <select
                  value=""
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) {
                      setLocalAllocs([...localAllocs, { inventory_item_id: val, quantity: 1 }]);
                    }
                  }}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-250 text-xs bg-white focus:ring-1 focus:ring-brand-500 outline-none"
                >
                  <option value="">+ Add item allocation...</option>
                  {inventoryItems
                    .filter(item => !localAllocs.some(la => la.inventory_item_id === item.id))
                    .map(item => (
                      <option key={item.id} value={item.id}>{item.name} ({inventoryCategoryLabels[item.category]})</option>
                    ))}
                </select>
              </div>
            ) : inventoryItems.length === 0 ? (
              <p className="text-[11px] text-gray-400 font-semibold italic">Configure inventory stock catalog items in Settings first.</p>
            ) : null}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Notes</label>
            <textarea id="textarea-eb-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-300 outline-none transition-all resize-none" />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4 space-y-2.5">
          <button id="btn-eb-save-changes" onClick={handleSave}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 active:scale-[0.98] transition-all shadow-sm disabled:opacity-55 disabled:cursor-not-allowed">
            {isSaving ? (
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {isSaving ? 'Saving Changes...' : 'Save Changes'}
          </button>
          <button id="btn-eb-cancel" onClick={closeEditBooking}
            className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
