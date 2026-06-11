import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Calendar as CalendarIcon, ChevronDown, Check, ArrowRight, Zap, Users,
  TrendingUp, MessageSquare, Clock, Sparkles, Menu, X,
  FileText, Smartphone, ShieldCheck, CheckCircle2, ChevronRight,
  HelpCircle, Printer, HeartHandshake, ArrowUpRight, Plus, Send,
  AlertCircle, XCircle, BarChart3, Shield, Award, Search, DollarSign, Phone,
  Play, Lock, RefreshCw
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';
import venueProLogo from '@/assets/venueProLogo.svg';
import { getRouteUrl } from '@/lib/urls';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';




// Interactive Flow Steps
interface FlowStep {
  title: string;
  desc: string;
  icon: any;
  metric: string;
}

const FLOW_STEPS: FlowStep[] = [
  {
    title: "1. Lead Entry",
    desc: "Inquiry enters via website widget or phone walk-in. Synced in CRM.",
    icon: Phone,
    metric: "+84 Leads This Month"
  },
  {
    title: "2. Slot Locked",
    desc: "System validates date availability and locks calendar slot instantly.",
    icon: CalendarIcon,
    metric: "0% Double-Bookings"
  },
  {
    title: "3. Deposit Logged",
    desc: "Splits advance payment, generates GST bill, and registers ledger.",
    icon: DollarSign,
    metric: "₹1.5L Deposit UPI Recd"
  },
  {
    title: "4. Auto-WhatsApp",
    desc: "Sends PDF invoice, schedule, and confirmation details to customer.",
    icon: MessageSquare,
    metric: "98% Open Rate"
  },
  {
    title: "5. Realtime Reports",
    desc: "Pushes transaction metadata to dashboard, updating occupancy ratios.",
    icon: BarChart3,
    metric: "₹52.8L Q3 Collections"
  }
];

interface DemoWizardProps {
  onSuccess?: (name: string, phone: string, venueName: string) => void;
}

