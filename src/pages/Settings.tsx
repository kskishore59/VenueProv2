import { Building2, Users, Shield, Upload, FileText, CreditCard, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDataStore } from '@/stores/data-store';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { toast } from 'sonner';
import { useState } from 'react';
import { compressAndConvertToWebp } from '@/lib/image';
import { StaffManagement } from '@/components/settings/StaffManagement';
import { AccessControl } from '@/components/settings/AccessControl';

export default function Settings() {
  const organization = useDataStore((s) => s.organization);
  const updateOrganization = useDataStore((s) => s.updateOrganization);
  const role = useAuthStore((s) => s.profile?.role);
  const isOwner = role === 'owner';
  const openSubscriptionModal = useUIStore((s) => s.openSubscriptionModal);

  const [activeTab, setActiveTab] = useState<'organization' | 'staff' | 'access' | 'subscription'>('organization');

  const [name, setName] = useState(organization.name);
  const [gstin, setGstin] = useState(organization.gstin || '');
  const [phone, setPhone] = useState(organization.phone || '');
  const [email, setEmail] = useState(organization.email || '');
  const [address, setAddress] = useState(organization.address || '');
  const [termsAndConditions, setTermsAndConditions] = useState(organization.terms_and_conditions || '');
  const [logoUrl, setLogoUrl] = useState(organization.logo_url || '');

  const [shouldCrash, setShouldCrash] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Compress logo to a maximum width of 400px (standard logo size) and convert to WebP
      const compressedBlob = await compressAndConvertToWebp(file, 400, 0.8);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
        toast.success('Logo optimized and selected! Hit Save Changes to save. 🖼️');
      };
      reader.readAsDataURL(compressedBlob);
    } catch (err: any) {
      toast.error(`Failed to process logo image: ${err.message || err}`);
    }
  };

  const handleSave = async () => {
    if (!isOwner) {
      toast.error('Only the Organization Owner can modify profile settings.');
      return;
    }
    setIsSaving(true);
    try {
      await updateOrganization({
        name,
        gstin: gstin || null,
        phone: phone || null,
        email: email || null,
        address: address || null,
        terms_and_conditions: termsAndConditions || null,
        logo_url: logoUrl || null,
      });
      toast.success('Organization profile saved! ✅');
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage your organization profile, team members, and permissions</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-150 pb-px overflow-x-auto whitespace-nowrap flex-nowrap scrollbar-none">
        <button
          onClick={() => setActiveTab('organization')}
          className={cn(
            'px-3 py-2 text-sm font-bold border-b-2 -mb-px transition-all flex items-center gap-1.5 shrink-0',
            activeTab === 'organization'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          )}
        >
          <Building2 className="w-4 h-4" />
          Organization Profile
        </button>
        {isOwner && (
          <>
            <button
              onClick={() => setActiveTab('staff')}
              className={cn(
                'px-3 py-2 text-sm font-bold border-b-2 -mb-px transition-all flex items-center gap-1.5 shrink-0',
                activeTab === 'staff'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              )}
            >
              <Users className="w-4 h-4" />
              Staff Management
            </button>
            <button
              onClick={() => setActiveTab('access')}
              className={cn(
                'px-3 py-2 text-sm font-bold border-b-2 -mb-px transition-all flex items-center gap-1.5 shrink-0',
                activeTab === 'access'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              )}
            >
              <Shield className="w-4 h-4" />
              Access Control
            </button>
            <button
              onClick={() => setActiveTab('subscription')}
              className={cn(
                'px-3 py-2 text-sm font-bold border-b-2 -mb-px transition-all flex items-center gap-1.5 shrink-0',
                activeTab === 'subscription'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              )}
            >
              <CreditCard className="w-4 h-4" />
              Manage Subscription
            </button>
          </>
        )}
      </div>

      {activeTab === 'organization' ? (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-2xs">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-600" />
                Venue & Company Information
              </h3>
            </div>
            <div className="px-6 py-5 space-y-4">
              {/* Logo Upload Section */}
              <div className="flex flex-col sm:flex-row items-center gap-5 pb-4 border-b border-gray-100">
                <div className="relative w-20 h-20 rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Company Logo" className="w-full h-full object-contain" />
                  ) : (
                    <Building2 className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div className="space-y-1.5 text-center sm:text-left">
                  <h4 className="text-xs font-bold text-gray-900">Company Logo</h4>
                  <p className="text-[11px] text-gray-400">Used on payment receipts and invoices (max 1MB, square PNG/JPG preferred).</p>
                  {isOwner && (
                    <label className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-700 cursor-pointer select-none transition-colors">
                      <Upload className="w-3.5 h-3.5 text-gray-500" />
                      <span>Upload Logo</span>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              {/* Form inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Venue Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} disabled={!isOwner}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">GSTIN</label>
                  <input type="text" value={gstin} onChange={(e) => setGstin(e.target.value)} disabled={!isOwner}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-mono focus:ring-2 focus:ring-brand-200 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Phone</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!isOwner}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!isOwner}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Address</label>
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} disabled={!isOwner}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all resize-none disabled:bg-gray-50 disabled:text-gray-400" />
              </div>

              {/* Terms and Conditions Textarea */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-gray-400" />
                  Terms & Conditions (Invoice & Receipt Footer)
                </label>
                <textarea 
                  value={termsAndConditions} 
                  onChange={(e) => setTermsAndConditions(e.target.value)} 
                  rows={4}
                  placeholder="Enter terms & conditions to print at the bottom of invoices and payment receipts..."
                  disabled={!isOwner}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all resize-none disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>

              {isOwner && (
                <button onClick={handleSave}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 active:scale-95 transition-all shadow-sm disabled:opacity-55 disabled:cursor-not-allowed flex items-center gap-1.5">
                  {isSaving && <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                  {isSaving ? 'Saving Changes...' : 'Save Changes'}
                </button>
              )}
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
      ) : activeTab === 'staff' ? (
        <StaffManagement />
      ) : activeTab === 'access' ? (
        <AccessControl />
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-2xs">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-brand-600" />
                Subscription Overview
              </h3>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-3xl text-white flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800 shadow-md">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-[10px] font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Workspace Tier</span>
                  </div>
                  <h4 className="text-2xl font-extrabold font-display uppercase tracking-tight">
                    VenuePro {organization.plan}
                  </h4>
                  <p className="text-xs text-indigo-200/80 font-medium">
                    Status: <span className="capitalize font-bold text-white bg-indigo-500/30 px-2.5 py-0.5 rounded-full">{organization.subscription_status || 'Active'}</span>
                  </p>
                </div>

                <div className="space-y-3 shrink-0">
                  {organization.trial_ends_at && organization.subscription_status === 'trial' ? (
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-indigo-300 block uppercase tracking-wider font-bold">Free Trial Ends</span>
                      <span className="text-sm font-extrabold text-white block mt-0.5">
                        {new Date(organization.trial_ends_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                      </span>
                    </div>
                  ) : null}
                  
                  <button
                    onClick={openSubscriptionModal}
                    className="w-full md:w-auto px-5 py-2.5 bg-white hover:bg-slate-100 text-indigo-950 rounded-xl text-xs font-black transition-all shadow-sm hover:scale-[1.01] active:scale-99"
                  >
                    {organization.subscription_status === 'trial' ? 'Upgrade to Paid Plan' : 'Manage / Change Plan'}
                  </button>
                </div>
              </div>

              {/* Feature Checklist */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Plan Features</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-600 font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Unlimited Booking Slots & Calendar</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Leads CRM & Inquiries Tracker</span>
                  </div>
                  {organization.plan === 'pro' || organization.plan === 'enterprise' ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>WhatsApp Automated Receipts</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>Staff Roles & Permissions (RBAC)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>CFO Expense & Spends Tracker</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>Bulk Excel/CSV Import Wizard</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-gray-400 line-through">
                        <span>✗</span>
                        <span>WhatsApp Automated Receipts</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 line-through">
                        <span>✗</span>
                        <span>Staff Roles & Permissions (RBAC)</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
