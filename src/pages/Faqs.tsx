import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, Search, ArrowLeft, HelpCircle, Sparkles, MessageSquare, PhoneCall,
  ShieldAlert, BookOpen, Calendar, DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import venueProLogo from '@/assets/venueProLogo.svg';

interface FAQItem {
  question: string;
  answer: string;
  category: 'all' | 'setup' | 'business' | 'security' | 'offline';
}

const FAQS: FAQItem[] = [
  {
    category: 'setup',
    question: "How easy is it to migrate from paper registers or Excel files?",
    answer: "Extremely easy. You can upload your customer lists and old bookings via Excel in one click. Our support team can also migrate everything for you over a quick WhatsApp chat, completely free of charge."
  },
  {
    category: 'business',
    question: "How does VenuePro help increase my booking conversions?",
    answer: "It stops inquiries from falling through the cracks. It auto-alerts staff to follow up, lets you share dates/rates on WhatsApp in 10 seconds, and automates balance collection reminders. Most venues report a 30% increase in bookings within 90 days."
  },
  {
    category: 'security',
    question: "Can I restrict staff access to sensitive financial metrics?",
    answer: "Yes, fully. Role-Based Access Control (RBAC) allows you to grant coordinators view-only access to calendar slots, while hiding profit margins, net cash flow, and cost curves from everyone except the owner."
  },
  {
    category: 'offline',
    question: "Does the app support offline operations during heavy wedding seasons?",
    answer: "Yes. VenuePro features client-side offline protection. If your internet drops, you can still check calendar slots and record bookings. All offline edits are cached locally and synchronized with the cloud automatically when connection returns."
  },
  {
    category: 'setup',
    question: "How do I invite my venue staff to join the app?",
    answer: "Navigate to Settings ➔ Team, click 'Invite Staff', and enter their email and role (Manager, Finance, or Staff). They will receive an automated invitation and be added to your organization upon sign up."
  },
  {
    category: 'business',
    question: "Can we manage multiple halls, party lawns, or catering packages?",
    answer: "Yes, VenuePro supports multi-hall configuration. You can customize capacity, base tariffs, and clean/dirty states for individual halls, and couple them with custom catering plate pricing in the booking sheet."
  },
  {
    category: 'security',
    question: "How does the real-time double-booking prevention work?",
    answer: "Every time you save a lead or booking, VenuePro runs an instant DB check. It checks the event date, start/end times, and designated hall. If a conflict is found, the system immediately blocks the booking to prevent slot overlaps."
  },
  {
    category: 'security',
    question: "How is our financial and booking data secured?",
    answer: "We employ banking-grade TLS encryption for all data in transit, coupled with Row-Level Security (RLS) on Supabase. This guarantees that your organization's records are completely isolated and accessible only to authorized personnel."
  },
  {
    category: 'business',
    question: "How do I configure custom GST rates on invoices and receipts?",
    answer: "Go to Settings ➔ Venue Information, enter your GSTIN, and toggle GST active. Invoices will automatically compute a standard 18% GST (9% CGST + 9% SGST) reverse-calculated from inclusive totals or added on top based on your preference."
  }
];

