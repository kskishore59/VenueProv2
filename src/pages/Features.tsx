import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, DollarSign, MessageSquare, ShieldCheck, WifiOff, ArrowLeft,
  ArrowRight, Check, Users, Sparkles, TrendingUp, BarChart3, Lock,
  RefreshCw, CheckCircle2, AlertTriangle, PhoneCall, Award, ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import venueProLogo from '@/assets/venueProLogo.svg';

interface FeatureWorkflowStep {
  title: string;
  desc: string;
  metric: string;
  icon: any;
  color: string;
}

const WORKFLOW_STEPS: FeatureWorkflowStep[] = [
  {
    title: "1. Lead Entry & Capture",
    desc: "Inquiries are captured directly from your landing page widget, walk-ins, or phone calls, and automatically populated in the B2B CRM pipeline.",
    metric: "+84 Inquiries This Month",
    icon: Users,
    color: "text-blue-500 bg-blue-50"
  },
  {
    title: "2. Realtime Availability Check",
    desc: "The system instantly checks designated event date, timings, and halls. Real-time calendar checks prevent double-bookings.",
    metric: "0% Double-Booking Clashes",
    icon: Calendar,
    color: "text-amber-500 bg-amber-50"
  },
  {
    title: "3. Deposit & GST Invoicing",
    desc: "The manager logs the deposit payment, while VenuePro automatically splits the advance and reverse-calculates CGST/SGST taxes.",
    metric: "₹1.5L Deposit UPI Logged",
    icon: DollarSign,
    color: "text-emerald-500 bg-emerald-50"
  },
  {
    title: "4. Auto-WhatsApp Receipts",
    desc: "A premium PDF invoice receipt is generated and instantly dispatched to the customer's WhatsApp with a single tap.",
    metric: "98% Customer Open Rate",
    icon: MessageSquare,
    color: "text-green-500 bg-green-50"
  },
  {
    title: "5. Real-Time CFO Reports",
    desc: "Payment records are updated instantly across all dashboards, auto-calculating occupancy ratios and outstanding collections.",
    metric: "₹52.8L Q3 Collections",
    icon: BarChart3,
    color: "text-purple-500 bg-purple-50"
  }
];

