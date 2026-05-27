import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Calendar as CalendarIcon, ChevronDown, Check, ArrowRight, Zap, Users,
  TrendingUp, MessageSquare, Clock, Sparkles, Menu, X,
  FileText, Smartphone, ShieldCheck, CheckCircle2, ChevronRight,
  HelpCircle, Printer, HeartHandshake, ArrowUpRight, Plus, Send,
  AlertCircle, XCircle, BarChart3, Database, Shield, Share2, Award, Search, DollarSign
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';
import venueProLogo from '@/assets/venueProLogo.svg';
import { getAppUrl } from '@/lib/urls';

// FAQ data structure matching operational B2B questions in simple terms
interface FAQItem {
  question: string;
  answer: string;
  category: 'usage' | 'benefits' | 'challenges' | 'support';
}

const FAQS: FAQItem[] = [
  {
    category: 'usage',
    question: "How easy is it to migrate from paper registers and Excel sheets to VenuePro?",
    answer: "Extremely simple. You can upload your customer registers and existing bookings via our automated Excel/CSV Import Wizard in one click. For immediate assistance, our dedicated support team can set up your workspace via a quick WhatsApp call, completely free of charge."
  },
  {
    category: 'benefits',
    question: "How does VenuePro guarantee a boost in booking occupancy?",
    answer: "VenuePro eliminates lead leakages. It automatically prompts your team to follow up on open inquiries, lets you share calendar availability and pricing sheets via WhatsApp in real-time, and sends automated payment reminders. Most Indian banquets report a 30% increase in bookings within the first 90 days."
  },
  {
    category: 'challenges',
    question: "Can I restrict staff access so they don't see my cash flow and profits?",
    answer: "Yes, fully. With custom Roles & Permissions, you can set coordinators to view event calendars only, managers to enter bookings, and restrict access to financial logs, profit reports, and expense statistics solely to the venue owner."
  },
  {
    category: 'support',
    question: "What happens if we lose internet connection during a busy wedding season?",
    answer: "VenuePro is built for Indian business conditions. It saves all your session modifications locally in your browser storage offline. The moment you connect to a mobile network, all bookings, logs, and payments are safely synchronized to the cloud."
  }
];

// Feature network nodes definition
interface FeatureNode {
  id: string;
  title: string;
  description: string;
  metric: string;
  icon: any;
  color: string;
}

