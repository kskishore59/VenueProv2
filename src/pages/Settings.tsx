import { Building2, MapPin } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { useDataStore } from '@/stores/data-store';
import { useUIStore } from '@/stores/ui-store';
import { hallTypeLabels } from '@/types/venue';
import { toast } from 'sonner';
import { useState } from 'react';

export default function Settings() {
  const organization = useDataStore((s) => s.organization);
  const halls = useDataStore((s) => s.halls);
  const updateOrganization = useDataStore((s) => s.updateOrganization);
  const openAddHall = useUIStore((s) => s.openAddHall);

  const [name, setName] = useState(organization.name);
  const [gstin, setGstin] = useState(organization.gstin || '');
  const [phone, setPhone] = useState(organization.phone || '');
  const [email, setEmail] = useState(organization.email || '');
  const [address, setAddress] = useState(organization.address || '');

  const [shouldCrash, setShouldCrash] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateOrganization({ name, gstin: gstin || null, phone: phone || null, email: email || null, address: address || null });
      toast.success('Settings saved! ✅');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (shouldCrash) {
    throw new Error('This is a simulated Page-Level crash from Settings diagnostic tools.');
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div><h1 className="text-2xl font-bold text-gray-900">Settings</h1><p className="text-sm text-gray-400 mt-0.5">Manage your venue and preferences</p></div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><Building2 className="w-4 h-4 text-brand-600" />Venue Information</h3>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Venue Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">GSTIN</label>
              <input type="text" value={gstin} onChange={(e) => setGstin(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-mono focus:ring-2 focus:ring-brand-200 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Phone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Address</label>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all resize-none" />
          </div>
          <button onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 active:scale-95 transition-all shadow-sm disabled:opacity-55 disabled:cursor-not-allowed flex items-center gap-1.5">
            {isSaving && <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
            {isSaving ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><MapPin className="w-4 h-4 text-brand-600" />Halls & Spaces</h3>
          <button onClick={openAddHall} className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors">+ Add Hall</button>
        </div>
        <div className="divide-y divide-gray-50">
          {halls.map((hall) => (
            <div key={hall.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', hall.is_active ? 'bg-brand-50' : 'bg-gray-100')}>
                <Building2 className={cn('w-4 h-4', hall.is_active ? 'text-brand-600' : 'text-gray-400')} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{hall.name}</span>
                  {hall.is_active ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-success-50 text-success-500">Active</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-400">Inactive</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                  <span>{hallTypeLabels[hall.type]}</span><span>•</span>
                  <span>{hall.capacity_min}–{hall.capacity_max} guests</span>
                  {hall.area_sqft && <><span>•</span><span>{hall.area_sqft.toLocaleString()} sq ft</span></>}
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-700">{formatCurrency(hall.pricing.base_price_paise)}</p>
                <p className="text-[11px] text-gray-400">base price</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Diagnostics */}
      <div className="bg-rose-50/40 rounded-2xl border border-rose-100 overflow-hidden p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-rose-950 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            Diagnostics & Error Testing
          </h3>
          <p className="text-xs text-rose-700/80 mt-1">
            Simulate runtime component failures to test React Error Boundary fallbacks.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShouldCrash(true)}
            className="px-4 py-2.5 text-xs font-semibold text-rose-700 bg-rose-100 hover:bg-rose-200/80 active:scale-95 transition-all rounded-xl"
          >
            Simulate Page-Level Crash
          </button>
        </div>
      </div>
    </div>
  );
}

