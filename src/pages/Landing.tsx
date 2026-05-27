import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Calendar as CalendarIcon, ChevronDown, Check, ArrowRight, Zap, Users,
  TrendingUp, MessageSquare, Clock, Sparkles, Menu, X,
  FileText, Smartphone, ShieldCheck, CheckCircle2, ChevronRight,
  HelpCircle, Printer, HeartHandshake, ArrowUpRight, Plus, Send,
  AlertCircle, XCircle
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
    question: "How easy is it to move my paper registers and Excel sheets into VenuePro?",
    answer: "Very easy! You can upload your customer list from an Excel sheet or CSV file in one click using our simple Import Wizard. If you need help, our support team can do it for you on a quick WhatsApp call, completely free."
  },
  {
    category: 'benefits',
    question: "How does VenuePro help me get more bookings and make more money?",
    answer: "VenuePro stops customers from slipping away. It reminds your staff to call back interested inquiries, lets you share available dates on WhatsApp instantly, and helps you close bookings faster. Most hall owners see a 30% increase in booked dates within the first few months."
  },
  {
    category: 'challenges',
    question: "Can I give my gate staff or coordinators access without showing them my cash earnings?",
    answer: "Yes! VenuePro features custom Roles & Access Control. You can invite gate staff to view the calendar only, banquet managers to write bookings, and keep the billing reports, expenses, and profit dashboard visible only to the owner."
  },
  {
    category: 'challenges',
    question: "Can I use it if our venue has slow internet or poor network connection?",
    answer: "Yes! You can see your calendar and enter new bookings even with zero internet. The app saves everything on your mobile or tablet and automatically updates the database the moment your internet is back, without losing any details."
  },
  {
    category: 'benefits',
    question: "Does it help us prevent billing errors and tax audit issues?",
    answer: "Absolutely. Every advance payment, refund, and final settlement generates a GST-compliant tax invoice. Our platform splits the tax cleanly into 9% CGST and 9% SGST so your accountant can download monthly GST sheets in one click."
  },
  {
    category: 'usage',
    question: "Will it work if I have multiple halls, lawns, or conference rooms?",
    answer: "Yes! You can manage multiple sub-venues (e.g., Main Hall, Dining Room, Open Lawn, AC Rooms) under a single account. The calendar displays availability separately or combined, preventing any booking overlaps."
  },
  {
    category: 'support',
    question: "What kind of customer support do you offer if we get stuck?",
    answer: "We are always here for you. All venue owners get 24/7 support over phone or WhatsApp. Growth and Enterprise plans also get a dedicated team member who will train your staff in person and help set up your hall details."
  }
];

