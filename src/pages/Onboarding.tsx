import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Sparkles, Check, ArrowRight, ChevronRight, ChevronLeft,
  Building2, Users, CheckCircle2, Shield, AlertCircle, Plus,
  Trash2, Mail, Landmark, CheckSquare, Zap, Gift
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useDataStore } from '@/stores/data-store';
import { cn } from '@/lib/utils';
import venueProLogo from '@/assets/venueProLogo.svg';
import { toast } from 'sonner';

type OnboardingStep =
  | 'welcome'
  | 'benefits'
  | 'role_selection'
  | 'wizard_org'
  | 'wizard_venue'
  | 'wizard_pricing'
  | 'wizard_staff'
  | 'success';

export default function Onboarding() {
  const navigate = useNavigate();
  const profile = useAuthStore((s) => s.profile);
  const organization = useDataStore((s) => s.organization);
  const updateOrganization = useDataStore((s) => s.updateOrganization);
  const createHall = useDataStore((s) => s.createHall);
  const inviteStaff = useDataStore((s) => s.inviteStaff);
  const pendingInvites = useDataStore((s) => s.pendingInvites);
  const cancelInvite = useDataStore((s) => s.cancelInvite);

  const [activeStep, setActiveStep] = useState<OnboardingStep>('welcome');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stepper progress for Wizard steps (Wizard Steps: Org -> Venue -> Pricing -> Staff)
  const getStepNumber = () => {
    switch (activeStep) {
      case 'wizard_org': return 1;
      case 'wizard_venue': return 2;
      case 'wizard_pricing': return 3;
      case 'wizard_staff': return 4;
      default: return 1;
    }
  };

  // Form states
  const [role, setRole] = useState<'owner' | 'manager' | 'coordinator'>('owner');
  const [venueCategory, setVenueCategory] = useState<'banquet' | 'shadi_mahal' | 'mandapam' | 'resort' | 'hotel' | 'lawn'>('banquet');

  // 1. Org details
  const [orgName, setOrgName] = useState(organization?.name || '');
  const [orgPhone, setOrgPhone] = useState('');
  const [orgGstin, setOrgGstin] = useState('');
  const [orgAddress, setOrgAddress] = useState('');
  const [orgCity, setOrgCity] = useState('');
  const [orgState, setOrgState] = useState('');

  // 2. Space/Venue details
  const [hallName, setHallName] = useState('Main Grand Hall');
  const [hallType, setHallType] = useState<'main_banquet_hall' | 'party_lawn' | 'conference_room' | 'mini_hall' | 'rooms'>('main_banquet_hall');
  const [capacityMin, setCapacityMin] = useState(100);
  const [capacityMax, setCapacityMax] = useState(500);

  // 3. Amenities & Pricing
  const [hasCatering, setHasCatering] = useState(true);
  const [hasDecor, setHasDecor] = useState(true);
  const [hasAc, setHasAc] = useState(true);
  const [hasDj, setHasDj] = useState(false);
  const [hasParking, setHasParking] = useState(true);
  const [hasPowerBackup, setHasPowerBackup] = useState(true);

  const [baseRental, setBaseRental] = useState('80000');
  const [vegPlatePrice, setVegPlatePrice] = useState('750');
  const [nonVegPlatePrice, setNonVegPlatePrice] = useState('950');

  // 4. Staff invites
  const [staffEmail, setStaffEmail] = useState('');
  const [staffRole, setStaffRole] = useState<'manager' | 'finance' | 'staff'>('staff');

  // Sync initial org name
  useEffect(() => {
    if (organization?.name && !orgName) {
      setOrgName(organization.name);
    }
  }, [organization, orgName]);

  // Handle Confetti explosion on mount of success step
  useEffect(() => {
    if (activeStep === 'success') {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
      // Second burst
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 60,
          origin: { y: 0.6 }
        });
      }, 400);
    }
  }, [activeStep]);

  // Stepper Handlers
  const handleNextStep = async () => {
    if (activeStep === 'welcome') {
      setActiveStep('benefits');
    } else if (activeStep === 'benefits') {
      setActiveStep('role_selection');
    } else if (activeStep === 'role_selection') {
      setActiveStep('wizard_org');
    } else if (activeStep === 'wizard_org') {
      if (!orgName.trim()) {
        toast.error('Please enter your business or venue name.');
        return;
      }
      setActiveStep('wizard_venue');
    } else if (activeStep === 'wizard_venue') {
      if (!hallName.trim()) {
        toast.error('Please enter a name for your primary venue space.');
        return;
      }
      setActiveStep('wizard_pricing');
    } else if (activeStep === 'wizard_pricing') {
      setIsSubmitting(true);
      try {
        // Save Org Details
        await updateOrganization({
          name: orgName.trim(),
          phone: orgPhone.trim() || null,
          gstin: orgGstin.trim().toUpperCase() || null,
          address: orgAddress.trim() || null,
          city: orgCity.trim() || null,
          state: orgState.trim() || null,
        });

        // Map UI onboarding type to database check constraint allowed value
        let dbHallType: 'banquet_hall' | 'conference_room' | 'lawn' | 'terrace' | 'boardroom' | 'other' = 'banquet_hall';
        if (hallType === 'party_lawn') {
          dbHallType = 'lawn';
        } else if (hallType === 'conference_room') {
          dbHallType = 'conference_room';
        } else if (hallType === 'rooms') {
          dbHallType = 'other';
        }

        // Save Primary Hall Space
        await createHall({
          name: hallName.trim(),
          type: dbHallType,
          capacity_min: Number(capacityMin),
          capacity_max: Number(capacityMax),
          capacity_comfortable: Math.round((Number(capacityMin) + Number(capacityMax)) / 2),
          base_price_paise: Math.round(Number(baseRental) * 100) || 0,
          pricing_config: {
            base_rental: Number(baseRental) || 0,
            catering_veg: hasCatering ? Number(vegPlatePrice) : null,
            catering_nonveg: hasCatering ? Number(nonVegPlatePrice) : null,
            default_advance_percent: 25,
          },
          amenities_config: {
            comfort: {
              air_conditioning: hasAc,
              heating: false,
            },
            convenience: {
              generator_backup: hasPowerBackup ? '100%' : 'none',
              valet_parking: hasParking,
            },
            entertainment: {
              stage_available: true,
              dj_allowed: hasDj,
            }
          },
          is_active: true
        });

        setActiveStep('wizard_staff');
      } catch (err: any) {
        toast.error(err.message || 'Failed to save configuration details.');
      } finally {
        setIsSubmitting(false);
      }
    } else if (activeStep === 'wizard_staff') {
      setActiveStep('success');
    }
  };

  const handlePrevStep = () => {
    if (activeStep === 'benefits') setActiveStep('welcome');
    else if (activeStep === 'role_selection') setActiveStep('benefits');
    else if (activeStep === 'wizard_org') setActiveStep('role_selection');
    else if (activeStep === 'wizard_venue') setActiveStep('wizard_org');
    else if (activeStep === 'wizard_pricing') setActiveStep('wizard_venue');
    else if (activeStep === 'wizard_staff') setActiveStep('wizard_pricing');
  };

  const handleSkipOnboarding = () => {
    const userId = profile?.id || useAuthStore.getState().user?.id;
    if (userId) {
      localStorage.setItem(`venuepro_onboarding_completed_${userId}`, 'true');
    }
    localStorage.setItem('venuepro_onboarding_completed', 'true');
    toast.success('Onboarding skipped. Seeding demo register.');
    navigate('/dashboard');
  };

  const handleFinishOnboarding = () => {
    const userId = profile?.id || useAuthStore.getState().user?.id;
    if (userId) {
      localStorage.setItem(`venuepro_onboarding_completed_${userId}`, 'true');
    }
    localStorage.setItem('venuepro_onboarding_completed', 'true');
    toast.success('Onboarding complete! Welcome to VenuePro.');
    navigate('/dashboard');
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffEmail.trim()) return;
    try {
      await inviteStaff(staffEmail.trim(), staffRole);
      setStaffEmail('');
      toast.success(`Invitation shared with ${staffEmail}! 📧`);
    } catch (err: any) {
      toast.error(err.message || 'Invitation failed.');
    }
  };

  // Variants for Linear-like sliding panel transitions
  const panelVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.25, ease: 'easeIn' as const } }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between font-sans relative overflow-hidden bg-grid-pattern py-12 px-4 select-none">

      {/* Decorative luxury gradient ambient blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] aspect-square rounded-full bg-gradient-to-tr from-brand-100/30 to-purple-100/20 blur-[120px] -z-10 animate-pulse-slow" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[45%] aspect-square rounded-full bg-gradient-to-tr from-indigo-100/30 to-brand-100/20 blur-[120px] -z-10 animate-pulse-slow" style={{ animationDelay: '3s' }} />

      {/* Floating small top header */}
      <header className="max-w-xl w-full mx-auto flex items-center justify-between mb-4 px-2">
        <div className="flex items-center">
          <img
            src={venueProLogo}
            alt="VenuePro Logo"
            className="h-14 w-auto object-contain max-w-[120px]"
          />
        </div>

        {activeStep !== 'success' && (
          <button
            onClick={handleSkipOnboarding}
            className="text-md font-semibold text-slate-400 hover:text-slate-900 transition-colors"
          >
            Skip setup
          </button>
        )}
      </header>

      {/* Main card container */}
      <main className="flex-1 flex items-center justify-center max-w-xl w-full mx-auto">
        <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-[0_15px_50px_rgba(0,0,0,0.03)] p-6 md:p-8 relative overflow-hidden min-h-[460px] flex flex-col justify-between">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-500 to-indigo-500" />

          <AnimatePresence mode="wait">
            {/* STEP 1: WELCOME SCREEN */}
            {activeStep === 'welcome' && (
              <motion.div
                key="welcome"
                variants={panelVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6 flex flex-col justify-between h-full"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight font-display text-left">
                      Welcome to VenuePro! <br />
                      Let's set up your workspace
                    </h1>
                    <p className="text-md text-slate-500 leading-relaxed font-medium text-left">
                      Join 500+ Indian wedding halls, banquets, and convention centers who digitize their operations. Lock booking dates, generate clean GST tax bills, and share vouchers on WhatsApp in seconds.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-6">
                  <button
                    onClick={handleNextStep}
                    className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 active:scale-98 transition-all rounded-2xl text-white text-md font-bold shadow-md shadow-brand-100 flex items-center justify-center gap-1.5"
                  >
                    Set Up My Venue Space <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-[11px] text-slate-400 text-center font-medium">
                    Takes less than 2 minutes • No credit card required
                  </p>
                </div>
              </motion.div>
            )}

            {/* STEP 2: BENEFITS SHOWCASE */}
            {activeStep === 'benefits' && (
              <motion.div
                key="benefits"
                variants={panelVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                <div className="space-y-1.5 text-left">
                  <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest block">Value Proposition</span>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-display">Designed for Modern Hall Owners</h2>
                </div>

                <div className="grid grid-cols-1 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {[
                    { icon: "🔒", title: "Instant Calendar Locking", desc: "Prevents double bookings across all staff and devices." },
                    { icon: "📄", title: "Bilingual GST Tax Invoicing", desc: "Compliant English & Hindi tax receipt sheets generated in 1-click." },
                    { icon: "💬", title: "1-Click WhatsApp Share", desc: "No file attachments. Send receipts and vouchers directly to phone chats." },
                    { icon: "👥", title: "Restricted Staff Roles", desc: "Invite managers and gatekeepers while keeping net collections hidden." }
                  ].map((b, idx) => (
                    <div key={idx} className="flex gap-3 items-start p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-brand-50/20 hover:border-brand-100/30 transition-all">
                      <span className="text-lg shrink-0">{b.icon}</span>
                      <div className="text-left">
                        <h4 className="text-xs font-bold text-slate-900">{b.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed font-semibold">{b.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    onClick={handlePrevStep}
                    className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 rounded-2xl text-xs font-bold text-slate-600 transition-all flex items-center justify-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 rounded-2xl text-xs font-bold text-white transition-all flex items-center justify-center gap-1"
                  >
                    Understand, Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: ROLE & CATEGORY SELECTION */}
            {activeStep === 'role_selection' && (
              <motion.div
                key="role"
                variants={panelVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6 text-left"
              >
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest block">Role & Venue Type</span>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-display">Tell us about your operations</h2>
                </div>

                <div className="space-y-4">
                  {/* Role picker */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">My Role is</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'owner', label: 'Venue Owner', icon: '👑' },
                        { id: 'manager', label: 'Manager', icon: '💼' },
                        { id: 'coordinator', label: 'Staff / Ops', icon: '⚙️' }
                      ].map(r => (
                        <button
                          key={r.id}
                          onClick={() => setRole(r.id as any)}
                          className={cn(
                            "p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 text-center transition-all",
                            role === r.id
                              ? "bg-brand-50 border-brand-200 text-brand-700 font-bold"
                              : "border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:text-slate-900"
                          )}
                        >
                          <span className="text-base">{r.icon}</span>
                          <span className="text-[10px] whitespace-nowrap">{r.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Venue Type Picker */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Venue Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'banquet', label: 'Banquet Hall', icon: '🏛️' },
                        { id: 'shadi_mahal', label: 'Shadi Mahal', icon: '🎪' },
                        { id: 'resort', label: 'Resort & Lawn', icon: '🌳' },
                        { id: 'mandapam', label: 'Kalyana Mandapam', icon: '🌟' },
                        { id: 'hotel', label: 'Hotel & Convention', icon: '🏢' },
                        { id: 'lawn', label: 'Party Lawn', icon: '⛳' }
                      ].map(v => (
                        <button
                          key={v.id}
                          onClick={() => setVenueCategory(v.id as any)}
                          className={cn(
                            "p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 text-center transition-all",
                            venueCategory === v.id
                              ? "bg-brand-50 border-brand-200 text-brand-700 font-bold"
                              : "border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:text-slate-900"
                          )}
                        >
                          <span className="text-base">{v.icon}</span>
                          <span className="text-[9px] font-semibold truncate max-w-full">{v.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    onClick={handlePrevStep}
                    className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 rounded-2xl text-xs font-bold text-slate-600 transition-all flex items-center justify-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 rounded-2xl text-xs font-bold text-white transition-all flex items-center justify-center gap-1"
                  >
                    Continue to Setup <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: WIZARD STEP 1 (ORG DETAILS) */}
            {activeStep === 'wizard_org' && (
              <motion.div
                key="org"
                variants={panelVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6 text-left"
              >
                {/* Stepper Wizard Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Step 1 of 4</span>
                    <h3 className="text-base font-extrabold text-slate-950 font-display">Business Profile</h3>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(num => (
                      <span
                        key={num}
                        className={cn(
                          "w-3.5 h-1.5 rounded-full transition-all duration-300",
                          num === 1 ? "bg-brand-600 w-6" : "bg-slate-200"
                        )}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Company / Venue Name</label>
                      <input
                        type="text"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        placeholder="e.g., Shree Mangalam Palace"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-brand-200 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Helpline Phone (Voucher Footer)</label>
                      <input
                        type="tel"
                        value={orgPhone}
                        onChange={(e) => setOrgPhone(e.target.value)}
                        placeholder="e.g., 9876543210"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-brand-200 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                      GSTIN (Optional)
                      <span className="text-[8px] text-slate-350 bg-slate-100 px-1 rounded">CGST/SGST splitting</span>
                    </label>
                    <input
                      type="text"
                      value={orgGstin}
                      onChange={(e) => setOrgGstin(e.target.value)}
                      placeholder="e.g., 29AAAAA1111A1Z1"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-brand-200 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Street Address</label>
                    <input
                      type="text"
                      value={orgAddress}
                      onChange={(e) => setOrgAddress(e.target.value)}
                      placeholder="e.g., Main Ring Road, Opposite Town Hall"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-brand-200 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">City</label>
                      <input
                        type="text"
                        value={orgCity}
                        onChange={(e) => setOrgCity(e.target.value)}
                        placeholder="e.g., Bengaluru"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-brand-200 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">State</label>
                      <input
                        type="text"
                        value={orgState}
                        onChange={(e) => setOrgState(e.target.value)}
                        placeholder="e.g., Karnataka"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-brand-200 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100 mt-2">
                  <button
                    onClick={handlePrevStep}
                    className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 rounded-2xl text-xs font-bold text-slate-600 transition-all flex items-center justify-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 rounded-2xl text-xs font-bold text-white transition-all flex items-center justify-center gap-1"
                  >
                    Next Step <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 5: WIZARD STEP 2 (VENUE DETAILS) */}
            {activeStep === 'wizard_venue' && (
              <motion.div
                key="venue"
                variants={panelVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6 text-left"
              >
                {/* Stepper Wizard Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Step 2 of 4</span>
                    <h3 className="text-base font-extrabold text-slate-950 font-display">Add Primary Space</h3>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(num => (
                      <span
                        key={num}
                        className={cn(
                          "w-3.5 h-1.5 rounded-full transition-all duration-300",
                          num === 2 ? "bg-brand-600 w-6" : "bg-slate-200"
                        )}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Space Name (e.g. Hall, Lawn)</label>
                    <input
                      type="text"
                      value={hallName}
                      onChange={(e) => setHallName(e.target.value)}
                      placeholder="e.g., Grand Royal AC Hall, Shanti Lawn"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-brand-200 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Space Category</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'main_banquet_hall', label: 'AC Banquet Hall', icon: '🏛️' },
                        { id: 'party_lawn', label: 'Party / Open Lawn', icon: '🌳' },
                        { id: 'mini_hall', label: 'Mini / AC Hall', icon: '🎪' },
                        { id: 'rooms', label: 'Guest Rooms Block', icon: '🛏️' }
                      ].map(t => (
                        <button
                          key={t.id}
                          onClick={() => setHallType(t.id as any)}
                          className={cn(
                            "p-3 rounded-2xl border flex items-center gap-2 transition-all text-left text-xs font-semibold",
                            hallType === t.id
                              ? "bg-brand-50 border-brand-200 text-brand-700"
                              : "border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:text-slate-900"
                          )}
                        >
                          <span className="text-md">{t.icon}</span>
                          <span>{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Min Guests Capacity</label>
                      <input
                        type="number"
                        value={capacityMin}
                        onChange={(e) => setCapacityMin(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-brand-200 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Max Capacity (Overcrowd)</label>
                      <input
                        type="number"
                        value={capacityMax}
                        onChange={(e) => setCapacityMax(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-brand-200 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100 mt-2">
                  <button
                    onClick={handlePrevStep}
                    className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 rounded-2xl text-xs font-bold text-slate-600 transition-all flex items-center justify-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 rounded-2xl text-xs font-bold text-white transition-all flex items-center justify-center gap-1"
                  >
                    Next Step <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 6: WIZARD STEP 3 (PRICING & AMENITIES) */}
            {activeStep === 'wizard_pricing' && (
              <motion.div
                key="pricing"
                variants={panelVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6 text-left"
              >
                {/* Stepper Wizard Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Step 3 of 4</span>
                    <h3 className="text-base font-extrabold text-slate-950 font-display">Amenities & Pricing</h3>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(num => (
                      <span
                        key={num}
                        className={cn(
                          "w-3.5 h-1.5 rounded-full transition-all duration-300",
                          num === 3 ? "bg-brand-600 w-6" : "bg-slate-200"
                        )}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {/* Base Rent */}
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Base Space Rental Price (₹ / day)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-slate-400">₹</span>
                      <input
                        type="number"
                        value={baseRental}
                        onChange={(e) => setBaseRental(e.target.value)}
                        placeholder="e.g. 150000"
                        className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-brand-200 outline-none"
                      />
                    </div>
                  </div>

                  {/* Amenities Checklist */}
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Amenities Included</label>
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-650">
                      {[
                        { label: 'Air Conditioning (AC)', checked: hasAc, set: setHasAc },
                        { label: 'In-House Catering', checked: hasCatering, set: setHasCatering },
                        { label: 'Mandap & Decoration', checked: hasDecor, set: setHasDecor },
                        { label: 'DJ / Sound System', checked: hasDj, set: setHasDj },
                        { label: 'Valet Car Parking', checked: hasParking, set: setHasParking },
                        { label: '100% Generator Backup', checked: hasPowerBackup, set: setHasPowerBackup }
                      ].map((item, index) => (
                        <button
                          key={index}
                          onClick={() => item.set(!item.checked)}
                          className={cn(
                            "px-3 py-2 border rounded-xl flex items-center justify-between text-left transition-all",
                            item.checked
                              ? "bg-indigo-50/50 border-indigo-200 text-indigo-700"
                              : "border-slate-100 bg-white text-slate-500 hover:border-slate-200"
                          )}
                        >
                          <span>{item.label}</span>
                          <span className={cn(
                            "w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-1.5",
                            item.checked
                              ? "bg-brand-600 border-brand-600 text-white"
                              : "border-slate-200 bg-white"
                          )}>
                            {item.checked && <Check className="w-2.5 h-2.5 stroke-[3px]" />}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Plate Pricing (Visible only if catering enabled) */}
                  {hasCatering && (
                    <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl animate-fade-in">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Veg Plate Rate (₹)</label>
                        <input
                          type="number"
                          value={vegPlatePrice}
                          onChange={(e) => setVegPlatePrice(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-brand-200 outline-none bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Non-Veg Rate (₹)</label>
                        <input
                          type="number"
                          value={nonVegPlatePrice}
                          onChange={(e) => setNonVegPlatePrice(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-brand-200 outline-none bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100 mt-2">
                  <button
                    onClick={handlePrevStep}
                    className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 rounded-2xl text-xs font-bold text-slate-600 transition-all flex items-center justify-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 rounded-2xl text-xs font-bold text-white transition-all flex items-center justify-center gap-1"
                  >
                    {isSubmitting ? (
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      <>Save & Next <ChevronRight className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 7: WIZARD STEP 4 (STAFF INVITATION) */}
            {activeStep === 'wizard_staff' && (
              <motion.div
                key="staff"
                variants={panelVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6 text-left"
              >
                {/* Stepper Wizard Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Step 4 of 4</span>
                    <h3 className="text-base font-extrabold text-slate-950 font-display">Invite Your Team</h3>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(num => (
                      <span
                        key={num}
                        className={cn(
                          "w-3.5 h-1.5 rounded-full transition-all duration-300",
                          num === 4 ? "bg-brand-600 w-6" : "bg-slate-200"
                        )}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    Manage your registers collaboratively. Invite coordinators to view the calendar, or accountant managers to handle billing.
                  </p>

                  <form onSubmit={handleSendInvite} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email Address</label>
                      <input
                        type="email"
                        value={staffEmail}
                        onChange={(e) => setStaffEmail(e.target.value)}
                        placeholder="coordinator@yourvenue.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-brand-200 outline-none"
                      />
                    </div>
                    <div className="w-28">
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Role</label>
                      <select
                        value={staffRole}
                        onChange={(e) => setStaffRole(e.target.value as any)}
                        className="w-full px-2.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-brand-200 outline-none bg-white"
                      >
                        <option value="manager">Manager</option>
                        <option value="finance">Finance</option>
                        <option value="staff">Staff</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      disabled={!staffEmail.trim()}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center shrink-0"
                    >
                      Invite
                    </button>
                  </form>

                  {/* Pending Invite list */}
                  {pendingInvites.length > 0 && (
                    <div className="border border-slate-100 bg-slate-50/50 rounded-2xl p-3.5 space-y-2 max-h-[140px] overflow-y-auto">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Shared Invites ({pendingInvites.length})</span>
                      <div className="space-y-1.5">
                        {pendingInvites.map(invite => (
                          <div key={invite.id} className="flex justify-between items-center bg-white p-2 rounded-xl border border-slate-100 text-[10px] font-semibold">
                            <span className="text-slate-650 truncate max-w-[70%]">{invite.email} ({invite.role})</span>
                            <button
                              type="button"
                              onClick={() => cancelInvite(invite.id)}
                              className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-2 py-1 rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100 mt-4">
                  <button
                    onClick={handlePrevStep}
                    className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 rounded-2xl text-xs font-bold text-slate-600 transition-all flex items-center justify-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="flex-2 py-3 bg-brand-600 hover:bg-brand-700 rounded-2xl text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5 animate-pulse-soft"
                  >
                    Complete Setup <Check className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 8: SUCCESS / ACTIVATION DASHBOARD */}
            {activeStep === 'success' && (
              <motion.div
                key="success"
                variants={panelVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6 flex flex-col justify-between h-full text-center"
              >
                <div className="space-y-5">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
                    <CheckCircle2 className="w-8 h-8 animate-bounce-slow" />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-display">Your Venue is Online! 🎉</h2>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed font-semibold">
                      Your organization <strong>{orgName}</strong> and space <strong>{hallName}</strong> have been configured successfully.
                    </p>
                  </div>

                  {/* Onboarding Checklist Widget */}
                  <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-4 text-left space-y-3 max-w-sm mx-auto">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Onboarding Checklist</span>

                    <div className="space-y-2.5">
                      {[
                        { label: "Configure your spaces & pricing", checked: true },
                        { label: "Add your first event booking", checked: false },
                        { label: "Record deposit payment receipt", checked: false },
                        { label: "Share confirmation on WhatsApp", checked: false }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center gap-2.5 text-xs font-semibold text-slate-750">
                          <span className={cn(
                            "w-4 h-4 rounded-full border flex items-center justify-center shrink-0",
                            item.checked
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "border-slate-350 bg-white"
                          )}>
                            {item.checked && <Check className="w-2.5 h-2.5 stroke-[3.5px]" />}
                          </span>
                          <span className={cn(item.checked && "text-slate-400 line-through")}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-6 space-y-2">
                  <button
                    onClick={handleFinishOnboarding}
                    className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 active:scale-98 transition-all rounded-2xl text-white text-md font-bold shadow-md shadow-brand-100 flex items-center justify-center gap-1.5"
                  >
                    Enter Workspace Dashboard <ChevronRight className="w-4 h-4" />
                  </button>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Let's Book Some Events!
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>

      {/* Page Footer */}
      <footer className="max-w-xl w-full mx-auto text-center mt-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest px-2">
        <span>© {new Date().getFullYear()} VenuePro Technologies • Data Encrypted Securely</span>
      </footer>

    </div>
  );
}