const FEATURE_NODES: FeatureNode[] = [
  {
    id: 'bookings',
    title: 'Instant Calendar Lock',
    description: 'Avoid double-booking disputes. Lock dates with real-time slot synchronization across all staff devices.',
    metric: '100% Calendar Accuracy',
    icon: CalendarIcon,
    color: 'from-blue-600 to-cyan-500'
  },
  {
    id: 'crm',
    title: 'Smart CRM & Leads',
    description: 'Capture wedding inquiries from WhatsApp, phone, and walk-ins. Turn cold inquiries into site visits.',
    metric: '3x Lead Conversion',
    icon: Users,
    color: 'from-indigo-600 to-purple-500'
  },
  {
    id: 'payments',
    title: 'Automated Invoices',
    description: 'Generate CA-compliant GST tax invoices. Split advances, catering plates, and add-ons in one click.',
    metric: 'Zero Invoice Mistakes',
    icon: DollarSign,
    color: 'from-emerald-600 to-teal-500'
  },
  {
    id: 'whatsapp',
    title: 'WhatsApp Automation',
    description: 'Send booking updates, PDF receipts, and balance reminders automatically to client chats.',
    metric: '98% Message Open Rate',
    icon: MessageSquare,
    color: 'from-green-600 to-emerald-500'
  },
  {
    id: 'operations',
    title: 'Venue Intelligence',
    description: 'Assign catering, decor, and cleaning checklists to staff. Monitor shifts and event handovers in real-time.',
    metric: 'Effortless Management',
    icon: Shield,
    color: 'from-amber-600 to-orange-500'
  },
  {
    id: 'analytics',
    title: 'Financial Analytics',
    description: 'Get reports on occupancy rates, outstanding collection timelines, and monthly expense curves.',
    metric: '35% Revenue Optimization',
    icon: BarChart3,
    color: 'from-cyan-600 to-blue-500'
  },
  {
    id: 'marketplace',
    title: 'Discoverability Network',
    description: 'List your venue on the consumer discovery portal to receive organic bookings direct from brides and grooms.',
    metric: 'Get Direct Leads',
    icon: Search,
    color: 'from-purple-600 to-pink-500'
  },
  {
    id: 'staff',
    title: 'Roles & Permissions',
    description: 'Restrict sensitive financial data. Give staff view-only calendars while keeping dashboard control to owners.',
    metric: 'Complete Data Security',
    icon: ShieldCheck,
    color: 'from-rose-600 to-orange-500'
  }
];

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [activeFeature, setActiveFeature] = useState<FeatureNode>(FEATURE_NODES[0]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [faqCategory, setFaqCategory] = useState<'all' | 'usage' | 'benefits' | 'challenges' | 'support'>('all');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Pricing toggle: true = Yearly, false = Monthly
  const [isYearlyBilling, setIsYearlyBilling] = useState(true);

  // WhatsApp Chat Simulator State
  const [whatsappStep, setWhatsappStep] = useState(0);
  const [messages, setMessages] = useState<{ sender: 'client' | 'system'; text: string; time: string; attachment?: string }[]>([
    { sender: 'client', text: "Namaste, can we get a quick price estimate for June 18th event?", time: "11:00 AM" }
  ]);

  // Analytics Dashboard state
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState<'month' | 'quarter' | 'year'>('quarter');

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
          bars: [
            { label: 'W1', value: 40 },
            { label: 'W2', value: 65 },
            { label: 'W3', value: 85 },
            { label: 'W4', value: 50 },
            { label: 'W5', value: 90 },
            { label: 'W6', value: 75 }
          ],
          bookingsList: [
            { name: 'Dev & Priya Wedding', space: 'Grand Lawn', amount: '₹12.4 Lakhs', status: 'Locked', date: 'Jun 18' },
            { name: 'Corporate AGM', space: 'Ruby Banquet', amount: '₹4.8 Lakhs', status: 'Deposit Paid', date: 'Jun 22' },
            { name: 'Sonia Birthday', space: 'Mini Hall', amount: '₹1.2 Lakhs', status: 'Inquiry', date: 'Jun 28' }
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
          bars: [
            { label: 'Q1', value: 60 },
            { label: 'Q2', value: 75 },
            { label: 'Q3', value: 90 },
            { label: 'Q4', value: 80 },
            { label: 'Q5', value: 98 },
            { label: 'Q6', value: 85 }
          ],
          bookingsList: [
            { name: 'Winter Wedding Fest', space: 'Full Resort', amount: '₹45.0 Lakhs', status: 'Locked', date: 'Nov 12' },
            { name: 'Medica Summit 2026', space: 'Convention Center', amount: '₹28.5 Lakhs', status: 'Locked', date: 'Dec 05' },
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
          bars: [
            { label: 'Jan', value: 55 },
            { label: 'Feb', value: 70 },
            { label: 'Mar', value: 85 },
            { label: 'Apr', value: 60 },
            { label: 'May', value: 95 },
            { label: 'Jun', value: 75 }
          ],
          bookingsList: [
            { name: 'Dev & Priya Wedding', space: 'Grand Lawn', amount: '₹12.4 Lakhs', status: 'Locked', date: 'Jun 18' },
            { name: 'Tech Summit 2026', space: 'Ruby Banquet', amount: '₹4.8 Lakhs', status: 'Locked', date: 'Jun 25' },
            { name: 'Rohan Engagement', space: 'Sapphire Hall', amount: '₹3.2 Lakhs', status: 'Deposit Paid', date: 'Jul 02' }
          ]
        };
    }
  };

  const analyticsData = getAnalyticsData();

  const handleNavigate = (path: string) => {
    const target = getAppUrl(path);
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
          { sender: 'system', text: "✨ VenuePro Auto-Response:\nJune 18th slot is AVAILABLE! Let me calculate the quote.", time: "11:01 AM" }
        ]);
        setWhatsappStep(2);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (whatsappStep === 3) {
      const timer = setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { sender: 'system', text: "📄 ESTIMATE_RECEIPT_JUNE_18.pdf", time: "11:02 AM", attachment: "PDF Estimate — 250 Guests, Veg Buffet" }
        ]);
        setWhatsappStep(4);
        confetti({
          particleCount: 60,
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

  const staggerContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }
    }
  };

  const filteredFaqs = faqCategory === 'all'
    ? FAQS
    : FAQS.filter(f => f.category === faqCategory);

  return (
    <div className="bg-[#fcfbf9] text-slate-900 min-h-screen font-sans bg-grid-pattern relative selection:bg-brand-100 selection:text-brand-900 overflow-hidden">

      {/* Decorative ambient blobs reflecting luxury warmth and cyan technology */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] aspect-square rounded-full bg-gradient-to-tr from-indigo-100/30 via-cyan-100/20 to-amber-100/20 blur-[130px] -z-10 animate-pulse-slow" />
      <div className="absolute top-[40%] right-[-10%] w-[45%] aspect-square rounded-full bg-gradient-to-tr from-purple-100/30 to-brand-100/20 blur-[130px] -z-10 animate-pulse-slow" style={{ animationDelay: '3s' }} />

      {/* Floating Glass Header */}
      <header className="fixed top-4 left-4 right-4 z-50 max-w-7xl mx-auto shadow">
        <nav className="backdrop-blur-xl bg-white/70 border border-slate-100/60 px-5 py-3 rounded-full flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div className="flex items-center gap-8">
            <a href="#" className="flex items-center group focus:outline-none transition-transform hover:scale-105">
              <img
                src={venueProLogo}
                alt="VenuePro Logo"
                className="h-14 w-auto object-contain transition-transform group-hover:scale-102"
              />
            </a>
            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm font-semibold text-slate-500 hover:text-slate-950 transition-colors hover:scale-105">Features</a>
              <a href="#workflow" className="text-sm font-semibold text-slate-500 hover:text-slate-950 transition-colors  hover:scale-105">Live Operations</a>
              <a href="#marketplace" className="text-sm font-semibold text-slate-500 hover:text-slate-950 transition-colors  hover:scale-105">Marketplace</a>
              <a href="#analytics" className="text-sm font-semibold text-slate-500 hover:text-slate-950 transition-colors  hover:scale-105">Analytics</a>
              <a href="#faq" className="text-sm font-semibold text-slate-500 hover:text-slate-950 transition-colors hover:scale-105">Help FAQ</a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <button
                type="button"
                onClick={() => handleNavigate('/dashboard')}
                className="px-5 py-2.5 bg-slate-950 hover:bg-slate-900 text-white rounded-full text-xs font-bold transition-all hover:scale-[1.03] active:scale-98 shadow-sm"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleNavigate('/login')}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-950 transition-colors hidden sm:block"
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('/signup')}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-bold transition-all hover:scale-[1.03] active:scale-98 shadow-md shadow-indigo-100"
                >
                  Start Free Trial
                </button>
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 md:hidden text-slate-500 hover:text-slate-950 rounded-lg focus:outline-none"
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
              className="absolute top-16 left-0 right-0 bg-white border border-slate-100 rounded-3xl p-5 shadow-2xl md:hidden flex flex-col gap-3"
            >
              <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold text-slate-600 hover:text-slate-950 px-3 py-2 rounded-xl hover:bg-slate-50 transition-all">Features</a>
              <a href="#workflow" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold text-slate-600 hover:text-slate-950 px-3 py-2 rounded-xl hover:bg-slate-50 transition-all">Live Operations</a>
              <a href="#marketplace" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold text-slate-600 hover:text-slate-950 px-3 py-2 rounded-xl hover:bg-slate-50 transition-all">Marketplace</a>
              <a href="#analytics" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold text-slate-600 hover:text-slate-950 px-3 py-2 rounded-xl hover:bg-slate-50 transition-all">Analytics</a>
              {!user && (
                <button
                  type="button"
                  onClick={() => { setIsMobileMenuOpen(false); handleNavigate('/login'); }}
                  className="w-full text-center py-2.5 text-sm font-bold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50"
                >
                  Log In
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main content body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 space-y-36">

        {/* 1. HERO SECTION */}
        <motion.section
          id="hero"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-8 w-full"
        >
          <motion.div variants={fadeInUp} className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" /> India's Premium Venue Management SaaS
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.1] font-display">
              Run Your Venue Like a <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-cyan-500">Modern Enterprise</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-xl font-medium">
              VenuePro helps banquet halls, convention centers, resorts and wedding venues manage bookings, payments, customers, operations and staff from one intelligent platform.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                type="button"
                onClick={() => handleNavigate('/signup')}
                className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-bold shadow-lg shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-98"
              >
                Start Free Trial
              </button>
              <a
                href="#workflow"
                className="px-6 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-full text-xs font-bold transition-all flex items-center gap-2"
              >
                Watch Live Demo <ArrowRight className="w-4 h-4 text-slate-400" />
              </a>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="lg:col-span-6 relative w-full flex items-center justify-center">
            {/* Interactive Browser Frame Visual Mock of the Actual VenuePro Booking App */}
            <div className="relative w-full max-w-[560px] bg-slate-50 border border-slate-200/80 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col">

              {/* App Chrome Header */}
              <div className="bg-slate-100 border-b border-slate-200/60 px-4 py-3 flex items-center gap-3 shrink-0">
                {/* 3 browser dots */}
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                {/* Mock Search Bar / Address bar */}
                <div className="flex-1 max-w-xs bg-white border border-slate-200/60 rounded-lg px-2.5 py-1 text-[9px] text-slate-400 font-semibold truncate flex items-center justify-center gap-1 shadow-3xs select-none">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  venuepro.in/calendar
                </div>
              </div>

              {/* Main App Workspace */}
              <div className="bg-white flex flex-1 min-h-[340px]">

                {/* Miniature Sidebar navigation */}
                <div className="w-12 bg-slate-50 border-r border-slate-100 p-2 flex flex-col items-center gap-4 select-none shrink-0">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shadow-sm mb-2">VP</div>
                  <div className="space-y-3 flex-1 flex flex-col items-center">
                    <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-650 flex items-center justify-center"><CalendarIcon className="w-3.5 h-3.5" /></div>
                    <div className="w-6 h-6 rounded-md text-slate-400 hover:text-slate-900 flex items-center justify-center"><Users className="w-3.5 h-3.5" /></div>
                    <div className="w-6 h-6 rounded-md text-slate-400 hover:text-slate-900 flex items-center justify-center"><BarChart3 className="w-3.5 h-3.5" /></div>
                    <div className="w-6 h-6 rounded-md text-slate-400 hover:text-slate-900 flex items-center justify-center"><FileText className="w-3.5 h-3.5" /></div>
                  </div>
                </div>

                {/* Calendar Workspace Panel */}
                <div className="flex-1 p-4 flex flex-col justify-between min-w-0">

                  {/* Calendar Header */}
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100 select-none">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 block">Banquet Scheduler</h3>
                      <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">June 18 – 20, 2026</span>
                    </div>
                    {/* Add booking button */}
                    <button
                      type="button"
                      onClick={() => handleNavigate('/signup')}
                      className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[9px] font-bold transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <Plus className="w-3 h-3" /> New Booking
                    </button>
                  </div>

                  {/* Calendar Grid Representation */}
                  <div className="flex-1 my-3 grid grid-cols-4 gap-2 text-left min-w-0 select-none">
                    {/* Time Column */}
                    <div className="flex flex-col justify-between text-[8px] font-bold text-slate-400 pt-6 pb-2 pr-1 select-none border-r border-slate-50 shrink-0">
                      <span>Jun 18</span>
                      <span>Jun 19</span>
                      <span>Jun 20</span>
                    </div>

                    {/* Venue Slots Grid columns */}
                    <div className="col-span-3 grid grid-cols-3 gap-2">

                      {/* Space Headers */}
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block truncate text-center">Grand Lawn</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block truncate text-center">Crystal Hall</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block truncate text-center">Royal Banquet</span>

                      {/* Row 1 slots (Jun 18) */}
                      <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-100 flex flex-col justify-between aspect-square">
                        <span className="text-[8px] font-bold text-indigo-950 block leading-tight truncate">Wedding: Priya</span>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[6px] font-bold text-indigo-750 bg-indigo-100/50 px-1 py-0.2 rounded uppercase">Locked</span>
                          <CheckCircle2 className="w-2.5 h-2.5 text-indigo-600 shrink-0" />
                        </div>
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-50/50 border border-slate-100 border-dashed flex flex-col items-center justify-center aspect-square text-[7px] text-slate-400 font-bold hover:bg-slate-50 hover:border-slate-350 transition-all cursor-pointer">
                        <span>+ Block</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-100 flex flex-col justify-between aspect-square">
                        <span className="text-[8px] font-bold text-amber-955 block leading-tight truncate">Corp AGM</span>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[6px] font-bold text-amber-700 bg-amber-100/50 px-1 py-0.2 rounded uppercase">Inquiry</span>
                          <Clock className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                        </div>
                      </div>

                      {/* Row 2 slots (Jun 19) */}
                      <div className="p-1.5 rounded-lg bg-slate-50/50 border border-slate-100 border-dashed flex flex-col items-center justify-center aspect-square text-[7px] text-slate-400 font-bold hover:bg-slate-50 hover:border-slate-350 transition-all cursor-pointer">
                        <span>+ Block</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-100 flex flex-col justify-between aspect-square">
                        <span className="text-[8px] font-bold text-emerald-955 block leading-tight truncate">Mehndi: Kapoor</span>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[6px] font-bold text-emerald-700 bg-emerald-100/50 px-1 py-0.2 rounded uppercase">Locked</span>
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                        </div>
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-50/50 border border-slate-100 border-dashed flex flex-col items-center justify-center aspect-square text-[7px] text-slate-400 font-bold hover:bg-slate-50 hover:border-slate-350 transition-all cursor-pointer">
                        <span>+ Block</span>
                      </div>

                      {/* Row 3 slots (Jun 20) */}
                      <div className="p-1.5 rounded-lg bg-purple-50 border border-purple-100 flex flex-col justify-between aspect-square">
                        <span className="text-[8px] font-bold text-purple-955 block leading-tight truncate">Reception: Sen</span>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[6px] font-bold text-purple-750 bg-purple-100/50 px-1 py-0.2 rounded uppercase">Locked</span>
                          <CheckCircle2 className="w-2.5 h-2.5 text-purple-600 shrink-0" />
                        </div>
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-50/50 border border-slate-100 border-dashed flex flex-col items-center justify-center aspect-square text-[7px] text-slate-400 font-bold hover:bg-slate-50 hover:border-slate-350 transition-all cursor-pointer">
                        <span>+ Block</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-cyan-50 border border-cyan-100 flex flex-col justify-between aspect-square">
                        <span className="text-[8px] font-bold text-cyan-955 block leading-tight truncate">B'day: Aisha</span>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[6px] font-bold text-cyan-700 bg-cyan-100/50 px-1 py-0.2 rounded uppercase">Locked</span>
                          <CheckCircle2 className="w-2.5 h-2.5 text-cyan-600 shrink-0" />
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              </div>

              {/* Decorative Glow Elements & Badges Floating Outside or Overlapping nicely */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-16 right-[-24px] bg-white/90 backdrop-blur-md border border-slate-150 p-2.5 rounded-xl shadow-lg flex items-center gap-2 max-w-[135px] select-none"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-[9px] shadow-3xs">98%</div>
                <div>
                  <span className="text-[8px] text-slate-400 font-bold block uppercase tracking-wider leading-none">Occupancy</span>
                  <span className="text-[10px] font-extrabold text-slate-800 mt-0.5 block">Peak Season</span>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-6 left-[-24px] bg-white/90 backdrop-blur-md border border-slate-150 p-2.5 rounded-xl shadow-lg flex items-center gap-2 max-w-[145px] select-none"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-650 flex items-center justify-center font-bold text-[9px] shadow-3xs">WhatsApp</div>
                <div>
                  <span className="text-[8px] text-slate-400 font-bold block uppercase tracking-wider leading-none">Status</span>
                  <span className="text-[10px] font-extrabold text-emerald-650 mt-0.5 block">Reminders Sent</span>
                </div>
              </motion.div>

            </div>
          </motion.div>
        </motion.section>

        {/* 2. PAIN TO TRANSFORMATION */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="space-y-12 text-center"
        >
          <motion.div variants={fadeInUp} className="space-y-3">
            <h2 className="text-5xl font-extrabold text-slate-950 font-display tracking-tight">
              Say Goodbye to Venue Chaos
            </h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto font-medium">
              Transform traditional registers and loose billing receipts into a streamlined digital operational ecosystem.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* The Chaos */}
            <motion.div
              variants={fadeInUp}
              className="bg-rose-50/20 border border-rose-100 rounded-3xl p-8 space-y-6 text-left relative"
            >
              <div className="absolute top-4 right-4 text-[9px] font-bold text-rose-600 uppercase tracking-widest bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full">Old Way</div>
              <h3 className="text-lg font-bold text-rose-950">Traditional Venue Disarray</h3>
              <div className="space-y-4">
                {[
                  { title: "Double Booking Overlaps", desc: "Two events locked for the same date because of paper register pencil overrides." },
                  { title: "Loose Advances & Payment Delays", desc: "Advances collected without invoice trails. Payment tracking gets missed." },
                  { title: "Manual WhatsApp PDF Sharing", desc: "Manually typing estimation items and converting Word sheets for clients." }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-start">
                    <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-sm">✕</div>
                    <div>
                      <span className="text-sm font-bold text-rose-900 block">{item.title}</span>
                      <p className="text-[12px] text-rose-700 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* The Clarity */}
            <motion.div
              variants={fadeInUp}
              className="bg-emerald-50/20 border border-emerald-100 rounded-3xl p-8 space-y-6 text-left relative"
            >
              <div className="absolute top-4 right-4 text-[9px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">Transformation</div>
              <h3 className="text-lg font-bold text-emerald-950">Intelligent Clarity with VenuePro</h3>
              <div className="space-y-4">
                {[
                  { title: "100% Calendar Locking", desc: "Slot blocked instantly across all coordinators. No overlaps, no mistakes." },
                  { title: "Automated GST Receipts", desc: "Auto-generates billing invoices. Reminders sent automatically on WhatsApp." },
                  { title: "Instant Digital Quotes", desc: "Send professional digital estimate sheets with GST splits in one tap." }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-start">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-sm">✓</div>
                    <div>
                      <span className="text-sm font-bold text-emerald-900 block">{item.title}</span>
                      <p className="text-[12px] text-emerald-700 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* 3. FEATURE ECOSYSTEM */}
        <motion.section
          id="features"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="space-y-12 text-center"
        >
          <motion.div variants={fadeInUp} className="space-y-3">
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
              Core Capabilities
            </div>
            <h2 className="text-5xl font-extrabold text-slate-950 font-display tracking-tight">
              An Connected Operational Network
            </h2>
            <p className="text-md text-slate-500 max-w-xl mx-auto font-medium">
              Every detail of your venue synchronized in real time. Click on any node to preview its capabilities.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto">
            {/* Interactive Grid nodes */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {FEATURE_NODES.map((node) => {
                const IconComponent = node.icon;
                const isSelected = activeFeature.id === node.id;
                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => setActiveFeature(node)}
                    className={cn(
                      "p-4 rounded-2xl text-left border flex flex-col justify-between aspect-square transition-all duration-300 relative overflow-hidden",
                      isSelected
                        ? "bg-white border-indigo-600 shadow-md scale-102"
                        : "bg-white/50 border-slate-100 hover:border-slate-300 hover:bg-white"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center text-white bg-gradient-to-br shadow-sm",
                      node.color
                    )}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">{node.metric.split(' ')[0]}</span>
                      <span className="text-md font-semibold text-slate-900 block mt-1">{node.title.split(' ')[0]}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Display detailed node panel */}
            <div className="lg:col-span-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white border border-slate-100 rounded-3xl p-8 text-left shadow-[0_8px_30px_rgb(0,0,0,0.01)] space-y-6"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br shadow-md",
                      activeFeature.color
                    )}>
                      <activeFeature.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900 font-display">{activeFeature.title}</h3>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full tracking-wider uppercase border border-emerald-100 mt-1 inline-block">
                        {activeFeature.metric}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed font-semibold">
                    {activeFeature.description}
                  </p>
                  <div className="pt-4 border-t border-slate-50">
                    <button
                      type="button"
                      onClick={() => handleNavigate('/signup')}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5"
                    >
                      Try this feature <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.section>

        {/* 4. LIVE OPERATION STORY */}
        <motion.section
          id="workflow"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="space-y-12 text-center"
        >
          <motion.div variants={fadeInUp} className="space-y-3">
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-[10px] font-bold uppercase tracking-wider">
              Event Lifecycle
            </div>
            <h2 className="text-5xl font-semibold text-slate-950 font-display tracking-tight">
              Visualizing the Flow of Operations
            </h2>
            <p className="text-md text-slate-500 max-w-xl mx-auto font-medium">
              From the initial wedding inquiry to the final settlement check, VenuePro handles the entire operational sequence.
            </p>
          </motion.div>

          {/* Timeline Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 max-w-6xl mx-auto relative">
            {[
              { num: "01", title: "Inquiry pinged", desc: "Customer details registered automatically via website or phone call log.", icon: MessageSquare },
              { num: "02", title: "Advance received", desc: "Secure advance split entered. System generates confirmation voucher.", icon: FileText },
              { num: "03", title: "Calendar locked", desc: "Date cell flashes locked across all coordinators. Duplicate blocks are forbidden.", icon: CalendarIcon },
              { num: "04", title: "Checklist active", desc: "Catering, menu plate counts, and decorations templates assigned to team.", icon: CheckCircle2 },
              { num: "05", title: "Settlement logged", desc: "CA-ready invoice with balance calculations shared on WhatsApp.", icon: DollarSign }
            ].map((step, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                className="bg-white border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all rounded-2xl p-5 text-left flex flex-col justify-between aspect-[4/3] md:aspect-[3/4] relative"
              >
                <div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-50 mb-4">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 w-6 h-6 rounded-lg flex items-center justify-center">{step.num}</span>
                    <step.icon className="w-4 h-4 text-slate-400" />
                  </div>
                  <h3 className="text-md font-bold text-slate-900 block mt-1">{step.title}</h3>
                  <p className="text-[12px] text-slate-400 font-medium leading-normal mt-2">{step.desc}</p>
                </div>
                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden mt-4">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 w-1/3 animate-pulse" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 5. MARKETPLACE VISION */}
        <motion.section
          id="marketplace"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="space-y-12 text-center"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-6xl mx-auto">
            <motion.div variants={fadeInUp} className="lg:col-span-5 space-y-6 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-purple-800 text-[10px] font-bold uppercase tracking-wider">
                Discoverability
              </div>
              <h2 className="text-4xl font-extrabold text-slate-950 font-display tracking-tight leading-[1.15]">
                Unlock Organic Inquiries with the Discovery Network
              </h2>
              <p className="text-md text-slate-500 leading-relaxed font-medium">
                VenuePro links your private dashboard to our guest-facing portal. Show available slots to wedding organizers in your city and receive direct digital bookings.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleNavigate('/signup')}
                  className="px-5 py-3 bg-slate-950 hover:bg-slate-900 text-white rounded-full text-sm font-bold transition-all flex items-center gap-2"
                >
                  Join the Network <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="lg:col-span-7 flex justify-center w-full">
              {/* Custom mock of discovery search filters card */}
              <div className="bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-3xl p-6 w-full max-w-[500px] space-y-5 text-left">
                <div className="flex gap-2">
                  <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-2.5 flex items-center gap-2 text-xs">
                    <Search className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-slate-700">Mumbai West Resorts</span>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-2.5 text-xs text-indigo-700 font-bold">
                    June 18
                  </div>
                </div>

                {/* Simulated list card */}
                <div className="border border-slate-100 rounded-2xl p-4 flex gap-4">
                  <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs uppercase">Resort</div>
                  <div className="flex-1 space-y-1.5">
                    <span className="bg-amber-100/80 text-amber-900 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Lux Premier</span>
                    <h3 className="text-sm font-bold text-slate-900 block">Royal Heritage Lawn & Hall</h3>
                    <p className="text-[11px] text-slate-400 font-medium">Capacity: 300 - 800 guests • Juhu, Mumbai</p>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-sm font-extrabold text-slate-800">Veg: ₹1,500/plate</span>
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Slot Available</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* 6. MOBILE EXPERIENCE (WhatsApp Chat Simulator) */}
        <motion.section
          id="mobile"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="space-y-12 text-center"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-6xl mx-auto">
            <motion.div variants={fadeInUp} className="lg:col-span-7 flex justify-center w-full order-last lg:order-first">
              {/* WhatsApp Simulator panel */}
              <div className="bg-slate-900 rounded-[40px] p-4 border-[8px] border-slate-800 shadow-2xl w-full max-w-[340px] aspect-[9/16] flex flex-col justify-between overflow-hidden">
                <div className="bg-slate-800/80 p-3 rounded-2xl flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">VP</div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">VenuePro Auto-Billing</span>
                    <span className="text-[8px] text-emerald-400 font-medium">Online</span>
                  </div>
                </div>

                <div className="flex-1 space-y-2.5 overflow-y-auto px-1 flex flex-col justify-end pb-3">
                  {messages.map((msg, idx) => {
                    const isSystem = msg.sender === 'system';
                    return (
                      <div key={idx} className={cn(
                        "p-2.5 rounded-2xl text-[10px] max-w-[85%] leading-normal font-semibold relative",
                        isSystem
                          ? "bg-slate-800 text-slate-100 self-start"
                          : "bg-indigo-600 text-white self-end"
                      )}>
                        {msg.attachment && (
                          <div className="p-2 bg-slate-950/60 rounded-xl border border-white/5 mb-1.5 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="font-bold text-[9px] text-white truncate">{msg.attachment}</span>
                          </div>
                        )}
                        <span>{msg.text}</span>
                        <span className="block text-[7px] text-slate-400 text-right mt-1">{msg.time}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-slate-800/60 p-2 rounded-2xl flex items-center gap-2">
                  <button
                    type="button"
                    onClick={runStepCheck}
                    disabled={whatsappStep === 4}
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 text-white rounded-xl text-[10px] font-bold transition-all text-center"
                  >
                    {whatsappStep === 0 && "Send Response Invitation"}
                    {whatsappStep === 1 && "Generating Response..."}
                    {whatsappStep === 2 && "Trigger Receipt Estimate"}
                    {whatsappStep === 3 && "Calculating split..."}
                    {whatsappStep === 4 && "Voucher Shared!"}
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="lg:col-span-5 space-y-6 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                WhatsApp Usability
              </div>
              <h2 className="text-4xl font-extrabold text-slate-950 font-display tracking-tight leading-[1.15]">
                Mobile-First Sharing for Busy Managers
              </h2>
              <p className="text-md text-slate-500 leading-relaxed font-medium">
                Clients demand quick answers. Instantly generate estimate sheets or GST tax logs and share them directly via WhatsApp. No PDF downloads or manual file transfers needed.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleNavigate('/signup')}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-sm font-bold transition-all shadow-md"
                >
                  Start Free Trial
                </button>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* 7. ANALYTICS */}
        <motion.section
          id="analytics"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="space-y-12 text-center"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-6xl mx-auto">
            <motion.div variants={fadeInUp} className="lg:col-span-5 space-y-6 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-850 text-[10px] font-bold uppercase tracking-wider">
                Occupancy Analytics
              </div>
              <h2 className="text-4xl font-extrabold text-slate-950 font-display tracking-tight leading-[1.15]">
                Intelligent Cash Flow & Occupancy Insights
              </h2>
              <p className="text-md text-slate-500 leading-relaxed font-medium">
                Track slot utilization graphs and outstanding balance collection curves. Analyze high-performance periods and manage seasonal catering costs.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleNavigate('/signup')}
                  className="px-5 py-3 bg-slate-950 hover:bg-slate-900 text-white rounded-full text-sm font-bold transition-all"
                >
                  Open Dashboard Account
                </button>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="lg:col-span-7 flex justify-center w-full">
              {/* Analytics Dashboard Visualizer */}
              <div className="bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] rounded-[32px] p-6 w-full max-w-[600px] space-y-6 text-left relative overflow-hidden">

                {/* Dashboard Header with Switcher */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">Executive Dashboard</h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Real-time performance analytics</p>
                  </div>

                  {/* Timeframe switch button group */}
                  <div className="flex bg-slate-50 border border-slate-100 p-1 rounded-xl shrink-0">
                    {(['month', 'quarter', 'year'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setAnalyticsTimeframe(t)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all",
                          analyticsTimeframe === t
                            ? "bg-white text-indigo-600 shadow-sm border border-slate-100"
                            : "text-slate-500 hover:text-slate-950"
                        )}
                      >
                        {t === 'month' ? '30 Days' : t === 'quarter' ? 'Quarter' : 'Year'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Metrics 3-Column Grid */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Bookings', val: analyticsData.bookings, trend: analyticsData.bookingsTrend, color: 'text-indigo-600' },
                    { label: 'Net Sales', val: analyticsData.revenue, trend: analyticsData.revenueTrend, color: 'text-emerald-650' },
                    { label: 'Occupancy', val: analyticsData.occupancy, trend: analyticsData.occupancyTrend, color: 'text-cyan-600' }
                  ].map((card, idx) => (
                    <div key={idx} className="bg-slate-50/50 border border-slate-100/50 rounded-2xl p-3 flex flex-col justify-between">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">{card.label}</span>
                      <div className="mt-1.5 flex items-baseline gap-1.5 flex-wrap">
                        <span className={cn("text-base font-extrabold tracking-tight", card.color)}>{card.val}</span>
                        <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded-md">{card.trend}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Styled Custom Bar Chart with vertical bars */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Revenue Flow</span>
                    <span className="text-[9px] font-bold text-slate-500">Scale: Relative %</span>
                  </div>

                  {/* Bar container */}
                  <div className="relative bg-slate-50/40 border border-slate-100/60 rounded-2xl p-5 h-44 flex items-end justify-between gap-2 overflow-hidden">
                    {/* Horizontal gridlines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none p-5 opacity-40">
                      <div className="border-b border-slate-200 border-dashed w-full h-0" />
                      <div className="border-b border-slate-200 border-dashed w-full h-0" />
                      <div className="border-b border-slate-200 border-dashed w-full h-0" />
                      <div className="w-full h-0" />
                    </div>

                    {analyticsData.bars.map((bar, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end relative z-10 group">
                        {/* Tooltip on hover */}
                        <div className="absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[8px] px-1.5 py-0.5 rounded font-bold pointer-events-none shadow-sm -translate-y-4">
                          {bar.value}%
                        </div>
                        {/* Interactive vertical animated bar */}
                        <div
                          className="w-full max-w-[28px] rounded-t-lg bg-gradient-to-t from-indigo-600 to-cyan-400 group-hover:from-indigo-500 group-hover:to-cyan-300 transition-all duration-500 shadow-xs"
                          style={{ height: `${bar.value}%` }}
                        />
                        <span className="text-[9px] font-extrabold text-slate-400 group-hover:text-slate-950 transition-colors uppercase">{bar.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Booking status sub-table */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Active Operations Log</span>
                  <div className="space-y-2">
                    {analyticsData.bookingsList.map((bk, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-white border border-slate-100 rounded-xl shadow-3xs hover:border-slate-200 transition-all">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                            <CalendarIcon className="w-3.5 h-3.5 text-indigo-600" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-800 block truncate">{bk.name}</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">{bk.space} • {bk.date}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs font-extrabold text-slate-700">{bk.amount}</span>
                          <span className={cn(
                            "text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                            bk.status === 'Locked'
                              ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                              : bk.status === 'Deposit Paid'
                                ? 'bg-cyan-50 border-cyan-100 text-cyan-700'
                                : 'bg-amber-50 border-amber-100 text-amber-700'
                          )}>
                            {bk.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* 8. TESTIMONIALS */}
        {/* <motion.section
          id="testimonials"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="space-y-12 text-center"
        >
          <motion.div variants={fadeInUp} className="space-y-3">
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold uppercase tracking-wider">
              Testimonials
            </div>
            <h2 className="text-3xl font-extrabold text-slate-950 font-display tracking-tight">
              Trusted by Top Indian Venue Owners
            </h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto font-medium">
              See how banquet hall and resort managers across the country rely on VenuePro to secure their business.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { quote: "We used to lose at least 3-4 bookings every season due to double booking overlaps in our paper registers. VenuePro eliminated that in 10 minutes.", name: "Sunil Kapoor", role: "Owner, Shree Mangalam Palace, Jaipur" },
              { quote: "Managing multiple catering quotes and calculating GST was a nightmare for our accounts team. Automated billing is a game-changer.", name: "Amit Reddy", role: "Manager, Grand Convention Lawn, Hyderabad" },
              { quote: "Our gate staff now updates menus and check-ins without having access to our core business cash earnings. Complete security control.", name: "Devika Sen", role: "MD, Whispering Pines Resort, Dehradun" }
            ].map((card, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                className="bg-white border border-slate-100 rounded-3xl p-6 text-left shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:shadow-md transition-all flex flex-col justify-between aspect-[4/3] md:aspect-[3/4]"
              >
                <div>
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span key={star} className="text-amber-400">★</span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-550 leading-relaxed font-semibold italic">"{card.quote}"</p>
                </div>
                <div className="pt-4 border-t border-slate-50">
                  <span className="text-xs font-bold text-slate-900 block">{card.name}</span>
                  <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{card.role}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section> */}

        {/* 9. FINAL CTA */}
        <motion.section
          id="final-cta"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="w-full flex justify-center pt-8"
        >
          <motion.div
            variants={fadeInUp}
            className="w-full max-w-5xl rounded-[40px] bg-gradient-to-br from-slate-900 to-indigo-950 p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-xl"
          >
            {/* Background ambient lighting */}
            <div className="absolute top-[-30%] left-[-20%] w-[60%] aspect-square rounded-full bg-cyan-600/20 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-30%] right-[-20%] w-[60%] aspect-square rounded-full bg-brand-600/20 blur-[100px] pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display">
                Modernize Your Venue Operations Today
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl mx-auto font-medium">
                Eliminate errors, protect client calendars, and get clean digital accounting reports. Join hundreds of Indian banquets and resorts.
              </p>
              <div className="pt-4 flex flex-wrap justify-center gap-4">
                <button
                  type="button"
                  onClick={() => handleNavigate('/signup')}
                  className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-xs font-bold transition-all shadow-lg shadow-indigo-600/10 hover:scale-[1.02] active:scale-98"
                >
                  Start Your Free Trial
                </button>
                <a
                  href="mailto:support@venuepro.in?subject=Demo Inquiry"
                  className="px-6 py-3.5 bg-slate-800/80 border border-slate-700/60 hover:bg-slate-800 text-white rounded-full text-xs font-bold transition-all text-center block"
                >
                  Request Customized Demo
                </a>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* 10. SEO DIRECTORY / ACCORDION */}
        <motion.section
          id="faq"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="space-y-12"
        >
          <motion.div variants={fadeInUp} className="text-center space-y-3">
            <h2 className="text-4xl font-extrabold text-slate-950 font-display tracking-tight">
              Operational Frequently Asked Questions
            </h2>
            <p className="text-md text-slate-500 max-w-xl mx-auto font-medium">
              We respond to the most common day-to-day doubts of banquet hall and resort managers.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto">
            {/* Category selection */}
            <div className="lg:col-span-3 flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-none shrink-0">
              {(['all', 'usage', 'benefits', 'challenges', 'support'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => { setFaqCategory(cat); setOpenFaqIndex(null); }}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-sm font-bold transition-all text-left whitespace-nowrap",
                    faqCategory === cat
                      ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                      : "bg-white border border-slate-100 text-slate-500 hover:text-slate-900"
                  )}
                >
                  {cat === 'all' && "All Questions"}
                  {cat === 'usage' && "Usage & Setup"}
                  {cat === 'benefits' && "Revenue Benefits"}
                  {cat === 'challenges' && "Staff & Control"}
                  {cat === 'support' && "Offline Support"}
                </button>
              ))}
            </div>

            {/* Accordion list */}
            <div className="lg:col-span-9 space-y-3">
              {filteredFaqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full px-6 py-4 flex justify-between items-center text-left text-md font-bold text-slate-900 hover:bg-slate-50/50 transition-all"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", isOpen && "rotate-180")} />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="px-6 pb-4 pt-1 text-[13px] text-slate-500 leading-relaxed font-500">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-100 bg-white py-16 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center">
              <img
                src={venueProLogo}
                alt="VenuePro Logo"
                className="h-16 w-auto object-contain max-w-[120px]"
              />
            </div>
            <p className="text-[12px] leading-relaxed text-slate-500 font-medium">
              The simple B2B system for wedding halls, banquets, and event centers. Made in India, built for everyone.
            </p>
          </div>
          <div className="space-y-3">
            <span className="block text-[10px] font-bold text-slate-900 uppercase tracking-wider font-display">Product Links</span>
            <ul className="space-y-2 text-[11px] font-semibold">
              <li><a href="#features" className="hover:text-slate-900">Platform Features</a></li>
              <li><a href="#workflow" className="hover:text-slate-900">Operational Timeline</a></li>
              <li><a href="#analytics" className="hover:text-slate-900">Revenue Analytics</a></li>
              <li><a href="#faq" className="hover:text-slate-900">Help FAQ Center</a></li>
            </ul>
          </div>
          <div className="space-y-3">
            <span className="block text-[10px] font-bold text-slate-900 uppercase tracking-wider font-display">Legal & Trust</span>
            <ul className="space-y-2 text-[11px] font-semibold">
              <li><a href="#" className="hover:text-slate-900">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-slate-900">Terms of Service</a></li>
              <li><a href="#" className="hover:text-slate-900">Data Encryption SLA</a></li>
            </ul>
          </div>
          <div className="space-y-3">
            <span className="block text-[10px] font-bold text-slate-900 uppercase tracking-wider font-display">Help & Support</span>
            <p className="text-[11px] leading-relaxed font-semibold">
              EMAIL US:<br />
              <strong className="text-slate-900">support@venuepro.in</strong>
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
