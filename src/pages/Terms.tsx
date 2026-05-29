import { Link } from 'react-router-dom';
import { FileText, ArrowLeft, Shield, Clock, BookOpen, Ban, HeartHandshake } from 'lucide-react';
import venueProLogo from '@/assets/venueProLogo.svg';

export default function Terms() {
  return (
    <div className="bg-[#fcfbf9] text-slate-900 min-h-screen font-sans bg-grid-pattern relative selection:bg-brand-100 selection:text-brand-900 overflow-hidden">
      
      {/* Background Ambience Blobs */}
      <div className="absolute top-[-10%] right-[-15%] w-[45%] aspect-square rounded-full bg-gradient-to-tr from-indigo-100/30 via-cyan-100/20 to-amber-100/20 blur-[130px] -z-10 animate-pulse-slow" />
      <div className="absolute bottom-[20%] left-[-10%] w-[40%] aspect-square rounded-full bg-gradient-to-tr from-purple-100/20 to-brand-100/20 blur-[130px] -z-10 animate-pulse-slow" style={{ animationDelay: '2s' }} />

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
            <FileText className="w-3.5 h-3.5 animate-pulse" />
            <span>Legal Agreement</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-950 font-display tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            Effective Date: May 29, 2026. Please read this agreement carefully before utilizing the VenuePro dashboard.
          </p>
        </div>

        {/* Content Sections */}
        <div className="bg-white/80 backdrop-blur-md border border-slate-100/80 rounded-3xl p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.015)] space-y-8 text-slate-650 text-xs md:text-sm leading-relaxed">
          
          {/* Section 1 */}
          <div className="space-y-3">
            <h2 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-indigo-650 shrink-0" />
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing, registering, or operating the VenuePro software application, you agree to comply with and be bound by these Terms of Service. If you are entering into this agreement on behalf of a banquet hall, wedding resort, or event venue organization, you represent that you have the legal authority to bind that entity.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <h2 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-650 shrink-0" />
              2. Platform Services
            </h2>
            <p>
              VenuePro delivers a B2B SaaS dashboard providing bookings calendaring, lead management, CFO-grade expense tracking, PDF receipt generation, team roles (RBAC) setup, and offline caching sync operations. We reserve the right to modify, optimize, or deprecate product modules at our discretion to enhance system performance.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-3">
            <h2 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-650 shrink-0" />
              3. Trial Tiers, Upgrades & Grace Periods
            </h2>
            <p>
              Our billing, trial, and locking mechanisms operate under strict rules:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[11px] font-medium text-slate-600">
              <li>
                <strong>14-Day Free Trial:</strong> Fresh registrations receive a 14-day Pro Trial to evaluate all tools.
              </li>
              <li>
                <strong>Subscription Lifecycle:</strong> Upgrades can be selected on Monthly or Yearly cycles, offering Starter (₹1,999/mo or ₹9,999/yr), Pro (₹4,999/mo or ₹14,999/yr), and Enterprise (Custom) configurations.
              </li>
              <li>
                <strong>3-Day Read-Only Grace Period:</strong> Immediately upon trial expiration or subscription lapse, all mutating actions (Adding bookings, payments, leads, customers) are disabled. The workspace operates in view-only mode for 3 days.
              </li>
              <li>
                <strong>Lock Overlay:</strong> After the 3-day grace period, all dashboards are fully locked behind a subscription block screen, preventing access until a payment upgrade is simulated or processed.
              </li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="space-y-3">
            <h2 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-650 shrink-0" />
              4. User Responsibilities & Data Integrity
            </h2>
            <p>
              As a venue manager, you assume full responsibility for the data entered into your workspace:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[11px] font-medium text-slate-600">
              <li>
                <strong>Double-Booking Prevention:</strong> While VenuePro utilizes automatic overlap validations to block scheduling conflicts, you are advised to verify all date parameters, specifically when using manual imports or offline overrides.
              </li>
              <li>
                <strong>Client Communications:</strong> You are responsible for ensuring that customer contact numbers recorded for automated SMS or WhatsApp notifications are correct and entered with client consent.
              </li>
              <li>
                <strong>GST compliance:</strong> Tax reverse-calculations are built as helper utilities. You must consult your local finance adviser to verify invoice declarations match GSTIN laws.
              </li>
            </ul>
          </div>

          {/* Section 5 */}
          <div className="space-y-3">
            <h2 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Ban className="w-4 h-4 text-indigo-650 shrink-0" />
              5. Limitation of Liability
            </h2>
            <p>
              VenuePro is provided on an "as is" and "as available" basis. To the maximum extent permitted by applicable law, we shall not be liable for any direct, indirect, incidental, or consequential damages resulting from calendar double-bookings, lost event revenues, system downtime, network synchronization failures, or unauthorized staff entries.
            </p>
            <p>
              We recommend utilizing our Local Offline Backup Export options to save weekly Excel/CSV copies of your workspace records.
            </p>
          </div>

          {/* Section 6 */}
          <div className="space-y-3">
            <h2 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-650 shrink-0" />
              6. Governing Law & Dispute Resolution
            </h2>
            <p>
              These Terms of Service shall be governed by and construed in accordance with the laws of India. Any legal action or commercial disputes arising under this agreement shall be settled exclusively in the courts located in Hyderabad, Telangana.
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