export default function Faqs() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'setup' | 'business' | 'security' | 'offline'>('all');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Filters
  const filteredFaqs = FAQS.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-[#F6F7FB] text-slate-800 min-h-screen font-sans relative selection:bg-[#1E5EFF]/15 selection:text-[#1E5EFF] overflow-hidden">
      {/* Custom fonts embedded */}
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

        .stripe-grid {
          background-image: 
            linear-gradient(to right, rgba(30, 94, 255, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(30, 94, 255, 0.04) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: radial-gradient(circle at center, black 40%, transparent 95%);
          -webkit-mask-image: radial-gradient(circle at center, black 40%, transparent 95%);
        }
      `}} />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 stripe-grid pointer-events-none opacity-60 -z-10" />

      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[60%] aspect-square rounded-full bg-gradient-to-tr from-[#1E5EFF]/5 via-[#0B1B3A]/5 to-[#F5C542]/5 blur-[160px] -z-10" />
      <div className="absolute bottom-0 left-[-10%] w-[50%] aspect-square rounded-full bg-gradient-to-tr from-[#1E5EFF]/5 via-[#0B1B3A]/5 to-transparent blur-[160px] -z-10" />

      {/* Floating Glass Header */}
      <header className="fixed top-5 left-4 right-4 z-50 max-w-7xl mx-auto">
        <nav className="backdrop-blur-xl bg-white/70 border border-slate-200/50 px-6 py-3.5 rounded-full flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-10">
            <button onClick={() => navigate('/')} className="flex items-center group transition-transform hover:scale-102 bg-transparent border-none outline-none cursor-pointer">
              <img
                src={venueProLogo}
                alt="VenuePro Logo"
                className="h-10 w-auto object-contain"
              />
            </button>
          </div>

          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 rounded-full text-xs font-bold transition-all hover:scale-[1.02] active:scale-98 shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
            Back to Home
          </button>
        </nav>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-24 space-y-12">
        {/* Page Title & Intro */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#1E5EFF] text-[10px] font-black uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Support FAQ Center
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0B1B3A] tracking-tight font-sans leading-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Have questions about migrating your data, managing slot locks, or setting up WhatsApp notifications? Here's everything you need to know.
          </p>
        </div>

        {/* Search Input */}
        <div className="max-w-xl mx-auto relative shadow-sm rounded-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setOpenIndex(null);
            }}
            placeholder="Search questions or answers..."
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-700 placeholder-slate-400 text-xs focus:ring-2 focus:ring-blue-100 focus:border-[#1E5EFF] outline-none transition-all"
          />
        </div>

        {/* Tab & Accordion Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
          {/* Categories Sidebar */}
          <div className="lg:col-span-3 flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-none shrink-0">
            {[
              { id: 'all', label: 'All Questions', icon: HelpCircle },
              { id: 'setup', label: 'Migration & Setup', icon: BookOpen },
              { id: 'business', label: 'Revenue Benefits', icon: DollarSign },
              { id: 'security', label: 'Roles & Security', icon: ShieldAlert },
              { id: 'offline', label: 'Offline Support', icon: Calendar }
            ].map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat.id as any);
                    setOpenIndex(null);
                  }}
                  className={cn(
                    "px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left whitespace-nowrap flex items-center gap-2 border",
                    activeCategory === cat.id
                      ? "bg-[#1E5EFF] text-white border-[#1E5EFF] shadow-md shadow-blue-500/10"
                      : "bg-white border-slate-200/60 text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Accordion List */}
          <div className="lg:col-span-9 space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredFaqs.map((faq, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <motion.div
                    key={faq.question}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-2xs hover:shadow-xs transition-shadow"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? null : idx)}
                      className="w-full px-6 py-5 flex justify-between items-center text-left text-sm sm:text-base font-bold text-slate-900 hover:bg-slate-50/30 transition-all cursor-pointer border-none outline-none"
                    >
                      <span className="font-sans font-large text-slate-800 pr-4">{faq.question}</span>
                      <div className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center bg-slate-100 transition-all",
                        isOpen && "bg-blue-50 text-[#1E5EFF]"
                      )}>
                        <ChevronDown className={cn("w-4 h-4 text-slate-500 transition-transform duration-300", isOpen && "rotate-180 text-[#1E5EFF]")} />
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                        >
                          <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-500 leading-relaxed">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredFaqs.length === 0 && (
              <div className="text-center py-16 bg-white border border-slate-200/60 rounded-3xl space-y-3">
                <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-slate-800 font-bold text-sm">No questions found</p>
                <p className="text-xs text-slate-400">Try searching for other terms like "Excel", "GST", or "Offline".</p>
              </div>
            )}
          </div>
        </div>

        {/* Live Support Bottom Card */}
        <div className="bg-gradient-to-r from-[#0B1B3A] to-[#0d224b] rounded-3xl border border-slate-800 p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-[40%] aspect-square rounded-full bg-[#1E5EFF]/10 blur-[80px] pointer-events-none" />

          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-lg font-bold font-display text-white">Still have questions? We are here to help!</h3>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Connect with our setup assistants on WhatsApp. We can answer queries, migrate your old paper records, or set up a live trial dashboard for your banquet lawn.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <a
              href="https://wa.me/919876543210?text=Hi%20VenuePro,%20I%20have%20some%20questions%20about%20the%20venue%20operating%20system."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold transition-all shadow-md active:scale-98 w-full sm:w-auto"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              Chat on WhatsApp
            </a>
            <a
              href="tel:+919876543210"
              className="flex items-center justify-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/15 border border-white/10 text-white rounded-full text-xs font-bold transition-all active:scale-98 w-full sm:w-auto"
            >
              <PhoneCall className="w-4 h-4" />
              Call Support
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 text-center text-xs text-slate-500 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex justify-center items-center gap-3">
            <img src={venueProLogo} alt="Logo" className="h-6 w-auto opacity-70" />
            <span className="font-bold text-slate-600">VenuePro</span>
          </div>
          <p>© 2026 VenuePro Technologies. All rights reserved. CA-audited billing, digital calendar locks, and WhatsApp CRM automations.</p>
          <div className="flex justify-center gap-6 text-[11px] font-semibold">
            <button onClick={() => navigate('/privacy')} className="hover:text-slate-800 bg-transparent border-none cursor-pointer">Privacy Policy</button>
            <button onClick={() => navigate('/terms')} className="hover:text-slate-800 bg-transparent border-none cursor-pointer">Terms of Service</button>
            <a href="mailto:support@venuepro.in" className="hover:text-slate-800 transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
