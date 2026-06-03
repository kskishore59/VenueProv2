import { useState } from 'react';
import { Search, Plus, PhoneIncoming, Calendar } from 'lucide-react';
import { cn, formatCurrency, formatDateReadable, getRelativeTime, formatPhone } from '@/lib/utils';
import { useDataStore } from '@/stores/data-store';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { WhatsAppButton } from '@/components/shared/WhatsAppButton';
import { CallButton } from '@/components/shared/CallButton';
import { useUIStore } from '@/stores/ui-store';
import { type LeadStatus, leadSourceLabels } from '@/types/lead';
import { eventTypeLabels, type EventType } from '@/types/booking';
import { useAuthStore } from '@/stores/auth-store';
import { hasPermission } from '@/lib/permissions';
import { DateRangeFilter } from '@/components/shared/DateRangeFilter';
import { EmptyState } from '@/components/shared/EmptyState';
import { 
  format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, 
  addMonths 
} from 'date-fns';

const statusFilters: { value: LeadStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'new', label: '🆕 New' },
  { value: 'contacted', label: '📞 Contacted' },
  { value: 'visit_scheduled', label: '🗓 Visit' },
  { value: 'negotiation', label: '🤝 Negotiation' },
  { value: 'won', label: '✅ Won' },
  { value: 'lost', label: '❌ Lost' },
];

export default function Leads() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({ start: null, end: null });
  const [datePreset, setDatePreset] = useState<string>('all');
  const openLeadDrawer = useUIStore((s) => s.openLeadDrawer);
  const openAddLead = useUIStore((s) => s.openAddLead);

  const calculatePresetRange = (preset: string): { start: string | null; end: string | null } => {
    const now = new Date();
    switch (preset) {
      case 'today': {
        const d = format(now, 'yyyy-MM-dd');
        return { start: d, end: d };
      }
      case 'week': {
        const start = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        const end = format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        return { start, end };
      }
      case 'month': {
        const start = format(startOfMonth(now), 'yyyy-MM-dd');
        const end = format(endOfMonth(now), 'yyyy-MM-dd');
        return { start, end };
      }
      case 'next_month': {
        const nextMonth = addMonths(now, 1);
        const start = format(startOfMonth(nextMonth), 'yyyy-MM-dd');
        const end = format(endOfMonth(nextMonth), 'yyyy-MM-dd');
        return { start, end };
      }
      case 'all':
      default:
        return { start: null, end: null };
    }
  };

  const handlePresetChange = (preset: string) => {
    setDatePreset(preset);
    const range = calculatePresetRange(preset);
    setDateRange(range);
  };

  const leads = useDataStore((s) => s.leads);

  const role = useAuthStore((s) => s.profile?.role);
  const organization = useDataStore((s) => s.organization);
  const canCreateLead = hasPermission(role, 'leads', 'create', organization?.settings);

  const filtered = leads
    .filter((l) => {
      if (statusFilter !== 'all' && l.status !== statusFilter) return false;
      if (dateRange.start) {
        const createdDate = l.created_at.slice(0, 10);
        if (createdDate < dateRange.start) return false;
      }
      if (dateRange.end) {
        const createdDate = l.created_at.slice(0, 10);
        if (createdDate > dateRange.end) return false;
      }
      if (search) {
        const s = search.toLowerCase();
        return l.name.toLowerCase().includes(s) || l.phone.includes(search);
      }
      return true;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads & Inquiries</h1>
          <p className="text-sm text-gray-400 mt-0.5">{leads.length} total leads</p>
        </div>
        {canCreateLead && (
          <button onClick={openAddLead}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 active:scale-95 transition-all shadow-sm">
            <Plus className="w-4 h-4" /> Add Lead
          </button>
        )}
      </div>

      <div className="space-y-3">
        {/* Search */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by name or phone..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none bg-white shadow-sm" />
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Quick Date Presets + Custom Date Range Picker */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
              {[
                { value: 'all', label: 'All Dates' },
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'This Week' },
                { value: 'month', label: 'This Month' },
                { value: 'next_month', label: 'Next Month' },
              ].map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => handlePresetChange(p.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border',
                    datePreset === p.value
                      ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                      : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <DateRangeFilter
              align="left"
              initialPreset="all"
              onChange={(start, end, preset) => {
                setDateRange({ start, end });
                setDatePreset(preset === 'custom' ? 'custom' : preset);
              }}
            />
          </div>

          {/* Status Filters */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {statusFilters.map((f) => (
              <button key={f.value} onClick={() => setStatusFilter(f.value)}
                className={cn('px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border',
                  statusFilter === f.value ? 'bg-brand-600 text-white border-brand-600 shadow-sm' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50')}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={PhoneIncoming}
          title="No leads found"
          description="Create your first inquiry, log caller details, event preferences, and start tracking wedding conversions."
          action={canCreateLead ? { label: "Add First Lead", onClick: openAddLead } : undefined}
        />
      ) : (
        <div className="space-y-3 stagger-children">
          {filtered.map((lead) => {
            const isOverdue = lead.follow_up_date && lead.follow_up_date <= new Date().toISOString().split('T')[0] && lead.status !== 'won' && lead.status !== 'lost';
            return (
              <div key={lead.id} onClick={() => openLeadDrawer(lead.id)}
                className={cn('bg-white rounded-2xl border p-4 cursor-pointer shadow-sm hover:shadow-md transition-all group',
                  isOverdue ? 'border-warning-500/30' : 'border-gray-100')}>
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <span className="text-sm font-bold text-violet-700">{lead.name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-gray-900 truncate">{lead.name}</span>
                      <StatusBadge type="lead" status={lead.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><PhoneIncoming className="w-3 h-3" />{formatPhone(lead.phone)}</span>
                      {lead.event_type && <span>• {eventTypeLabels[lead.event_type as EventType] || lead.event_type}</span>}
                      {lead.tentative_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDateReadable(lead.tentative_date)}</span>}
                      {lead.budget_min_paise && <span>Budget: {formatCurrency(lead.budget_min_paise)}–{formatCurrency(lead.budget_max_paise || lead.budget_min_paise)}</span>}
                    </div>
                    {isOverdue && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-warning-600 animate-pulse-soft">
                        <span className="w-1.5 h-1.5 rounded-full bg-warning-500" />
                        Follow-up overdue • {getRelativeTime(lead.follow_up_date + 'T00:00:00Z')}
                      </div>
                    )}
                    {lead.notes && <p className="mt-2 text-xs text-gray-400 line-clamp-1">{lead.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[12px] font-medium text-gray-500 hidden sm:block">{leadSourceLabels[lead.source]}</span>
                    <CallButton phone={lead.phone} leadName={lead.name} size="sm" />
                    <WhatsAppButton phone={lead.phone} size="sm" leadId={lead.id} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
