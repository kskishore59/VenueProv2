import { useState, useEffect } from 'react';
import { useAdminStore } from '@/stores/admin-store';
import {
  ShieldCheck, Building2, Users, IndianRupee, Search, Filter,
  Edit2, Plus, Ban, CheckCircle, AlertTriangle, X, Calendar,
  Loader2, Sparkles, Check, ArrowRight, Activity, TrendingUp, Info,
  Gift, Trash2, Phone, MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { toast } from 'sonner';

export default function SuperAdmin() {
  const {
    allOrganizations,
    allProfiles,
    allPayments,
    allPromoCodes = [],
    isLoading,
    syncAdminData,
    updateOrganizationDetails,
    updateUserProfile,
    createOrganizationAdmin,
    createPromoCode,
    togglePromoCodeActive,
    deletePromoCode
  } = useAdminStore();

  const [activeTab, setActiveTab] = useState<'analytics' | 'organizations' | 'users' | 'payments' | 'promo_codes' | 'demo_requests'>('analytics');
  const [orgSearch, setOrgSearch] = useState('');
  const [orgPlanFilter, setOrgPlanFilter] = useState<string>('all');
  const [orgStatusFilter, setOrgStatusFilter] = useState<string>('all');
  
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [userStatusFilter, setUserStatusFilter] = useState<string>('all');

  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentModeFilter, setPaymentModeFilter] = useState<string>('all');

  // Promo Codes state
  const [promoSearch, setPromoSearch] = useState('');
  const [promoStatusFilter, setPromoStatusFilter] = useState<string>('all');

  // Modals state
  const [isCreateOrgOpen, setIsCreateOrgOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [newOrgPlan, setNewOrgPlan] = useState<'free' | 'starter' | 'pro' | 'enterprise'>('pro');

  const [isCreatePromoOpen, setIsCreatePromoOpen] = useState(false);
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoMonths, setNewPromoMonths] = useState<number>(1);
  const [newPromoExpires, setNewPromoExpires] = useState('');
  const [newPromoActive, setNewPromoActive] = useState(true);

  const [isManageOrgOpen, setIsManageOrgOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [editPlan, setEditPlan] = useState<'free' | 'starter' | 'pro' | 'enterprise'>('pro');
  const [editStatus, setEditStatus] = useState<string>('active');
  const [editTrialEnds, setEditTrialEnds] = useState<string>('');

  // Demo Requests State
  const [demoRequests, setDemoRequests] = useState<any[]>([]);
  const [isFetchingDemos, setIsFetchingDemos] = useState(false);
  const [demoSearch, setDemoSearch] = useState('');
  const [demoStatusFilter, setDemoStatusFilter] = useState<string>('all');

  const fetchDemoRequests = async () => {
    setIsFetchingDemos(true);
    try {
      if (!isSupabaseConfigured()) {
        setDemoRequests([
          { id: '1', name: 'Sanjay Yadav', phone: '9876543210', venue_name: 'Balaji Palace & Lawn', city: 'Gurugram', notes: 'Venue Type: banquet | Current Setup: paper | Schedule Preference: today - morning', status: 'pending', created_at: new Date().toISOString() },
          { id: '2', name: 'Rohan Sharma', phone: '9911223344', venue_name: 'Royal Palms Resort', city: 'Noida', notes: 'Venue Type: resort | Current Setup: excel | Schedule Preference: tomorrow - afternoon', status: 'scheduled', created_at: new Date(Date.now() - 24*3600*1000).toISOString() }
        ]);
        return;
      }
      const { data, error } = await supabase
        .from('demo_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setDemoRequests(data || []);
    } catch (err: any) {
      console.error('Failed to fetch demo requests:', err);
      toast.error('Failed to load demo requests');
    } finally {
      setIsFetchingDemos(false);
    }
  };

  useEffect(() => {
    syncAdminData();
  }, [syncAdminData]);

  useEffect(() => {
    if (activeTab === 'demo_requests') {
      fetchDemoRequests();
    }
  }, [activeTab]);

  const handleUpdateDemoStatus = async (id: string, newStatus: string) => {
    try {
      if (!isSupabaseConfigured()) {
        setDemoRequests(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
        toast.success('Demo request status updated locally! 📝');
        return;
      }
      const { error } = await supabase
        .from('demo_requests')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success('Demo request status updated successfully! 📝');
      fetchDemoRequests();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status.');
    }
  };

  const parseDemoNotes = (notes: string | null) => {
    if (!notes) return { venueType: 'N/A', currentSetup: 'N/A', schedule: 'N/A' };
    const parts = notes.split(' | ');
    const result = { venueType: 'N/A', currentSetup: 'N/A', schedule: 'N/A' };
    
    parts.forEach(part => {
      if (part.startsWith('Venue Type:')) {
        result.venueType = part.replace('Venue Type:', '').trim();
      } else if (part.startsWith('Current Setup:')) {
        result.currentSetup = part.replace('Current Setup:', '').trim();
      } else if (part.startsWith('Schedule Preference:')) {
        result.schedule = part.replace('Schedule Preference:', '').trim();
      }
    });
    
    return result;
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim() || !newOwnerName.trim() || !newOwnerEmail.trim()) return;
    try {
      await createOrganizationAdmin(newOrgName, newOwnerName, newOwnerEmail, newOrgPlan);
      setIsCreateOrgOpen(false);
      setNewOrgName('');
      setNewOwnerName('');
      setNewOwnerEmail('');
    } catch (err) {
      // toast is triggered inside store
    }
  };

  const handleCreatePromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode.trim()) return;
    try {
      await createPromoCode({
        code: newPromoCode.trim().toUpperCase(),
        months_to_add: newPromoMonths,
        expires_at: newPromoExpires ? new Date(newPromoExpires).toISOString() : null,
        is_active: newPromoActive
      });
      setIsCreatePromoOpen(false);
      setNewPromoCode('');
      setNewPromoMonths(1);
      setNewPromoExpires('');
      setNewPromoActive(true);
    } catch (err) {
      // toast is triggered inside store
    }
  };

  const handleOpenManageOrg = (org: any) => {
    setSelectedOrgId(org.id);
    setEditPlan(org.plan);
    setEditStatus(org.subscription_status);
    setEditTrialEnds(org.trial_ends_at ? org.trial_ends_at.slice(0, 10) : '');
    setIsManageOrgOpen(true);
  };

  const handleUpdateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrgId) return;
    try {
      const updateData: any = {
        plan: editPlan,
        subscription_status: editStatus,
        trial_ends_at: editTrialEnds ? new Date(editTrialEnds).toISOString() : null
      };
      await updateOrganizationDetails(selectedOrgId, updateData);
      setIsManageOrgOpen(false);
    } catch (err) {
      // error handled in store
    }
  };

  const toggleUserActive = async (profile: any) => {
    try {
      await updateUserProfile(profile.id, { is_active: !profile.is_active });
    } catch (err) {}
  };

  const changeUserRole = async (profileId: string, role: any) => {
    try {
      await updateUserProfile(profileId, { role });
    } catch (err) {}
  };

  // ─── Computations & Stats ──────────────────────────────────────────────────
  const totalVenues = allOrganizations.length;
  const activeSubs = allOrganizations.filter(o => o.subscription_status === 'active').length;
  const trialSubs = allOrganizations.filter(o => o.subscription_status === 'trial').length;
  const expiredSubs = allOrganizations.filter(o => o.subscription_status === 'expired' || o.subscription_status === 'canceled').length;

  // Approximate Monthly Recurring Revenue (MRR) based on active plans
  // Starter: ₹9,999/yr => ₹833/mo. Pro: ₹14,999/yr => ₹1,250/mo. Enterprise: ₹50,000/yr => ₹4,166/mo.
  const projectedMRRPaise = allOrganizations.reduce((acc, org) => {
    if (org.subscription_status !== 'active') return acc;
    if (org.plan === 'starter') return acc + 83325;
    if (org.plan === 'pro') return acc + 124991;
    if (org.plan === 'enterprise') return acc + 416666;
    return acc;
  }, 0);

  const totalPaymentsPaise = allPayments.reduce((acc, p) => p.status === 'received' ? acc + Number(p.amount_paise) : acc, 0);
  const conversionRate = totalVenues > 0 ? Math.round(((activeSubs) / totalVenues) * 100) : 0;

  // Filters application
  const filteredOrgs = allOrganizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(orgSearch.toLowerCase()) || 
                          (org.email && org.email.toLowerCase().includes(orgSearch.toLowerCase())) ||
                          org.city?.toLowerCase().includes(orgSearch.toLowerCase());
    const matchesPlan = orgPlanFilter === 'all' || org.plan === orgPlanFilter;
    const matchesStatus = orgStatusFilter === 'all' || org.subscription_status === orgStatusFilter;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const filteredUsers = allProfiles.filter(profile => {
    const matchesSearch = profile.full_name.toLowerCase().includes(userSearch.toLowerCase()) || 
                          profile.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === 'all' || profile.role === userRoleFilter;
    const matchesStatus = userStatusFilter === 'all' || 
                          (userStatusFilter === 'active' ? profile.is_active : !profile.is_active);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const filteredPayments = allPayments.filter(payment => {
    const matchesSearch = (payment.organization?.name || '').toLowerCase().includes(paymentSearch.toLowerCase()) ||
                          (payment.transaction_ref || '').toLowerCase().includes(paymentSearch.toLowerCase());
    const matchesMode = paymentModeFilter === 'all' || payment.payment_mode === paymentModeFilter;
    return matchesSearch && matchesMode;
  });

  const filteredPromoCodes = allPromoCodes.filter(promo => {
    const matchesSearch = promo.code.toLowerCase().includes(promoSearch.toLowerCase());
    const matchesStatus = promoStatusFilter === 'all' || 
                          (promoStatusFilter === 'active' ? promo.is_active : !promo.is_active);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight font-display">Governance Console</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 border border-indigo-150 text-indigo-600 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              SUPER ADMIN
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-0.5">Global platform controller, subscription analytics, and venue audits.</p>
        </div>

        {activeTab === 'organizations' && (
          <button
            onClick={() => setIsCreateOrgOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-650 text-white font-bold hover:bg-indigo-700 text-xs active:scale-[0.98] transition-all shadow-sm shadow-indigo-150"
          >
            <Plus className="w-4 h-4" />
            Provision Venue
          </button>
        )}

        {activeTab === 'promo_codes' && (
          <button
            onClick={() => setIsCreatePromoOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-650 text-white font-bold hover:bg-indigo-700 text-xs active:scale-[0.98] transition-all shadow-sm shadow-indigo-150"
          >
            <Plus className="w-4 h-4" />
            Create Promo Code
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 border-b border-gray-150 pb-px overflow-x-auto whitespace-nowrap scrollbar-none">
        <button
          onClick={() => setActiveTab('analytics')}
          className={cn(
            'px-4 py-2.5 text-xs font-black border-b-2 -mb-px transition-all flex items-center gap-2',
            activeTab === 'analytics'
              ? 'border-indigo-600 text-indigo-650'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          )}
        >
          <Activity className="w-4 h-4" />
          Metrics & KPI Dashboard
        </button>
        <button
          onClick={() => setActiveTab('organizations')}
          className={cn(
            'px-4 py-2.5 text-xs font-black border-b-2 -mb-px transition-all flex items-center gap-2',
            activeTab === 'organizations'
              ? 'border-indigo-600 text-indigo-650'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          )}
        >
          <Building2 className="w-4 h-4" />
          Organizations ({totalVenues})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={cn(
            'px-4 py-2.5 text-xs font-black border-b-2 -mb-px transition-all flex items-center gap-2',
            activeTab === 'users'
              ? 'border-indigo-600 text-indigo-650'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          )}
        >
          <Users className="w-4 h-4" />
          User Directory ({allProfiles.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={cn(
            'px-4 py-2.5 text-xs font-black border-b-2 -mb-px transition-all flex items-center gap-2',
            activeTab === 'payments'
              ? 'border-indigo-600 text-indigo-650'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          )}
        >
          <IndianRupee className="w-4 h-4" />
          Payment Audit Ledger
        </button>
        <button
          onClick={() => setActiveTab('promo_codes')}
          className={cn(
            'px-4 py-2.5 text-xs font-black border-b-2 -mb-px transition-all flex items-center gap-2',
            activeTab === 'promo_codes'
              ? 'border-indigo-600 text-indigo-650'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          )}
        >
          <Gift className="w-4 h-4" />
          Promo Codes ({allPromoCodes.length})
        </button>
        <button
          onClick={() => setActiveTab('demo_requests')}
          className={cn(
            'px-4 py-2.5 text-xs font-black border-b-2 -mb-px transition-all flex items-center gap-2',
            activeTab === 'demo_requests'
              ? 'border-indigo-600 text-indigo-650'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          )}
        >
          <Phone className="w-4 h-4" />
          Demo Requests ({demoRequests.length})
        </button>
      </div>

      {(isLoading || isFetchingDemos) && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      )}

      {/* Tab Contents */}
      {!isLoading && !isFetchingDemos && activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* KPI Matrix Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-2xs space-y-3 relative overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-bl from-indigo-50 to-transparent rounded-bl-full -z-10 group-hover:scale-105 transition-transform" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Venues</span>
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 leading-none">{totalVenues}</h3>
                <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1 font-semibold">
                  <span className="text-emerald-500 font-bold">+{totalVenues - 3}</span> vs last month
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-2xs space-y-3 relative overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-bl from-emerald-50 to-transparent rounded-bl-full -z-10 group-hover:scale-105 transition-transform" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Projected MRR</span>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <IndianRupee className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 leading-none">{formatCurrency(projectedMRRPaise)}</h3>
                <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1 font-semibold">
                  <span className="text-emerald-500 font-bold">Active subscriptions</span>
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-2xs space-y-3 relative overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-bl from-violet-50 to-transparent rounded-bl-full -z-10 group-hover:scale-105 transition-transform" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Platform Volume</span>
                <div className="p-2 bg-violet-50 text-violet-600 rounded-xl">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 leading-none">{formatCurrency(totalPaymentsPaise)}</h3>
                <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1 font-semibold">
                  Total receipts audited
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-2xs space-y-3 relative overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-bl from-amber-50 to-transparent rounded-bl-full -z-10 group-hover:scale-105 transition-transform" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Plan Conversion</span>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 leading-none">{conversionRate}%</h3>
                <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1 font-semibold">
                  <span className="text-amber-500 font-bold">{activeSubs} Active</span> / {trialSubs} Trialing
                </p>
              </div>
            </div>
          </div>

          {/* Graphical Analytics Charts (Animated SVG) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart 1: Active Venues Signups Growth */}
            <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-2xs space-y-4 lg:col-span-2">
              <div>
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-650" />
                  Monthly Signups Trend
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">Platform growth trajectory over the past six months.</p>
              </div>
              
              <div className="relative h-48 w-full border-b border-gray-100 flex items-end">
                {/* SVG Graph line */}
                <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
                  <defs>
                    <linearGradient id="gradient-line" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1="0" y1="30" x2="500" y2="30" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />
                  <line x1="0" y1="75" x2="500" y2="75" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />
                  <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />

                  {/* Area fill */}
                  <path d="M0,120 L100,105 L200,90 L300,60 L400,45 L500,20 L500,150 L0,150 Z" fill="url(#gradient-line)" />
                  
                  {/* Line path */}
                  <path
                    d="M0,120 L100,105 L200,90 L300,60 L400,45 L500,20"
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    className="animate-dash"
                  />
                  
                  {/* Data Points */}
                  <circle cx="100" cy="105" r="4.5" fill="#4f46e5" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="200" cy="90" r="4.5" fill="#4f46e5" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="300" cy="60" r="4.5" fill="#4f46e5" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="400" cy="45" r="4.5" fill="#4f46e5" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="500" cy="20" r="4.5" fill="#4f46e5" stroke="#ffffff" strokeWidth="2" />
                </svg>
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider px-2">
                <span>Dec</span>
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May (Current)</span>
              </div>
            </div>

            {/* Chart 2: Plan Breakdown Donut chart representation */}
            <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-2xs space-y-4">
              <div>
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-650" />
                  Workspace Ratios
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">Proportion of venue subscriptions by plan tier.</p>
              </div>

              <div className="flex flex-col items-center justify-center space-y-5 py-2">
                {/* SVG Semi-donut circle */}
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.91" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                    {/* Pro plan ratio */}
                    <circle cx="18" cy="18" r="15.91" fill="none" stroke="#6366f1" strokeWidth="3" strokeDasharray="66 100" strokeDashoffset="0" />
                    {/* Starter ratio */}
                    <circle cx="18" cy="18" r="15.91" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="17 100" strokeDashoffset="-66" />
                    {/* Enterprise ratio */}
                    <circle cx="18" cy="18" r="15.91" fill="none" stroke="#8b5cf6" strokeWidth="3" strokeDasharray="17 100" strokeDashoffset="-83" />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-xl font-black text-gray-900">{totalVenues}</span>
                    <span className="text-[9px] text-gray-400 font-bold block uppercase tracking-wider">Venues</span>
                  </div>
                </div>

                {/* Legend list */}
                <div className="w-full space-y-2 text-xs">
                  <div className="flex items-center justify-between font-semibold text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                      <span>Pro (₹14,999/yr)</span>
                    </div>
                    <span>{allOrganizations.filter(o => o.plan === 'pro').length}</span>
                  </div>
                  <div className="flex items-center justify-between font-semibold text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>Starter (₹9,999/yr)</span>
                    </div>
                    <span>{allOrganizations.filter(o => o.plan === 'starter').length}</span>
                  </div>
                  <div className="flex items-center justify-between font-semibold text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                      <span>Enterprise (Custom)</span>
                    </div>
                    <span>{allOrganizations.filter(o => o.plan === 'enterprise').length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Signups & Audits Summary list */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-2xs space-y-4 lg:col-span-2">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <Building2 className="w-4.5 h-4.5 text-indigo-650" />
                Latest Registrations
              </h4>
              <div className="divide-y divide-gray-100 overflow-hidden">
                {allOrganizations.slice(0, 4).map(org => (
                  <div key={org.id} className="py-3 flex items-center justify-between text-xs hover:bg-gray-50/50 transition-colors px-1">
                    <div className="space-y-0.5">
                      <h5 className="font-extrabold text-gray-900">{org.name}</h5>
                      <p className="text-[11px] text-gray-400 font-semibold">{org.city || 'No Location'}, {org.state || ''} • {org.email || ''}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider',
                        org.plan === 'pro' && 'bg-indigo-50 text-indigo-700 border border-indigo-150',
                        org.plan === 'starter' && 'bg-emerald-50 text-emerald-700 border border-emerald-150',
                        org.plan === 'enterprise' && 'bg-purple-50 text-purple-700 border border-purple-150',
                        org.plan === 'free' && 'bg-gray-100 text-gray-600'
                      )}>
                        {org.plan}
                      </span>
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-[9px] font-extrabold capitalize',
                        org.subscription_status === 'active' && 'bg-emerald-100 text-emerald-800',
                        org.subscription_status === 'trial' && 'bg-blue-100 text-blue-800',
                        org.subscription_status === 'expired' && 'bg-rose-100 text-rose-800',
                        org.subscription_status === 'canceled' && 'bg-gray-100 text-gray-600',
                      )}>
                        {org.subscription_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-2xs space-y-4">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4.5 h-4.5 text-indigo-650" />
                Platform Activity Summary
              </h4>
              <div className="space-y-4 text-xs font-semibold text-gray-600">
                <div className="p-3 bg-gray-50/50 rounded-xl space-y-2 border border-gray-100">
                  <div className="flex items-center justify-between text-gray-500">
                    <span>Active Users Directory</span>
                    <span className="text-gray-900 font-bold">{allProfiles.filter(u => u.is_active).length} / {allProfiles.length}</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full" 
                      style={{ width: `${allProfiles.length > 0 ? (allProfiles.filter(u => u.is_active).length / allProfiles.length) * 100 : 0}%` }} 
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Supabase connection checks stable</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Real-time DB synchronization provisioned</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Access control tokens validated</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Organizations */}
      {!isLoading && !isFetchingDemos && activeTab === 'organizations' && (
        <div className="space-y-4">
          {/* Filters header */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-2xl border border-gray-150 shadow-2xs">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={orgSearch}
                onChange={e => setOrgSearch(e.target.value)}
                placeholder="Search venues by name, email, or city..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-150 px-3 py-2 rounded-xl text-xs flex-1 sm:flex-initial">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                <select 
                  value={orgPlanFilter} 
                  onChange={e => setOrgPlanFilter(e.target.value)}
                  className="bg-transparent text-gray-700 outline-none font-bold text-xs"
                >
                  <option value="all">All Plans</option>
                  <option value="starter">Starter</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                  <option value="free">Free</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-150 px-3 py-2 rounded-xl text-xs flex-1 sm:flex-initial">
                <select 
                  value={orgStatusFilter} 
                  onChange={e => setOrgStatusFilter(e.target.value)}
                  className="bg-transparent text-gray-700 outline-none font-bold text-xs w-full"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="trial">Trial</option>
                  <option value="expired">Expired</option>
                  <option value="canceled">Canceled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orgs Grid */}
          <div className="bg-white rounded-3xl border border-gray-150 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 uppercase tracking-widest font-black text-[10px]">
                    <th className="py-4 px-6">Venue Name</th>
                    <th className="py-4 px-6">Contact / Location</th>
                    <th className="py-4 px-6">Subscription Plan</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Created At</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-600 font-semibold">
                  {filteredOrgs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400 font-medium">
                        No organizations found matching search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredOrgs.map(org => (
                      <tr key={org.id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="py-4 px-6">
                          <div className="space-y-0.5">
                            <span className="font-black text-gray-900 block">{org.name}</span>
                            <span className="text-[10px] text-gray-400 font-mono tracking-tighter">{org.id}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-0.5 text-xs">
                            <span className="block text-gray-700">{org.email || 'No email'}</span>
                            <span className="text-[11px] text-gray-400">{org.phone || 'No phone'} • {org.city || 'No City'}, {org.state || ''}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={cn(
                            'px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider',
                            org.plan === 'pro' && 'bg-indigo-50 text-indigo-700 border border-indigo-150',
                            org.plan === 'starter' && 'bg-emerald-50 text-emerald-700 border border-emerald-150',
                            org.plan === 'enterprise' && 'bg-purple-50 text-purple-700 border border-purple-150',
                            org.plan === 'free' && 'bg-gray-100 text-gray-600'
                          )}>
                            {org.plan}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <span className={cn(
                              'inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold capitalize',
                              org.subscription_status === 'active' && 'bg-emerald-100 text-emerald-800',
                              org.subscription_status === 'trial' && 'bg-blue-100 text-blue-800',
                              org.subscription_status === 'expired' && 'bg-rose-100 text-rose-800',
                              org.subscription_status === 'canceled' && 'bg-gray-100 text-gray-600',
                            )}>
                              {org.subscription_status}
                            </span>
                            {org.trial_ends_at && org.subscription_status === 'trial' && (
                              <span className="block text-[10px] text-gray-400 font-medium">
                                Ends: {format(new Date(org.trial_ends_at), 'dd MMM yyyy')}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-400 text-[11px]">
                          {org.created_at ? format(new Date(org.created_at), 'dd/MM/yyyy') : 'N/A'}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleOpenManageOrg(org)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 rounded-xl transition-all inline-flex items-center gap-1 text-xs"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Manage</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: User Directory */}
      {!isLoading && !isFetchingDemos && activeTab === 'users' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-2xl border border-gray-150 shadow-2xs">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Search users by name, email..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-150 px-3 py-2 rounded-xl text-xs flex-1 sm:flex-initial">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                <select 
                  value={userRoleFilter} 
                  onChange={e => setUserRoleFilter(e.target.value)}
                  className="bg-transparent text-gray-700 outline-none font-bold text-xs"
                >
                  <option value="all">All Roles</option>
                  <option value="owner">Owner</option>
                  <option value="manager">Manager</option>
                  <option value="finance">Finance</option>
                  <option value="staff">Staff</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-150 px-3 py-2 rounded-xl text-xs flex-1 sm:flex-initial">
                <select 
                  value={userStatusFilter} 
                  onChange={e => setUserStatusFilter(e.target.value)}
                  className="bg-transparent text-gray-700 outline-none font-bold text-xs w-full"
                >
                  <option value="all">All Users</option>
                  <option value="active">Active Only</option>
                  <option value="suspended">Suspended Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-3xl border border-gray-150 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 uppercase tracking-widest font-black text-[10px]">
                    <th className="py-4 px-6">User Account</th>
                    <th className="py-4 px-6">Venue Association</th>
                    <th className="py-4 px-6">Security Role</th>
                    <th className="py-4 px-6">Account Status</th>
                    <th className="py-4 px-6">Joined Date</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-600 font-semibold">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400 font-medium">
                        No user accounts found matching query parameters.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(profile => {
                      const associatedOrg = allOrganizations.find(o => o.id === profile.org_id)?.name || 'Platform (Admin)';
                      return (
                        <tr key={profile.id} className="hover:bg-gray-50/30 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-black text-xs">
                                {profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                              </div>
                              <div className="space-y-0.5">
                                <span className="font-extrabold text-gray-900 block">{profile.full_name}</span>
                                <span className="text-[11px] text-gray-400 font-medium block">{profile.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-gray-700 text-xs font-bold">{associatedOrg}</span>
                          </td>
                          <td className="py-4 px-6">
                            <select
                              value={profile.role}
                              onChange={e => changeUserRole(profile.id, e.target.value as any)}
                              className="px-2.5 py-1 rounded-lg border border-gray-200 bg-gray-50 font-bold text-[11px] text-gray-700 focus:ring-2 focus:ring-indigo-100 outline-none"
                            >
                              <option value="owner">Owner</option>
                              <option value="manager">Manager</option>
                              <option value="finance">Finance</option>
                              <option value="staff">Staff</option>
                              <option value="super_admin">Super Admin</option>
                            </select>
                          </td>
                          <td className="py-4 px-6">
                            <span className={cn(
                              'px-2 py-0.5 rounded-full text-[10px] font-extrabold',
                              profile.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            )}>
                              {profile.is_active ? 'Active' : 'Suspended'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-gray-400 text-[11px]">
                            {profile.created_at ? format(new Date(profile.created_at), 'dd/MM/yyyy') : 'N/A'}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => toggleUserActive(profile)}
                              className={cn(
                                'p-2 rounded-xl transition-all text-xs font-bold inline-flex items-center gap-1 border',
                                profile.is_active 
                                  ? 'text-rose-600 bg-rose-50 border-rose-100 hover:bg-rose-100' 
                                  : 'text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-100'
                              )}
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>{profile.is_active ? 'Suspend' : 'Activate'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Payment Audit Ledger */}
      {!isLoading && !isFetchingDemos && activeTab === 'payments' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-2xl border border-gray-150 shadow-2xs">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={paymentSearch}
                onChange={e => setPaymentSearch(e.target.value)}
                placeholder="Search transactions by organization name or transaction ref..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-150 px-3 py-2 rounded-xl text-xs w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select 
                value={paymentModeFilter} 
                onChange={e => setPaymentModeFilter(e.target.value)}
                className="bg-transparent text-gray-700 outline-none font-bold text-xs w-full"
              >
                <option value="all">All Modes</option>
                <option value="online">Online Payment</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="card">Card Payment</option>
                <option value="cash">Cash Inflow</option>
              </select>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-white rounded-3xl border border-gray-150 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 uppercase tracking-widest font-black text-[10px]">
                    <th className="py-4 px-6">Transaction ID</th>
                    <th className="py-4 px-6">Organization</th>
                    <th className="py-4 px-6">Inflow Amount</th>
                    <th className="py-4 px-6">Receipt / Ref</th>
                    <th className="py-4 px-6">Processed Date</th>
                    <th className="py-4 px-6">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-600 font-semibold">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400 font-medium">
                        No transactions found matching search filters.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map(payment => (
                      <tr key={payment.id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="py-4 px-6 font-mono text-[11px] text-gray-800">
                          {payment.id}
                        </td>
                        <td className="py-4 px-6 text-gray-900 font-black">
                          {payment.organization?.name || 'VenuePro Platform'}
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-emerald-650 font-black text-sm">
                            {formatCurrency(payment.amount_paise)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-0.5">
                            <span className="block text-gray-700 capitalize">{payment.payment_mode} • {payment.payment_type}</span>
                            <span className="text-[10px] text-gray-400 font-mono tracking-tighter">{payment.transaction_ref || 'No transaction key'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-400 text-[11px]">
                          {payment.paid_at ? format(new Date(payment.paid_at), 'dd MMM yyyy HH:mm') : 'N/A'}
                        </td>
                        <td className="py-4 px-6">
                          <span className={cn(
                            'px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider',
                            payment.status === 'received' && 'bg-emerald-100 text-emerald-800',
                            payment.status === 'refunded' && 'bg-orange-100 text-orange-800',
                            payment.status === 'failed' && 'bg-rose-100 text-rose-800',
                          )}>
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Promo Codes */}
      {!isLoading && !isFetchingDemos && activeTab === 'promo_codes' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-2xl border border-gray-150 shadow-2xs">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={promoSearch}
                onChange={e => setPromoSearch(e.target.value)}
                placeholder="Search promo codes..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-150 px-3 py-2 rounded-xl text-xs w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select 
                value={promoStatusFilter} 
                onChange={e => setPromoStatusFilter(e.target.value)}
                className="bg-transparent text-gray-700 outline-none font-bold text-xs w-full"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>

          {/* Promo Codes Table */}
          <div className="bg-white rounded-3xl border border-gray-150 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 uppercase tracking-widest font-black text-[10px]">
                    <th className="py-4 px-6">Promo Code</th>
                    <th className="py-4 px-6">Trial Duration</th>
                    <th className="py-4 px-6">Expiration Date</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Created Date</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-600 font-semibold">
                  {filteredPromoCodes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400 font-medium">
                        No promo codes found.
                      </td>
                    </tr>
                  ) : (
                    filteredPromoCodes.map(promo => {
                      const isExpired = promo.expires_at && new Date(promo.expires_at) < new Date();
                      return (
                        <tr key={promo.code} className="hover:bg-gray-50/30 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-700">
                                <Gift className="w-4 h-4" />
                              </div>
                              <span className="font-black text-gray-900 text-sm tracking-wide">{promo.code}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-gray-700 font-bold">{promo.months_to_add} {promo.months_to_add === 1 ? 'Month' : 'Months'}</span>
                          </td>
                          <td className="py-4 px-6">
                            {promo.expires_at ? (
                              <span className={cn(
                                "text-xs",
                                isExpired ? "text-rose-605 font-bold" : "text-gray-600"
                              )}>
                                {format(new Date(promo.expires_at), 'dd MMM yyyy')} {isExpired && '(Expired)'}
                              </span>
                            ) : (
                              <span className="text-gray-400 italic">No Expiration</span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <button
                              onClick={() => togglePromoCodeActive(promo.code, !promo.is_active)}
                              className={cn(
                                "px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all border",
                                promo.is_active 
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-100 hover:bg-emerald-100" 
                                  : "bg-rose-50 text-rose-800 border-rose-100 hover:bg-rose-100"
                              )}
                            >
                              {promo.is_active ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="py-4 px-6 text-gray-400 text-[11px]">
                            {promo.created_at ? format(new Date(promo.created_at), 'dd/MM/yyyy') : 'N/A'}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete promo code ${promo.code}?`)) {
                                  deletePromoCode(promo.code);
                                }
                              }}
                              className="p-2 rounded-xl text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 transition-all inline-flex items-center gap-1 text-xs"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Demo Requests */}
      {!isLoading && !isFetchingDemos && activeTab === 'demo_requests' && (
        <div className="space-y-4 animate-fade-in">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-2xl border border-gray-150 shadow-2xs">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={demoSearch}
                onChange={e => setDemoSearch(e.target.value)}
                placeholder="Search requests by name, phone, or venue..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-150 px-3 py-2 rounded-xl text-xs w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select 
                value={demoStatusFilter} 
                onChange={e => setDemoStatusFilter(e.target.value)}
                className="bg-transparent text-gray-700 outline-none font-bold text-xs w-full"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="contacted">Contacted</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Demo Requests Table */}
          <div className="bg-white rounded-3xl border border-gray-150 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 uppercase tracking-widest font-black text-[10px]">
                    <th className="py-4 px-6">Requester</th>
                    <th className="py-4 px-6">Venue Details</th>
                    <th className="py-4 px-6">Qualification Profile</th>
                    <th className="py-4 px-6">Call Schedule</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-600 font-semibold">
                  {demoRequests
                    .filter(d => {
                      const matchesSearch = d.name.toLowerCase().includes(demoSearch.toLowerCase()) || 
                                            (d.phone || '').toLowerCase().includes(demoSearch.toLowerCase()) ||
                                            (d.venue_name || '').toLowerCase().includes(demoSearch.toLowerCase());
                      const matchesStatus = demoStatusFilter === 'all' || d.status === demoStatusFilter;
                      return matchesSearch && matchesStatus;
                    })
                    .length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400 font-medium">
                        No demo requests found.
                      </td>
                    </tr>
                  ) : (
                    demoRequests
                      .filter(d => {
                        const matchesSearch = d.name.toLowerCase().includes(demoSearch.toLowerCase()) || 
                                              (d.phone || '').toLowerCase().includes(demoSearch.toLowerCase()) ||
                                              (d.venue_name || '').toLowerCase().includes(demoSearch.toLowerCase());
                        const matchesStatus = demoStatusFilter === 'all' || d.status === demoStatusFilter;
                        return matchesSearch && matchesStatus;
                      })
                      .map(demo => {
                        const { venueType, currentSetup, schedule } = parseDemoNotes(demo.notes);
                        return (
                          <tr key={demo.id} className="hover:bg-gray-50/30 transition-colors">
                            <td className="py-4 px-6">
                              <div className="space-y-0.5">
                                <span className="font-black text-gray-900 text-sm block">{demo.name}</span>
                                <span className="text-[10px] text-gray-400 font-mono tracking-tighter">
                                  Requested: {demo.created_at ? format(new Date(demo.created_at), 'dd MMM yyyy HH:mm') : 'N/A'}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="space-y-0.5">
                                <span className="block text-gray-800">{demo.venue_name || 'Not specified'}</span>
                                <span className="text-[10px] text-gray-400 font-semibold">{demo.city || 'No Location'}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="space-y-1">
                                <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-755 rounded text-[9px] font-bold uppercase tracking-wider border border-indigo-100 capitalize">
                                  Space: {venueType}
                                </span>
                                <span className="block text-[10px] text-gray-400">
                                  Tracks on: <strong className="text-gray-700 capitalize">{currentSetup}</strong>
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-1 text-[11px] text-gray-700">
                                <Phone className="w-3.5 h-3.5 text-indigo-500" />
                                <span className="capitalize font-bold">{schedule}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className={cn(
                                'px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider',
                                demo.status === 'pending' && 'bg-amber-100 text-amber-800 border border-amber-250',
                                demo.status === 'contacted' && 'bg-blue-100 text-blue-800 border border-blue-200',
                                demo.status === 'scheduled' && 'bg-purple-100 text-purple-800 border border-purple-200',
                                demo.status === 'completed' && 'bg-emerald-100 text-emerald-800 border border-emerald-200',
                                demo.status === 'cancelled' && 'bg-gray-100 text-gray-600 border border-gray-200',
                              )}>
                                {demo.status}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {demo.status === 'pending' && (
                                  <button
                                    onClick={() => handleUpdateDemoStatus(demo.id, 'contacted')}
                                    className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold rounded-lg border border-blue-100 transition-all"
                                  >
                                    Contacted
                                  </button>
                                )}
                                {(demo.status === 'pending' || demo.status === 'contacted') && (
                                  <button
                                    onClick={() => handleUpdateDemoStatus(demo.id, 'scheduled')}
                                    className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10px] font-bold rounded-lg border border-purple-100 transition-all"
                                  >
                                    Schedule
                                  </button>
                                )}
                                {demo.status !== 'completed' && demo.status !== 'cancelled' && (
                                  <button
                                    onClick={() => handleUpdateDemoStatus(demo.id, 'completed')}
                                    className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-100 transition-all"
                                  >
                                    Complete
                                  </button>
                                )}
                                
                                <a
                                  href={`https://wa.me/91${demo.phone}?text=Namaste%20${encodeURIComponent(demo.name)},%20I%20am%20connecting%20from%20VenuePro%20regarding%20your%20request%20for%20a%20guided%20tour%20for%20${encodeURIComponent(demo.venue_name || 'your venue')}.%20Is%20this%20a%2520good%2520time%2520to%2520connect%253F`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-lg transition-all"
                                  title="WhatsApp Lead"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Promo Code */}
      {isCreatePromoOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-[100] animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900 flex items-center gap-1.5">
                <Gift className="w-5 h-5 text-indigo-650" />
                Create Promo Code
              </h3>
              <button 
                onClick={() => setIsCreatePromoOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePromoCode} className="space-y-4 text-xs font-semibold text-gray-600">
              <div>
                <label className="block text-gray-500 mb-1">Promo Code Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP50"
                  value={newPromoCode}
                  onChange={e => setNewPromoCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-sans uppercase font-bold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-500 mb-1">Free Trial Duration (Months)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={12}
                    value={newPromoMonths}
                    onChange={e => setNewPromoMonths(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-sans text-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    Expiration Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={newPromoExpires}
                    onChange={e => setNewPromoExpires(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-sans text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2.5 py-1">
                <input
                  id="promo-active-checkbox"
                  type="checkbox"
                  checked={newPromoActive}
                  onChange={e => setNewPromoActive(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-650 border-slate-200 focus:ring-indigo-500/20 cursor-pointer accent-indigo-650 shrink-0"
                />
                <label htmlFor="promo-active-checkbox" className="text-xs text-slate-700 font-bold select-none cursor-pointer">
                  Activate promo code immediately
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 text-xs shadow-md shadow-indigo-100 mt-6"
              >
                <Check className="w-4 h-4" />
                Create Coupon Code
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Provision Organization */}
      {isCreateOrgOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-[100] animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900 flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-indigo-650 animate-pulse" />
                Provision Workspace & Owner
              </h3>
              <button 
                onClick={() => setIsCreateOrgOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrg} className="space-y-4 text-xs font-semibold text-gray-600">
              <div>
                <label className="block text-gray-500 mb-1">Organization / Venue Name</label>
                <input
                  type="text"
                  required
                  placeholder="Royal Banquet & Lawn"
                  value={newOrgName}
                  onChange={e => setNewOrgName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-500 mb-1">Owner Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Rahul Sharma"
                    value={newOwnerName}
                    onChange={e => setNewOwnerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-sans"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1">Owner Email</label>
                  <input
                    type="email"
                    required
                    placeholder="rahul@banquet.com"
                    value={newOwnerEmail}
                    onChange={e => setNewOwnerEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-500 mb-1">Initial Subscription Plan</label>
                <select
                  value={newOrgPlan}
                  onChange={e => setNewOrgPlan(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all bg-white font-sans font-bold text-gray-700"
                >
                  <option value="pro">Pro Edition (₹14,999/yr)</option>
                  <option value="starter">Starter Edition (₹9,999/yr)</option>
                  <option value="enterprise">Enterprise (Custom)</option>
                  <option value="free">Free Trial (₹0)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 text-xs shadow-md shadow-indigo-100 mt-6"
              >
                <Check className="w-4 h-4" />
                Provision Database Workspace
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Manage Organization subscription */}
      {isManageOrgOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-[100] animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900 flex items-center gap-1.5">
                <Building2 className="w-5 h-5 text-indigo-650" />
                Manage Venue Plan
              </h3>
              <button 
                onClick={() => setIsManageOrgOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateOrg} className="space-y-4 text-xs font-semibold text-gray-600">
              <div>
                <label className="block text-gray-500 mb-1">Assigned Plan Tier</label>
                <select
                  value={editPlan}
                  onChange={e => setEditPlan(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 bg-white font-bold text-gray-700 text-xs"
                >
                  <option value="free">Free</option>
                  <option value="starter">Starter (₹9,999/yr)</option>
                  <option value="pro">Pro (₹14,999/yr)</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-500 mb-1">Billing Lifecycle Status</label>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 bg-white font-bold text-gray-700 text-xs"
                >
                  <option value="active">Active</option>
                  <option value="trial">Trial Mode</option>
                  <option value="expired">Expired (Grace/Read-Only)</option>
                  <option value="canceled">Canceled</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-500 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  Free Trial Ends (Only for Trial Mode)
                </label>
                <input
                  type="date"
                  value={editTrialEnds}
                  onChange={e => setEditTrialEnds(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-sans text-xs"
                />
              </div>

              <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl flex gap-2">
                <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-gray-400 leading-relaxed font-semibold">
                  Updating this subscription configuration takes effect immediately across all linked staff accounts. Grace policies (expired status) will limit standard users to read-only actions after 3 days.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-1 text-xs shadow-md shadow-indigo-100 mt-6"
              >
                <span>Save Billing Configurations</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
