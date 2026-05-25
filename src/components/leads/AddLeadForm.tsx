import { useState } from 'react';
import { X, Plus, Phone, Calendar, Users, IndianRupee, MapPin } from 'lucide-react';
import { cn, validateIndianPhone } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';
import { useDataStore } from '@/stores/data-store';
import { eventTypes, eventTypeLabels, type EventType } from '@/types/booking';
import { leadSourceLabels, type LeadSource } from '@/types/lead';
import { toast } from 'sonner';
import { DatePicker } from '@/components/shared/DatePicker';

const leadSources: LeadSource[] = ['walk_in', 'phone_call', 'whatsapp', 'google', 'referral', 'social_media', 'justdial', 'website', 'other'];

export function AddLeadForm() {
  const isOpen = useUIStore((s) => s.isAddLeadOpen);
  const closeAddLead = useUIStore((s) => s.closeAddLead);
  const createLead = useDataStore((s) => s.createLead);
  const halls = useDataStore((s) => s.halls);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [eventType, setEventType] = useState<string>('');
  const [tentativeDate, setTentativeDate] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [source, setSource] = useState<LeadSource>('phone_call');
  const [notes, setNotes] = useState('');
  const [hallPreference, setHallPreference] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    if (!validateIndianPhone(phone)) { toast.error('Enter a valid 10-digit phone number'); return; }

    setIsSubmitting(true);
    try {
      await createLead({
        name: name.trim(),
        phone,
        email: email || undefined,
        event_type: eventType || undefined,
        tentative_date: tentativeDate || undefined,
        budget_min_paise: budgetMin ? Number(budgetMin) * 100 : undefined,
        budget_max_paise: budgetMax ? Number(budgetMax) * 100 : undefined,
        source,
        notes: notes || undefined,
        hall_preference: hallPreference || undefined,
        guest_count: guestCount ? Number(guestCount) : undefined,
        follow_up_date: followUpDate || undefined,
      });

      toast.success('Lead added! 🎯', { description: `${name} — ${leadSourceLabels[source]}` });
      handleClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    closeAddLead();
    setName(''); setPhone(''); setEmail(''); setEventType('');
    setTentativeDate(''); setBudgetMin(''); setBudgetMax('');
    setSource('phone_call'); setNotes(''); setHallPreference('');
    setGuestCount(''); setFollowUpDate('');
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50 drawer-overlay" onClick={handleClose} />
      <div className="fixed top-0 right-0 h-full w-full sm:w-[460px] bg-white z-50 shadow-2xl flex flex-col drawer-content">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">New Lead / Inquiry</h2>
            <p className="text-xs text-gray-400 mt-0.5">Track a potential customer</p>
          </div>
          <button onClick={handleClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Name + Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                Name <span className="text-danger-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Customer name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-300 outline-none transition-all"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                Phone <span className="text-danger-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-300 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Email</label>
            <input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-300 outline-none transition-all"
            />
          </div>

          {/* Event Type + Guest Count */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Event Type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-300 outline-none transition-all appearance-none bg-white"
              >
                <option value="">Select</option>
                {eventTypes.map((et) => (
                  <option key={et} value={et}>{eventTypeLabels[et]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Guests</label>
              <div className="relative">
                <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  placeholder="200"
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-300 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Tentative Date + Follow-up Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Tentative Date</label>
              <DatePicker value={tentativeDate} onChange={setTentativeDate} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Follow-up Date</label>
              <DatePicker value={followUpDate} onChange={setFollowUpDate} />
            </div>
          </div>

          {/* Budget Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Budget Min (₹)</label>
              <div className="relative">
                <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  placeholder="2,00,000"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-300 outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Budget Max (₹)</label>
              <div className="relative">
                <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  placeholder="5,00,000"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-300 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Source + Hall Preference */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as LeadSource)}
                className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-300 outline-none transition-all appearance-none bg-white"
              >
                {leadSources.map((s) => (
                  <option key={s} value={s}>{leadSourceLabels[s]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Hall Pref</label>
              <select
                value={hallPreference}
                onChange={(e) => setHallPreference(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-300 outline-none transition-all appearance-none bg-white"
              >
                <option value="">None</option>
                {halls.filter((h) => h.is_active).map((h) => (
                  <option key={h.id} value={h.name}>{h.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any details about this inquiry..."
              rows={3}
              className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-300 outline-none transition-all resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4 space-y-2.5">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 active:scale-[0.98] transition-all shadow-sm disabled:opacity-55 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {isSubmitting ? 'Saving Lead...' : 'Add Lead'}
          </button>
          <button
            onClick={handleClose}
            className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
