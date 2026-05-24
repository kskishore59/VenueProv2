import { useState } from 'react';
import { 
  Search, HelpCircle, ChevronDown, BookOpen, AlertTriangle, 
  Wrench, CheckCircle2, FileText, ArrowRight, PlayCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// FAQ data structure
const faqs = [
  {
    q: "Can I run VenuePro without internet?",
    a: "Yes! VenuePro works in an offline fallback mode. If you lose connection, your data is preserved in local memory. The system syncs with Supabase once you reconnect.",
    category: "general"
  },
  {
    q: "How does double-booking prevention work?",
    a: "When scheduling a booking or lead, VenuePro runs a real-time overlap check across event dates, start/end timings, and selected halls. If there is a clash, the app blocks creation to safeguard your calendar.",
    category: "bookings"
  },
  {
    q: "How do I invite my venue staff?",
    a: "Navigate to Settings ➔ Team, tap 'Invite Staff', and enter their email and role (Manager, Finance, or Staff). They will receive an invitation and be added to your organization upon sign up.",
    category: "team"
  },
  {
    q: "How do I configure GST rates on receipts?",
    a: "Go to Settings ➔ Venue Information, enter your GSTIN, and ensure GST settings are toggled on. Invoices will automatically compute a standard 18% GST (9% CGST + 9% SGST) reverse-calculated from inclusive totals.",
    category: "payments"
  },
  {
    q: "How do I download and print receipts?",
    a: "Open any payment from the Payments page or Booking Drawer and click the document icon. In the preview modal, click 'Print / Save PDF' to trigger your system's print menu, where you can select physical printer or 'Save as PDF'.",
    category: "payments"
  }
];

// Blunders data structure
const blunders = [
  {
    title: "Neglecting Setup Buffer Time",
    desc: "Forgetting to leave 2-3 hours between consecutive events in the same hall. Ensure you schedule buffer margins for decoration teardown, catering assembly, and cleanup.",
    fix: "Always book the start time at least 2 hours before the guest arrival and set end time 1 hour after exit."
  },
  {
    title: "Reserving Dates Without Deposit",
    desc: "Holding prime wedding dates on calendar 'holds' indefinitely without obtaining an advance. This blocks actual paying inquiries and leads to empty halls.",
    fix: "Set a strict 48-hour expiration on tentative holds and require a minimum 25% deposit to confirm."
  },
  {
    title: "Typing Phone Numbers Incorrectly",
    desc: "Typing single-digit typos in customer mobile numbers. Since VenuePro uses phone numbers for WhatsApp integration, incorrect numbers break communications.",
    fix: "Double check phone numbers match the 10-digit format (starting with 6-9) before hitting save."
  },
  {
    title: "Bypassing Hall Configuration",
    desc: "Trying to register new bookings or inquiries without first configuring active Halls/Spaces in Settings.",
    fix: "Take 5 minutes to set up your Halls, capacities, and base rates under Settings ➔ Halls first."
  }
];

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'flows' | 'blunders' | 'faqs'>('flows');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Filter FAQs based on search
  const filteredFaqs = faqs.filter(
    (faq) => 
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter Blunders based on search
  const filteredBlunders = blunders.filter(
    (b) => 
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl pb-12">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 rounded-3xl p-6 md:p-8 text-white shadow-md overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-y-1/4 translate-x-1/4 w-72 h-72 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        
        <div className="relative space-y-4 max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Support & Documentation</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Help & Knowledge Center</h1>
          <p className="text-xs md:text-sm text-brand-100 leading-relaxed font-medium">
            Learn core flows, avoid operational mistakes, and troubleshoot system issues in under 5 minutes.
          </p>
          
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides, FAQs, or troubleshooting steps..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white text-gray-900 placeholder-gray-400 text-xs focus:ring-2 focus:ring-brand-200 outline-none transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Tour Banner */}
      <div className="bg-brand-50/60 border border-brand-100/80 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-sm font-extrabold text-brand-900 flex items-center justify-center sm:justify-start gap-1.5">
            <PlayCircle className="w-4 h-4 text-brand-600" />
            New to VenuePro?
          </h3>
          <p className="text-xs text-brand-700 leading-normal max-w-xl font-medium">
            Take a 1-minute interactive tour of the workspace. We will walk you through the key layout zones, dashboard controls, settings profile, and the action console.
          </p>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem('venuepro_onboarding_completed');
            window.dispatchEvent(new CustomEvent('start-onboarding-tour'));
          }}
          className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all active:scale-95 shadow-sm shrink-0"
        >
          Start Workspace Tour
        </button>
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-2 border-b border-gray-150 pb-px">
        <button
          onClick={() => setActiveTab('flows')}
          className={cn(
            'px-4 py-2 text-xs font-bold border-b-2 -mb-px transition-all flex items-center gap-1.5',
            activeTab === 'flows'
              ? 'border-brand-600 text-brand-600 font-extrabold'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          )}
        >
          <BookOpen className="w-4 h-4" />
          Core App Flows
        </button>
        <button
          onClick={() => setActiveTab('blunders')}
          className={cn(
            'px-4 py-2 text-xs font-bold border-b-2 -mb-px transition-all flex items-center gap-1.5',
            activeTab === 'blunders'
              ? 'border-brand-600 text-brand-600 font-extrabold'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          )}
        >
          <AlertTriangle className="w-4 h-4" />
          Common Blunders
        </button>
        <button
          onClick={() => setActiveTab('faqs')}
          className={cn(
            'px-4 py-2 text-xs font-bold border-b-2 -mb-px transition-all flex items-center gap-1.5',
            activeTab === 'faqs'
              ? 'border-brand-600 text-brand-600 font-extrabold'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          )}
        >
          <Wrench className="w-4 h-4" />
          Troubleshooting & FAQs
        </button>
      </div>

      {/* Content Rendering */}
      {activeTab === 'flows' && (
        <div className="space-y-6">
          {/* Card 1: Inquiry to Booking Flow */}
          <div className="bg-white rounded-2xl border border-gray-150 p-6 space-y-4 hover:shadow-xs transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                <PlayCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-gray-900">Inquiry to Booking Lifecycle</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Standard sequence for capturing and winning leads</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1 relative">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Step 1</span>
                <h4 className="text-xs font-bold text-gray-900">Log Inquiry</h4>
                <p className="text-[11px] text-gray-500 leading-normal">Enter name, phone, tentative date, and source in Inquiries.</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1 relative">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Step 2</span>
                <h4 className="text-xs font-bold text-gray-900">Follow-up Call</h4>
                <p className="text-[11px] text-gray-500 leading-normal">Reach out to discuss pricing, options, and arrange physical visit.</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1 relative">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Step 3</span>
                <h4 className="text-xs font-bold text-gray-900">Convert Lead</h4>
                <p className="text-[11px] text-gray-500 leading-normal">Click 'Convert' in Lead Details, which auto-creates the customer card.</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1 relative">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Step 4</span>
                <h4 className="text-xs font-bold text-gray-900">Lock Calendar</h4>
                <p className="text-[11px] text-gray-500 leading-normal">Log booking details, record advance deposit, and issue receipt.</p>
              </div>
            </div>
          </div>

          {/* Card 2: Payment and Receipt Flow */}
          <div className="bg-white rounded-2xl border border-gray-150 p-6 space-y-4 hover:shadow-xs transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-gray-900">Payment Collection & Receipting</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Tracking payments and issuing digital documentation</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Step 1</span>
                <h4 className="text-xs font-bold text-gray-900">Log Payment</h4>
                <p className="text-[11px] text-gray-500 leading-normal">Open booking details, click 'Collect Payment', enter amount and mode.</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Step 2</span>
                <h4 className="text-xs font-bold text-gray-900">Generate Paper</h4>
                <p className="text-[11px] text-gray-500 leading-normal">Open Receipt Modal from payment log, validating GST settings.</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Step 3</span>
                <h4 className="text-xs font-bold text-gray-900">Print or Save PDF</h4>
                <p className="text-[11px] text-gray-500 leading-normal">Trigger print overlay to output physical copy or save vector PDF file.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'blunders' && (
        <div className="space-y-4">
          <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-amber-950">Why does this matter?</h4>
              <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                Running a busy wedding/event venue requires absolute scheduling precision. Overlooking buffer timings or details can cause major disputes with clients. Review these blunders to run a smooth venue.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBlunders.map((b, index) => (
              <div key={index} className="bg-white rounded-2xl border border-gray-150 p-5 space-y-3 flex flex-col justify-between hover:shadow-xs transition-shadow">
                <div className="space-y-1.5">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    ⚠️ Blunder #{index + 1}
                  </span>
                  <h4 className="text-xs font-extrabold text-gray-900">{b.title}</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed">{b.desc}</p>
                </div>
                <div className="pt-2 border-t border-gray-100 mt-2">
                  <p className="text-[11px] font-bold text-success-600 flex items-start gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success-500 flex-shrink-0 mt-0.5" />
                    <span>How to avoid: {b.fix}</span>
                  </p>
                </div>
              </div>
            ))}
            {filteredBlunders.length === 0 && (
              <div className="col-span-2 py-8 text-center text-xs text-gray-400">
                No blunders match your search query.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'faqs' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden divide-y divide-gray-100 shadow-2xs">
            {filteredFaqs.map((faq, index) => (
              <div key={index} className="bg-white">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xs font-bold text-gray-800">{faq.q}</span>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-gray-400 transition-transform duration-200",
                      expandedFaq === index && "rotate-180 text-brand-600"
                    )}
                  />
                </button>
                {expandedFaq === index && (
                  <div className="px-5 pb-4 text-[11px] text-gray-500 leading-relaxed bg-gray-50/50 animate-slide-up">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
            {filteredFaqs.length === 0 && (
              <div className="py-12 text-center text-xs text-gray-400">
                No FAQs match your search query. Try typing another keyword!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