export default function Features() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [expandedFeature, setExpandedFeature] = useState<string | null>("calendar");

  return (
    <div className="bg-[#F6F7FB] text-slate-800 min-h-screen font-sans relative selection:bg-[#1E5EFF]/15 selection:text-[#1E5EFF] overflow-hidden">
      {/* Custom styles */}
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

        .gradient-glow {
          box-shadow: 0 0 40px -10px rgba(30, 94, 255, 0.08);
        }
      `}} />

      {/* Grid Pattern and Gradients */}
      <div className="absolute inset-0 stripe-grid pointer-events-none opacity-60 -z-10" />
      <div className="absolute top-0 left-1/4 w-[60%] aspect-square rounded-full bg-gradient-to-tr from-[#1E5EFF]/5 via-[#0B1B3A]/5 to-[#F5C542]/5 blur-[160px] -z-10" />
      <div className="absolute bottom-0 right-[-10%] w-[50%] aspect-square rounded-full bg-gradient-to-tr from-[#1E5EFF]/5 via-[#0B1B3A]/5 to-transparent blur-[160px] -z-10" />

      {/* Floating Header */}
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-24 space-y-32">

        {/* Intro */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#1E5EFF] text-[10px] font-black uppercase tracking-wider shadow-2xs">
            <Award className="w-3.5 h-3.5 text-[#F5C542]" /> Platform Capabilities
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0B1B3A] tracking-tight font-Sans leading-tight">
            Built Specially For Indian Banquet & Resort Owners
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Eliminate double-booking arguments, calculate GST tax splits in 2 seconds, and automatically chase outstanding balances on WhatsApp. Here is how VenuePro powers your operation.
          </p>
        </div>

        {/* SECTION 1: THE OPERATIONAL WORKFLOW TIMELINE */}
        <section className="space-y-16">
          <div className="text-center space-y-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#1E5EFF]">Operational Timelines</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1B3A] tracking-tight font-Sans">
              The 5-Step Venue Management Workflow
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto font-medium">
              From a first phone inquiry to full ledger reporting, VenuePro streamlines your operations in minutes.
            </p>
          </div>

          {/* Timeline UI */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto items-center">
            {/* Step Selection Accordion (Left) */}
            <div className="lg:col-span-5 space-y-3">
              {WORKFLOW_STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isActive = activeStep === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveStep(idx)}
                    className={cn(
                      "w-full text-left p-5 rounded-2xl border transition-all duration-300 flex items-start gap-4 cursor-pointer outline-none",
                      isActive
                        ? "bg-white border-slate-300 shadow-md ring-1 ring-slate-100"
                        : "bg-white/40 border-slate-200/50 hover:bg-white hover:border-slate-300 hover:shadow-2xs"
                    )}
                  >
                    <div className={cn("p-3 rounded-xl shrink-0 mt-0.5", step.color)}>
                      <Icon className="w-5 h-5 shrink-0" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black tracking-wider text-slate-400 uppercase">Stage {idx + 1}</span>
                        {isActive && <span className="text-[8px] bg-blue-50 text-[#1E5EFF] px-1.5 py-0.5 rounded font-black uppercase">Active View</span>}
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">{step.title}</h4>
                      {isActive && (
                        <p className="text-xs text-slate-500 leading-relaxed pt-1 animate-fade-in">
                          {step.desc}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Interactive Visualizer Card (Right) */}
            <div className="lg:col-span-7 bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-lg glow-blue relative min-h-[360px] flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#1E5EFF]/5 rounded-bl-full pointer-events-none" />

              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-[#1E5EFF]">
                      {WORKFLOW_STEPS[activeStep].metric}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold">VenuePro Core Module</span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="min-h-[200px] flex flex-col justify-center"
                  >
                    {activeStep === 0 && (
                      <div className="space-y-4 text-left">
                        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-3 relative overflow-hidden">
                          <span className="absolute top-3 right-3 text-[8px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-bold uppercase">New lead</span>
                          <h4 className="text-xs font-bold text-slate-400">Incoming B2B Inquiry</h4>
                          <div>
                            <p className="text-sm font-black text-slate-800">Sanjay Yadav Wedding</p>
                            <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">Dec 18, 2026 · Grand Lawn · 300 Guests</p>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-white p-2 rounded-lg border border-slate-100">
                            <span className="font-bold text-[#1E5EFF]">Source:</span> Website Demo Wizard
                          </div>
                        </div>
                      </div>
                    )}

                    {activeStep === 1 && (
                      <div className="space-y-4 text-left">
                        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-400">Calendar Timelines</span>
                            <span className="text-[9px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md font-bold">No Overlaps</span>
                          </div>
                          <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-bold text-slate-400">
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i}>{d}</span>)}
                            {Array.from({ length: 14 }).map((_, idx) => {
                              const isDec18 = idx === 8;
                              return (
                                <span key={idx} className={cn(
                                  "py-1.5 rounded-md font-bold transition-all",
                                  isDec18
                                    ? "bg-[#1E5EFF] text-white animate-pulse"
                                    : "bg-white border border-slate-150 text-slate-600"
                                )}>
                                  {idx + 10}
                                </span>
                              );
                            })}
                          </div>
                          <p className="text-[9px] text-[#1E5EFF] font-bold text-center">✓ Dec 18 Available — Calendar Locks Armed</p>
                        </div>
                      </div>
                    )}

                    {activeStep === 2 && (
                      <div className="space-y-4 text-left">
                        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-2.5 font-mono text-[11px] text-slate-600">
                          <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-2">
                            <span className="font-bold font-sans text-xs text-slate-800">CFO Tax Split Summary</span>
                            <span className="text-[8px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-black">GST Compliant</span>
                          </div>
                          <div className="flex justify-between"><span>Buffet Package (Inclusive):</span><span className="font-bold text-slate-800">₹1,50,000</span></div>
                          <div className="flex justify-between text-slate-400"><span>CGST Split (9%):</span><span>₹11,440.68</span></div>
                          <div className="flex justify-between text-slate-400"><span>SGST Split (9%):</span><span>₹11,440.68</span></div>
                          <div className="flex justify-between text-slate-400"><span>Taxable Net Base:</span><span>₹1,27,118.64</span></div>
                          <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-slate-800">
                            <span>UPI Advance Logged:</span>
                            <span>₹1,50,000</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeStep === 3 && (
                      <div className="space-y-4 text-left">
                        <div className="bg-[#E9F7EF] border border-[#A9DFBF] rounded-2xl p-4 flex gap-3 max-w-[85%] ml-auto relative">
                          <div className="absolute right-2 bottom-1.5 flex items-center gap-0.5 text-[8px] text-slate-400 font-semibold">
                            <span>11:02 AM</span>
                            <span className="text-blue-500 font-bold">✓✓</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 border-b border-[#A9DFBF]/60 pb-1.5">
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-[9px] font-black text-emerald-800 uppercase tracking-wider">Auto Invoice Sent</span>
                            </div>
                            <p className="text-[10px] leading-relaxed text-slate-700 font-medium pb-2">
                              "Ram Ram Sanjay ji, your advance of <strong>₹1,50,000</strong> has been received. Your booking for <strong>Dec 18, 2026</strong> is locked. View receipt: <u>venuepro.in/public/share/payment/rec_02931</u>"
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeStep === 4 && (
                      <div className="space-y-4 text-left">
                        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-3">
                          <span className="text-[9px] font-bold text-slate-400 block border-b border-slate-200 pb-1.5">Owner Collections Progress</span>
                          <div className="flex items-end gap-2.5 h-24 pt-2">
                            {[30, 45, 65, 50, 85, 95, 70].map((val, idx) => (
                              <div key={idx} className="flex-1 bg-slate-200/40 rounded-t-md h-full flex items-end">
                                <motion.div
                                  initial={{ height: 0 }}
                                  animate={{ height: `${val}%` }}
                                  transition={{ duration: 0.5 }}
                                  className="w-full bg-[#1E5EFF] rounded-t-md"
                                />
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between text-[8px] text-slate-400 font-bold">
                            <span>July</span>
                            <span>August</span>
                            <span>September (Current)</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="text-[9px] text-slate-400 flex justify-between border-t border-slate-100 pt-3 font-semibold mt-4">
                <span>Secure SSL Cloud Operations</span>
                <span>Select stages on the left to see modules</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: PLATFORM DEEP DIVE BENTO GRID */}
        <section className="space-y-16">
          <div className="text-center space-y-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#1E5EFF]">Feature Modules</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1B3A] tracking-tight font-Sans">
              Built For Complete Operational Command
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto font-medium">
              Every detail optimized to save advances, block errors, and secure data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 max-w-6xl mx-auto">
            {/* Calendar locking card */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-8 md:col-span-8 flex flex-col justify-between min-h-[340px] relative overflow-hidden group shadow-2xs hover:shadow-md transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#1E5EFF]/5 rounded-bl-full pointer-events-none" />
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-7 space-y-4">
                  <div className="p-3 bg-[#1E5EFF]/5 rounded-2xl w-fit text-[#1E5EFF]"><Calendar className="w-5 h-5" /></div>
                  <h3 className="text-lg font-bold text-slate-800">Double-Booking Calendar Protection</h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                    Our database engine enforces record constraints. If two coordinators try to book the same hall for the same slot concurrently, the system blocks the overlap immediately, ensuring 100% calendar accuracy.
                  </p>
                </div>
                <div className="md:col-span-5 bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-2.5 font-sans relative overflow-hidden shadow-2xs">
                  <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                    <span>Double Booking Checker</span>
                    <span className="text-red-500 font-extrabold flex items-center gap-1">● Conflict Lock</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="bg-red-50 border border-red-200 p-2 rounded-xl text-[9px] text-red-950 flex justify-between items-center">
                      <div>
                        <p className="font-extrabold">Inquiry 1: Rajesh Wedding</p>
                        <p className="text-slate-500 font-medium">Dec 18, 10:00 AM</p>
                      </div>
                      <span className="bg-red-100 px-1.5 py-0.5 rounded font-black text-red-700">CLASH</span>
                    </div>
                  </div>
                  <p className="text-[8px] text-slate-400 text-center font-semibold">Locked concurrent duplicate attempts</p>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-4 mt-6 text-[10px] text-slate-400 font-bold">100% Double-Booking Prevention</div>
            </div>

            {/* Split payment card */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-8 md:col-span-4 flex flex-col justify-between min-h-[340px] relative overflow-hidden shadow-2xs hover:shadow-md transition-all">
              <div className="space-y-4">
                <div className="p-3 bg-[#F5C542]/10 rounded-2xl w-fit text-[#F5C542]"><DollarSign className="w-5 h-5" /></div>
                <h3 className="text-lg font-bold text-slate-800">CA-Compliant Split Billing</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                  Define plate package rates and base rentals. VenuePro automatically logs advances, breaks down installments, and handles reverse-GST splits (9% CGST + 9% SGST) for audits in one click.
                </p>
                <div className="bg-amber-50/40 border border-amber-200/50 rounded-2xl p-3.5 space-y-1.5 text-[9px] font-mono text-slate-600">
                  <div className="flex justify-between text-slate-400"><span>Catering split:</span><span>₹1,27,118</span></div>
                  <div className="flex justify-between text-slate-400"><span>GST (18%):</span><span>₹22,881</span></div>
                  <div className="border-t border-slate-200/60 my-1" />
                  <div className="flex justify-between font-extrabold text-slate-800"><span>Invoice Total:</span><span>₹1,50,000</span></div>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-4 mt-6 text-[10px] text-slate-400 font-bold">Calculations Compliant with GST Audits</div>
            </div>

            {/* WhatsApp CRM card */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-8 md:col-span-4 flex flex-col justify-between min-h-[340px] relative overflow-hidden shadow-2xs hover:shadow-md transition-all">
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 rounded-2xl w-fit text-emerald-500"><MessageSquare className="w-5 h-5" /></div>
                <h3 className="text-lg font-bold text-slate-800">Automated WhatsApp Trails</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                  Ditch physical invoice printouts. Dispatch PDF invoices, booking details, and payment receipt confirmation links straight to customer's WhatsApp chat with single-tap prompts.
                </p>
                <div className="bg-emerald-50/40 border border-[#A9DFBF]/60 rounded-xl p-3 space-y-1 text-[9px] text-slate-700">
                  <p className="font-extrabold text-emerald-800 flex items-center gap-1">🟢 Dispatch Receipt</p>
                  <p>Invoices sent to customer's chat instantly with a secure PDF file link.</p>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-4 mt-6 text-[10px] text-slate-400 font-bold">Zero Storage Cost PDF Sharing</div>
            </div>

            {/* Security Roles card */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-8 md:col-span-8 flex flex-col justify-between min-h-[340px] relative overflow-hidden group shadow-2xs hover:shadow-md transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5C542]/5 rounded-bl-full pointer-events-none" />
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-7 space-y-4">
                  <div className="p-3 bg-purple-50 rounded-2xl w-fit text-purple-500"><ShieldCheck className="w-5 h-5" /></div>
                  <h3 className="text-lg font-bold text-slate-800">Role-Based Staff Permissions</h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                    Keep your business margins secure. Assign coordinators to view and schedule booking calendar slots while completely hiding costs, expense books, staff pay logs, and net cash statistics from everyone but the owner.
                  </p>
                </div>
                <div className="md:col-span-5 bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-2 font-sans relative overflow-hidden">
                  <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 border-b border-slate-200/60 pb-1.5">
                    <span>Role Access Matrix</span>
                    <span>Status</span>
                  </div>
                  <div className="space-y-1.5 text-[9px]">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-700 font-semibold">Booking slot lock</span>
                      <span className="text-emerald-600 font-black">ENABLED</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-slate-100 pt-1.5">
                      <span className="text-slate-700 font-semibold">Cash ledger changes</span>
                      <span className="text-red-500 font-black">DISABLED</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-4 mt-6 text-[10px] text-slate-400 font-bold">Secure Business Data Isolation</div>
            </div>

            {/* Offline backup card */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-8 md:col-span-6 flex flex-col justify-between min-h-[300px] relative overflow-hidden shadow-2xs hover:shadow-md transition-all">
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-2xl w-fit text-blue-500"><WifiOff className="w-5 h-5" /></div>
                <h3 className="text-lg font-bold text-slate-800">Offline Fallback Protection</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                  Built for erratic Indian network conditions. If connection drops during a busy booking tour, VenuePro automatically caches session bookings and invoices in the browser memory. Once you reconnect to network towers, all changes sync to Supabase with zero data loss.
                </p>
              </div>
              <div className="border-t border-slate-100 pt-4 mt-6 text-[10px] text-slate-400 font-bold">Automatic Synchronization Recovery</div>
            </div>

            {/* CRM Overdues card */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-8 md:col-span-6 flex flex-col justify-between min-h-[300px] relative overflow-hidden shadow-2xs hover:shadow-md transition-all">
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 rounded-2xl w-fit text-emerald-500"><TrendingUp className="w-5 h-5" /></div>
                <h3 className="text-lg font-bold text-slate-800">Inquiry Pipeline & Reminders</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                  Track hot leads in one CRM pipeline. The system flags outstanding callback deadlines and balance collections. Tap a customer card to call them directly or send a pre-filled WhatsApp check-in template.
                </p>
              </div>
              <div className="border-t border-slate-100 pt-4 mt-6 text-[10px] text-slate-400 font-bold">Auto-Calculated Collection Balances</div>
            </div>
          </div>
        </section>

        {/* SECTION 3: INTERACTIVE FEATURES ACCORDION */}
        <section className="space-y-16 max-w-4xl mx-auto">
          <div className="text-center space-y-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#1E5EFF]">FAQ & Modules</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1B3A] tracking-tight font-Sans">
              Feature FAQ & Capabilities
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto font-medium">
              Find detailed explanations of how our platform locks down your venue registry.
            </p>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden divide-y divide-slate-100 shadow-2xs">
            {[
              {
                id: "calendar",
                title: "How does the calendar prevent duplicate slot booking?",
                desc: "Every time you attempt to create a booking or lead, VenuePro runs a database constraint check. It checks the dates, timings, and halls. If another manager submits the same slot, the database blocks the overlap in real-time, displaying a collision warning and queuing the secondary request."
              },
              {
                id: "whatsapp",
                title: "Is a WhatsApp Business API subscription required?",
                desc: "No expensive API setup is required! VenuePro uses direct WhatsApp deep-links prefilled with customer details, invoice numbers, and payment receipt URLs. It triggers your native phone/desktop WhatsApp app instantly, completely bypassing expensive API charges."
              },
              {
                id: "offline",
                title: "How long can the application run offline?",
                desc: "VenuePro can store transaction changes and bookings offline in your browser memory for up to 30 days. The moment you open the app with a stable internet connection, it automatically uploads and syncs the backlog to Supabase."
              },
              {
                id: "migration",
                title: "Can we migrate our old registers and paper books?",
                desc: "Yes. We provide an automated Excel Import Wizard in Settings. If you have physical paper diaries, simply take pictures and share them with our support crew. We will manually enter and configure your registry backlog within 24 hours, free of charge."
              }
            ].map(item => {
              const isOpen = expandedFeature === item.id;
              return (
                <div key={item.id} className="bg-white">
                  <button
                    type="button"
                    onClick={() => setExpandedFeature(isOpen ? null : item.id)}
                    className="w-full text-left px-6 py-5 flex items-center justify-between hover:bg-slate-50/30 transition-colors border-none outline-none cursor-pointer"
                  >
                    <span className="text-sm sm:text-base font-bold text-slate-800 font-Sans">{item.title}</span>
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center bg-slate-100 transition-all",
                      isOpen && "bg-blue-50 text-[#1E5EFF]"
                    )}>
                      <ChevronDown className={cn("w-3.5 h-3.5 text-slate-500 transition-transform duration-300", isOpen && "rotate-180 text-[#1E5EFF]")} />
                    </div>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                          {item.desc}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* Call to Action bottom banner */}
        <section className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-[#0B1B3A] to-[#0A1A35] rounded-3xl border border-slate-800 p-8 sm:p-12 text-center text-white space-y-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-[-30%] left-[-20%] w-[60%] aspect-square rounded-full bg-[#1E5EFF]/10 blur-[120px] pointer-events-none" />

            <div className="space-y-4 relative z-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-Sans tracking-tight">
                Experience VenuePro Live In Action
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                Take a 14-day free trial. Set up your halls, invite your staff, and secure your event slots. No credit card required.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 relative z-10">
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="w-full sm:w-auto px-7 py-4 bg-[#1E5EFF] hover:bg-blue-600 text-white rounded-full text-xs font-bold shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-98"
              >
                Start Free Trial
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full sm:w-auto px-7 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-full text-xs font-bold transition-all shadow-lg hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-2"
              >
                <span>Request a Walkthrough Demo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

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
            <button onClick={() => navigate('/faqs')} className="hover:text-slate-800 bg-transparent border-none cursor-pointer">Support FAQs</button>
            <button onClick={() => navigate('/privacy')} className="hover:text-slate-800 bg-transparent border-none cursor-pointer">Privacy Policy</button>
            <button onClick={() => navigate('/terms')} className="hover:text-slate-800 bg-transparent border-none cursor-pointer">Terms of Service</button>
            <a href="mailto:support@venuepro.in" className="hover:text-slate-800 transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
