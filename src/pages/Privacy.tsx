import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, FileText, Database, Share2, HelpCircle, Menu, X } from 'lucide-react';
import venueProLogo from '@/assets/venueProLogo.svg';
import { getRouteUrl } from '@/lib/urls';
import { useAuthStore } from '@/stores/auth-store';

export default function Privacy() {
  const navigate = useNavigate();
  const handleNavigate = (path: string) => {
    const target = getRouteUrl(path);
    if (target.startsWith('http')) {
      window.location.href = target;
    } else {
      navigate(target);
    }
  };
  const { user } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleScrollToWorkflow = () => {
    const target = getRouteUrl('/') + '#workflow';
    if (target.startsWith('http')) {
      window.location.href = target;
    } else {
      navigate('/');
      setTimeout(() => {
        document.getElementById('workflow')?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  };

  const handleBookDemo = () => {
    const target = getRouteUrl('/') + '#demo';
    if (target.startsWith('http')) {
      window.location.href = target;
    } else {
      navigate('/');
      setTimeout(() => {
        document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  };

  return (
    <div className="bg-[#fcfbf9] text-slate-900 min-h-screen font-sans bg-grid-pattern relative selection:bg-brand-100 selection:text-brand-900 overflow-hidden">
      
      {/* Background Ambience Blobs */}
      <div className="absolute top-[-10%] left-[-15%] w-[45%] aspect-square rounded-full bg-gradient-to-tr from-indigo-100/30 via-cyan-100/20 to-amber-100/20 blur-[130px] -z-10 animate-pulse-slow" />
      <div className="absolute bottom-[20%] right-[-10%] w-[40%] aspect-square rounded-full bg-gradient-to-tr from-purple-100/20 to-brand-100/20 blur-[130px] -z-10 animate-pulse-slow" />

      {/* Floating Glass Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-5 left-4 right-4 z-50 max-w-7xl mx-auto"
      >
        <nav className="backdrop-blur-xl bg-white/70 border border-slate-200/50 px-6 py-3.5 rounded-full flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-10">
            <button onClick={() => handleNavigate('/')} className="flex items-center group transition-transform hover:scale-102 bg-transparent border-none outline-none cursor-pointer">
              <img
                src={venueProLogo}
                alt="VenuePro Logo"
                className="h-10 w-auto object-contain"
              />
            </button>
            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-7">
              <button onClick={() => handleNavigate('/features')} className="text-sm font-semibold text-slate-500 hover:text-[#0B1B3A] hover:scale-110 ease-in-out transition-all bg-transparent border-none cursor-pointer">Features</button>
              <button onClick={handleScrollToWorkflow} className="text-sm font-semibold text-slate-500 hover:text-[#0B1B3A] hover:scale-110 ease-in-out transition-all bg-transparent border-none cursor-pointer">How It Works</button>
              <button onClick={handleBookDemo} className="text-sm font-semibold text-slate-500 hover:text-[#0B1B3A] hover:scale-110 ease-in-out transition-all bg-transparent border-none cursor-pointer">Book Demo</button>
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
              <button onClick={() => { setIsMobileMenuOpen(false); handleScrollToWorkflow(); }} className="text-left text-md font-semibold text-slate-600 hover:text-[#0B1B3A] px-3 py-2 rounded-xl hover:bg-slate-50 transition-all bg-transparent border-none cursor-pointer">How It Works</button>
              <button onClick={() => { setIsMobileMenuOpen(false); handleBookDemo(); }} className="text-left text-md font-semibold text-slate-600 hover:text-[#0B1B3A] px-3 py-2 rounded-xl hover:bg-slate-50 transition-all bg-transparent border-none cursor-pointer">Book Demo</button>
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

      {/* Main Content Area */}
      <main className="pt-28 pb-20 px-4 max-w-4xl mx-auto space-y-12 relative">
        
        {/* Title Hero */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5 animate-pulse" />
            <span>Privacy & Trust</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-950 font-display tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            Effective Date: May 29, 2026. This policy outlines how VenuePro collects, secures, and handles operational event data for your organization.
          </p>
        </div>

        {/* Content Sections */}
        <div className="bg-white/80 backdrop-blur-md border border-slate-100/80 rounded-3xl p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.015)] space-y-8 text-slate-650 text-xs md:text-sm leading-relaxed">
          
          {/* Section 1 */}
          <div className="space-y-3">
            <h2 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-650 shrink-0" />
              1. Overview & Scope
            </h2>
            <p>
              VenuePro ("we", "our", or "us") is a specialized B2B software platform designed to help venue owners, banquet managers, and event organizers manage bookings, leads, staff permissions, and payments. This Privacy Policy describes how we collect, store, and process data relating to your venue operations, customer records, and dashboard users.
            </p>
            <p>
              By utilizing the VenuePro dashboard, onboarding wizards, or mock sandbox instances, you consent to the data collection and security practices outlined in this policy.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <h2 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-650 shrink-0" />
              2. Data We Collect
            </h2>
            <p>
              We collect operational data that you intentionally provide during workspace configuration and event planning. This includes:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[11px] font-medium text-slate-600">
              <li>
                <strong>Organization Details:</strong> Venue/hall names, descriptions, display ordering, dimensions (length, width, height, seating capacities), floor numbers, custom pricing tiers, weekend premium configuration, and photos.
              </li>
              <li>
                <strong>Client & Lead Records:</strong> Customer names, mobile phone numbers (essential for scheduling SMS/WhatsApp alerts), emails, event descriptions, tentative booking dates, budgets, and operational notes.
              </li>
              <li>
                <strong>Financial Ledger Logs:</strong> Transaction dates, payments received (advance deposits, pending balances), payment modes (cash, card, UPI, bank transfer), transaction references, and PDF invoices.
              </li>
              <li>
                <strong>Team Configuration:</strong> Invitee emails, staff roles (Owner, Manager, Finance, Staff), avatar URLs, and profile configurations.
              </li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-3">
            <h2 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-650 shrink-0" />
              3. Data Security & Storage
            </h2>
            <p>
              Security is the cornerstone of the VenuePro architecture. We safeguard your commercial data using enterprise-grade protections:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[11px] font-medium text-slate-600">
              <li>
                <strong>Row Level Security (RLS):</strong> All Supabase database tables are protected by strict security policies ensuring that user sessions can only read, write, or update rows bound to their specific organization ID.
              </li>
              <li>
                <strong>Database Encryption:</strong> Sensitive credentials and passwords are encrypted using high-performance cryptographic algorithms (pgcrypto) at the database tier.
              </li>
              <li>
                <strong>Local Storage Sandboxing:</strong> For offline fallback modes, backup data is cached inside browser-encrypted Local Storage blocks and synchronized safely over SSL/TLS channels once internet connectivity is restored.
              </li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="space-y-3">
            <h2 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-indigo-650 shrink-0" />
              4. Third-Party Integrations
            </h2>
            <p>
              VenuePro integrates with select communication and payment verification systems to deliver automated alerts:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[11px] font-medium text-slate-600">
              <li>
                <strong>WhatsApp & SMS dispatches:</strong> Event receipt links and follow-up templates are transmitted via our communication gateway. We do not sell or lease customer phone numbers to third-party advertisers.
              </li>
              <li>
                <strong>Mock Payment Sandboxes:</strong> For subscription upgrades, card and UPI forms are verified in sandbox modes. Real billing data is processed via securely tokenized integrations.
              </li>
            </ul>
          </div>

          {/* Section 5 */}
          <div className="space-y-3">
            <h2 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-650 shrink-0" />
              5. Your Rights & Data Deletion
            </h2>
            <p>
              You maintain complete ownership of your database entries. You have the right to request a full CSV archive of your bookings, customer logs, and expenses at any time.
            </p>
            <p>
              If you decide to terminate your account, you can request a permanent, irreversible purge of all organization data, user logins, and uploaded media attachments by contacting us at: <strong>support@venuepro.in</strong>.
            </p>
          </div>

        </div>

        {/* Footer Credit */}
        <div className="text-center text-[10px] text-slate-400 font-semibold">
          © 2026 VenuePro. All rights reserved. Built with RLS security protections.
        </div>

      </main>
    </div>
  );
}
