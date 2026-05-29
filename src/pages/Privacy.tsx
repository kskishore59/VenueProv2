import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Lock, FileText, Database, Share2, HelpCircle } from 'lucide-react';
import venueProLogo from '@/assets/venueProLogo.svg';

export default function Privacy() {
  return (
    <div className="bg-[#fcfbf9] text-slate-900 min-h-screen font-sans bg-grid-pattern relative selection:bg-brand-100 selection:text-brand-900 overflow-hidden">
      
      {/* Background Ambience Blobs */}
      <div className="absolute top-[-10%] left-[-15%] w-[45%] aspect-square rounded-full bg-gradient-to-tr from-indigo-100/30 via-cyan-100/20 to-amber-100/20 blur-[130px] -z-10 animate-pulse-slow" />
      <div className="absolute bottom-[20%] right-[-10%] w-[40%] aspect-square rounded-full bg-gradient-to-tr from-purple-100/20 to-brand-100/20 blur-[130px] -z-10 animate-pulse-slow" />

      {/* Floating Header */}
      <header className="fixed top-4 left-4 right-4 z-50 max-w-5xl mx-auto">
        <div className="backdrop-blur-xl bg-white/70 border border-slate-100/60 px-6 py-2.5 rounded-full flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <Link to="/" className="flex items-center group transition-transform hover:scale-102">
            <img
              src={venueProLogo}
              alt="VenuePro Logo"
              className="h-10 w-auto object-contain"
            />
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs hover:scale-102 active:scale-98"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Homepage</span>
          </Link>
        </div>
      </header>

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