function DemoWizard({ onSuccess }: DemoWizardProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    venueName: '',
    city: '',
    venueType: '',
    currentSystem: '',
    preferredDate: '',
    preferredTime: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSelectVenueType = (type: string) => {
    setForm(prev => ({ ...prev, venueType: type }));
  };

  const handleSelectSystem = (system: string) => {
    setForm(prev => ({ ...prev, currentSystem: system }));
  };

  const handleSelectDate = (date: string) => {
    setForm(prev => ({ ...prev, preferredDate: date }));
  };

  const handleSelectTime = (time: string) => {
    setForm(prev => ({ ...prev, preferredTime: time }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!form.venueType || !form.currentSystem) {
        toast.error('Please make selections for both options.');
        return;
      }
    } else if (step === 2) {
      if (!form.name.trim()) {
        toast.error('Please enter your name');
        return;
      }
      const cleanPhone = form.phone.replace(/[^0-9]/g, '');
      if (cleanPhone.length < 10) {
        toast.error('Please enter a valid 10-digit mobile number');
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    const cleanPhone = form.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!form.preferredDate || !form.preferredTime) {
      toast.error('Please select your preferred date and time');
      return;
    }

    setIsSubmitting(true);
    try {
      const notesString = `Venue Type: ${form.venueType} | Current Setup: ${form.currentSystem} | Preferred Schedule: ${form.preferredDate} - ${form.preferredTime}`;

      const { error } = await supabase.from('demo_requests').insert({
        name: form.name.trim(),
        phone: cleanPhone,
        venue_name: form.venueName.trim() || null,
        city: form.city.trim() || null,
        notes: notesString
      });

      if (error) throw error;

      toast.success("Demo request registered successfully! 🎉");
      setSubmitted(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
      if (onSuccess) {
        onSuccess(form.name.trim(), cleanPhone, form.venueName.trim());
      }
    } catch (err: any) {
      console.error('Failed to submit demo request:', err);
      toast.error(err.message || 'Failed to schedule demo. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-6 space-y-5 animate-scale-up">
        <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-emerald-500 shadow-xs">
          <Check className="w-6 h-6 stroke-[3]" />
        </div>
        <div className="space-y-2">
          <h4 className="text-base font-extrabold text-slate-800 font-display">Demo Requested Successfully!</h4>
          <p className="text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
            Dhanyawad <strong>{form.name}</strong>! We have registered your request. One of our product guides will contact you on WhatsApp (<strong>+91 {form.phone.replace(/[^0-9]/g, '')}</strong>) within 15 minutes to initiate your live walkthrough.
          </p>
        </div>
        <div className="pt-2">
          <a
            href={`https://wa.me/919812345678?text=Namaste%20VenuePro,%20I%20just%20requested%20a%20guided%20demo%20for%20${encodeURIComponent(form.venueName || 'my venue')}.%20Can%20we%20connect%20now?`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-sm font-bold transition-all shadow-md shadow-emerald-500/20 hover:scale-[1.02] active:scale-98"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Connect on WhatsApp Instantly</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Progress Header */}
      <div className="flex justify-between items-center">
        <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Step {step} of 3</span>
        <div className="flex gap-1.5">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`w-10 h-1.5 rounded-full transition-all duration-300 ${s <= step ? 'bg-[#1E5EFF]' : 'bg-slate-200'
                }`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <div>
              <label className="block text-sm font-black text-slate-700 uppercase tracking-wide mb-2.5">
                What type of venue do you manage? *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'banquet', label: 'Banquet Hall 🏰' },
                  { id: 'lawn', label: 'Wedding Lawn 🌿' },
                  { id: 'resort', label: 'Resort & Lawn 🏨' },
                  { id: 'convention', label: 'Convention Center 🏛️' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectVenueType(opt.id)}
                    className={`p-4 rounded-xl border text-left text-sm font-bold transition-all flex justify-between items-center ${form.venueType === opt.id
                      ? 'border-[#1E5EFF] bg-[#1E5EFF]/5 text-[#1E5EFF] shadow-xs ring-1 ring-[#1E5EFF]'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-350 hover:bg-slate-50'
                      }`}
                  >
                    <span>{opt.label}</span>
                    {form.venueType === opt.id && (
                      <div className="w-4 h-4 rounded-full bg-[#1E5EFF] flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-slate-700 uppercase tracking-wide mb-2.5">
                How do you track slots and payments now? *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'paper', label: 'Paper Registers 📖' },
                  { id: 'excel', label: 'Excel Sheets 📊' },
                  { id: 'software', label: 'Other Software 💻' },
                  { id: 'none', label: 'New Venue / None 🚀' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectSystem(opt.id)}
                    className={`p-4 rounded-xl border text-left text-sm font-bold transition-all flex justify-between items-center ${form.currentSystem === opt.id
                      ? 'border-[#1E5EFF] bg-[#1E5EFF]/5 text-[#1E5EFF] shadow-xs ring-1 ring-[#1E5EFF]'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-350 hover:bg-slate-50'
                      }`}
                  >
                    <span>{opt.label}</span>
                    {form.currentSystem === opt.id && (
                      <div className="w-4 h-4 rounded-full bg-[#1E5EFF] flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleNext}
              disabled={!form.venueType || !form.currentSystem}
              className="w-full text-center py-3.5 bg-[#1E5EFF] hover:bg-blue-600 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-99"
            >
              <span>Continue to Contact Details</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Your Name (आपका नाम) *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Sanjay Yadav"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-[#1E5EFF] focus:ring-1 focus:ring-[#1E5EFF] transition-all outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">WhatsApp Number *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 flex items-center gap-1 pointer-events-none">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </span>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="98765 43210"
                    className="w-full rounded-xl border border-slate-200 bg-white pl-16 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-[#1E5EFF] focus:ring-1 focus:ring-[#1E5EFF] transition-all outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">City / Location (शहर)</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="e.g. Gurugram"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-[#1E5EFF] focus:ring-1 focus:ring-[#1E5EFF] transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Venue / Banquet Name (वेन्यू का नाम)</label>
              <input
                type="text"
                value={form.venueName}
                onChange={(e) => setForm(prev => ({ ...prev, venueName: e.target.value }))}
                placeholder="e.g. Balaji Palace & Garden"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-[#1E5EFF] focus:ring-1 focus:ring-[#1E5EFF] transition-all outline-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="w-1/3 text-center py-3 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={!form.name.trim() || form.phone.replace(/[^0-9]/g, '').length < 10}
                className="w-2/3 text-center py-3 bg-[#1E5EFF] hover:bg-blue-600 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-99"
              >
                <span>Continue to Schedule</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <div>
              <label className="block text-sm font-black text-slate-700 uppercase tracking-wide mb-2.5">
                Preferred Day for Guided Tour *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'today', label: '🗓️ Today' },
                  { id: 'tomorrow', label: '🗓️ Tomorrow' },
                  { id: 'later', label: '🗓️ Later' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectDate(opt.id)}
                    className={`p-3 rounded-xl border text-center text-sm font-bold transition-all ${form.preferredDate === opt.id
                      ? 'border-[#1E5EFF] bg-[#1E5EFF]/5 text-[#1E5EFF] shadow-xs ring-1 ring-[#1E5EFF]'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-350 hover:bg-slate-50'
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-slate-700 uppercase tracking-wide mb-2.5">
                Preferred Time Window *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'morning', label: '🌅 Morning (10AM-1PM)' },
                  { id: 'afternoon', label: '☀️ Afternoon (1PM-5PM)' },
                  { id: 'evening', label: '🌆 Evening (5PM-8PM)' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectTime(opt.id)}
                    className={`p-3 rounded-xl border text-center text-[10px] font-bold transition-all ${form.preferredTime === opt.id
                      ? 'border-[#1E5EFF] bg-[#1E5EFF]/5 text-[#1E5EFF] shadow-xs ring-1 ring-[#1E5EFF]'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-350 hover:bg-slate-50'
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="w-1/3 text-center py-3 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting || !form.preferredDate || !form.preferredTime}
                className="w-2/3 text-center py-3 bg-[#1E5EFF] hover:bg-blue-600 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-99 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Request</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [activeStep, setActiveStep] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isYearlyBilling, setIsYearlyBilling] = useState(true);

  // WhatsApp Chat Simulator State
  const [whatsappStep, setWhatsappStep] = useState(0);
  const [messages, setMessages] = useState<{ sender: 'client' | 'system'; text: string; time: string; attachment?: string }[]>([
    { sender: 'client', text: "Namaste, can we check slot availability and per plate rate for Dec 18th?", time: "11:00 AM" }
  ]);

  // Analytics Dashboard state
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState<'month' | 'quarter' | 'year'>('quarter');

  // Demo Request form states
  const demoSectionRef = useRef<HTMLDivElement>(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const handleScrollToDemo = () => {
    demoSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getAnalyticsData = () => {
    switch (analyticsTimeframe) {
      case 'month':
        return {
          bookings: '28',
          bookingsTrend: '+8%',
          revenue: '₹18.4L',
          revenueTrend: '+12%',
          occupancy: '85%',
          occupancyTrend: '+4%',
          bars: [45, 60, 85, 50, 90, 75],
          bookingsList: [
            { name: 'Dev & Priya Wedding', space: 'Grand Lawn', amount: '₹12.4 Lakhs', status: 'Locked', date: 'Dec 18' },
            { name: 'Corporate AGM', space: 'Ruby Banquet', amount: '₹4.8 Lakhs', status: 'Deposit Paid', date: 'Dec 22' },
            { name: 'Sonia Birthday', space: 'Mini Hall', amount: '₹1.2 Lakhs', status: 'Inquiry', date: 'Dec 28' }
          ]
        };
      case 'year':
        return {
          bookings: '324',
          bookingsTrend: '+22%',
          revenue: '₹2.16 Cr',
          revenueTrend: '+25%',
          occupancy: '88%',
          occupancyTrend: '+7%',
          bars: [70, 75, 90, 80, 98, 85],
          bookingsList: [
            { name: 'Winter Wedding Fest', space: 'Full Resort', amount: '₹45.0 Lakhs', status: 'Locked', date: 'Nov 12' },
            { name: 'Medical Summit 2026', space: 'Convention Center', amount: '₹28.5 Lakhs', status: 'Locked', date: 'Dec 05' },
            { name: 'Royal Engagement', space: 'Crystal Palace', amount: '₹15.0 Lakhs', status: 'Deposit Paid', date: 'Jan 15' }
          ]
        };
      case 'quarter':
      default:
        return {
          bookings: '84',
          bookingsTrend: '+14%',
          revenue: '₹52.8L',
          revenueTrend: '+19%',
          occupancy: '91%',
          occupancyTrend: '+5%',
          bars: [55, 70, 85, 60, 95, 75],
          bookingsList: [
            { name: 'Dev & Priya Wedding', space: 'Grand Lawn', amount: '₹12.4 Lakhs', status: 'Locked', date: 'Dec 18' },
            { name: 'Tech Summit 2026', space: 'Ruby Banquet', amount: '₹4.8 Lakhs', status: 'Locked', date: 'Dec 25' },
            { name: 'Rohan Engagement', space: 'Sapphire Hall', amount: '₹3.2 Lakhs', status: 'Deposit Paid', date: 'Jan 02' }
          ]
        };
    }
  };

  const analyticsData = getAnalyticsData();

  const handleNavigate = (path: string) => {
    const target = getRouteUrl(path);
    if (target.startsWith('http')) {
      window.location.href = target;
    } else {
      navigate(target);
    }
  };

  // WhatsApp Simulator Interaction loop
  useEffect(() => {
    if (whatsappStep === 1) {
      const timer = setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { sender: 'system', text: "✨ VenuePro Auto-Response:\nDec 18th is AVAILABLE at Sapphire Lawn! Plate quote generated.", time: "11:01 AM" }
        ]);
        setWhatsappStep(2);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (whatsappStep === 3) {
      const timer = setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { sender: 'system', text: "📄 ESTIMATE_DECI_18_SAPPHIRE.pdf", time: "11:02 AM", attachment: "PDF Estimate — 300 Guests, Veg Buffet" }
        ]);
        setWhatsappStep(4);
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 }
        });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [whatsappStep]);

  const runStepCheck = () => {
    if (whatsappStep === 0) setWhatsappStep(1);
    if (whatsappStep === 2) setWhatsappStep(3);
  };

  // Autoplay flow stepper
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % FLOW_STEPS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);



  return (
    <div className="bg-[#F6F7FB] text-slate-800 min-h-screen font-sans relative selection:bg-[#1E5EFF]/15 selection:text-[#1E5EFF] overflow-hidden">

      {/* Custom Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        
        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background-color: #F6F7FB;
        }
        
        .font-display {
          font-family: 'Outfit', sans-serif;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #F6F7FB;
        }
        ::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #94A3B8;
        }

        .stripe-grid {
          background-image: 
            linear-gradient(to right, rgba(30, 94, 255, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(30, 94, 255, 0.04) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: radial-gradient(circle at center, black 40%, transparent 95%);
          -webkit-mask-image: radial-gradient(circle at center, black 40%, transparent 95%);
        }

        .inner-dot-grid {
          background-image: radial-gradient(rgba(11, 27, 58, 0.03) 1px, transparent 0);
          background-size: 16px 16px;
        }

        .glow-blue {
          box-shadow: 0 0 0 1px rgba(30, 94, 255, 0.05), 0 10px 40px -10px rgba(30, 94, 255, 0.08);
        }

        .glow-gold {
          box-shadow: 0 0 0 1px rgba(245, 197, 66, 0.1), 0 10px 40px -10px rgba(245, 197, 66, 0.12);
        }

        @keyframes pulseGlow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }

        .animate-pulse-glow {
          animation: pulseGlow 8s ease-in-out infinite;
        }

        @keyframes borderRotate {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .gradient-border-glow {
          position: relative;
          background: white;
          border-radius: 24px;
          z-index: 1;
        }

        .gradient-border-glow::before {
          content: '';
          position: absolute;
          inset: -1.5px;
          border-radius: 25.5px;
          background: linear-gradient(90deg, #1E5EFF, #F5C542, #1E5EFF);
          background-size: 200% 200%;
          animation: borderRotate 6s linear infinite;
          z-index: -1;
          opacity: 0.6;
        }
      `}} />

      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[60%] aspect-square rounded-full bg-gradient-to-tr from-[#1E5EFF]/5 via-[#0B1B3A]/5 to-[#F5C542]/5 blur-[160px] -z-10 animate-pulse-glow" />
      <div className="absolute top-[35%] right-0 w-[45%] aspect-square rounded-full bg-gradient-to-tr from-[#1E5EFF]/4 to-[#F5C542]/4 blur-[160px] -z-10 animate-pulse-glow" style={{ animationDelay: '4s' }} />
      <div className="absolute bottom-0 left-[-10%] w-[50%] aspect-square rounded-full bg-gradient-to-tr from-[#1E5EFF]/5 via-[#0B1B3A]/5 to-transparent blur-[160px] -z-10 animate-pulse-glow" style={{ animationDelay: '2s' }} />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 stripe-grid pointer-events-none opacity-60 -z-10" />

      {/* Floating Glass Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-5 left-4 right-4 z-50 max-w-7xl mx-auto"
      >
        <nav className="backdrop-blur-xl bg-white/70 border border-slate-200/50 px-6 py-3.5 rounded-full flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-10">
            <a href="#" className="flex items-center group transition-transform hover:scale-102">
              <img
                src={venueProLogo}
                alt="VenuePro Logo"
                className="h-10 w-auto object-contain"
              />
            </a>
            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-7">
              <button onClick={() => handleNavigate('/features')} className="text-sm font-semibold text-slate-500 hover:text-[#0B1B3A] hover:scale-110 ease-in-out transition-all bg-transparent border-none cursor-pointer">Features</button>
              <a href="#workflow" className="text-sm font-semibold text-slate-500 hover:text-[#0B1B3A] transition-all hover:scale-110 ease-in-out">How It Works</a>
              <button onClick={() => setIsDemoModalOpen(true)} className="text-sm font-semibold text-slate-500 hover:text-[#0B1B3A] hover:scale-110 ease-in-out transition-all">Book Demo</button>
              <button onClick={() => handleNavigate('/faqs')} className="text-sm font-semibold text-slate-500 hover:text-[#0B1B3A] hover:scale-110 ease-in-out transition-all bg-transparent border-none cursor-pointer">Support FAQ</button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <button
                type="button"
                onClick={() => handleNavigate('/dashboard')}
                className="px-5 py-2.5 bg-[#1E5EFF] hover:bg-blue-600 text-white rounded-full text-sm font-bold transition-all hover:scale-[1.03] active:scale-98 shadow-md shadow-blue-500/10"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleNavigate('/login')}
                  className="px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-[#0B1B3A] hover:scale-110 ease-in-out transition-all hidden sm:block"
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('/signup')}
                  className="px-5 py-2.5 bg-[#1E5EFF] hover:bg-blue-600 text-white rounded-full text-sm font-bold transition-all hover:scale-[1.03] active:scale-98 shadow-md shadow-blue-500/10"
                >
                  Start Free Trial
                </button>
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 md:hidden text-slate-500 hover:text-[#0B1B3A] rounded-lg focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-16 left-0 right-0 bg-white/95 border border-slate-200 backdrop-blur-2xl rounded-3xl p-5 shadow-2xl md:hidden flex flex-col gap-3"
            >
              <button onClick={() => { setIsMobileMenuOpen(false); handleNavigate('/features'); }} className="text-left text-sm font-semibold text-slate-600 hover:text-[#0B1B3A] px-3 py-2 rounded-xl hover:bg-slate-50 transition-all bg-transparent border-none cursor-pointer">Features</button>
              <a href="#workflow" onClick={() => setIsMobileMenuOpen(false)} className="text-md font-semibold text-slate-600 hover:text-[#0B1B3A] px-3 py-2 rounded-xl hover:bg-slate-50 transition-all">How It Works</a>
              <button onClick={() => { setIsMobileMenuOpen(false); setIsDemoModalOpen(true); }} className="text-left text-md font-semibold text-slate-600 hover:text-[#0B1B3A] px-3 py-2 rounded-xl hover:bg-slate-50 transition-all">Book Demo</button>
              <button onClick={() => { setIsMobileMenuOpen(false); handleNavigate('/faqs'); }} className="text-left text-md font-semibold text-slate-600 hover:text-[#0B1B3A] px-3 py-2 rounded-xl hover:bg-slate-50 transition-all bg-transparent border-none cursor-pointer">Support FAQs</button>
              {!user && (
                <button
                  type="button"
                  onClick={() => { setIsMobileMenuOpen(false); handleNavigate('/login'); }}
                  className="w-full text-center py-2.5 text-md font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50"
                >
                  Log In
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Main content body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-24 space-y-36">

        {/* 1. HERO SECTION */}
        <motion.section
          id="hero"
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[75vh] pt-4 w-full"
        >
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 text-[#0B1B3A] text-[10px] font-black uppercase tracking-wider shadow-sm">
              <Award className="w-3.5 h-3.5 text-[#F5C542]" /> India's Premium Venue Operating System
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-6xl tracking-tight leading-[1.12] font-display text-[#0B1B3A]">
              <span className="block text-black-600 font-large font-sans text-5xl md:text-5xl sm:text-4xl lg:text-6xl mb-2">Still managing your bookings through</span>
              <span className="animate-gradient-text text-transparent font-extrabold italic font-sans">WhatsApp & Registers?</span>
            </h1>
            <p className="text-md sm:text-base text-slate-600 leading-relaxed max-w-xl">
              Most banquet halls and wedding venues lose track of payments, follow-ups, and event coordination when everything is managed manually in diaries.
            </p>
            <div className="border-l-2 border-[#1E5EFF]/40 pl-4 py-1 max-w-xl space-y-0.5">
              <span className="text-md font-bold text-slate-800 block">Upgrade to VenuePro</span>
              <p className="text-sm sm:text-md text-slate-500 leading-relaxed">
                The modern operating system built specifically for banquet halls, wedding lawns, resorts, and convention centers in India.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                type="button"
                onClick={() => handleNavigate('/signup')}
                className="px-6 py-4 bg-[#1E5EFF] hover:bg-blue-600 text-white rounded-full text-sm font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-98"
              >
                Start 14-Day Free Trial
              </button>
              <button
                type="button"
                onClick={() => setIsDemoModalOpen(true)}
                className="px-6 py-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-full text-sm font-bold transition-all flex items-center gap-2 shadow-sm"
              >
                <Play className="w-3.5 h-3.5 text-[#1E5EFF] fill-current" /> Request a Demo
              </button>
            </div>
          </div>

          {/* Hero Visual: Venue operations flow simulator */}
          {/* <div className="lg:col-span-6 relative flex justify-center w-full hover:scale-105 transition-all ease-in-out">
            <div className="relative w-full max-w-lg bg-white/80 border border-slate-200/60 rounded-3xl p-6 glow-blue backdrop-blur-md shadow-lg">
              <div className="absolute -top-3 left-6 px-3 py-1 rounded-md bg-[#1E5EFF] text-white text-[10px] font-bold tracking-widest uppercase">Live Operations Flow</div>
              <div className="space-y-4">
                {[
                  { id: 0, title: "1. Lead Entry", desc: "Customer details collected from website / phone call", label: "+84 Inquiries", icon: Users, color: "text-[#1E5EFF] bg-blue-50" },
                  { id: 1, title: "2. Slot Locked", desc: "Real-time calendar verification prevents double-bookings", label: "0% Clashes", icon: CalendarIcon, color: "text-[#F5C542] bg-amber-50" },
                  { id: 2, title: "3. Advance Ledger", desc: "Catering and rental bill parsed with GST reverse-calc", label: "₹1.5L UPI Recd", icon: DollarSign, color: "text-emerald-500 bg-emerald-50" },
                  { id: 3, title: "4. Auto WhatsApp", desc: "Automated PDF invoice receipt and balance alert triggered", label: "98% Open Rate", icon: MessageSquare, color: "text-green-500 bg-green-50" },
                  { id: 4, title: "5. CFO Analytics", desc: "Transaction mapped to occupancies and expense reports", label: "₹52.8L Q3 Sales", icon: BarChart3, color: "text-purple-500 bg-purple-50" }
                ].map((item, idx) => {
                  const isActive = idx === activeStep;
                  return (
                    <motion.div
                      key={item.id}
                      animate={{
                        scale: isActive ? 1.02 : 1,
                        backgroundColor: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.3)',
                        borderColor: isActive ? 'rgba(30, 94, 255, 0.25)' : 'rgba(15, 23, 42, 0.05)',
                        boxShadow: isActive ? '0 10px 25px -5px rgba(30, 94, 255, 0.08), 0 0 0 1px rgba(30, 94, 255, 0.1)' : 'none'
                      }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-4 p-3.5 rounded-2xl border border-slate-100"
                    >
                      <div className={cn("p-2.5 rounded-xl", item.color)}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold text-slate-800">{item.title}</p>
                          <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-md", isActive ? "text-[#1E5EFF] bg-[#1E5EFF]/10" : "text-slate-400")}>
                            {item.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 truncate">{item.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div> */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            className="lg:col-span-6 relative flex justify-center w-full"
          >
            <div className="relative w-full max-w-lg bg-white/80 border border-slate-200/60 rounded-3xl p-6 glow-blue backdrop-blur-md shadow-lg">

              {/* Floating Label */}
              <div className="absolute -top-3 left-6 px-3 py-1 rounded-md bg-[#1E5EFF] text-white text-[10px] font-bold tracking-widest uppercase">
                Live Venue Operations Flow
              </div>

              <div className="space-y-4">

                {[
                  {
                    id: 0,
                    title: "Inquiry Captured",
                    desc: "Lead comes from call, website, or walk-in — all stored in one place",
                    label: "Real-time Leads",
                    icon: Users,
                    color: "text-[#1E5EFF] bg-blue-50"
                  },
                  {
                    id: 1,
                    title: "Booking Confirmed",
                    desc: "Instant slot check prevents double bookings and conflicts",
                    label: "Zero Clashes",
                    icon: CalendarIcon,
                    color: "text-[#F5C542] bg-amber-50"
                  },
                  {
                    id: 2,
                    title: "Payment Recorded",
                    desc: "Advance and balance payments tracked automatically",
                    label: "₹ Live Tracking",
                    icon: DollarSign,
                    color: "text-emerald-500 bg-emerald-50"
                  },
                  {
                    id: 3,
                    title: "Customer Updates Sent",
                    desc: "WhatsApp messages, invoices and reminders sent automatically",
                    label: "Auto Communication",
                    icon: MessageSquare,
                    color: "text-green-500 bg-green-50"
                  },
                  {
                    id: 4,
                    title: "Event Completed Insights",
                    desc: "Revenue, occupancy and performance tracked after every event",
                    label: "Business Clarity",
                    icon: BarChart3,
                    color: "text-purple-500 bg-purple-50"
                  }
                ].map((item, idx) => {
                  const isActive = idx === activeStep;

                  return (
                    <motion.div
                      key={item.id}
                      animate={{
                        scale: isActive ? 1.03 : 1,
                        backgroundColor: isActive ? "#FFFFFF" : "rgba(255,255,255,0.35)",
                        borderColor: isActive
                          ? "rgba(30, 94, 255, 0.25)"
                          : "rgba(15, 23, 42, 0.05)",
                        boxShadow: isActive
                          ? "0 12px 30px -8px rgba(30, 94, 255, 0.15)"
                          : "none"
                      }}
                      transition={{ duration: 0.35 }}
                      className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100"
                    >

                      {/* Icon */}
                      <div className={cn("p-2.5 rounded-xl", item.color)}>
                        <item.icon className="w-4 h-4" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">

                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold text-slate-800">
                            {item.title}
                          </p>

                          <span
                            className={cn(
                              "text-[9px] font-bold px-2 py-0.5 rounded-md",
                              isActive
                                ? "text-[#1E5EFF] bg-[#1E5EFF]/10"
                                : "text-slate-400"
                            )}
                          >
                            {item.label}
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {item.desc}
                        </p>

                      </div>
                    </motion.div>
                  );
                })}

              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* 2. PAIN TO TRANSFORMATION SECTION */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-12 text-center"
        >
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B1B3A] font-sans tracking-tight">
              Replace Diary Chaos with Unified Order
            </h2>
            <p className="text-md text-slate-500 max-w-xl mx-auto">
              Running a busy Indian venue is hectic. Managing it on papers shouldn't make it harder.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* The Chaos */}
            <motion.div
              whileHover={{ y: -6, scale: 1.015, boxShadow: "0 20px 40px -15px rgba(239, 68, 68, 0.08)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-red-50/40 border border-red-200/50 rounded-3xl p-8 space-y-6 text-left relative transition-all hover:border-red-200 shadow-xs"
            >
              <div className="absolute top-4 right-4 text-[9px] font-bold text-red-600 uppercase tracking-widest bg-red-100 border border-red-200 px-2.5 py-0.5 rounded-full">Old Way (Diaries & Paper)</div>
              <h3 className="text-lg font-bold text-red-950">The Friction of Paper Registers</h3>
              <div className="space-y-4">
                {[
                  { title: "Double-Booking Risk", desc: "Booking a date on a slip of paper only to find another manager blocked it in another register book.", icon: AlertCircle },
                  { title: "Manual GST Calculations", desc: "Scribbling per-plate costs and tax structures by hand, leading to massive accounting gaps.", icon: XCircle },
                  { title: "Lost Inquiries", desc: "WhatsApp inquiries buried under hundreds of messages, causing customers to book with rival venues.", icon: MessageSquare }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <item.icon className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-red-900">{item.title}</h4>
                      <p className="text-[11px] text-red-700 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* The Transformation */}
            <motion.div
              whileHover={{ y: -6, scale: 1.015, boxShadow: "0 20px 40px -15px rgba(30, 94, 255, 0.15)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="gradient-border-glow shadow-md"
            >
              <div className="inner-dot-grid bg-white/95 rounded-[24px] p-8 space-y-6 text-left relative overflow-hidden h-full">
                <div className="absolute top-4 right-4 text-[9px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">The Order (VenuePro OS)</div>
                <h3 className="text-lg font-bold text-slate-800">The Power of Digital Precision</h3>
                <div className="space-y-4">
                  {[
                    { title: "100% Calendar Lock", desc: "Dates are blocked instantly across all coordinators' phones. Overlap safety checks block double-bookings.", icon: CheckCircle2 },
                    { title: "Automated Tax Bills", desc: "GST calculations are reverse-computed automatically from inclusive packages in 2 seconds.", icon: CheckCircle2 },
                    { title: "Follow-up Pipeline", desc: "CRM dashboard surfaces pending client follow-ups automatically, securing site visits.", icon: CheckCircle2 }
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-3 relative z-10">
                      <item.icon className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* 3. PRODUCT VALUE SECTION (Outcome-Based Benefits) */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-16"
        >
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B1B3A] font-Sans tracking-tight">
              Outcome-Driven Venue Growth
            </h2>
            <p className="text-md text-slate-500 max-w-xl mx-auto">
              We focus on metrics that drive business expansion, booking occupancy, and owner security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "30% Booking Rate Increase", desc: "Automated followup alerts keep hot leads warm. Share quotes in seconds via WhatsApp so customers book with you before competitors get back to them.", metric: "+30%" },
              { title: "3x Faster Debt Collection", desc: "Split advance structures and automated pending payments notifications keep cash flowing, cutting down on physical collection phone calls.", metric: "3x" },
              { title: "100% Secret Profit Margin", desc: "Role-Based Access Control keeps net margins, bills, and accounting files completely hidden from staff while allowing them to check calendars.", metric: "100%" }
            ].map((card, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -6, scale: 1.1, boxShadow: "0 20px 40px -15px rgba(30, 94, 255, 0.12)" }}

                className="bg-white border border-slate-200/60 hover:border-slate-350  rounded-3xl p-8 space-y-6 transition-all  relative group overflow-hidden shadow-2xs hover:shadow-md"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#4f46e5] rounded-bl-full group-hover:bg-[#4f46e5] transition-all" />



                <div className="text-5xl font-black text-[#1E5EFF] font-display relative z-10">{card.metric}</div>
                <div className="space-y-2 relative z-10">
                  <h3 className="text-base font-bold text-slate-800">{card.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{card.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 4. SYSTEM FLOW SECTION (Interactive Workflow Mockup) */}
        <motion.section
          id="workflow"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-12"
        >
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B1B3A] font-Sans tracking-tight">
              The Booking Pipeline in Action
            </h2>
            <p className="text-md text-slate-500 max-w-xl mx-auto">
              Follow a single booking from initial inquiry all the way to final tax receipts and reporting.
            </p>
          </div>

          {/* Stepper Tabs */}
          <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
            {FLOW_STEPS.map((step, idx) => {
              const isActive = idx === activeStep;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={cn(
                    "px-4 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 border",
                    isActive
                      ? "bg-[#1E5EFF] border-transparent text-white shadow-md shadow-blue-500/10"
                      : "bg-white border-slate-200/60 text-slate-500 hover:text-[#0B1B3A] hover:border-slate-350"
                  )}
                >
                  <step.icon className="w-3.5 h-3.5" />
                  <span>{step.title.split('. ')[1]}</span>
                </button>
              );
            })}
          </div>

          {/* Stepper Display Card */}
          <div className="max-w-4xl mx-auto bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-lg glow-blue relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-4">
                <span className="text-[9px] font-black uppercase tracking-widest text-[#1E5EFF] bg-[#1E5EFF]/10 border border-[#1E5EFF]/20 px-2.5 py-0.5 rounded-full">
                  {FLOW_STEPS[activeStep].metric}
                </span>
                <h3 className="text-xl font-bold text-slate-800">{FLOW_STEPS[activeStep].title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{FLOW_STEPS[activeStep].desc}</p>
                <div className="flex items-center gap-2 text-sm font-semibold text-[#1E5EFF] hover:underline cursor-pointer" onClick={() => handleNavigate('/signup')}>
                  <span>Try this module</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>

              <div className="lg:col-span-7 bg-[#F6F7FB] rounded-2xl border border-slate-200/50 p-4 sm:p-6 overflow-hidden h-64 relative flex flex-col justify-between shadow-inner">
                {activeStep === 0 && (
                  <div className="space-y-4 animate-scale-up">
                    <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
                      <span className="text-sm font-bold text-slate-400">Leads Board</span>
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-bold">New Inquiries</span>
                    </div>
                    <div className="bg-white rounded-xl p-3.5 border border-slate-200/60 shadow-2xs relative overflow-hidden">
                      <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                      <p className="text-sm font-bold text-slate-800">Sanjay Gupta</p>
                      <p className="text-[10px] text-slate-500 mt-1 font-medium">Event: Dec 18 Wedding (300 Plates)</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Contact: +91 98123 45678</p>
                    </div>
                  </div>
                )}
                {activeStep === 1 && (
                  <div className="space-y-3 animate-scale-up">
                    <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
                      <span className="text-sm font-bold text-slate-400">Calendar Validation</span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md font-bold">Slot Available</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1.5 text-center text-[10px]">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i} className="text-slate-400 font-bold">{d}</span>)}
                      {Array.from({ length: 14 }).map((_, idx) => {
                        const isDec18 = idx === 8;
                        return (
                          <span key={idx} className={cn(
                            "py-1 rounded-md font-bold",
                            isDec18
                              ? "bg-[#1E5EFF] text-white animate-pulse"
                              : "bg-white border border-slate-150 text-slate-600"
                          )}>
                            {idx + 10}
                          </span>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-[#1E5EFF] font-bold text-center mt-2">✨ Dec 18 Locked Successfully</p>
                  </div>
                )}
                {activeStep === 2 && (
                  <div className="space-y-4 animate-scale-up">
                    <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
                      <span className="text-sm font-bold text-slate-400">Reverse GST Invoice</span>
                      <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md font-bold">Calculated</span>
                    </div>
                    <div className="space-y-1.5 text-[10px] text-slate-600 font-mono">
                      <div className="flex justify-between"><span>Package (Inclusive):</span><span className="font-bold">₹1,50,000</span></div>
                      <div className="flex justify-between text-slate-400"><span>Taxable Base:</span><span>₹1,27,118.64</span></div>
                      <div className="flex justify-between text-slate-400"><span>CGST (9%):</span><span>₹11,440.68</span></div>
                      <div className="flex justify-between text-slate-400"><span>SGST (9%):</span><span>₹11,440.68</span></div>
                      <div className="flex justify-between text-slate-800 font-bold border-t border-slate-200/60 pt-1.5"><span>Total Advance Paid:</span><span>₹1,50,000</span></div>
                    </div>
                  </div>
                )}
                {activeStep === 3 && (
                  <div className="space-y-4 animate-scale-up flex flex-col justify-between h-full">
                    <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
                      <span className="text-sm font-bold text-slate-400">WhatsApp Dispatch</span>
                      <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-md font-bold">Delivered</span>
                    </div>
                    <div className="self-end bg-white border border-slate-200/60 shadow-2xs rounded-2xl p-3 max-w-[85%] text-[10px] text-slate-700">
                      <p>Dear Sanjay Gupta, confirmation of payment of ₹1,50,000. Slot Dec 18 Locked. Receipts: venuepro.in/public/receipt/...</p>
                      <span className="text-[8px] text-slate-400 block text-right mt-1 font-semibold">11:02 AM ✓✓</span>
                    </div>
                  </div>
                )}
                {activeStep === 4 && (
                  <div className="space-y-4 animate-scale-up h-full flex flex-col justify-between">
                    <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
                      <span className="text-sm font-bold text-slate-400">Q3 Revenue Ledger</span>
                      <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-md font-bold">Updated</span>
                    </div>
                    <div className="flex-1 flex bg-slate-100/50 p-2.5 rounded-xl border border-slate-200/50 h-28 relative overflow-hidden">
                      {/* Gridlines */}
                      <div className="absolute inset-0 flex flex-col justify-between py-4 px-2 pointer-events-none opacity-5">
                        <div className="border-b border-slate-900 w-full" />
                        <div className="border-b border-slate-900 w-full" />
                      </div>

                      {/* Bars */}
                      <div className="flex-1 flex items-end gap-2 h-full relative z-10">
                        {[30, 45, 65, 50, 85, 95, 70].map((val, idx) => (
                          <div key={idx} className="flex-1 bg-slate-200/40 rounded-t-md h-full flex items-end relative group">
                            <motion.div
                              key={`${activeStep}-${idx}`}
                              initial={{ height: 0 }}
                              animate={{ height: `${val}%` }}
                              transition={{ duration: 0.8 }}
                              className="w-full bg-gradient-to-t from-[#1E5EFF] to-[#6090FF] group-hover:from-[#F5C542] group-hover:to-[#FFDE85] rounded-t-md transition-all duration-300"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div className="text-[9px] text-slate-400 flex justify-between border-t border-slate-200/50 pt-2 font-semibold">
                  <span>Connection: Secure SSL</span>
                  <span>Press Tabs to switch views</span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 5. PRODUCT MODULES (Bento Grid) */}
        <motion.section
          id="features"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-16"
        >
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B1B3A] font-Sans tracking-tight">
              A Complete Venue Operating System
            </h2>
            <p className="text-md text-slate-500 max-w-xl mx-auto">
              Everything you need to automate inquiries, billing, staff, and analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-6xl mx-auto">
            {/* 1. Calendar locking */}
            <motion.div
              whileHover={{ y: -6, scale: 1.012, boxShadow: "0 20px 40px -15px rgba(30, 94, 255, 0.12)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-white border border-slate-200/60 hover:border-slate-350 rounded-3xl p-6 sm:p-8 md:col-span-8 flex flex-col justify-between min-h-[300px] transition-all relative overflow-hidden group shadow-2xs"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#1E5EFF]/5 rounded-bl-full" />
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-7 space-y-4">
                  <div className="p-3 bg-[#1E5EFF]/5 rounded-2xl w-fit text-[#1E5EFF]"><CalendarIcon className="w-5 h-5" /></div>
                  <h3 className="text-lg font-bold text-slate-800">Instant Calendar Slots Locking</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Dates are locked instantly across all coordinator devices. Double-booking check blocks concurrent submissions and checks buffer slot times.
                  </p>
                </div>
                <div className="md:col-span-5 bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-2.5 font-sans relative overflow-hidden shadow-2xs scale-95 md:scale-100">
                  <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                    <span>Calendar Guard</span>
                    <span className="text-red-500 font-extrabold flex items-center gap-1">● Conflict Lock</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="bg-red-50 border border-red-200 p-2 rounded-xl text-[9px] text-red-950 flex justify-between items-center">
                      <div>
                        <p className="font-extrabold">Inquiry 1: Sanjay (Grand Lawn)</p>
                        <p className="text-slate-500 font-medium">Dec 18, 10:00 AM</p>
                      </div>
                      <span className="bg-red-100 px-1.5 py-0.5 rounded font-black text-red-700">CLASH</span>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 p-2 rounded-xl text-[9px] text-blue-950 flex justify-between items-center opacity-60">
                      <div>
                        <p className="font-extrabold">Inquiry 2: Sharma (Grand Lawn)</p>
                        <p className="text-slate-500 font-medium">Dec 18, 11:30 AM</p>
                      </div>
                      <span className="bg-blue-100 px-1.5 py-0.5 rounded font-black text-blue-700">QUEUED</span>
                    </div>
                  </div>
                  <p className="text-[8px] text-slate-400 text-center font-bold">⚠️ Blocked concurrently submitted duplicate requests</p>
                </div>
              </div>
              <div className="border-t border-slate-150 pt-4 mt-6 text-[10px] text-slate-400 font-bold">100% Slot Accuracy Guarantee</div>
            </motion.div>

            {/* 2. Automated invoices */}
            <motion.div
              whileHover={{ y: -6, scale: 1.012, boxShadow: "0 20px 40px -15px rgba(30, 94, 255, 0.12)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-white border border-slate-200/60 hover:border-slate-350 rounded-3xl p-6 sm:p-8 md:col-span-4 flex flex-col justify-between min-h-[300px] transition-all relative overflow-hidden group shadow-2xs"
            >
              <div className="space-y-4">
                <div className="p-3 bg-[#F5C542]/10 rounded-2xl w-fit text-[#F5C542]"><DollarSign className="w-5 h-5" /></div>
                <h3 className="text-lg font-bold text-slate-800">Split Payments & Tax</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Splits advances, logs installments, and reverse-calculates CGST/SGST from package totals instantly.
                </p>
                <div className="bg-amber-50/40 border border-amber-200/50 rounded-2xl p-3.5 space-y-2 mt-4 text-[9px] font-mono text-slate-605">
                  <div className="flex justify-between text-slate-400"><span>Catering base:</span><span>₹1,27,118</span></div>
                  <div className="flex justify-between text-slate-400"><span>GST (18%):</span><span>₹22,881</span></div>
                  <div className="border-t border-slate-200/60 my-1" />
                  <div className="flex justify-between font-extrabold text-slate-800"><span>Bill Total:</span><span>₹1,50,000</span></div>
                </div>
              </div>
              <div className="border-t border-slate-150 pt-4 mt-6 text-[10px] text-slate-400 font-bold">CA-Compliant Billing Ledger</div>
            </motion.div>

            {/* 3. CRM followups */}
            <motion.div
              whileHover={{ y: -6, scale: 1.012, boxShadow: "0 20px 40px -15px rgba(30, 94, 255, 0.12)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-white border border-slate-200/60 hover:border-slate-350 rounded-3xl p-6 sm:p-8 md:col-span-4 flex flex-col justify-between min-h-[300px] transition-all relative overflow-hidden group shadow-2xs"
            >
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 rounded-2xl w-fit text-emerald-500"><TrendingUp className="w-5 h-5" /></div>
                <h3 className="text-lg font-bold text-slate-800">CRM Follow-ups Pipeline</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Automatically flags overdue customer calls, keeping hot event inquiries active.
                </p>
                <div className="bg-emerald-50/40 border border-emerald-200/50 rounded-2xl p-3.5 space-y-2 mt-4 text-[9px] font-sans">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-800">Sanjay Gupta (Wedding)</span>
                    <span className="bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded text-[8px]">📞 OVERDUE</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-800">Rajesh Reddy (Engagement)</span>
                    <span className="bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded text-[8px]">✓ Done</span>
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-150 pt-4 mt-6 text-[10px] text-slate-400 font-bold">3x Sales Conversion Rate</div>
            </motion.div>

            {/* 4. Staff roles */}
            <motion.div
              whileHover={{ y: -6, scale: 1.012, boxShadow: "0 20px 40px -15px rgba(30, 94, 255, 0.12)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-white border border-slate-200/60 hover:border-slate-350 rounded-3xl p-6 sm:p-8 md:col-span-8 flex flex-col justify-between min-h-[300px] transition-all relative overflow-hidden group shadow-2xs"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5C542]/5 rounded-bl-full" />
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-7 space-y-4">
                  <div className="p-3 bg-purple-50 rounded-2xl w-fit text-purple-500"><ShieldCheck className="w-5 h-5" /></div>
                  <h3 className="text-lg font-bold text-slate-800">Staff Roles & Permissions Control</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Restrict access to cash registers, profit metrics, and pricing policies. Staff members get read-only calendar access.
                  </p>
                </div>
                <div className="md:col-span-5 bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-2 font-sans scale-95 md:scale-100">
                  <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 border-b border-slate-200/60 pb-1.5">
                    <span>Staff Access Rules</span>
                    <span>Status</span>
                  </div>
                  <div className="space-y-1.5 text-[9px]">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-800 font-bold">Owner Dashboard metrics</span>
                      <span className="text-emerald-600 font-black">ENABLED</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-slate-100 pt-1.5">
                      <span className="text-slate-800 font-bold">Staff Booking calendar</span>
                      <span className="text-emerald-600 font-black">ENABLED</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-slate-100 pt-1.5">
                      <span className="text-slate-800 font-bold">Cash ledger modifications</span>
                      <span className="text-red-500 font-black">DISABLED</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-150 pt-4 mt-6 text-[10px] text-slate-400 font-bold">Audit Log Integrity System</div>
            </motion.div>
          </div>
        </motion.section>

        {/* 6. MOBILE-FIRST SECTION */}
        <motion.section
          id="mobile"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full"
        >
          <div className="lg:col-span-6 space-y-6 text-left order-last lg:order-first">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E5EFF]/10 border border-[#1E5EFF]/20 text-[#1E5EFF] text-[10px] font-bold uppercase tracking-wider">
              <Smartphone className="w-3.5 h-3.5" /> Mobile Hub
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B1B3A] tracking-tight leading-none font-Sans">
              Manage Your Venue Directly From Your Phone
            </h2>
            <p className="text-md text-slate-500 leading-relaxed">
              Our mobile-first layout is built specifically for venue managers and coordinators on the move. You don't need a computer to check slot availability, print a GST invoice, or check today's collections.
            </p>
            <div className="space-y-3.5">
              {[
                "10-second mobile quotation creation and dispatch",
                "Instant WhatsApp invoice links with zero manual attachment steps",
                "Realtime booking notifications and UPI deposit confirmations",
                "Offline protected calendar checks that sync on network return"
              ].map((text, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#1E5EFF]/10 border border-[#1E5EFF]/20 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-[#1E5EFF]" />
                  </div>
                  <span className="text-sm text-slate-600 font-semibold">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 flex justify-center w-full">
            {/* Phone Mockup */}
            <div className="w-72 h-[560px] rounded-[44px] border-[8px] border-slate-900 bg-white p-3 shadow-2xl relative overflow-hidden ring-4 ring-slate-100 ring-offset-0">
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-900 rounded-full z-20 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-slate-800 rounded-full ml-auto mr-1.5 opacity-60" />
              </div> {/* Dynamic Island */}

              <div className="flex-1 flex flex-col justify-between pt-5">
                <div className="space-y-4">
                  {/* Phone Header */}
                  <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-slate-100 pb-2 font-bold">
                    <span>9:41 AM</span>
                    <span className="text-emerald-600 font-black">● Synchronized</span>
                  </div>

                  {/* Phone App Widget */}
                  <div className="space-y-3">
                    <div className="bg-[#0B1B3A] rounded-2xl p-3.5 space-y-1 shadow-sm text-white">
                      <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Today's Revenue</span>
                      <p className="text-lg font-black">₹1.85 Lakhs</p>
                      <span className="text-[8px] text-emerald-400 block font-semibold">+14% vs last week</span>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-3 space-y-2 border border-slate-200/60">
                      <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Active Slots (Today)</span>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-slate-800">Crystal Lawn</span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-[#F5C542] text-[8px] font-bold">Sangeet</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notifications feed */}
                <div className="space-y-2.5">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-2.5 flex items-start gap-2.5 animate-pulse shadow-3xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1E5EFF] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[9px] font-bold text-slate-800">Booking Slot Locked</p>
                      <p className="text-[8px] text-slate-500 font-medium">Dec 18 - Grand Lawn (Gupta Wedding)</p>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-150 shadow-3xs rounded-xl p-2.5 flex items-start gap-2.5">
                    <MessageSquare className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[9px] font-bold text-slate-800">WhatsApp Invoice Sent</p>
                      <p className="text-[8px] text-slate-500 font-medium">Sanjay Gupta - Invoice INV-10292</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Home button indicator */}
              <div className="w-24 h-1 bg-slate-200 rounded-full mx-auto mt-4 shrink-0" />
            </div>
          </div>
        </motion.section>

        {/* 8. ANALYTICS SECTION */}
        <motion.section
          id="analytics"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-12"
        >
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B1B3A] font-Sans tracking-tight">
              Real-Time Financial Dashboard
            </h2>
            <p className="text-md text-slate-500 max-w-xl mx-auto">
              Get an accurate view of your bookings, plate counts, margins, and expenses instantly.
            </p>
          </div>

          <div className="max-w-5xl mx-auto bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 backdrop-blur-md glow-gold relative overflow-hidden shadow-lg">
            {/* Interactive Timeline Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
              <div>
                <h3 className="text-base font-bold text-slate-800">CFO Dashboard Preview</h3>
                <p className="text-sm text-slate-400 mt-0.5 font-semibold">Toggle timeline to view simulated database calculations</p>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60 w-fit">
                {['month', 'quarter', 'year'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setAnalyticsTimeframe(t as any)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase tracking-wider",
                      analyticsTimeframe === t
                        ? "bg-[#1E5EFF] text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-700"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Dashboard Visual Body */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-left">
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Bookings Count</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-800">{analyticsData.bookings}</span>
                  <span className="text-sm text-emerald-600 font-bold">{analyticsData.bookingsTrend}</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Total Collection</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[#1E5EFF]">{analyticsData.revenue}</span>
                  <span className="text-sm text-emerald-600 font-bold">{analyticsData.revenueTrend}</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Occupancy Rate</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-800">{analyticsData.occupancy}</span>
                  <span className="text-sm text-emerald-600 font-bold">{analyticsData.occupancyTrend}</span>
                </div>
              </div>
            </div>

            {/* Mini Chart & Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 items-end">
              {/* Columns */}
              <div className="lg:col-span-5 h-44 flex bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner relative overflow-hidden">
                {/* Gridlines */}
                <div className="absolute inset-0 flex flex-col justify-between py-6 px-4 pointer-events-none opacity-5">
                  <div className="border-b border-slate-900 w-full" />
                  <div className="border-b border-slate-900 w-full" />
                  <div className="border-b border-slate-900 w-full" />
                </div>

                {/* Y-Axis Labels */}
                <div className="flex flex-col justify-between text-[8px] text-slate-400 font-bold pr-2 h-full py-2 pointer-events-none select-none">
                  <span>100%</span>
                  <span>50%</span>
                  <span>0%</span>
                </div>

                {/* Bars */}
                <div className="flex-1 flex items-end gap-3.5 h-full relative z-10">
                  {analyticsData.bars.map((val, idx) => (
                    <div key={idx} className="flex-1 bg-slate-200/40 rounded-t-md h-full flex items-end relative group">
                      <motion.div
                        key={`${analyticsTimeframe}-${idx}`}
                        initial={{ height: 0 }}
                        animate={{ height: `${val}%` }}
                        transition={{ duration: 0.6 }}
                        className="w-full bg-gradient-to-t from-[#1E5EFF] to-[#6090FF] group-hover:from-[#F5C542] group-hover:to-[#FFDE85] rounded-t-md transition-all duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Bookings List */}
              <div className="lg:col-span-7 bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3 shadow-2xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recent Slated Handovers</p>
                <div className="divide-y divide-slate-150 text-[11px]">
                  {analyticsData.bookingsList.map((b, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-800 truncate max-w-xs">{b.name}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5 font-medium">{b.space} · {b.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#1E5EFF]">{b.amount}</p>
                        <span className="text-[8px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-md mt-0.5 block w-fit ml-auto font-bold">
                          {b.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 9. MARKETPLACE FUTURE SECTION */}
        <motion.section
          id="marketplace"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-16 relative"
        >
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B1B3A] font-sans tracking-tight">
              Grow Your Business Commission-Free
            </h2>
            <p className="text-md text-slate-500 max-w-xl mx-auto">
              Our vision is to bypass middlemen and connect guests directly with local wedding venues.
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 relative overflow-hidden glow-blue shadow-lg">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#1E5EFF]/5 rounded-bl-full pointer-events-none" />

            <div className="lg:col-span-6 space-y-6 text-left">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#1E5EFF] bg-[#1E5EFF]/10 border border-[#1E5EFF]/20 px-2.5 py-0.5 rounded-full">
                Venue Discovery Portal
              </span>
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Direct Consumer Booking Portal</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                We are building India's largest commission-free venue directory. By hosting your internal operations on VenuePro, your open calendar slots, photo galleries, and specs catalogs can sync directly to our guest-facing portal.
              </p>
              <p className="text-sm text-slate-500 leading-relaxed">
                Brides, grooms, and event planners can view your availability, send inquiries directly to your WhatsApp CRM, and book slots without paying a single rupee to commissions agents.
              </p>
            </div>

            <div className="lg:col-span-6 border border-slate-150 rounded-2xl bg-slate-50 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                <Search className="w-4 h-4 text-[#1E5EFF]" />
                <span className="text-[10px] text-slate-400 font-bold">Searching for wedding banquets in Gurugram...</span>
              </div>

              <div className="bg-white rounded-xl p-3.5 space-y-3 border border-slate-200/60 shadow-3xs">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Shree Balaji Palace & Lawn</h4>
                    <p className="text-[9px] text-slate-400 mt-0.5 font-medium">Sector 48, Gurugram · 500-1000 Capacity</p>
                  </div>
                  <span className="text-[8px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md font-bold">Dec 18 Available</span>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 bg-slate-50 border border-slate-200/50 rounded-md text-[8px] text-slate-500 font-bold">✓ Parking 200 Cars</span>
                  <span className="px-2 py-0.5 bg-slate-50 border border-slate-200/50 rounded-md text-[8px] text-slate-500 font-bold">✓ 4 Bridal Suites</span>
                </div>
                <button type="button" className="w-full text-center py-2 bg-[#1E5EFF] text-white rounded-lg text-[10px] font-bold shadow-sm">
                  Connect Direct via WhatsApp
                </button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 9. BOOK A DEMO SECTION */}
        <motion.section
          ref={demoSectionRef}
          id="demo"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="scroll-mt-24 space-y-12"
        >
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B1B3A] font-Sans tracking-tight">
              Book a Free Live Demo & WhatsApp Tour
            </h2>
            <p className="text-md text-slate-500 max-w-xl mx-auto">
              See how VenuePro works live. We will show you how to lock calendar slots, set up menus, and trigger WhatsApp receipts in 15 minutes.
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-lg relative glow-blue">
            <div className="lg:col-span-6 space-y-6 text-left">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#1E5EFF] bg-[#1E5EFF]/10 border border-[#1E5EFF]/20 px-2.5 py-0.5 rounded-full">
                Guided Walkthrough
              </span>
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight">What to expect in your 15-min demo:</h3>

              <div className="space-y-4">
                {[
                  { title: "Double-Booking Protection Test", desc: "Test how the digital calendar blocks overlapping timings across multiple managers." },
                  { title: "GST & Catering Packages Setup", desc: "See how custom menus (Veg/Non-Veg rate lists) link directly to your reverse-tax invoice builder." },
                  { title: "Free Data Migration Setup", desc: "Learn how we migrate your existing customer registers and Excel files to VenuePro in under 24 hours." }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-[#1E5EFF]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 border border-slate-150 rounded-2xl bg-slate-50 p-6 sm:p-8 shadow-2xs">
              <DemoWizard />
            </div>
          </div>
        </motion.section>

        {/* 10. TRUST SECTION */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-16 max-w-5xl mx-auto"
        >
          {/* <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold text-[#0B1B3A] font-display tracking-tight">
              Trusted by Top Indian Venues
            </h2>
            <p className="text-md text-slate-500 max-w-xl mx-auto">
              Read how wedding halls and convention center owners upgraded their operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="bg-white border border-slate-200/60 rounded-3xl p-8 space-y-4 relative shadow-2xs">
              <p className="text-sm text-slate-600 italic leading-relaxed">
                "We managed our wedding lawn on hardbound paper registers for over 35 years. Shifting our staff to VenuePro took only 2 days. The calendar locks slots instantly across all staff phones, stopping double-booking arguments once and for all."
              </p>
              <div>
                <p className="text-sm font-bold text-slate-800">Rajesh Yadav</p>
                <p className="text-[10px] text-slate-400 font-semibold">Owner, Shree Balaji Gardens (Gurugram)</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200/60 rounded-3xl p-8 space-y-4 relative shadow-2xs">
              <p className="text-sm text-slate-600 italic leading-relaxed">
                "Calculating reverse-GST billing during wedding seasons used to take hours. VenuePro computes splits, plates, CGST, and SGST in 2 seconds, and auto-dispatches clean PDF invoice links directly to our clients' WhatsApp. Excellent application!"
              </p>
              <div>
                <p className="text-sm font-bold text-slate-800">Sanjay Reddy</p>
                <p className="text-[10px] text-slate-400 font-semibold">General Manager, Pearl Convention Center (Hyderabad)</p>
              </div>
            </div>
          </div> */}

          <div className="pt-8 border-t border-slate-200 text-center space-y-4">
            <p className="text-[18px] text-[#0B1B3A] uppercase font-black tracking-widest">A Note from the Founders</p>
            <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed font-medium">
              "We built VenuePro because we saw Indian banquet and resort owners losing lakhs every wedding season to billing calculation errors, calendar clashes, and outstanding balance collections. We designed it to be simple enough that anyone who can use WhatsApp can run their entire venue register in 10 seconds."
            </p>
            <p className="text-[14px] text-[#0B1B3A] font-black tracking-widest">Kishore ~ Co Founder at Venue Pro</p>
          </div>
        </motion.section>

        {/* 11. FINAL CTA SECTION (Premium Dark Navy Contrast Card) */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          <motion.div
            whileHover={{ y: -6, scale: 1.01, boxShadow: "0 25px 50px -12px rgba(245, 197, 66, 0.15)" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-gradient-to-br from-[#0B1B3A] to-[#0A1A35] rounded-3xl border border-slate-800 p-8 sm:p-12 text-center text-white space-y-8 relative overflow-hidden glow-gold shadow-2xl"
          >
            <div className="absolute top-[-30%] left-[-20%] w-[60%] aspect-square rounded-full bg-[#1E5EFF]/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-30%] right-[-20%] w-[60%] aspect-square rounded-full bg-[#F5C542]/5 blur-[120px] pointer-events-none" />

            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-Sans tracking-tight">
                Modernize Your Venue Register Today
              </h2>
              <p className="text-sm sm:text-md text-slate-300 max-w-lg mx-auto leading-relaxed">
                Start our 14-day free trial. Setup takes under 5 minutes. No credit card required. Upload your list and check slot calendars instantly.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button
                type="button"
                onClick={() => handleNavigate('/signup')}
                className="w-full sm:w-auto px-7 py-4 bg-[#1E5EFF] hover:bg-blue-600 text-white rounded-full text-sm font-bold shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-98"
              >
                Create Free Account
              </button>
              <button
                type="button"
                onClick={() => setIsDemoModalOpen(true)}
                className="w-full sm:w-auto px-7 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-full text-sm font-bold transition-all shadow-lg hover:scale-[1.02] active:scale-98"
              >
                Request a Live Demo
              </button>
            </div>

            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-[10px] text-slate-500 pt-4 font-semibold">
              <span>✓ No credit card required</span>
              <span>✓ Cancel / Pause any time</span>
              <span>✓ Free data migration support</span>
            </div>
          </motion.div>
        </motion.section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 text-center text-sm text-slate-500 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex justify-center items-center gap-3">
            <img src={venueProLogo} alt="Logo" className="h-10 w-auto opacity-70" />

          </div>
          <p>© 2026 VenuePro Technologies. All rights reserved. CA-audited billing, digital calendar locks, and WhatsApp CRM automations.</p>
          <div className="flex justify-center gap-6 text-[11px] font-semibold">
            <button onClick={() => handleNavigate('/faqs')} className="hover:text-slate-800 bg-transparent border-none cursor-pointer transition-colors">Support FAQs</button>
            <button onClick={() => handleNavigate('/privacy')} className="hover:text-slate-800 bg-transparent border-none cursor-pointer transition-colors">Privacy Policy</button>
            <button onClick={() => handleNavigate('/terms')} className="hover:text-slate-800 bg-transparent border-none cursor-pointer transition-colors">Terms of Service</button>
            <a href="mailto:support@venuepro.in" className="hover:text-slate-800 transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>

      {/* Demo Request Modal */}
      <AnimatePresence>
        {isDemoModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
            onClick={() => setIsDemoModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200/50 flex flex-col md:flex-row relative max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsDemoModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors z-50 animate-fade-in"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Left Column - Demo Info / Value Prop */}
              <div className="hidden md:flex md:w-5/12 bg-[#0B1B3A] p-8 text-white flex-col justify-between relative overflow-hidden">
                {/* Background glow */}
                <div className="absolute top-[-20%] left-[-20%] w-[80%] aspect-square rounded-full bg-[#1E5EFF]/20 blur-[80px]" />

                <div className="space-y-6 relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[#F5C542] text-[9px] font-black tracking-wider uppercase">
                    <Sparkles className="w-3 h-3 animate-pulse" /> Live Sandbox Tour
                  </div>
                  <h3 className="text-xl font-bold tracking-tight font-display">Request a Personalized Demo</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Explore how VenuePro eliminates paper register mistakes and payment tracking hassles for Indian wedding halls.
                  </p>

                  <div className="space-y-4 pt-2">
                    {[
                      "Realtime slot lock verification",
                      "Reverse-GST invoicing demo",
                      "WhatsApp auto-reminders setup",
                      "Free 24hr paper data migration"
                    ].map((text, idx) => (
                      <div key={idx} className="flex items-center gap-2.5">
                        <div className="w-4 h-4 rounded-full bg-[#1E5EFF] flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                        <span className="text-[11px] text-slate-200 font-medium">{text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 border-t border-white/10 mt-8 relative z-10">
                  <p className="text-[10px] text-slate-400 italic">
                    "Setting up took only 2 days. The calendar lock is brilliant."
                  </p>
                  <p className="text-[10px] font-bold text-[#F5C542] mt-1">Rajesh Yadav (Gurugram)</p>
                </div>
              </div>

              {/* Right Column - Conversational Form */}
              <div className="w-full md:w-7/12 p-8 bg-slate-50 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight mb-1 font-display">Let's set up your walkthrough</h3>
                  <p className="text-sm text-slate-400 mb-6">Takes less than 1 minute to submit request</p>
                  <DemoWizard onSuccess={() => { }} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