export default function Landing() {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    const target = getAppUrl(path);
    if (target.startsWith('http')) {
      window.location.href = target;
    } else {
      navigate(target);
    }
  };

  // Animation variants for scroll transitions
  const staggerContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const }
    }
  };

  const slideInLeft = {
    hidden: { opacity: 0, x: -40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" as const }
    }
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" as const }
    }
  };

  const { user } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [faqCategory, setFaqCategory] = useState<'all' | 'usage' | 'benefits' | 'challenges' | 'support'>('all');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Pricing toggle: true = Yearly, false = Monthly
  const [isYearlyBilling, setIsYearlyBilling] = useState(true);

  // 1. Live Calculator Graphic State
  const [venueTier, setVenueTier] = useState<'standard' | 'premium' | 'luxury'>('premium');
  const [cateringType, setCateringType] = useState<'veg' | 'nonveg'>('veg');
  const [guestCount, setGuestCount] = useState(250);
  const [addons, setAddons] = useState({
    decor: true,
    dj: false,
    security: true
  });
  const [gstMode, setGstMode] = useState<'exclusive' | 'inclusive'>('exclusive');

  // 2. Interactive Booking Calendar Graphic State
  const [calendarBookings, setCalendarBookings] = useState<Record<number, { title: string; color: string }>>({
    4: { title: "Rahul Wedding", color: "bg-indigo-50 text-indigo-700 border-indigo-100" },
    12: { title: "Kapoor Shadi", color: "bg-indigo-50 text-indigo-700 border-indigo-100" },
    18: { title: "Corporate Gala", color: "bg-indigo-50 text-indigo-700 border-indigo-100" },
  });
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [bookingName, setBookingName] = useState("");
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  // 3. Interactive WhatsApp Chat Mock State
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'client'; text: string; isAttachment?: boolean }[]>([
    { sender: 'client', text: "Hi, is the hall available on June 18th for an engagement?" },
    { sender: 'user', text: "Hello! Yes, the June 18th evening slot is available. Let me send you a quick price estimate." }
  ]);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [estimateSent, setEstimateSent] = useState(false);

  // 4. Interactive Kanban Pipeline Graphic State
  const [leads, setLeads] = useState([
    { id: '1', name: "Amit Sharma", guests: 300, date: "June 25", stage: "inquiry" },
    { id: '2', name: "Priya Patel", guests: 450, date: "July 10", stage: "visit" },
    { id: '3', name: "Suresh Kumar", guests: 200, date: "June 14", stage: "booked" }
  ]);

  // SEO Setup
  useEffect(() => {
    document.title = 'VenuePro — Simple Venue Management & Booking System';

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', 'Digitize your venue business. Manage bookings, capture high-quality leads, track payments, automate GST invoices, and share logs via WhatsApp. Simple tool for wedding halls, banquets, and convention centers.');

    // Keywords meta tag
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', 'venue management software, banquet hall booking software, shadi mahal register app, kalyana mandapam software, venue booking system, marriage hall billing software, banquet hall GST invoice, venue lead tracker, event scheduling app India, banquet hall management system, marriage hall register, GST billing software for event centers, kalyana mandapam booking app, shadi mahal management register, party lawn scheduler app, convention center booking manager, B2B SaaS for venue owners, online venue calendar software, wedding venue CRM tools, banquet hall expense tracker, catering & venue billing app, shadi mahal advance booking register, mandapam booking ledger, venue manager roles and permissions, offline venue booking software, banquet booking confirmation WhatsApp tool');

    // Canonical link
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', window.location.origin + window.location.pathname);

    // OpenGraph & Twitter tags
    const setMetaTag = (property: string, content: string, isOG = true) => {
      const attrName = isOG ? 'property' : 'name';
      let el = document.querySelector(`meta[${attrName}="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMetaTag('og:title', 'VenuePro — Simple Venue Management & Booking System');
    setMetaTag('og:description', 'Digitize your venue business. Manage bookings, capture high-quality leads, track payments, automate GST invoices, and share logs via WhatsApp.');
    setMetaTag('og:url', window.location.origin + window.location.pathname);
    setMetaTag('og:site_name', 'VenuePro');
    setMetaTag('og:type', 'website');
    setMetaTag('og:image', `${window.location.origin}/og-image.jpg`);
    setMetaTag('twitter:card', 'summary_large_image', false);
    setMetaTag('twitter:title', 'VenuePro — Simple Venue Management & Booking System', false);
    setMetaTag('twitter:description', 'Digitize your venue business. Manage bookings, capture high-quality leads, track payments, automate GST invoices, and share logs via WhatsApp.', false);

    // JSON-LD Structured Data Schema
    let scriptSchema = document.getElementById('jsonld-schema');
    if (!scriptSchema) {
      scriptSchema = document.createElement('script');
      scriptSchema.id = 'jsonld-schema';
      scriptSchema.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptSchema);
    }

    const schemaData = [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "VenuePro",
        "url": window.location.origin,
        "logo": `${window.location.origin}/logo.svg`,
        "description": "Simplify venue management with VenuePro. Manage bookings, track payments, handle leads, and grow your venue business.",
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+91-8808866504",
          "contactType": "customer service",
          "availableLanguage": ["English", "Hindi"]
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "VenuePro",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web",
        "description": "Simplify venue management with VenuePro. Manage bookings, track payments, handle leads, and grow your venue business.",
        "offers": {
          "@type": "AggregateOffer",
          "lowPrice": "1199",
          "highPrice": "1499",
          "priceCurrency": "INR",
          "offerCount": 3
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "500",
          "bestRating": "5",
          "worstRating": "1"
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": FAQS.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      }
    ];

    scriptSchema.textContent = JSON.stringify(schemaData);

    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor && anchor.hash && anchor.origin === window.location.origin) {
        e.preventDefault();
        const element = document.querySelector(anchor.hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };
    document.addEventListener('click', handleAnchorClick);
    return () => {
      document.removeEventListener('click', handleAnchorClick);
      const schemaScript = document.getElementById('jsonld-schema');
      if (schemaScript) {
        schemaScript.remove();
      }
    };
  }, []);

  // Calculator calculations
  const getBaseRental = () => {
    if (venueTier === 'standard') return 80000;
    if (venueTier === 'premium') return 150000;
    return 350000;
  };

  const getPlatePrice = () => {
    if (cateringType === 'veg') {
      if (venueTier === 'standard') return 600;
      if (venueTier === 'premium') return 900;
      return 1500;
    } else {
      if (venueTier === 'standard') return 850;
      if (venueTier === 'premium') return 1200;
      return 2000;
    }
  };

  const getAddonCost = () => {
    let sum = 0;
    if (addons.decor) sum += venueTier === 'standard' ? 30000 : venueTier === 'premium' ? 60000 : 120000;
    if (addons.dj) sum += 25000;
    if (addons.security) sum += 12000;
    return sum;
  };

  const computeCosts = () => {
    const rent = getBaseRental();
    const catering = getPlatePrice() * guestCount;
    const addonCost = getAddonCost();
    const rawSubtotal = rent + catering + addonCost;

    let subtotal = 0;
    let cgst = 0;
    let sgst = 0;
    let total = 0;

    if (gstMode === 'inclusive') {
      total = rawSubtotal;
      subtotal = Math.round(rawSubtotal / 1.18);
      const remainingGst = total - subtotal;
      cgst = Math.round(remainingGst / 2);
      sgst = remainingGst - cgst;
    } else {
      subtotal = rawSubtotal;
      cgst = Math.round(rawSubtotal * 0.09);
      sgst = Math.round(rawSubtotal * 0.09);
      total = subtotal + cgst + sgst;
    }

    return { rent, catering, addonCost, subtotal, cgst, sgst, total };
  };

  const costs = computeCosts();

  // Print invoice from calculator
  const handlePrintEstimate = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>VenuePro Estimate - ${venueTier.toUpperCase()} Hall</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #4f46e5; }
            .subtitle { font-size: 12px; color: #64748b; margin-top: 5px; }
            .title { font-size: 18px; font-weight: bold; margin-bottom: 20px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
            .total-row { display: flex; justify-content: space-between; border-top: 2px solid #1e293b; padding-top: 12px; font-weight: bold; font-size: 16px; margin-top: 15px; }
            .footer { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">VENUEPRO ESTIMATE</div>
            <div class="subtitle">Quick Price Calculation Sheet</div>
          </div>
          <div class="title">Cost Break-up (${venueTier.toUpperCase()} Venue)</div>
          <div class="row"><span>Catering (${guestCount} Guests x ₹${getPlatePrice()}/plate)</span> <span>₹${costs.catering.toLocaleString('en-IN')}</span></div>
          <div class="row"><span>Base Space Rental</span> <span>₹${costs.rent.toLocaleString('en-IN')}</span></div>
          <div class="row"><span>Decorations & Sound Packages</span> <span>₹${costs.addonCost.toLocaleString('en-IN')}</span></div>
          <div style="margin-top:20px; border-bottom:1px dashed #cbd5e1; padding-bottom:10px;"></div>
          <div class="row" style="margin-top:10px;"><span>Subtotal</span> <span>₹${costs.subtotal.toLocaleString('en-IN')}</span></div>
          <div class="row"><span>CGST (9%)</span> <span>₹${costs.cgst.toLocaleString('en-IN')}</span></div>
          <div class="row"><span>SGST (9%)</span> <span>₹${costs.sgst.toLocaleString('en-IN')}</span></div>
          <div class="total-row"><span>Grand Total (${gstMode === 'inclusive' ? 'Inclusive' : 'Exclusive'})</span> <span>₹${costs.total.toLocaleString('en-IN')}</span></div>
          <div class="footer">Generated via VenuePro.in Live interactive calculator. All rights reserved.</div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Calendar Day Click Handler
  const handleDayClick = (day: number) => {
    if (calendarBookings[day]) return; // already booked
    setSelectedDay(day);
    setBookingName("");
    setShowConfirmPopup(true);
  };

  // Confirm booking callback
  const handleConfirmBooking = () => {
    if (!selectedDay || !bookingName.trim()) return;
    setCalendarBookings({
      ...calendarBookings,
      [selectedDay]: {
        title: bookingName.trim(),
        color: "bg-emerald-50 text-emerald-700 border-emerald-100"
      }
    });
    setShowConfirmPopup(false);
    setSelectedDay(null);

    // Play confetti explosion!
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 }
    });
  };

  // WhatsApp Demo Trigger
  const handleSendWhatsappEstimate = () => {
    if (estimateSent || isSendingMessage) return;
    setIsSendingMessage(true);
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'user',
          text: `📄 ESTIMATE_INV_${guestCount}_GUESTS.pdf\nVenue rental, Catering (Veg plate), & Decorations.\nGrand Total: ₹${costs.total.toLocaleString('en-IN')}`,
          isAttachment: true
        }
      ]);
      setEstimateSent(true);
      setIsSendingMessage(false);
    }, 1200);
  };

  // Kanban Stage Move Handler
  const handleMoveStage = (leadId: string) => {
    setLeads(leads.map(l => {
      if (l.id === leadId) {
        const nextStage = l.stage === 'inquiry' ? 'visit' : l.stage === 'visit' ? 'booked' : 'inquiry';
        if (nextStage === 'booked') {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
          });
        }
        return { ...l, stage: nextStage };
      }
      return l;
    }));
  };

  const filteredFaqs = faqCategory === 'all'
    ? FAQS
    : FAQS.filter(f => f.category === faqCategory);

  return (
    <div className="bg-[#f8fafc] text-slate-800 min-h-screen font-sans bg-grid-pattern relative selection:bg-brand-100 selection:text-brand-900 overflow-hidden">

      {/* Dynamic Soft Light Glowing Aura Blobs */}
      <div className="absolute top-[-5%] left-[-5%] w-[45%] aspect-square rounded-full bg-gradient-to-tr from-brand-100/40 via-indigo-100/30 to-purple-100/20 blur-[100px] -z-10 animate-pulse-slow" />
      <div className="absolute top-[35%] right-[-5%] w-[40%] aspect-square rounded-full bg-gradient-to-tr from-indigo-100/30 to-brand-100/30 blur-[100px] -z-10 animate-pulse-slow" style={{ animationDelay: '2.5s' }} />

      {/* Floating Header */}
      <header className="fixed top-4 left-4 right-4 z-50 max-w-7xl mx-auto">
        <nav className="glass bg-white/80 border border-slate-100 px-4 sm:px-6 py-3.5 rounded-full flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
          <div className="flex items-center gap-8">
            <a href="#" className="flex items-center group focus:outline-none">
              <img
                src={venueProLogo}
                alt="VenuePro Logo"
                className="h-14 w-auto object-contain max-w-[130px] group-hover:scale-105 transition-transform"
              />
            </a>
            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">Features</a>
              <a href="#demo" className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">Interactive Estimator</a>
              <a href="#pipeline-section" className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">How It Works</a>
              <a href="#pricing" className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">Pricing Plans</a>
              <a href="#faq" className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">Q&A Help</a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <button
                type="button"
                id="btn-goto-dashboard"
                onClick={() => handleNavigate('/dashboard')}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-full text-xs font-bold transition-all hover:scale-[1.03] active:scale-98 shadow-md shadow-brand-200"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <button
                  type="button"
                  id="btn-login"
                  onClick={() => handleNavigate('/login')}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors hidden sm:block"
                >
                  Log In
                </button>
                <button
                  type="button"
                  id="btn-signup"
                  onClick={() => handleNavigate('/signup')}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-full text-xs font-bold transition-all hover:scale-[1.03] active:scale-98 shadow-md shadow-brand-200"
                >
                  Try Free Now
                </button>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              id="btn-mobile-menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 md:hidden text-slate-500 hover:text-slate-900 rounded-lg focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white/95 border border-slate-100 rounded-3xl p-5 shadow-2xl animate-scale-up md:hidden flex flex-col gap-3">
            <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold text-slate-600 hover:text-slate-900 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all">Features</a>
            <a href="#demo" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold text-slate-600 hover:text-slate-900 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all">Interactive Estimator</a>
            <a href="#pipeline-section" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold text-slate-600 hover:text-slate-900 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all">How It Works</a>
            <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold text-slate-600 hover:text-slate-900 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all">Pricing Plans</a>
            <a href="#faq" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold text-slate-600 hover:text-slate-900 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all">Q&A Help</a>
            {!user && (
              <button
                type="button"
                id="btn-mobile-login"
                onClick={() => { setIsMobileMenuOpen(false); handleNavigate('/login'); }}
                className="w-full text-center py-2.5 text-sm font-bold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50"
              >
                Log In
              </button>
            )}
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 space-y-36">

        {/* SECTION 1: HERO */}
        <section id="hero" className="w-full grid grid-cols-1 md:grid-cols-12 gap-12 items-center pt-8">
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="md:col-span-5 space-y-6 text-left"
          >
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-50 text-brand-700 text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5" /> VenuePro Software V2
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight text-slate-900 leading-[1.15] font-display">
              Manage Your <br />
              <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">
                Venue Bookings
              </span> <br />
              & Bills, Effortlessly
            </h1>

            <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-xl font-medium">
              Ditch the confusing diaries and paper books. VenuePro lets you record booked dates, manage client details, create GST tax invoices automatically, and share booking confirmations instantly on WhatsApp. Simple, fast, and secure.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <button
                type="button"
                id="btn-hero-cta"
                onClick={() => navigate('/signup')}
                className="px-7 py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-brand-100 flex items-center justify-center gap-2"
              >
                Try It Free <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#demo"
                className="px-7 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl text-sm font-bold transition-all text-slate-700 flex items-center justify-center gap-1.5 shadow-sm"
              >
                Calculate Event Price
              </a>
            </div>

            {/* Micro Trust Indicators - simple language */}
            {/* <div className="pt-8 border-t border-slate-100 flex items-center gap-6">
              <div>
                <span className="block text-2xl font-bold text-slate-900 font-display">2.5 Lakh+</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Events Managed</span>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div>
                <span className="block text-2xl font-bold text-slate-900 font-display">₹40 Crore+</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Bills Calculated</span>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div>
                <span className="block text-2xl font-bold text-slate-900 font-display">24/7 Phone</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Support Help</span>
              </div>
            </div> */}
          </motion.div>

          {/* INTERACTIVE MOCK BOOKING CALENDAR GRAPHIC (Hero Visual Graphic) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="md:col-span-7"
          >
            <div className="bg-white rounded-3xl p-6 shadow-[0_15px_50px_rgba(0,0,0,0.04)] border border-slate-50 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-500 to-indigo-500" />

              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
                <div>
                  <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest block">Interactive Live Demo</span>
                  <span className="text-sm font-extrabold text-slate-900 font-display">Hall Availability Schedule</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-400">June 2026</div>
              </div>

              <p className="text-[11px] text-slate-500 mb-3 bg-indigo-50/50 p-2 rounded-xl border border-indigo-100/20">
                👉 <strong>Try it yourself:</strong> Click on any gray date (like 10 or 15) to record a mockup booking.
              </p>

              {/* Simplified Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 text-center text-xs mb-4">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                  <span key={idx} className="font-bold text-slate-400 text-[10px] py-1">{day}</span>
                ))}

                {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
                  const hasBooking = calendarBookings[day];
                  return (
                    <button
                      key={day}
                      onClick={() => handleDayClick(day)}
                      disabled={!!hasBooking}
                      className={cn(
                        "aspect-square rounded-xl border flex flex-col items-center justify-center p-1 transition-all",
                        hasBooking
                          ? `${hasBooking.color} cursor-not-allowed font-bold`
                          : "border-slate-100 hover:border-brand-500 hover:bg-slate-50 text-slate-700 bg-white"
                      )}
                    >
                      <span className="text-[10px]">{day}</span>
                      {hasBooking && (
                        <span className="text-[7px] block truncate max-w-full leading-none mt-0.5">{hasBooking.title.split(' ')[0]}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Calendar Status Legends */}
              <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 px-1">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-100 border border-slate-200" /> Free Date</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Booked Hall</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> New Booking (Just Added)</span>
              </div>

              {/* Confirm Booking Popup Dialog */}
              <AnimatePresence>
                {showConfirmPopup && selectedDay && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute inset-0 bg-white/95 backdrop-blur-xs p-6 flex flex-col justify-center items-center rounded-3xl"
                  >
                    <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center mb-3">
                      <CalendarIcon className="w-6 h-6 text-brand-600" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">Book Slot for June {selectedDay}th</h4>
                    <p className="text-[11px] text-slate-500 text-center max-w-xs mb-4">Enter a client or wedding event name to instantly book this date.</p>

                    <input
                      type="text"
                      placeholder="e.g., Sharma Reception, Verma Engagement"
                      value={bookingName}
                      onChange={(e) => setBookingName(e.target.value)}
                      className="w-full max-w-xs px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-200 outline-none mb-4 font-semibold"
                    />

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowConfirmPopup(false)}
                        className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmBooking}
                        disabled={!bookingName.trim()}
                        className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl disabled:opacity-50"
                      >
                        Confirm Date Booking
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </motion.div>
        </section>

        {/* SECTION 2: PROBLEM VS SOLUTION COMPARISON */}
        <motion.section
          id="problem-solution"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="w-full space-y-12"
        >
          <motion.div variants={fadeInUp} className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold uppercase tracking-wider">
              The Reality of Venue Operations
            </div>
            <h2 className="text-3xl sm:text-[34px] font-extrabold text-slate-900 tracking-tight font-display">
              Why 500+ Venue Owners Left Paper Registers Behind
            </h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto font-medium">
              Running a venue with paper diaries, Excel sheets, and mental notes is a recipe for double bookings and lost income. Here is how VenuePro brings order to the chaos.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* The Old Way */}
            <motion.div
              variants={slideInLeft}
              className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)] border border-rose-100 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
                    <XCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 font-display">Messy Operations</h3>
                    <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">The Old Way (Paper & Diaries)</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      title: "Risk of Double Bookings",
                      desc: "Writing dates on physical registers leads to confusion. If two managers take phone bookings at the same time, you risk double booking the hall, destroying your reputation."
                    },
                    {
                      title: "Forgotten Booking Advances",
                      desc: "Checking which clients paid deposits and when their final balance is due requires manual page-flipping. Many owners lose lakhs because they forget to collect final payments before the event."
                    },
                    {
                      title: "Inquiries Slip Through the Cracks",
                      desc: "Customer inquiries are scribbled on random sheets or in personal WhatsApp chats. Without follow-ups, hot leads cool down and book with competitors instead."
                    },
                    {
                      title: "GST Tax Math Nightmares",
                      desc: "Splitting GST inclusive prices or calculating 18% tax manually is slow and error-prone. This leads to billing mistakes, customer disputes, and accounting headaches."
                    }
                  ].map((p, idx) => (
                    <div key={idx} className="flex gap-3 items-start bg-rose-50/20 p-4 rounded-2xl border border-rose-50">
                      <span className="text-rose-500 font-bold shrink-0 mt-0.5">✕</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{p.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed font-semibold">{p.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* The New Way */}
            <motion.div
              variants={slideInRight}
              className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_15px_50px_rgba(79,70,229,0.04)] border border-brand-100 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 font-display">Automated Growth</h3>
                    <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">The Modern Way (VenuePro App)</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      title: "100% Calendar Locking",
                      desc: "A single, digital booking register shared across all staff members. Booking a date locks it instantly across all devices, eliminating double bookings forever."
                    },
                    {
                      title: "Automated Payment Reminders",
                      desc: "The dashboard flags pending advances and sends automated payment reminders. Track what is paid, what is due, and send clean PDF receipts instantly."
                    },
                    {
                      title: "Unified Lead Pipeline",
                      desc: "Store every customer call, walk-in request, and online lead in one central pipeline. Set callback reminders so your team never misses an inquiry."
                    },
                    {
                      title: "One-Click GST Invoicing",
                      desc: "Select a package, enter the guest count, and let VenuePro do the math. Generate compliant, professional GST tax bills automatically in seconds."
                    }
                  ].map((s, idx) => (
                    <div key={idx} className="flex gap-3 items-start bg-emerald-50/20 p-4 rounded-2xl border border-emerald-50/50">
                      <span className="text-emerald-600 font-bold shrink-0 mt-0.5">✓</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{s.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed font-semibold">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* SECTION 3: B2B CORE FEATURES (Refined with direct business value) */}
        <motion.section
          id="features"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="space-y-12"
        >
          <motion.div variants={fadeInUp} className="text-center space-y-3">
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider">
              Practical Features
            </div>
            <h2 className="text-3xl sm:text-[34px] font-extrabold text-slate-900 tracking-tight font-display">
              Designed Exclusively to Secure and Grow Your Venue
            </h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto font-medium">
              We focus on simple tools that solve daily venue operational problems and increase booking success.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              {
                icon: CalendarIcon,
                title: "Real-Time Booking Calendar",
                desc: "Check available dates instantly from your phone while talking to a client. Lock slots with a deposit in seconds to prevent double bookings across staff.",
                color: "bg-blue-50 text-blue-600"
              },
              {
                icon: Users,
                title: "Unified Lead Pipeline",
                desc: "Record customer details, guests, and quotes. Set callback reminders so your managers follow up and convert inquiries before they cool down.",
                color: "bg-indigo-50 text-indigo-600"
              },
              {
                icon: FileText,
                title: "Bilingual GST Tax Invoicing",
                desc: "Generate professional tax bills in English and Hindi. Automatically splits CGST/SGST taxes, keeping calculations clean for your accountant.",
                color: "bg-purple-50 text-purple-600"
              },
              {
                icon: MessageSquare,
                title: "1-Click WhatsApp Direct Share",
                desc: "Share booking vouchers, quotes, and payment receipts directly to the client's phone on WhatsApp with a single button click. No manual PDF attaching.",
                color: "bg-emerald-50 text-emerald-600"
              },
              {
                icon: Clock,
                title: "Vendor Payout & Profit Tracker",
                desc: "Log cash paid to caterers, decorators, and band staff. Compare actual event collections against expenses to instantly calculate net margins.",
                color: "bg-amber-50 text-amber-600"
              },
              {
                icon: ShieldCheck,
                title: "Basement Offline Mode",
                desc: "Convention halls in basements often have zero mobile signal. Log new inquiries offline; VenuePro auto-syncs the database once network is back.",
                color: "bg-teal-50 text-teal-600"
              }
            ].map((f, idx) => (
              <motion.div
                variants={fadeInUp}
                key={idx}
                className="bg-white rounded-3xl p-6 hover:scale-[1.01] hover:translate-y-[-2px] transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_15px_40px_rgba(99,102,241,0.06)] border border-slate-50 flex flex-col items-start text-left"
              >
                <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center mb-5 font-bold shadow-xs", f.color)}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 mb-2.5 font-display">
                  {f.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* SECTION 4: LEADS FLOW DYNAMIC GRAPHIC (Leads consolidation) */}
        <motion.section
          id="leads-flow"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="w-full space-y-12 bg-white rounded-3xl p-6 md:p-8 shadow-[0_15px_50px_rgba(0,0,0,0.02)] border border-slate-100 relative overflow-hidden"
        >
          <style dangerouslySetInnerHTML={{
            __html: `
            @keyframes dash {
              to {
                stroke-dashoffset: -40;
              }
            }
            .flow-line {
              stroke-dasharray: 8 12;
              animation: dash 2.5s linear infinite;
            }
            .flow-line-fast {
              stroke-dasharray: 8 12;
              animation: dash 1.8s linear infinite;
            }
          `}} />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Copy Side */}
            <motion.div
              variants={slideInLeft}
              className="md:col-span-5 space-y-6 text-left"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                Lead Consolidation
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display leading-[1.2]">
                All Your Inquiries, Unified into One Pipeline
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed font-semibold">
                Stop checking five different apps for customer inquiries. Whether a client messages you on WhatsApp, calls your phone, fills a contact form on your website, walks into your office, or leaves a message on social media—every single lead is captured and organized automatically.
              </p>

              <div className="space-y-3.5">
                {[
                  "No more inquiries lost in staff notebooks or personal phone chats",
                  "Automated callback alerts remind managers to call back in 24 hours",
                  "Track site visits and convert 40% more leads into booked dates"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs font-bold text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-indigo-600" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Visual Flow Side */}
            <motion.div
              variants={slideInRight}
              className="md:col-span-7 flex flex-col items-center justify-center p-4"
            >
              <div className="w-full max-w-lg bg-slate-50/50 rounded-2xl p-6 border border-slate-100 relative">

                <div className="flex items-center justify-between gap-4">
                  {/* Left Side: Sources */}
                  <div className="flex flex-col gap-4 w-[110px] z-10">
                    {[
                      { icon: "💬", label: "WhatsApp", color: "border-emerald-200 text-emerald-700 bg-emerald-50" },
                      { icon: "📞", label: "Phone Call", color: "border-blue-200 text-blue-700 bg-blue-50" },
                      { icon: "🌐", label: "Website Form", color: "border-purple-200 text-purple-700 bg-purple-50" },
                      { icon: "🚶", label: "Walk-in Visitor", color: "border-amber-200 text-amber-700 bg-amber-50" },
                      { icon: "📸", label: "Social Media", color: "border-pink-200 text-pink-700 bg-pink-50" }
                    ].map((source, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl border text-[10px] font-bold shadow-xs ${source.color}`}
                      >
                        <span className="text-xs">{source.icon}</span>
                        <span className="truncate">{source.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Middle: SVGs Flow Lines */}
                  <div className="flex-1 h-[260px] relative">
                    <svg className="w-full h-full" viewBox="0 0 160 260" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M 10 32 L 80 130" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />
                      <path className="flow-line" d="M 10 32 L 80 130" stroke="#10b981" strokeWidth="2" />

                      <path d="M 10 82 L 80 130" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />
                      <path className="flow-line" d="M 10 82 L 80 130" stroke="#3b82f6" strokeWidth="2" />

                      <path d="M 10 130 L 80 130" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />
                      <path className="flow-line" d="M 10 130 L 80 130" stroke="#a855f7" strokeWidth="2" />

                      <path d="M 10 178 L 80 130" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />
                      <path className="flow-line" d="M 10 178 L 80 130" stroke="#f59e0b" strokeWidth="2" />

                      <path d="M 10 228 L 80 130" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />
                      <path className="flow-line" d="M 10 228 L 80 130" stroke="#ec4899" strokeWidth="2" />

                      <path d="M 80 130 L 150 130" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />
                      <path className="flow-line-fast" d="M 80 130 L 150 130" stroke="#4f46e5" strokeWidth="3" />
                    </svg>

                    <div className="absolute top-[130px] left-[80px] -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-brand-600 border-4 border-white flex items-center justify-center shadow-lg animate-pulse z-15">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* Right Side: VenuePro Admin Dashboard Mock */}
                  <div className="w-[120px] bg-white border border-slate-200 rounded-2xl p-3 shadow-md z-10 space-y-2.5">
                    <div className="border-b border-slate-100 pb-1.5">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Lead Manager</span>
                      <span className="text-[10px] font-bold text-slate-800 block">Unified Board</span>
                    </div>
                    <div className="space-y-1.5 text-[8px] font-semibold text-slate-500">
                      <div className="p-1 bg-emerald-50 border border-emerald-100 rounded text-emerald-800 flex justify-between items-center">
                        <span>New Inquiries</span>
                        <span className="font-bold">42</span>
                      </div>
                      <div className="p-1 bg-indigo-50 border border-indigo-100 rounded text-indigo-800 flex justify-between items-center">
                        <span>Site Visits</span>
                        <span className="font-bold">18</span>
                      </div>
                      <div className="p-1 bg-brand-50 border border-brand-100 rounded text-brand-800 flex justify-between items-center">
                        <span>Confirmations</span>
                        <span className="font-bold text-brand-600">12</span>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-1 rounded border border-slate-100 text-[6px] text-center text-slate-400 font-bold uppercase">
                      100% Captured
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* SECTION 3: LIVE INTERACTIVE INVOICE CALCULATOR (Light theme, No hard borders) */}
        <motion.section
          id="demo"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="w-full grid grid-cols-1 md:grid-cols-12 gap-12 items-center"
        >
          <motion.div
            variants={slideInLeft}
            className="md:col-span-5 space-y-6 text-left"
          >
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
              Price Calculator
            </div>
            <h2 className="text-3xl sm:text-[34px] font-extrabold text-slate-900 tracking-tight font-display">
              Calculate Hall Bookings and GST Instantly
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed font-semibold">
              Try changing the numbers below. See how the invoice automatically calculates subtotal, catering charges, and taxes (CGST/SGST at 9% each) in real time.
            </p>

            {/* Calculator Controls */}
            <div className="space-y-4 pt-2">
              {/* Venue Tier Selector */}
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Hall Tier / Rent Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'standard', name: 'Standard Hall' },
                    { id: 'premium', name: 'Premium Banquet' },
                    { id: 'luxury', name: 'Luxury Palace' }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setVenueTier(t.id as any)}
                      className={cn(
                        "py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all",
                        venueTier === t.id
                          ? "bg-brand-50 border-brand-200 text-brand-700 font-extrabold"
                          : "border-slate-100 hover:border-slate-200 text-slate-500 hover:text-slate-900 bg-white"
                      )}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Guest Count Slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Guests Count</label>
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">{guestCount} Guests</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="50"
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
              </div>

              {/* Catering Type */}
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Food Choice per Plate</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setCateringType('veg')}
                    className={cn(
                      "py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all flex items-center justify-center gap-1.5",
                      cateringType === 'veg'
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-extrabold"
                        : "border-slate-100 hover:border-slate-200 text-slate-500 hover:text-slate-900 bg-white"
                    )}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Veg (₹{venueTier === 'standard' ? 600 : venueTier === 'premium' ? 900 : 1500}/plate)
                  </button>
                  <button
                    onClick={() => setCateringType('nonveg')}
                    className={cn(
                      "py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all flex items-center justify-center gap-1.5",
                      cateringType === 'nonveg'
                        ? "bg-rose-50 border-rose-200 text-rose-700 font-extrabold"
                        : "border-slate-100 hover:border-slate-200 text-slate-500 hover:text-slate-900 bg-white"
                    )}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Non-Veg (₹{venueTier === 'standard' ? 850 : venueTier === 'premium' ? 1200 : 2000}/plate)
                  </button>
                </div>
              </div>

              {/* Addons Checklist */}
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Add-ons (Optional)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'decor', label: 'Decorations' },
                    { key: 'dj', label: 'Sound & DJ' },
                    { key: 'security', label: 'Valet / Staff' }
                  ].map(a => (
                    <button
                      key={a.key}
                      onClick={() => setAddons({ ...addons, [a.key]: !addons[a.key as keyof typeof addons] })}
                      className={cn(
                        "py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all",
                        addons[a.key as keyof typeof addons]
                          ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-extrabold"
                          : "border-slate-100 hover:border-slate-200 text-slate-500 hover:text-slate-900 bg-white"
                      )}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* GST Calculation Toggle */}
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Tax Calculations (GST)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setGstMode('exclusive')}
                    className={cn(
                      "py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all",
                      gstMode === 'exclusive'
                        ? "bg-slate-100 border-slate-300 text-slate-900 font-extrabold"
                        : "border-slate-100 hover:border-slate-200 text-slate-500 hover:text-slate-900 bg-white"
                    )}
                  >
                    Add 18% GST Extra
                  </button>
                  <button
                    onClick={() => setGstMode('inclusive')}
                    className={cn(
                      "py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all",
                      gstMode === 'inclusive'
                        ? "bg-slate-100 border-slate-300 text-slate-900 font-extrabold"
                        : "border-slate-100 hover:border-slate-200 text-slate-500 hover:text-slate-900 bg-white"
                    )}
                  >
                    GST is Included in Price
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Interactive Calculator Output Sheet */}
          <motion.div
            variants={slideInRight}
            className="md:col-span-7"
          >
            <div className="bg-white rounded-3xl p-6 shadow-[0_15px_50px_rgba(0,0,0,0.03)] border border-slate-100 relative">
              <div className="absolute top-4 right-4 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest">Live Estimates</span>
              </div>

              {/* Receipt Header */}
              <div className="border-b border-slate-100 pb-4 mb-4 space-y-1">
                <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest block">Bill Mockup Preview</span>
                <h3 className="text-lg font-extrabold text-slate-900 font-display uppercase">{venueTier} Hall Booking</h3>
                <span className="text-[10px] text-slate-400 block">Date of calculation: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>

              {/* Line Items */}
              <div className="space-y-3.5 text-xs text-slate-700">
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">Hall Space Rent</span>
                  <span className="font-bold text-slate-900">₹{costs.rent.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <div>
                    <span className="text-slate-500 block">Food & Catering Charges</span>
                    <span className="text-[9px] text-slate-400 block">({guestCount} Guests • ₹{getPlatePrice()}/plate {cateringType.toUpperCase()})</span>
                  </div>
                  <span className="font-bold text-slate-900">₹{costs.catering.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">Add-ons (Decor, DJ, Security)</span>
                  <span className="font-bold text-slate-900">₹{costs.addonCost.toLocaleString('en-IN')}</span>
                </div>

                <div className="border-t border-slate-100 my-4 pt-3.5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Subtotal Amount</span>
                    <span className="font-bold text-slate-900">₹{costs.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">CGST Tax (9%)</span>
                    <span className="font-semibold text-slate-600">₹{costs.cgst.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">SGST Tax (9%)</span>
                    <span className="font-semibold text-slate-600">₹{costs.sgst.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Grand Total */}
                <div className="border-t border-slate-200 border-double pt-4 mt-2 flex justify-between items-center">
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">Total Amount Customer Pays</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">({gstMode} GST base)</span>
                  </div>
                  <span className="text-2xl font-extrabold text-slate-900 font-display">₹{costs.total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Informative block for GST inclusive logic */}
              {gstMode === 'inclusive' && (
                <div className="mt-4 p-3 bg-emerald-50 text-[10px] text-emerald-800 rounded-xl leading-relaxed border border-emerald-100/50">
                  💡 <strong>Helper Tip:</strong> You tell the client the total price is ₹{costs.total.toLocaleString('en-IN')}. VenuePro automatically splits the money into ₹{costs.subtotal.toLocaleString('en-IN')} base rent + ₹{costs.cgst.toLocaleString('en-IN')} CGST + ₹{costs.sgst.toLocaleString('en-IN')} SGST for your accountant.
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-6 pt-1">
                <button
                  type="button"
                  onClick={handlePrintEstimate}
                  className="py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1.5 active:scale-98 transition-all shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" /> Print/Download Bill
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center justify-center gap-1 active:scale-98 transition-all shadow-sm"
                >
                  Save Invoices Digitally <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </motion.div>
        </motion.section>

        {/* SECTION 4: INTERACTIVE WHATSAPP INTEGRATION DEMO (Light theme visual graphics) */}
        <motion.section
          id="pipeline-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="w-full grid grid-cols-1 md:grid-cols-12 gap-12 items-center"
        >

          {/* Visual WhatsApp Phone Graphic */}
          <motion.div
            variants={slideInLeft}
            className="md:col-span-6 flex justify-center order-2 md:order-1"
          >
            <div className="w-full max-w-[340px] bg-slate-950 rounded-[40px] p-3 shadow-2xl relative border-4 border-slate-800 aspect-[9/18] flex flex-col justify-between">

              {/* Phone Camera Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-b-2xl z-20 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 mr-2" />
                <div className="w-10 h-1 bg-slate-800 rounded-full" />
              </div>

              {/* WhatsApp Interface */}
              <div className="flex-1 bg-[#efeae2] rounded-[32px] pt-7 p-3 flex flex-col justify-between overflow-hidden relative">

                {/* Chat Header */}
                <div className="bg-[#075e54] text-white p-3 absolute top-0 inset-x-0 flex items-center gap-2.5 shadow-xs">
                  <div className="w-6 h-6 rounded-full bg-emerald-100/20 text-white flex items-center justify-center font-bold text-[10px]">VP</div>
                  <div>
                    <span className="block text-[10px] font-bold leading-none">Vikram client (Groom)</span>
                    <span className="text-[7px] opacity-70 block mt-0.5">Online</span>
                  </div>
                </div>

                {/* Message logs */}
                <div className="flex-1 overflow-y-auto space-y-2 pt-8 pb-2 text-[10px]">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "p-2.5 rounded-2xl max-w-[85%] leading-normal shadow-[0_1px_1px_rgba(0,0,0,0.05)]",
                        msg.sender === 'user'
                          ? "bg-[#dcf8c6] text-slate-800 ml-auto rounded-tr-none text-right"
                          : "bg-white text-slate-800 mr-auto rounded-tl-none text-left"
                      )}
                    >
                      {msg.isAttachment ? (
                        <div className="space-y-1.5 text-left">
                          <div className="flex items-center gap-1.5 bg-emerald-800/10 p-1.5 rounded-lg border border-emerald-800/20 text-[9px] font-bold text-emerald-800">
                            <FileText className="w-4 h-4 shrink-0" />
                            <span className="truncate">{msg.text.split('\n')[0]}</span>
                          </div>
                          <p className="text-[9px] text-slate-600 font-semibold">{msg.text.split('\n').slice(1).join('\n')}</p>
                        </div>
                      ) : (
                        <p className="font-semibold">{msg.text}</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="bg-white rounded-full p-2 flex items-center justify-between border border-slate-200">
                  <span className="text-[9px] text-slate-400 pl-2">Reply to client...</span>
                  <div className="w-6 h-6 rounded-full bg-[#128c7e] flex items-center justify-center text-white">
                    <Send className="w-3 h-3" />
                  </div>
                </div>

              </div>
            </div>
          </motion.div>

          <motion.div
            variants={slideInRight}
            className="md:col-span-6 space-y-6 text-left order-1 md:order-2"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider">
              WhatsApp Updates
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display leading-tight">
              Share Booking Logs and Invoices on WhatsApp with One Click
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed font-semibold">
              No need to download files and attach them manually. Send wedding quotes, booking vouchers, and payment receipts directly to client numbers via visual chat templates.
            </p>

            {/* Action Trigger in demo */}
            <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-3.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Interactive Chat Demo</span>
              <p className="text-xs text-slate-600 font-semibold">
                Click the button below to simulate sending a PDF estimate bill to Vikram's WhatsApp chat mockup:
              </p>

              <button
                type="button"
                onClick={handleSendWhatsappEstimate}
                disabled={estimateSent || isSendingMessage}
                className={cn(
                  "w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                  estimateSent
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-100"
                )}
              >
                {isSendingMessage ? (
                  <>Sending PDF File...</>
                ) : estimateSent ? (
                  <>✓ PDF Invoice Shared on WhatsApp Mockup</>
                ) : (
                  <>Send PDF Invoice to Chat Mockup <ArrowRight className="w-3.5 h-3.5" /></>
                )}
              </button>
            </div>
          </motion.div>

        </motion.section>

        {/* SECTION 5: KANBAN LEAD PIPELINE GRAPHIC (How it works visual) */}
        <motion.section
          id="pipeline-graphic"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="space-y-12"
        >
          <motion.div variants={fadeInUp} className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider">
              Work Flow
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
              Track Customer Bookings From Inquiry to Advance Payment
            </h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto font-medium">
              See how easy it is to track customer requests. Click the blue arrow on the lead cards to progress them to the next stage.
            </p>
          </motion.div>

          {/* Board Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">

            {/* Inquiry Stage */}
            <motion.div
              variants={slideInLeft}
              className="bg-slate-100/50 rounded-3xl p-5 space-y-4 border border-slate-200/20 text-left"
            >
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">1. New Inquiries</span>
                <span className="bg-slate-200 text-slate-700 text-[9px] font-bold px-2 py-0.5 rounded-full">
                  {leads.filter(l => l.stage === 'inquiry').length} Leads
                </span>
              </div>
              <div className="space-y-3.5 min-h-[150px]">
                {leads.filter(l => l.stage === 'inquiry').map(lead => (
                  <div key={lead.id} className="bg-white p-4 rounded-2xl shadow-xs border border-slate-100 space-y-3">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{lead.name}</span>
                      <span className="text-[9px] text-slate-400 block mt-0.5">{lead.guests} Guests • Date: {lead.date}</span>
                    </div>
                    <button
                      onClick={() => handleMoveStage(lead.id)}
                      className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-xl flex items-center justify-center gap-1 transition-all"
                    >
                      Schedule Site Visit <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Visit Scheduled Stage */}
            <motion.div
              variants={fadeInUp}
              className="bg-slate-100/50 rounded-3xl p-5 space-y-4 border border-slate-200/20 text-left"
            >
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">2. Site Visit Done</span>
                <span className="bg-indigo-100 text-indigo-700 text-[9px] font-bold px-2 py-0.5 rounded-full">
                  {leads.filter(l => l.stage === 'visit').length} Leads
                </span>
              </div>
              <div className="space-y-3.5 min-h-[150px]">
                {leads.filter(l => l.stage === 'visit').map(lead => (
                  <div key={lead.id} className="bg-white p-4 rounded-2xl shadow-xs border border-slate-100 space-y-3">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{lead.name}</span>
                      <span className="text-[9px] text-slate-400 block mt-0.5">{lead.guests} Guests • Date: {lead.date}</span>
                    </div>
                    <button
                      onClick={() => handleMoveStage(lead.id)}
                      className="w-full py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 text-[10px] font-bold rounded-xl flex items-center justify-center gap-1 transition-all"
                    >
                      Record Advance Deposit <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Booked Stage */}
            <motion.div
              variants={slideInRight}
              className="bg-slate-100/50 rounded-3xl p-5 space-y-4 border border-slate-200/20 text-left"
            >
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">3. Booked Slots</span>
                <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-full">
                  {leads.filter(l => l.stage === 'booked').length} Booked
                </span>
              </div>
              <div className="space-y-3.5 min-h-[150px]">
                {leads.filter(l => l.stage === 'booked').map(lead => (
                  <div key={lead.id} className="bg-white p-4 rounded-2xl shadow-xs border border-slate-100 border-l-4 border-l-emerald-500 space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 block">{lead.name}</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </div>
                      <span className="text-[9px] text-slate-400 block mt-0.5">{lead.guests} Guests • Date: {lead.date}</span>
                    </div>
                    <div className="p-2 bg-emerald-50 rounded-xl text-[9px] text-emerald-800 leading-normal font-semibold">
                      🎉 Date blocked. Confirmation receipt sent on WhatsApp.
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        </motion.section>

        {/* SECTION 6: PRICING PLANS (Light-themed Workspace Style) */}
        <motion.section
          id="pricing"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="space-y-12"
        >
          <motion.div variants={fadeInUp} className="text-center space-y-3">
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider">
              Simple Pricing
            </div>
            <h2 className="text-3xl sm:text-[34px] font-extrabold text-slate-900 tracking-tight font-display">
              Simple Monthly or Yearly Pricing Tiers
            </h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto font-medium">
              Choose the plan that matches your hall size. Save 20% on all plans by choosing Yearly billing.
            </p>

            {/* Monthly / Yearly Billing Toggle */}
            <div className="flex items-center justify-center gap-3 pt-4">
              <span className={cn("text-xs font-bold transition-colors", !isYearlyBilling ? "text-slate-900" : "text-slate-400")}>Monthly Billing</span>
              <button
                type="button"
                onClick={() => setIsYearlyBilling(!isYearlyBilling)}
                className="w-12 h-6 rounded-full bg-slate-200 border border-slate-300 relative p-0.5 focus:outline-none transition-colors duration-200"
              >
                <div className={cn(
                  "w-5 h-5 rounded-full bg-brand-600 transition-transform duration-200",
                  isYearlyBilling ? "translate-x-6" : "translate-x-0"
                )} />
              </button>
              <div className="flex items-center gap-1.5">
                <span className={cn("text-xs font-bold transition-colors", isYearlyBilling ? "text-slate-900" : "text-slate-400")}>Yearly Billing</span>
                <span className="bg-brand-100 text-brand-700 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">Save 20%</span>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
            {/* Free Trial */}
            <motion.div
              variants={fadeInUp}
              className="bg-white rounded-3xl p-6 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 relative text-left"
            >
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-display">Trial Account</span>
                  <h3 className="text-lg font-extrabold text-slate-900 font-display mt-0.5">Free Trial</h3>
                  <p className="text-[11px] text-slate-500 mt-2 font-medium">Test drive VenuePro and see how simple it is to use.</p>
                </div>
                <div className="py-2.5 border-y border-slate-100 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-900 font-display">₹0</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">/ 14 Days</span>
                </div>
                <ul className="space-y-3.5 text-[11px] text-slate-600 font-semibold">
                  {["1 Venue / Hall support", "See calendar availability", "Enter up to 10 bookings", "Standard phone/whatsapp help"].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-brand-600 shrink-0 font-bold" /> <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={() => handleNavigate('/signup')}
                className="w-full mt-8 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 hover:text-slate-900 transition-all active:scale-98"
              >
                Sign Up Free
              </button>
            </motion.div>

            {/* Growth Plan - Highlighted */}
            <motion.div
              variants={fadeInUp}
              className="bg-white rounded-3xl p-6 flex flex-col justify-between shadow-[0_20px_50px_rgba(79,70,229,0.07)] border-2 border-brand-500 relative text-left"
            >
              <div className="absolute top-0 right-6 -translate-y-1/2 bg-brand-600 text-white text-[9px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-brand-500 shadow-md">
                Bestseller
              </div>
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest block font-display">B2B Standard</span>
                  <h3 className="text-lg font-extrabold text-slate-900 font-display mt-0.5">Growth Plan</h3>
                  <p className="text-[11px] text-slate-500 mt-2 font-medium">Complete features optimized for busy banquet halls.</p>
                </div>
                <div className="py-2.5 border-y border-slate-100 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-900 font-display">
                    {isYearlyBilling ? '₹1,199' : '₹1,499'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">/ month</span>
                </div>
                {isYearlyBilling && (
                  <p className="text-[9px] text-emerald-700 font-bold uppercase tracking-wider mt-[-10px] bg-emerald-50 px-2 py-0.5 rounded inline-block border border-emerald-100">Billed Yearly (Save ₹3,600/yr)</p>
                )}
                <ul className="space-y-3.5 text-[11px] text-slate-600 font-semibold">
                  {[
                    "Up to 3 Venue / Halls support",
                    "Unlimited bookings and leads",
                    "Automated GST invoice generator",
                    "1-Click WhatsApp confirmations",
                    "Expense logs with compressed receipts",
                    "Multi-user logins for staff members"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-brand-600 shrink-0 font-bold" /> <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={() => handleNavigate('/signup')}
                className="w-full mt-8 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-100 transition-all active:scale-98"
              >
                Upgrade to Growth
              </button>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div
              variants={fadeInUp}
              className="bg-white rounded-3xl p-6 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 relative text-left"
            >
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-display">Large Resorts</span>
                  <h3 className="text-lg font-extrabold text-slate-900 font-display mt-0.5">Enterprise</h3>
                  <p className="text-[11px] text-slate-500 mt-2 font-medium">Customized for chain banquets and franchise owners.</p>
                </div>
                <div className="py-2.5 border-y border-slate-100 flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-slate-900 font-display">Custom Rate</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">/ annual</span>
                </div>
                <ul className="space-y-3.5 text-[11px] text-slate-600 font-semibold">
                  {[
                    "Unlimited venues and halls",
                    "Dedicated WhatsApp sender number",
                    "In-person training for staff",
                    "On-call technical support manager",
                    "99.9% uptime SLA contract"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-brand-600 shrink-0 font-bold" /> <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <a
                href="mailto:support@venuepro.in?subject=Enterprise Inquiry"
                className="w-full mt-8 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 hover:text-slate-900 text-center block transition-all active:scale-98"
              >
                Talk to Sales
              </a>
            </motion.div>
          </div>
        </motion.section>

        {/* SECTION 7: FAQ ACCORDION (Usage, Benefits, Challenges, Support in Simple Language) */}
        <motion.section
          id="faq"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="space-y-16 max-w-4xl mx-auto"
        >
          <motion.div variants={fadeInUp} className="text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider">
              Answers & Help
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">
              Usage, Benefits & Practical Questions
            </h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto font-semibold">
              Find simple answers about moving data, training venue managers, offline logs, and helpline support.
            </p>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              {['all', 'usage', 'benefits', 'challenges', 'support'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setFaqCategory(cat as any); setOpenFaqIndex(null); }}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all",
                    faqCategory === cat
                      ? "bg-brand-50 border-brand-200 text-brand-700 font-extrabold shadow-xs"
                      : "border-slate-100 hover:border-slate-200 text-slate-500 hover:text-slate-900 bg-white"
                  )}
                >
                  {cat === 'all' ? 'Show All' : cat}
                </button>
              ))}
            </div>
          </motion.div>

          <div className="space-y-3.5 pt-2">
            {filteredFaqs.map((faq, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-xs transition-all duration-300 text-left"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full text-left px-6 py-4 flex justify-between items-center text-sm font-bold text-slate-800 hover:text-brand-600 transition-colors focus:outline-none"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-brand-600 shrink-0" />
                    {faq.question}
                  </span>
                  <ChevronDown className={cn(
                    "w-4 h-4 text-slate-400 transition-transform duration-300",
                    openFaqIndex === idx && "rotate-180 text-brand-600"
                  )} />
                </button>

                {openFaqIndex === idx && (
                  <div className="px-6 pb-5 pt-0.5 animate-fade-in border-t border-slate-50">
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Micro Support Banner */}
          <motion.div
            variants={fadeInUp}
            className="bg-slate-50 border border-slate-200/50 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center border border-brand-100">
                <HeartHandshake className="w-5 h-5 text-brand-600" />
              </div>
              <div className="text-left">
                <span className="block text-xs font-bold text-slate-900">Need a live walkthrough?</span>
                <span className="text-[10px] text-slate-500 block">We can demo the software specifically for your hall layout over a video call.</span>
              </div>
            </div>
            <a
              href="mailto:support@venuepro.in?subject=Demo Walkthrough request"
              className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-all active:scale-98 shadow-xs"
            >
              Request Call Back
            </a>
          </motion.div>
        </motion.section>

        {/* SECTION 8: SEO KEYWORDS & POPULAR SEARCH DIRECTORY */}
        <motion.section
          id="seo-directory"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="border-t border-slate-200/60 pt-16 pb-8 text-left space-y-8"
        >
          <motion.div variants={fadeInUp} className="space-y-2">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-display">Popular Directories</h3>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-display">
              Venue Management & Billing Solutions across India
            </h2>
            <p className="text-[11px] text-slate-500 font-semibold max-w-2xl leading-relaxed">
              VenuePro empowers banquet halls, function halls, kalyana mandapams, and marriage resorts with automated booking calendars, GST invoicing, and WhatsApp client integrations.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {/* Column 1: Software Solutions */}
            <motion.div
              variants={slideInLeft}
              className="space-y-3.5"
            >
              <span className="block text-[10px] font-bold text-slate-900 uppercase tracking-wider font-display">Software Solutions</span>
              <ul className="space-y-2 text-[11px] text-slate-500 font-medium leading-relaxed">
                {[
                  "Banquet Hall Management System",
                  "Marriage Hall Booking Register",
                  "GST Billing Software for Event Centers",
                  "Kalyana Mandapam Booking App",
                  "Shadi Mahal Management Register",
                  "Party Lawn Scheduler App",
                  "Convention Center Booking Manager",
                  "B2B SaaS for Venue Owners",
                  "Online Venue Calendar Software",
                  "Wedding Venue CRM Tools",
                  "Banquet Hall Expense Tracker",
                  "Catering & Venue Billing App"
                ].map((kw, idx) => (
                  <li key={idx}>
                    <a href="#" className="hover:text-brand-600 transition-colors flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-slate-300" /> {kw}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Column 2: Event & Venue Keywords */}
            <motion.div
              variants={fadeInUp}
              className="space-y-3.5"
            >
              <span className="block text-[10px] font-bold text-slate-900 uppercase tracking-wider font-display">Specialized Features</span>
              <ul className="space-y-2 text-[11px] text-slate-500 font-medium leading-relaxed">
                {[
                  "Shadi Mahal Advance Booking Register",
                  "Mandapam Booking Ledger App",
                  "Venue Manager Roles and Permissions",
                  "Offline Venue Booking Software",
                  "Banquet Booking Confirmation WhatsApp Tool",
                  "Wedding Lawn Management System",
                  "Mini Hall Booking App",
                  "Convention Center Billing Software",
                  "Seminar Hall Reservation Register",
                  "Resort Event Planner Tool",
                  "Exhibition Hall Booking Software",
                  "Birthday Party Venue App"
                ].map((kw, idx) => (
                  <li key={idx}>
                    <a href="#" className="hover:text-brand-600 transition-colors flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-slate-300" /> {kw}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Column 3: Indian City Locations */}
            <motion.div
              variants={slideInRight}
              className="space-y-3.5"
            >
              <span className="block text-[10px] font-bold text-slate-900 uppercase tracking-wider font-display">Popular Search Locations</span>
              <div className="flex flex-wrap gap-2 pt-0.5">
                {[
                  "Bengaluru", "Mumbai", "Delhi NCR", "Hyderabad", "Chennai", "Pune", "Jaipur",
                  "Kolkata", "Lucknow", "Patna", "Ahmedabad", "Surat", "Indore", "Bhopal",
                  "Nagpur", "Kochi", "Coimbatore", "Chandigarh", "Ludhiana", "Amritsar",
                  "Dehradun", "Agra", "Varanasi", "Ranchi", "Bhubaneswar", "Guwahati"
                ].map((city, idx) => (
                  <a
                    key={idx}
                    href="#"
                    className="px-2.5 py-1 text-[10px] font-bold text-slate-500 hover:text-brand-600 bg-slate-100 hover:bg-brand-50 border border-slate-200/50 hover:border-brand-200 rounded-md transition-all"
                  >
                    {city}
                  </a>
                ))}
              </div>
            </motion.div>
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
                className="h-7 w-auto object-contain max-w-[120px]"
              />
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500 font-medium">
              The simple B2B system for wedding halls, banquets, and event centers. Made in India, built for everyone.
            </p>
          </div>

          <div className="space-y-3">
            <span className="block text-[10px] font-bold text-slate-900 uppercase tracking-wider font-display">Product Links</span>
            <ul className="space-y-2 text-[11px] font-semibold">
              <li><a href="#features" className="hover:text-brand-600 transition-colors">Booking Calendars</a></li>
              <li><a href="#demo" className="hover:text-brand-600 transition-colors">GST Tax Estimates</a></li>
              <li><a href="#features" className="hover:text-brand-600 transition-colors">Lead Tracking</a></li>
              <li><a href="#features" className="hover:text-brand-600 transition-colors">WhatsApp Gateways</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <span className="block text-[10px] font-bold text-slate-900 uppercase tracking-wider font-display">Help & Onboarding</span>
            <ul className="space-y-2 text-[11px] font-semibold">
              <li><a href="mailto:support@venuepro.in" className="hover:text-brand-600 transition-colors">WhatsApp Helpline</a></li>
              <li><a href="#faq" className="hover:text-brand-600 transition-colors">Importing old registers</a></li>
              <li><a href="#pricing" className="hover:text-brand-600 transition-colors">Yearly Discounts</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <span className="block text-[10px] font-bold text-slate-900 uppercase tracking-wider font-display">Company Info</span>
            <p className="text-[11px] text-slate-500 font-medium">
              © {new Date().getFullYear()} VenuePro Technologies Pvt Ltd. All rights reserved.
            </p>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">
              Payments powered by certified secure bank APIs. Data encrypted on secure cloud servers.
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
}
