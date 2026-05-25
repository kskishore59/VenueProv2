import { useState } from 'react';
import { X, Phone, Calendar, Users, MapPin, IndianRupee, ArrowRight, Edit, Plus, Clock } from 'lucide-react';
import { cn, formatCurrency, formatDateReadable, formatPhone, getRelativeTime, getInitials } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';
import { useDataStore } from '@/stores/data-store';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { WhatsAppButton } from '@/components/shared/WhatsAppButton';
import { leadStatusConfig, leadSourceLabels, type LeadStatus } from '@/types/lead';
import { eventTypeLabels, type EventType } from '@/types/booking';
import { toast } from 'sonner';
import { DatePicker } from '@/components/shared/DatePicker';
import { TimePicker } from '@/components/shared/TimePicker';
import { useAuthStore } from '@/stores/auth-store';
import { hasPermission } from '@/lib/permissions';

const statusFlow: LeadStatus[] = ['new', 'contacted', 'visit_scheduled', 'negotiation', 'won', 'lost'];

export function LeadDrawer() {
  const isOpen = useUIStore((s) => s.isLeadDrawerOpen);
  const leadId = useUIStore((s) => s.selectedLeadId);
  const closeLeadDrawer = useUIStore((s) => s.closeLeadDrawer);
  const openQuickAdd = useUIStore((s) => s.openQuickAdd);
  const openEditLead = useUIStore((s) => s.openEditLead);

  const lead = useDataStore((s) => (leadId ? s.getLeadById(leadId) : undefined));
  const updateLeadStatus = useDataStore((s) => s.updateLeadStatus);
  const updateLead = useDataStore((s) => s.updateLead);
  const convertLeadToBooking = useDataStore((s) => s.convertLeadToBooking);
  const halls = useDataStore((s) => s.halls);
  const role = useAuthStore((s) => s.profile?.role);
  const organization = useDataStore((s) => s.organization);

  const canUpdateLeads = hasPermission(role, 'leads', 'update', organization?.settings);
  const canCreateBookings = hasPermission(role, 'bookings', 'create', organization?.settings);

  const [isEditing, setIsEditing] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [showConvert, setShowConvert] = useState(false);
  const [convertHall, setConvertHall] = useState('');
  const [convertDate, setConvertDate] = useState('');
  const [convertStartTime, setConvertStartTime] = useState('10:00');
  const [convertEndTime, setConvertEndTime] = useState('22:00');
  const [convertAmount, setConvertAmount] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  if (!isOpen || !leadId || !lead) return null;

  const handleStatusChange = async (status: LeadStatus) => {
    try {
      await updateLeadStatus(leadId, status);
      toast.success(`Lead status updated to "${status.replace('_', ' ')}"`, {
        description: lead.name,
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      await updateLead(leadId, { notes: editNotes });
      setIsEditing(false);
      toast.success('Notes updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update notes');
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleConvertToBooking = async () => {
    if (!convertHall || !convertDate) {
      toast.error('Please select a hall and date');
      return;
    }
    setIsConverting(true);
    try {
      const result = await convertLeadToBooking(leadId, {
        hall_id: convertHall,
        event_date: convertDate,
        start_time: convertStartTime,
        end_time: convertEndTime,
        total_amount_paise: convertAmount ? Number(convertAmount) * 100 : lead.budget_max_paise || 0,
      });

      if (result.success) {
        toast.success('Lead converted to booking! 🎉', {
          description: `${lead.name} — Booking ${result.booking?.booking_number}`,
        });
        setShowConvert(false);
        closeLeadDrawer();
      } else {
        toast.error(result.error || 'Failed to convert lead');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to convert lead');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50 drawer-overlay" onClick={closeLeadDrawer} />
      <div className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white z-50 shadow-2xl flex flex-col drawer-content">
        {/* Header */}
        <div className="relative px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-violet-50/50 to-white">
          <div className="absolute top-4 right-4 flex items-center gap-1">
            {canUpdateLeads && (
              <button onClick={() => { closeLeadDrawer(); openEditLead(leadId); }} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400" title="Edit Lead">
                <Edit className="w-4.5 h-4.5" />
              </button>
            )}
            <button onClick={closeLeadDrawer} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-gray-400">{leadSourceLabels[lead.source]}</span>
            <StatusBadge type="lead" status={lead.status} pulse={lead.status === 'new'} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 pr-10">{lead.name}</h2>
          <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-2">
            <Phone className="w-3.5 h-3.5" />
            {formatPhone(lead.phone)}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Quick info */}
          <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
            <div className="px-4 py-4 text-center">
              <Calendar className="w-4 h-4 text-gray-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-gray-900">{lead.tentative_date ? formatDateReadable(lead.tentative_date) : '—'}</p>
              <p className="text-[11px] text-gray-400">Event Date</p>
            </div>
            <div className="px-4 py-4 text-center">
              <Users className="w-4 h-4 text-gray-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-gray-900">{lead.guest_count || '—'}</p>
              <p className="text-[11px] text-gray-400">Guests</p>
            </div>
            <div className="px-4 py-4 text-center">
              <IndianRupee className="w-4 h-4 text-gray-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-gray-900 truncate px-1">
                {lead.budget_min_paise ? formatCurrency(lead.budget_min_paise) : '—'}
              </p>
              <p className="text-[11px] text-gray-400">Budget</p>
            </div>
          </div>

          {/* Details */}
          <div className="px-6 py-5 border-b border-gray-100 space-y-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] text-gray-400 mb-0.5">Event Type</p>
                <p className="text-sm font-medium text-gray-700">
                  {lead.event_type ? eventTypeLabels[lead.event_type as EventType] || lead.event_type : '—'}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 mb-0.5">Hall Preference</p>
                <p className="text-sm font-medium text-gray-700">{lead.hall_preference || '—'}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 mb-0.5">Budget Range</p>
                <p className="text-sm font-medium text-gray-700">
                  {lead.budget_min_paise
                    ? `${formatCurrency(lead.budget_min_paise)} – ${formatCurrency(lead.budget_max_paise || lead.budget_min_paise)}`
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 mb-0.5">Follow-up</p>
                <p className={cn('text-sm font-medium', lead.follow_up_date && lead.follow_up_date <= new Date().toISOString().split('T')[0] ? 'text-warning-500' : 'text-gray-700')}>
                  {lead.follow_up_date ? getRelativeTime(lead.follow_up_date + 'T00:00:00Z') : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Status Pipeline */}
          <div className="px-6 py-5 border-b border-gray-100">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Status Pipeline</h4>
            <div className="flex gap-1.5 flex-wrap">
              {statusFlow.map((s) => {
                const config = leadStatusConfig[s];
                const isCurrent = lead.status === s;
                return (
                  <button
                    key={s}
                    disabled={!canUpdateLeads}
                    onClick={() => handleStatusChange(s)}
                    className={cn(
                      'px-3 py-2 rounded-lg text-xs font-semibold transition-all border',
                      isCurrent
                        ? 'border-transparent shadow-sm'
                        : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600',
                      !canUpdateLeads && 'opacity-65 cursor-not-allowed'
                    )}
                    style={isCurrent ? { backgroundColor: config.bg, color: config.color, borderColor: config.color + '40' } : {}}
                  >
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes</h4>
              {!isEditing && canUpdateLeads && (
                <button
                  onClick={() => { setIsEditing(true); setEditNotes(lead.notes || ''); }}
                  className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  <Edit className="w-3 h-3" /> Edit
                </button>
              )}
            </div>
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-300 outline-none transition-all resize-none"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors disabled:opacity-55 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    {isSavingNotes && <span className="w-3 h-3 rounded-full border border-white/30 border-t-white animate-spin" />}
                    Save
                  </button>
                  <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-lg text-xs font-medium text-gray-400 hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600 leading-relaxed">{lead.notes || 'No notes yet'}</p>
            )}
          </div>

          {/* Convert to Booking section */}
          {lead.status !== 'won' && lead.status !== 'lost' && canCreateBookings && (
            <div className="px-6 py-5">
              {showConvert ? (
                <div className="p-4 rounded-2xl bg-brand-50 border border-brand-100 space-y-4 animate-fade-in">
                  <h4 className="text-sm font-bold text-brand-700">Convert to Booking</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1">Hall *</label>
                      <select
                        value={convertHall}
                        onChange={(e) => setConvertHall(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none"
                      >
                        <option value="">Select</option>
                        {halls.filter((h) => h.is_active).map((h) => (
                          <option key={h.id} value={h.id}>{h.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1">Date *</label>
                      <DatePicker
                        value={convertDate || lead.tentative_date || ''}
                        onChange={setConvertDate}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1">Start</label>
                      <TimePicker
                        value={convertStartTime}
                        onChange={setConvertStartTime}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1">End</label>
                      <TimePicker
                        value={convertEndTime}
                        onChange={setConvertEndTime}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Total Amount (₹)</label>
                    <input
                      type="number"
                      placeholder={lead.budget_max_paise ? String(lead.budget_max_paise / 100) : ''}
                      value={convertAmount}
                      onChange={(e) => setConvertAmount(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleConvertToBooking}
                      disabled={isConverting}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 active:scale-[0.98] transition-all disabled:opacity-55 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      {isConverting && <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                      Convert & Create Booking
                    </button>
                    <button onClick={() => setShowConvert(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setShowConvert(true);
                    setConvertDate(lead.tentative_date || '');
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-brand-200 text-brand-600 text-sm font-semibold hover:bg-brand-50 transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                  Convert to Booking
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4 flex gap-2.5">
          <WhatsAppButton
            phone={lead.phone}
            variant="button"
            size="md"
            label="WhatsApp"
            message={`Hi ${lead.name.split(' ')[0]}, this is from ${useDataStore.getState().organization.name}. `}
            className="flex-1"
            leadId={lead.id}
          />
          {lead.email && (
            <a
              href={`mailto:${lead.email}`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Email
            </a>
          )}
        </div>
      </div>
    </>
  );
}
