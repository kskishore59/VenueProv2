import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Calendar as CalendarIcon, ChevronDown, Check, ArrowRight, Zap, Users,
  TrendingUp, MessageSquare, Clock, Sparkles, Menu, X,
  FileText, Smartphone, ShieldCheck, CheckCircle2, ChevronRight,
  HelpCircle, Printer, HeartHandshake, ArrowUpRight, Plus, Send,
  AlertCircle, XCircle, BarChart3, Database, Shield, Share2, Award, Search, DollarSign, Phone
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
    question: "How easy is it to change from paper diaries or Excel sheets to VenuePro?",
    answer: "Very simple! You can upload your customer lists and old bookings from Excel in one click. If you need help, our support team can set everything up for you over a quick WhatsApp call, completely free."
  },
  {
    category: 'benefits',
    question: "How does VenuePro help me get more hall bookings?",
    answer: "It stops leads from getting lost. It alerts your team to follow up on inquiries, lets you share open dates and prices on WhatsApp instantly, and auto-reminds clients about pending payments. Most banquets see a 30% increase in bookings within 90 days."
  },
  {
    category: 'challenges',
    question: "Can I hide my profits and cash flow details from my staff?",
    answer: "Yes, 100%. You can set staff permissions so coordinators only see the calendar slots to check dates and enter bookings, while all financial reports, net profits, and expenses are hidden and visible only to the owner."
  },
  {
    category: 'support',
    question: "What if the internet stops working during wedding season?",
    answer: "No problem. VenuePro has offline protection. It saves all your bookings on your phone or computer even without internet. As soon as you connect to a mobile network, it automatically syncs everything safely to the cloud."
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

function InteractiveDemo() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'booking' | 'followup'>('dashboard');
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [bookingStep, setBookingStep] = useState(0); // 0: initial, 1: cursor moving/typing, 2: clicked / confetti / success
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 70 });
  const [followupStatus, setFollowupStatus] = useState<Record<string, string>>({}); // leadId -> status/text
  const containerRef = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(true);

  // Intersection Observer to run the animation only when visible in Hero viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // Autoplay cycle
  useEffect(() => {
    if (isPaused || !isIntersecting) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveTab((curr) => {
            if (curr === 'dashboard') return 'booking';
            if (curr === 'booking') return 'followup';
            return 'dashboard';
          });
          return 0;
        }
        return prev + 1; // 1% every 50ms = 5s total
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isPaused, isIntersecting]);

  // Handle active tab switches (reset progress and step animations)
  useEffect(() => {
    setProgress(0);
    if (activeTab === 'booking') {
      setBookingStep(0);
      const timer1 = setTimeout(() => {
        // start animation
        setBookingStep(1);
        setCursorPos({ x: 75, y: 80 }); // move towards save button
      }, 1000);
      const timer2 = setTimeout(() => {
        setBookingStep(2);
        confetti({
          particleCount: 50,
          spread: 45,
          origin: { x: 0.75, y: 0.6 }
        });
      }, 3000);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else {
      setBookingStep(0);
      setCursorPos({ x: 50, y: 70 });
    }
  }, [activeTab]);

  const handleTabClick = (tab: 'dashboard' | 'booking' | 'followup') => {
    setActiveTab(tab);
    setIsPaused(true); // stop autoplay once user clicks
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-[540px] h-[460px] md:w-[540px] md:h-[460px] shrink-0 group rounded-3xl">
      {/* Glow background layer */}
      <div className="absolute -inset-[3px] rounded-3xl bg-gradient-to-r from-indigo-500 via-cyan-400 to-purple-650 opacity-30 blur-md group-hover:opacity-45 transition duration-500 animate-edge-glow -z-10" />
      {/* Sharp gradient border line */}
      <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-indigo-500 via-cyan-400 to-purple-650 animate-edge-glow -z-10" />

      {/* Main card */}
      <div
        className="w-full h-full bg-white rounded-3xl overflow-hidden flex flex-col shadow-lg transition-all duration-300"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => { if (progress > 0) setIsPaused(false); }}
      >
        {/* Tabs / Header buttons */}
        <div className="bg-slate-50 px-4 pt-3 pb-0 border-b border-slate-100 shrink-0">
          <div className="flex gap-2 text-xs font-bold select-none overflow-x-auto scrollbar-none pb-2">
            {[
              { id: 'dashboard', label: '📊 Owner Dashboard', color: 'from-indigo-500 to-cyan-500' },
              { id: 'booking', label: '📅 Lock Booking', color: 'from-emerald-500 to-teal-500' },
              { id: 'followup', label: '📞 Customer Follow-ups', color: 'from-amber-500 to-orange-500' },
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabClick(tab.id as any)}
                  className={cn(
                    "px-3 py-2 rounded-xl transition-all whitespace-nowrap relative overflow-hidden flex-1 text-center",
                    isSelected
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
                  )}
                >
                  <span>{tab.label}</span>
                  {isSelected && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-100">
                      <div
                        className={cn("h-full bg-gradient-to-r", tab.color)}
                        style={{ width: `${progress}%`, transition: 'width 50ms linear' }}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Browser address bar visual */}
        <div className="bg-slate-100/60 border-b border-slate-150 px-4 py-2 flex items-center gap-2 text-[10px] text-slate-400 select-none">
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-300" />
            <span className="w-2 h-2 rounded-full bg-slate-300" />
            <span className="w-2 h-2 rounded-full bg-slate-300" />
          </div>
          <div className="flex-1 max-w-[200px] bg-white border border-slate-200/80 rounded-md py-0.5 text-center text-slate-500 truncate flex items-center justify-center gap-1 font-semibold">
            <ShieldCheck className="w-3 h-3 text-indigo-500" />
            venuepro.in/{activeTab}
          </div>
        </div>

        {/* Frame Body Content */}
        <div className="bg-[#fcfbf9] p-5 relative text-left text-slate-800 select-none flex-1 flex flex-col justify-between overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 flex-1 flex flex-col justify-between"
              >
                {/* Financial KPI Widgets */}
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { label: "Revenue (कमाई)", value: "₹18.4L", sub: "+12% this month", color: "text-indigo-600" },
                    { label: "Bookings", value: "28 Events", sub: "Grand Hall & Lawn", color: "text-emerald-650" },
                    { label: "Due Balance", value: "₹4.20L", sub: "Needs reminder ⚠️", color: "text-rose-600" }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-2.5 flex flex-col justify-between shadow-2xs">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">{item.label}</span>
                      <span className={cn("text-sm sm:text-base font-black tracking-tight mt-1 block", item.color)}>{item.value}</span>
                      <span className="text-[7px] text-slate-400 mt-0.5 block">{item.sub}</span>
                    </div>
                  ))}
                </div>

                {/* Miniature Interactive Calendar Grid */}
                <div className="bg-white border border-slate-200 rounded-2xl p-3 flex-1 mt-3 flex flex-col justify-between shadow-2xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="text-[10px] font-bold text-slate-700">Banquet Slot Scheduler</span>
                    <span className="text-[8px] text-indigo-650 font-bold bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">June 18 - 20</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-2.5 text-[8px] flex-1">
                    <div className="flex flex-col justify-around text-slate-450 font-bold border-r border-slate-100 pr-1 shrink-0">
                      <span>Jun 18</span>
                      <span>Jun 19</span>
                      <span>Jun 20</span>
                    </div>

                    <div className="col-span-3 grid grid-cols-3 gap-1.5">
                      {/* Headers */}
                      <span className="text-[7px] text-slate-400 text-center font-bold">Grand Lawn</span>
                      <span className="text-[7px] text-slate-400 text-center font-bold">Crystal Hall</span>
                      <span className="text-[7px] text-slate-400 text-center font-bold">Royal Banquet</span>

                      {/* Jun 18 */}
                      <div className="p-1 rounded bg-indigo-50 border border-indigo-100 flex flex-col justify-between">
                        <span className="font-extrabold text-indigo-700 truncate">Priya Wedding</span>
                        <span className="text-[6px] text-indigo-600 font-bold uppercase mt-1">LOCKED 🔒</span>
                      </div>
                      <div className="border border-dashed border-slate-200 rounded flex items-center justify-center text-slate-400 text-[6px] hover:bg-slate-50 hover:text-slate-650 cursor-pointer">+ Block</div>
                      <div className="p-1 rounded bg-amber-50 border border-amber-100 flex flex-col justify-between">
                        <span className="font-extrabold text-amber-700 truncate">Corp AGM</span>
                        <span className="text-[6px] text-amber-600 font-bold uppercase mt-1">INQUIRY ⏳</span>
                      </div>

                      {/* Jun 19 */}
                      <div className="border border-dashed border-slate-200 rounded flex items-center justify-center text-slate-400 text-[6px] hover:bg-slate-50 hover:text-slate-655 cursor-pointer">+ Block</div>
                      <div className="p-1 rounded bg-emerald-50 border border-emerald-100 flex flex-col justify-between">
                        <span className="font-extrabold text-emerald-700 truncate">Kapoor Mehndi</span>
                        <span className="text-[6px] text-emerald-600 font-bold uppercase mt-1">LOCKED 🔒</span>
                      </div>
                      <div className="border border-dashed border-slate-200 rounded flex items-center justify-center text-slate-400 text-[6px] hover:bg-slate-50 hover:text-slate-655 cursor-pointer">+ Block</div>

                      {/* Jun 20 */}
                      <div className="p-1 rounded bg-purple-50 border border-purple-100 flex flex-col justify-between">
                        <span className="font-extrabold text-purple-700 truncate">Sen Reception</span>
                        <span className="text-[6px] text-purple-650 font-bold uppercase mt-1">LOCKED 🔒</span>
                      </div>
                      <div className="border border-dashed border-slate-200 rounded flex items-center justify-center text-slate-400 text-[6px] hover:bg-slate-50 hover:text-slate-655 cursor-pointer">+ Block</div>
                      <div className="p-1 rounded bg-cyan-50 border border-cyan-100 flex flex-col justify-between">
                        <span className="font-extrabold text-cyan-700 truncate">Birthday Bash</span>
                        <span className="text-[6px] text-cyan-600 font-bold uppercase mt-1">LOCKED 🔒</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[9px] text-slate-450 mt-2 text-center border-t border-slate-100 pt-2 font-semibold">
                    💡 Owners see their full daily occupancy, income, and cash reports on one screen.
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === 'booking' && (
              <motion.div
                key="booking"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 flex-1 flex flex-col justify-between relative"
              >
                {/* Form simulator */}
                <div className="bg-white border border-slate-200 rounded-2xl p-3 flex-1 flex flex-col justify-between gap-2.5 shadow-2xs">
                  <div className="flex justify-between items-center pb-1.5 border-b border-slate-100">
                    <span className="text-[10px] font-bold text-slate-700">📅 Quick Block Slot</span>
                    <span className="text-[8px] text-emerald-650 font-bold bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded uppercase">No Conflict</span>
                  </div>

                  {/* Simulated Form inputs */}
                  <div className="grid grid-cols-2 gap-2 text-[8px] font-semibold text-slate-455">
                    <div>
                      <label className="block text-slate-400 mb-1">Customer Name</label>
                      <div className="bg-slate-50 border border-slate-150 rounded p-1.5 text-slate-800 font-bold">
                        {bookingStep >= 1 ? "Ramesh Sharma" : <span className="opacity-0">Placeholder</span>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Event Date</label>
                      <div className="bg-slate-50 border border-slate-150 rounded p-1.5 text-slate-800 font-bold">Oct 12, 2026</div>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Total Venue Price (₹)</label>
                      <div className="bg-slate-50 border border-slate-150 rounded p-1.5 text-slate-800 font-bold">3,50,000</div>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Advance Collected (₹)</label>
                      <div className="bg-slate-50 border border-slate-150 rounded p-1.5 text-slate-800 font-bold">87,500 (UPI)</div>
                    </div>
                  </div>

                  {/* Animated cursor click overlay */}
                  {bookingStep === 1 && (
                    <motion.div
                      className="absolute w-4 h-4 z-30 pointer-events-none select-none text-base animate-pulse"
                      style={{ left: '60%', top: '65%' }}
                    >
                      🖱️
                    </motion.div>
                  )}

                  {/* Submit button */}
                  <button
                    type="button"
                    className={cn(
                      "w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300",
                      bookingStep === 2
                        ? "bg-emerald-650 text-white shadow-emerald-500/20"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/10 cursor-default"
                    )}
                  >
                    {bookingStep === 2 ? "✓ Date Locked & Receipt Shared!" : "Lock Booking & Send WhatsApp Receipt"}
                  </button>
                </div>

                {/* Confetti & WhatsApp pop-up mock */}
                {bookingStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="bg-white border border-slate-200 rounded-2xl p-2.5 mt-2 flex items-start gap-2.5 shadow-md max-w-[90%] self-end"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold text-xs">💬</div>
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] font-bold text-emerald-600">WhatsApp Notification</span>
                        <span className="text-[7px] text-slate-400">Just now</span>
                      </div>
                      <p className="text-[9px] text-slate-600 leading-normal mt-1 italic font-semibold">
                        "Dear Ramesh, your venue slot is LOCKED for Oct 12! PDF Invoice attached. Paid: ₹87,500 advance via UPI. Thank you!"
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeTab === 'followup' && (
              <motion.div
                key="followup"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-3 flex-1 flex flex-col justify-between"
              >
                <div className="bg-white border border-slate-200 rounded-2xl p-3 flex-1 flex flex-col justify-between gap-2 shadow-2xs">
                  <div className="flex justify-between items-center pb-1.5 border-b border-slate-100">
                    <span className="text-[10px] font-bold text-slate-700">📞 Follow-ups Due Today (बातचीत बाकी है)</span>
                    <span className="text-[8px] text-amber-700 font-bold bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded uppercase">2 Actions Pending</span>
                  </div>

                  {/* List of customer inquiries */}
                  <div className="space-y-2 text-[9px]">
                    {[
                      { id: '1', name: 'Sanjay Sharma', event: 'Wedding - Nov 15th', state: 'Cold prospect', defaultStatus: 'Site visit done. Needs menu price list.' },
                      { id: '2', name: 'Megha Gupta', event: 'Sangeet - Dec 8th', state: 'Hot prospect', defaultStatus: 'Party requested discount sheet.' }
                    ].map((lead) => (
                      <div key={lead.id} className="bg-slate-50 border border-slate-150 rounded-xl p-2.5 flex items-center justify-between gap-3 hover:border-slate-250 transition-colors shadow-3xs">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-800">{lead.name}</span>
                            <span className="text-[7px] text-slate-450 font-bold block">{lead.event}</span>
                          </div>
                          <p className="text-[8px] text-slate-500 mt-1 truncate font-semibold">
                            {followupStatus[lead.id] || lead.defaultStatus}
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 shrink-0 select-none">
                          <button
                            key={`call-${lead.id}`}
                            type="button"
                            onClick={() => setFollowupStatus(prev => ({ ...prev, [lead.id]: "📞 Phone dialer opened!" }))}
                            className="p-1.5 bg-white hover:bg-slate-100 text-slate-650 hover:text-slate-800 rounded-lg border border-slate-200 flex items-center justify-center transition-all active:scale-95 shadow-3xs"
                            title="Call Customer"
                          >
                            <Phone className="w-3.5 h-3.5 text-indigo-500" />
                          </button>
                          <button
                            key={`wa-${lead.id}`}
                            type="button"
                            onClick={() => {
                              setFollowupStatus(prev => ({ ...prev, [lead.id]: "💬 Menu sent on WhatsApp!" }));
                              confetti({ particleCount: 30, spread: 30, origin: { x: 0.6, y: 0.6 } });
                            }}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700 rounded-lg border border-emerald-150 flex items-center justify-center transition-all active:scale-95 shadow-3xs"
                            title="WhatsApp Estimate"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-[9px] text-slate-450 mt-2 text-center border-t border-slate-100 pt-2 font-semibold">
                    💡 Never forget a follow-up. Keep wedding inquiries warm and book faster.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

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

      {/* Edge glow animation keyframes */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes borderGlow {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-edge-glow {
          background-size: 200% 200%;
          animation: borderGlow 6s linear infinite;
        }
      `}} />

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
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-bold transition-all hover:scale-[1.03] active:scale-98 shadow-md shadow-indigo-100 "
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
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider shadow-3xs">
              <Award className="w-3.5 h-3.5" /> India's Easiest Venue Management App
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.1] font-display">
              Stop Losing Bookings to <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-cyan-500">Paper Registers</span> & Missing Follow-ups
            </h1>
            <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-xl font-semibold">
              Lock Bookings, track Follow-ups & manage Staff in one click. The simplest app built for Banquet Halls, Wedding Lawns, Resorts, and Convention Centers. No computer skills needed.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                type="button"
                onClick={() => handleNavigate('/signup')}
                className="px-6 py-4 bg-brand-500 hover:bg-indigo-700 text-white rounded-full text-xs font-bold shadow-lg shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-98"
              >
                Start Free Trial (14 Days)
              </button>
              <a
                href="#workflow"
                className="px-6 py-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-full text-xs font-bold transition-all flex items-center gap-2"
              >
                See How It Works <ArrowRight className="w-4 h-4 text-slate-400" />
              </a>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="lg:col-span-6 relative flex justify-center w-full">
            <InteractiveDemo />
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
            <h2 className="text-4xl font-extrabold text-slate-950 font-display tracking-tight">
              Say Goodbye to Messy Diary Registers
            </h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto font-semibold">
              Banquet management shouldn't be complicated. Here is how VenuePro saves you from daily headaches.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* The Chaos */}
            <motion.div
              variants={fadeInUp}
              className="bg-rose-50/30 border border-rose-100 rounded-3xl p-8 space-y-6 text-left relative transition-all hover:border-rose-200"
            >
              <div className="absolute top-4 right-4 text-[9px] font-bold text-rose-600 uppercase tracking-widest bg-rose-50 border border-rose-100 px-2.5 py-0.5 rounded-full">Old Way (Diaries & Paper)</div>
              <h3 className="text-lg font-bold text-rose-950">The Headaches of Paper Registers</h3>
              <div className="space-y-4">
                {[
                  { title: "Double-Booking Overlaps", desc: "Two wedding parties arrive for the same date because a slot was written in pencil or forgotten in a diary." },
                  { title: "Lost Payment Slips & Disputes", desc: "Advances collected in cash get misplaced or forgotten, leading to arguments during final settlement." },
                  { title: "Slow Quotes & Manual WhatsApp", desc: "Manually calculating buffet plates and decor rates, causing delays and letting competitors steal clients." }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-start">
                    <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">✕</div>
                    <div>
                      <span className="text-sm font-bold text-rose-900 block">{item.title}</span>
                      <p className="text-[12px] text-rose-700 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* The Clarity */}
            <motion.div
              variants={fadeInUp}
              className="bg-emerald-50/30 border border-emerald-100 rounded-3xl p-8 space-y-6 text-left relative transition-all hover:border-emerald-200"
            >
              <div className="absolute top-4 right-4 text-[9px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full">Transformation</div>
              <h3 className="text-lg font-bold text-emerald-950">Intelligent Clarity with VenuePro</h3>
              <div className="space-y-4">
                {[
                  { title: "100% Calendar Slots Locking", desc: "Slots lock instantly across all staff phones. No double-bookings, no arguments, ever." },
                  { title: "Automated WhatsApp Invoice Trails", desc: "Auto-tracks advances, catering plates, and tax bills. Sends bills directly to client phones on WhatsApp." },
                  { title: "10-Second Digital Quotes", desc: "Instantly create menu rates and venue bills. Share beautiful quotes via WhatsApp in one click." }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-start">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">✓</div>
                    <div>
                      <span className="text-sm font-bold text-emerald-900 block">{item.title}</span>
                      <p className="text-[12px] text-emerald-700 mt-0.5 leading-relaxed">{item.desc}</p>
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
            <h2 className="text-4xl font-extrabold text-slate-950 font-display tracking-tight">
              Everything You Need to Run Your Venue
            </h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto font-semibold">
              Every detail of your venue synchronized in real time. Click on any block to see what it does.
            </p>
          </motion.div>

          {/* Desktop view (hidden on mobile) */}
          <div className="hidden lg:grid grid-cols-12 gap-8 items-center max-w-6xl mx-auto">
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
                      "p-4 rounded-2xl text-left border flex flex-col justify-between aspect-square transition-all duration-300 relative overflow-hidden shadow-2xs hover:-translate-y-0.5",
                      isSelected
                        ? "bg-white border-indigo-600 shadow-md scale-102"
                        : "bg-white/50 border-slate-100 hover:border-slate-350 hover:bg-white"
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
                      <h3 className="text-lg font-extrabold text-slate-950 font-display">{activeFeature.title}</h3>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full tracking-wider uppercase border border-emerald-100 mt-1 inline-block">
                        {activeFeature.metric}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed font-semibold">
                    {activeFeature.description}
                  </p>
                  <div className="pt-4 border-t border-slate-55">
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

          {/* Mobile view accordion (visible on mobile only) */}
          <div className="block lg:hidden space-y-3.5 text-left max-w-xl mx-auto px-1">
            {FEATURE_NODES.map((node) => {
              const IconComponent = node.icon;
              const isSelected = activeFeature.id === node.id;
              return (
                <div
                  key={node.id}
                  className={cn(
                    "bg-white border rounded-2xl overflow-hidden shadow-2xs transition-all duration-300",
                    isSelected ? "border-indigo-600 ring-1 ring-indigo-600/30" : "border-slate-100"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setActiveFeature(node)}
                    className="w-full p-4 flex items-center justify-between gap-3 text-left focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-white bg-gradient-to-br shadow-xs shrink-0", node.color)}>
                        <IconComponent className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{node.title}</span>
                        <span className="text-[9px] text-emerald-650 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full tracking-wider uppercase font-semibold mt-1 inline-block">
                          {node.metric}
                        </span>
                      </div>
                    </div>
                    <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0", isSelected && "rotate-180")} />
                  </button>

                  <AnimatePresence initial={false}>
                    {isSelected && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-4 pb-4 pt-1.5 text-xs text-slate-500 leading-relaxed font-semibold border-t border-slate-100 bg-[#fcfbf9]/50">
                          <p>{node.description}</p>
                          <div className="pt-3 flex justify-start">
                            <button
                              type="button"
                              onClick={() => handleNavigate('/signup')}
                              className="text-[11px] font-bold text-indigo-650 hover:text-indigo-700 flex items-center gap-1"
                            >
                              Try this feature <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
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
              Easy Workflow
            </div>
            <h2 className="text-4xl font-extrabold text-slate-950 font-display tracking-tight">
              How VenuePro Works in 5 Simple Steps
            </h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto font-semibold">
              From the first phone call inquiry to the final wedding payment, everything runs smoothly.
            </p>
          </motion.div>

          {/* Timeline Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 max-w-6xl mx-auto relative">
            {[
              { num: "01", title: "Inquiry Captured", desc: "Customer details and event dates registered instantly. Never forget a potential client.", icon: MessageSquare },
              { num: "02", title: "Lock The Date", desc: "Select the hall, enter the advance amount, and lock the date. Slot is blocked immediately.", icon: CalendarIcon },
              { num: "03", title: "Auto WhatsApp Receipt", desc: "The system automatically sends a professional PDF receipt to the client's WhatsApp.", icon: FileText },
              { num: "04", title: "Staff Checklist", desc: "Catering food plates, decorations, and shifts checklists are assigned to staff on their phones.", icon: CheckCircle2 },
              { num: "05", title: "Final Billing Clear", desc: "Auto-calculates buffet counts and pending amounts. Share the final bill on WhatsApp in 1 tap.", icon: DollarSign }
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
                  <p className="text-[12px] text-slate-400 font-semibold leading-relaxed mt-2">{step.desc}</p>
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
                Get New Clients
              </div>
              <h2 className="text-4xl font-extrabold text-slate-950 font-display tracking-tight leading-[1.15]">
                Get Direct Bookings from Bride & Groom Searches
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed font-semibold">
                VenuePro links your private dashboard to our public guest-facing portal. Local wedding planners, brides, and grooms can see your open dates and message you directly. Grow your bookings with zero commissions.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleNavigate('/signup')}
                  className="px-5 py-3 bg-slate-950 hover:bg-slate-900 hover:scale-105 text-white rounded-full text-sm font-bold transition-all flex items-center gap-2"
                >
                  Join the Booking Network <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="lg:col-span-7 flex justify-center w-full">
              {/* Custom mock of discovery search filters card */}
              <div className="bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-3xl p-6 w-full max-w-[500px] space-y-5 text-left">
                <div className="flex gap-2">
                  <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-2.5 flex items-center gap-2 text-xs">
                    <Search className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-slate-700">Resorts & Banquets in Juhu</span>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-2.5 text-xs text-indigo-700 font-bold">
                    June 18
                  </div>
                </div>

                {/* Simulated list card */}
                <div className="border border-slate-100 rounded-2xl p-4 flex gap-4">
                  <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center text-slate-450 font-bold text-xs uppercase shrink-0">Lawn Image</div>
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <span className="bg-amber-105 text-amber-900 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Lux Premium</span>
                    <h3 className="text-sm font-bold text-slate-900 block truncate">Royal Heritage Lawn & Hall</h3>
                    <p className="text-[11px] text-slate-450 font-semibold">Capacity: 300 - 800 guests • Juhu, Mumbai</p>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs font-black text-slate-800">Veg: ₹1,500/plate</span>
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 shrink-0">Slot Available</span>
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
                WhatsApp Connected
              </div>
              <h2 className="text-4xl font-extrabold text-slate-950 tracking-tight leading-[1.15] font-display">
                Send Bills & Menu Rates via WhatsApp
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed font-semibold">
                Banquets run on mobile, not computers. Lock bookings, send receipt PDFs, and calculate price quotes directly from your phone. Share details instantly in 1 tap on WhatsApp chats.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleNavigate('/signup')}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-bold transition-all shadow-md"
                >
                  Try Mobile Booking Free
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
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-855 text-[10px] font-bold uppercase tracking-wider">
                Venue Reports
              </div>
              <h2 className="text-4xl font-extrabold text-slate-950 tracking-tight leading-[1.15] font-display">
                Understand Your Daily Revenue & Occupancy
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed font-semibold">
                Track how many dates are filled this wedding season. Monitor your total cash earnings, pending balances, and catering plate expenses without calculating things manually in Excel sheets.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleNavigate('/signup')}
                  className="px-5 py-3 bg-slate-950 hover:bg-slate-900 text-white rounded-full text-sm font-bold transition-all shadow-sm"
                >
                  Open Owner Account
                </button>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="lg:col-span-7 flex justify-center w-full">
              {/* Analytics Dashboard Visualizer */}
              <div className="relative w-full max-w-[600px] group rounded-[32px]">
                {/* Glow background */}
                <div className="absolute -inset-[3px] rounded-[32px] bg-gradient-to-r from-indigo-500 via-cyan-400 to-purple-650 opacity-20 blur-md group-hover:opacity-35 transition duration-500 animate-edge-glow -z-10" />
                {/* Sharp border line */}
                <div className="absolute -inset-[1px] rounded-[32px] bg-gradient-to-r from-indigo-500 via-cyan-400 to-purple-650 animate-edge-glow -z-10" />

                <div className="bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] rounded-[32px] p-6 w-full space-y-6 text-left relative overflow-hidden h-full">

                  {/* Dashboard Header with Switcher */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 tracking-tight">Owner's Dashboard Report</h3>
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
                              ? "bg-white text-indigo-650 shadow-sm border border-slate-100"
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
                      { label: 'Bookings Locked', val: analyticsData.bookings, trend: analyticsData.bookingsTrend, color: 'text-indigo-600' },
                      { label: 'Total Earnings', val: analyticsData.revenue, trend: analyticsData.revenueTrend, color: 'text-emerald-650' },
                      { label: 'Dates Filled %', val: analyticsData.occupancy, trend: analyticsData.occupancyTrend, color: 'text-cyan-600' }
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
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* 8. PRICING PLANS */}
        <motion.section
          id="pricing"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="space-y-12 text-center animate-fade-in"
        >
          <motion.div variants={fadeInUp} className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
              Pricing Plans
            </div>
            <h2 className="text-4xl font-extrabold text-slate-950 font-display tracking-tight">
              Simple, Honest Pricing for Hall Owners
            </h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto font-medium">
              Start with our <strong>14-day free trial</strong> to explore all features. No credit card required.
            </p>

            {/* Toggle Group */}
            <div className="pt-4 flex justify-center items-center gap-3">
              <div className="flex bg-white border border-slate-150 p-1.5 rounded-2xl shadow-3xs">
                <button
                  type="button"
                  onClick={() => setIsYearlyBilling(true)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5",
                    isYearlyBilling
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-950"
                  )}
                >
                  Yearly Billing
                  <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black px-1.5 py-0.2 rounded-md">Save 20%</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsYearlyBilling(false)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                    !isYearlyBilling
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-950"
                  )}
                >
                  Monthly
                </button>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {/* Starter Plan */}
            <motion.div
              variants={fadeInUp}
              className="bg-white border border-slate-150 rounded-3xl p-8 text-left shadow-2xs hover:shadow-md transition-all flex flex-col justify-between hover:scale-[1.02]"
            >
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 font-display">Starter</h3>
                  <p className="text-xs text-slate-450 font-semibold mt-1">For single halls or local banquet spaces.</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-950 font-display">
                    ₹{isYearlyBilling ? '9,999' : '1,999'}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">/{isYearlyBilling ? 'year' : 'month'}</span>
                </div>
                <ul className="space-y-3 pt-4 border-t border-slate-50 text-xs text-slate-600 font-medium">
                  {[
                    "1 Active Venue/Hall Profile",
                    "Unlimited Booking Slots Calendar",
                    "Leads & Customer Inquiries CRM",
                    "Basic Invoicing (Plain PDF)",
                    "Up to 2 Staff Accounts",
                    "Offline Local Sync Protection"
                  ].map((benefit, idx) => (
                    <li key={idx} className="flex gap-2 items-center">
                      <Check className="w-4 h-4 text-indigo-650 shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={() => handleNavigate('/signup')}
                className="w-full py-3.5 mt-8 bg-brand-600 hover:bg-brand-800 hover:scale-102 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                Start 14-Day Free Trial
              </button>
            </motion.div>

            {/* Pro Plan */}
            <div className="relative flex flex-col group rounded-[32px] hover:scale-[1.03] transition-all duration-300">
              {/* Glow background */}
              <div className="absolute -inset-[2.5px] rounded-[32px] bg-gradient-to-r from-indigo-500 via-cyan-400 to-purple-650 opacity-30 blur-md group-hover:opacity-50 transition duration-500 animate-edge-glow -z-10" />
              {/* Sharp border line */}
              <div className="absolute -inset-[1px] rounded-[32px] bg-gradient-to-r from-indigo-500 via-cyan-400 to-purple-650 animate-edge-glow -z-10" />

              <motion.div
                variants={fadeInUp}
                className="bg-white rounded-[32px] p-8 text-left shadow-md flex flex-col justify-between relative bg-gradient-to-b from-indigo-50/10 to-transparent h-full"
              >
                <div className="absolute top-0 right-8 -translate-y-1/2 bg-gradient-to-r from-brand-600 to-brand-300 text-white text-[9px] font-black tracking-widest px-3.5 py-1 rounded-full uppercase shadow-xs animate-pulse">
                  Most Popular
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 font-display">Pro Plan</h3>
                    <p className="text-xs text-indigo-700 font-semibold mt-1">Complete automated billing & WhatsApp operations for banquet halls.</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-slate-950 font-display">
                      ₹{isYearlyBilling ? '14,999' : '4,999'}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">/{isYearlyBilling ? 'year' : 'month'}</span>
                  </div>
                  <ul className="space-y-3 pt-4 border-t border-indigo-100/50 text-xs text-slate-700 font-semibold">
                    {[
                      "Unlimited Halls & Spaces Profiles",
                      "Unlimited Bookings Slots",
                      "Automated WhatsApp Receipts & Reminders",
                      "Full Cash Flow & Plate Cost Analytics",
                      "Staff Roles & View-Only Permissions",
                      "Discovery Portal Premium Listing",
                      "Easy Excel/CSV Customer Importer",
                      "Priority 24/7 Phone & WhatsApp Support"
                    ].map((benefit, idx) => (
                      <li key={idx} className="flex gap-2 items-center">
                        <Check className="w-4 h-4 text-indigo-650 shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => handleNavigate('/signup')}
                  className="w-full py-3.5 mt-8 bg-indigo-600 hover:bg-indigo-700 hover:scale-102 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-100"
                >
                  Start 14-Day Free Trial
                </button>
              </motion.div>
            </div>

            {/* Enterprise Plan */}
            <motion.div
              variants={fadeInUp}
              className="bg-white border border-slate-150 rounded-3xl p-8 text-left shadow-2xs hover:shadow-md transition-all flex flex-col justify-between hover:scale-[1.02]"
            >
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 font-display">Enterprise</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Setup custom operations for banquet chains & resorts.</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-950 font-display">Custom</span>
                  <span className="text-xs text-slate-400 font-medium">/chain pricing</span>
                </div>
                <ul className="space-y-3 pt-4 border-t border-slate-50 text-xs text-slate-650 font-medium">
                  {[
                    "Multi-Location Chain Dashboards",
                    "Bespoke Billing & GST Tax Layouts",
                    "Dedicated Account Operations Manager",
                    "Bespoke WhatsApp Notification Packs",
                    "Advanced API Data Access & Webhooks",
                    "Custom Staff Coaching & Onboarding"
                  ].map((benefit, idx) => (
                    <li key={idx} className="flex gap-2 items-center">
                      <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <a
                href="mailto:support@venuepro.in?subject=Enterprise Inquiry"
                className="w-full py-3.5 mt-8 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all text-center block"
              >
                Contact Sales Team
              </a>
            </motion.div>
          </div>
        </motion.section>

        {/* 9. FINAL CTA */}
        <motion.section
          id="final-cta"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="w-full flex justify-center pt-8"
        >
          <div className="relative w-full max-w-5xl group rounded-[40px]">
            {/* Glow background */}
            <div className="absolute -inset-[3px] rounded-[40px] bg-gradient-to-r from-indigo-500 via-cyan-400 to-purple-650 opacity-25 blur-lg group-hover:opacity-40 transition duration-500 animate-edge-glow -z-10" />
            {/* Sharp border line */}
            <div className="absolute -inset-[1px] rounded-[40px] bg-gradient-to-r from-indigo-500 via-cyan-400 to-purple-650 animate-edge-glow -z-10" />

            <motion.div
              variants={fadeInUp}
              className="w-full rounded-[40px] bg-gradient-to-br from-slate-900 to-indigo-950 p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-xl"
            >
              {/* Background ambient lighting */}
              <div className="absolute top-[-30%] left-[-20%] w-[60%] aspect-square rounded-full bg-cyan-600/20 blur-[100px] pointer-events-none" />
              <div className="absolute bottom-[-30%] right-[-20%] w-[60%] aspect-square rounded-full bg-brand-600/20 blur-[100px] pointer-events-none" />

              <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display">
                  Ready to Run Your Banquet Without Headaches?
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl mx-auto font-semibold">
                  Lock dates instantly, track follow-ups on your phone, and stop losing advances. Join hundreds of wedding lawns and banquet owners who trust VenuePro.
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
          </div>
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
              Have Doubts? We Have Answers
            </h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto font-semibold">
              Clear answers to the most common questions banquet owners ask about moving from diaries to VenuePro.
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
              <li><Link to="/privacy" className="hover:text-slate-900">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-slate-900">Terms of Service</Link></li>
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
