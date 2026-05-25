import { useState, useEffect } from 'react';
import { X, Check, Trash2, IndianRupee, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';
import { useDataStore } from '@/stores/data-store';
import { leadSourceLabels, type LeadSource } from '@/types/lead';
import { eventTypes, eventTypeLabels, type EventType } from '@/types/booking';
import { toast } from 'sonner';
import { DatePicker } from '@/components/shared/DatePicker';

export function EditLeadDrawer() {
  const isOpen = useUIStore((s) => s.isEditLeadOpen);
  const leadId = useUIStore((s) => s.selectedEditLeadId);
  const closeEditLead = useUIStore((s) => s.closeEditLead);
  const showConfirm = useUIStore((s) => s.showConfirm);

  const lead = useDataStore((s) => (leadId ? s.getLeadById(leadId) : undefined));
  const updateLead = useDataStore((s) => s.updateLead);
  const deleteLead = useDataStore((s) => s.deleteLead);
  const halls = useDataStore((s) => s.halls);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [eventType, setEventType] = useState('');
  const [tentativeDate, setTentativeDate] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [source, setSource] = useState<LeadSource>('other');
  const [notes, setNotes] = useState('');
  const [hallPreference, setHallPreference] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (lead) {
      setName(lead.name);
      setPhone(lead.phone);
      setEmail(lead.email || '');
      setEventType(lead.event_type || '');
      setTentativeDate(lead.tentative_date || '');
      setBudgetMin(lead.budget_min_paise ? String(lead.budget_min_paise / 100) : '');
      setBudgetMax(lead.budget_max_paise ? String(lead.budget_max_paise / 100) : '');
      setSource(lead.source);
      setNotes(lead.notes || '');
      setHallPreference(lead.hall_preference || '');
      setGuestCount(lead.guest_count ? String(lead.guest_count) : '');
      setFollowUpDate(lead.follow_up_date || '');
    }
  }, [lead]);

  if (!isOpen || !leadId || !lead) return null;

  const handleSave = async () => {
    if (isSaving) return;
    if (!name || !phone) {
      toast.error('Name and Phone number are required');
      return;
    }

    setIsSaving(true);
    try {
      await updateLead(leadId, {
        name,
        phone,
        email: email || null,
        event_type: eventType || null,
        tentative_date: tentativeDate || null,
        budget_min_paise: budgetMin ? Number(budgetMin) * 100 : null,
        budget_max_paise: budgetMax ? Number(budgetMax) * 100 : null,
        source,
        notes: notes || null,
        hall_preference: hallPreference || null,
        guest_count: guestCount ? Number(guestCount) : null,
        follow_up_date: followUpDate || null,
      });

      toast.success('Lead updated! ✏️');
      closeEditLead();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update lead');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    showConfirm({
      title: 'Delete Lead',
      description: `Are you sure you want to delete lead for "${lead.name}"? This action cannot be undone.`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deleteLead(leadId);
          closeEditLead();
        } catch (err: any) {
          toast.error(err.message || 'Failed to delete lead');
        }
      },
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50 drawer-overlay" onClick={closeEditLead} />
      <div className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white z-50 shadow-2xl flex flex-col drawer-content">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Edit Lead</h2>
            <p className="text-xs text-gray-400 mt-0.5">{lead.name}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              id="btn-el-delete"
              onClick={handleDelete}
              className="p-2 rounded-xl hover:bg-rose-50 text-rose-500 transition-colors"
              title="Delete Lead"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button onClick={closeEditLead} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Lead Name *</label>
              <input id="input-el-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Phone *</label>
              <input id="input-el-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Email</label>
              <input id="input-el-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Source</label>
              <select id="select-el-source" value={source} onChange={(e) => setSource(e.target.value as LeadSource)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all bg-white">
                {Object.entries(leadSourceLabels).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Event Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Event Type</label>
              <select id="select-el-event-type" value={eventType} onChange={(e) => setEventType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all bg-white">
                <option value="">Select Event Type</option>
                {eventTypes.map((et) => (
                  <option key={et} value={et}>{eventTypeLabels[et]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Tentative Date</label>
              <DatePicker id="input-el-tentative-date" value={tentativeDate} onChange={setTentativeDate} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Hall Preference</label>
              <select id="select-el-hall-pref" value={hallPreference} onChange={(e) => setHallPreference(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all bg-white">
                <option value="">No Preference</option>
                {halls.map((h) => (
                  <option key={h.id} value={h.name}>{h.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Expected Guests</label>
              <input id="input-el-guest-count" type="number" value={guestCount} onChange={(e) => setGuestCount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all" />
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Min Budget (₹)</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input id="input-el-budget-min" type="number" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Max Budget (₹)</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input id="input-el-budget-max" type="number" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all" />
              </div>
            </div>
          </div>

          {/* Follow Up */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-brand-600" /> Follow-up Date
            </label>
            <DatePicker id="input-el-follow-up-date" value={followUpDate} onChange={setFollowUpDate} />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Notes</label>
            <textarea id="textarea-el-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all resize-none" />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4 space-y-2.5">
          <button id="btn-el-save" onClick={handleSave}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 active:scale-[0.98] transition-all shadow-sm disabled:opacity-55 disabled:cursor-not-allowed">
            {isSaving ? (
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {isSaving ? 'Saving Changes...' : 'Save Changes'}
          </button>
          <button id="btn-el-cancel" onClick={closeEditLead}
            className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
