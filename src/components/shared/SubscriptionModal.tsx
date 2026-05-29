import { useState } from 'react';
import { X, Check, Calculator, CreditCard, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useDataStore } from '@/stores/data-store';
import { formatCurrency } from '@/lib/utils';
import confetti from 'canvas-confetti';

export function SubscriptionModal() {
  const isOpen = useUIStore((s) => s.isSubscriptionModalOpen);
  const close = useUIStore((s) => s.closeSubscriptionModal);
  const upgradeOrg = useDataStore((s) => s.upgradeOrganization);

  const [billingCycle, setBillingCycle] = useState<'yearly' | 'monthly'>('yearly');
  const [activeTab, setActiveTab] = useState<'plans' | 'roi'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro' | 'enterprise' | null>(null);
  
  // Checkout flow state
  const [isCheckout, setIsCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // ROI Calculator inputs
  const [monthlyBookings, setMonthlyBookings] = useState(15);
  const [avgBookingValue, setAvgBookingValue] = useState(150000);

  if (!isOpen) return null;

  // ROI Math
  const annualRevenue = monthlyBookings * avgBookingValue * 12;
  const estimatedLeakageSaved = Math.round(annualRevenue * 0.12); // 12% revenue leakage saved
  const adminHoursRecovered = monthlyBookings * 4; // 4 hours saved per booking
  const proAnnualCost = 14999;
  const estimatedRoiRatio = (estimatedLeakageSaved / proAnnualCost).toFixed(1);

  // Pricing Tiers
  const pricingPlans = {
    starter: {
      name: 'Starter',
      description: 'Ideal for independent party halls & single spaces.',
      priceMonthly: 1999,
      priceYearly: 9999,
      benefits: [
        '1 Active Venue/Hall Profile',
        'Unlimited Bookings Calendar',
        'Basic Leads CRM & Follow-ups',
        'Invoice Generation (Plain PDF)',
        'Up to 2 Staff Accounts',
        'Local Offline Backup Sync',
      ]
    },
    pro: {
      name: 'Pro Enterprise',
      description: 'Perfect for premium wedding resorts, banquets, and active managers.',
      priceMonthly: 4999,
      priceYearly: 14999,
      benefits: [
        'Unlimited Halls & Spaces Profiles',
        'Unlimited Bookings Calendar',
        'Advanced CRM with automatic alerts',
        'WhatsApp Automated Receipts & Reminders',
        'Staff Roles & Permissions (RBAC)',
        'CFO Expense tracker & Category Analytics',
        'Discovery Marketplace Premium Listing',
        'Bulk Excel/CSV Import Wizard',
        'Priority Phone Support (24/7)',
      ]
    },
    enterprise: {
      name: 'Enterprise',
      description: 'Custom operations scale for multi-city venues.',
      priceMonthly: 9999,
      priceYearly: 29999,
      benefits: [
        'Multi-Location & Chain Dashboards',
        'Bespoke Billing & GST Tax Layouts',
        'Dedicated Account Operations Manager',
        'Bespoke WhatsApp Notification Packs',
        'Advanced API Data Access & Webhooks',
        'Custom Staff Coaching & Onboarding',
      ]
    }
  };

  const handleSelectPlan = (plan: 'starter' | 'pro' | 'enterprise') => {
    setSelectedPlan(plan);
    setIsCheckout(true);
  };

  const handleFillMockCard = () => {
    setCardNumber('4111 2222 3333 4444');
    setCardExpiry('12/28');
    setCardCvv('123');
    setCardName('Venue Manager');
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    
    setIsProcessing(true);
    // Simulate gateway delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    try {
      await upgradeOrg(selectedPlan);
      setIsProcessing(false);
      setIsCheckout(false);
      close();
      
      // Celebrate!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (err) {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] transition-opacity animate-fade-in" 
        onClick={() => { if (!isProcessing) close(); }}
      />
      
      {/* Modal Dialog */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-xl border border-slate-100 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto transition-all animate-scale-up">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
                {isCheckout ? 'Finalize Subscription Upgrade' : 'Choose Your VenuePro Plan'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isCheckout ? `Upgrading to VenuePro ${pricingPlans[selectedPlan!].name}` : 'Unlock advanced CRM follow-ups, WhatsApp automation, and expense tracking.'}
              </p>
            </div>
            <button 
              onClick={close} 
              disabled={isProcessing}
              className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400 disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Checkout View */}
          {isCheckout ? (
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-8">
              
              {/* Order Summary */}
              <div className="md:col-span-5 space-y-5 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Upgrade Summary</h3>
                
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-baseline">
                    <span className="font-extrabold text-slate-900 text-lg">
                      {pricingPlans[selectedPlan!].name} Plan
                    </span>
                    <span className="text-xs text-indigo-600 font-bold bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full capitalize">
                      {billingCycle}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {pricingPlans[selectedPlan!].description}
                  </p>
                </div>

                <div className="border-t border-slate-200/60 pt-4 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Base Subscription</span>
                    <span>
                      {billingCycle === 'yearly'
                        ? formatCurrency(pricingPlans[selectedPlan!].priceYearly * 100)
                        : formatCurrency(pricingPlans[selectedPlan!].priceMonthly * 100)
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Tax (GST 18%)</span>
                    <span className="text-slate-400">Included (Mock)</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>14-Day Trial Credit</span>
                    <span className="text-emerald-600 font-semibold">-100% discount</span>
                  </div>
                  
                  <div className="border-t border-slate-250 border-dashed pt-4 flex justify-between items-baseline font-bold text-slate-900 mt-2">
                    <span className="text-sm">Total Due Today</span>
                    <span className="text-xl font-extrabold text-slate-950 font-display">
                      ₹0.00
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium leading-normal pt-1.5 text-center">
                    Mock Transaction. You won't be charged. Pay ₹0.00 today to activate your paid subscription profile.
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={() => setIsCheckout(false)}
                  disabled={isProcessing}
                  className="w-full text-center text-xs font-semibold text-indigo-600 hover:text-indigo-700 py-1.5 transition-colors disabled:opacity-50"
                >
                  ← Back to Plans Selection
                </button>
              </div>

              {/* Checkout Billing Form */}
              <div className="md:col-span-7 space-y-6">
                <div className="flex bg-slate-50 border border-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${paymentMethod === 'card' ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-950'}`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Credit / Debit Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${paymentMethod === 'upi' ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-950'}`}
                  >
                    <span className="text-xs">⚡</span>
                    UPI / QR Code
                  </button>
                </div>

                <form onSubmit={handleProcessPayment} className="space-y-4">
                  {paymentMethod === 'card' ? (
                    <div className="space-y-4 animate-fade-in">
                      <div className="flex justify-between items-center">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Card Details</label>
                        <button
                          type="button"
                          onClick={handleFillMockCard}
                          className="text-[11px] font-bold text-indigo-650 hover:underline"
                        >
                          ⚡ Auto-Fill Mock Card
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <input
                          type="text"
                          required
                          placeholder="Card Number (4111 2222 3333 4444)"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all font-mono"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            required
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all font-mono"
                          />
                          <input
                            type="text"
                            required
                            placeholder="CVV"
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all font-mono"
                          />
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="Cardholder Name"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 text-center py-6 bg-slate-50 border border-slate-100 rounded-2xl animate-fade-in flex flex-col items-center">
                      <div className="w-32 h-32 bg-white border border-slate-200/80 rounded-xl p-2 shadow-2xs flex items-center justify-center relative">
                        {/* Mock QR SVG representation */}
                        <svg className="w-28 h-28 text-slate-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M3 3h6v6H3V3zm12 0h6v6h-6V3zM3 15h6v6H3v-6zm14 0h4v4h-4v-4z" />
                          <path d="M7 7h.01M17 7h.01M7 17h.01M12 7v10m-3-5h6" />
                        </svg>
                        <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[0.5px] rounded-xl flex items-center justify-center">
                          <span className="text-[10px] bg-slate-950 text-white font-extrabold px-2 py-0.5 rounded-full shadow-sm">MOCK QR</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-800">Scan QR Code using PhonePe, GPay, or Paytm</span>
                        <p className="text-[10px] text-slate-400 font-medium">Approved immediately upon clicking "Simulate QR Scan Approval" below.</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2.5 items-start p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-[11px] text-indigo-750">
                    <ShieldCheck className="w-4 h-4 text-indigo-650 shrink-0 mt-0.5" />
                    <p className="font-semibold leading-relaxed">
                      Secure Sandbox Gateway. Payments are processed in local demo mode. Upgrading will unlock full, unrestricted dashboard access immediately.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-100 transition-all hover:scale-[1.01] active:scale-99 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isProcessing && <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                    <span>{isProcessing ? 'Processing Transaction...' : paymentMethod === 'card' ? 'Simulate Card Payment' : 'Simulate QR Scan Approval'}</span>
                  </button>
                </form>
              </div>

            </div>
          ) : (
            <>
              {/* Tab Selector */}
              <div className="px-6 py-2 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('plans')}
                    className={`px-4 py-2 text-xs font-bold rounded-full transition-all ${activeTab === 'plans' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                  >
                    Tiers & Benefits
                  </button>
                  <button
                    onClick={() => setActiveTab('roi')}
                    className={`px-4 py-2 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 ${activeTab === 'roi' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    ROI Calculator
                  </button>
                </div>

                {activeTab === 'plans' && (
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-150 p-1 rounded-xl">
                    <button
                      onClick={() => setBillingCycle('yearly')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 ${billingCycle === 'yearly' ? 'bg-white text-indigo-650 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-950'}`}
                    >
                      Yearly Billing
                      <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black px-1.5 py-0.2 rounded-md">Save 20%</span>
                    </button>
                    <button
                      onClick={() => setBillingCycle('monthly')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all ${billingCycle === 'monthly' ? 'bg-white text-indigo-650 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-950'}`}
                    >
                      Monthly
                    </button>
                  </div>
                )}
              </div>

              {/* Plans Tab */}
              {activeTab === 'plans' && (
                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
                  
                  {/* Starter Tier */}
                  <div className="border border-slate-150 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-300 transition-all bg-white relative">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">{pricingPlans.starter.name}</h3>
                        <p className="text-[10px] text-slate-400 font-semibold mt-1">{pricingPlans.starter.description}</p>
                      </div>
                      
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-extrabold text-slate-950 font-display">
                          ₹{billingCycle === 'yearly' ? pricingPlans.starter.priceYearly : pricingPlans.starter.priceMonthly}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          /{billingCycle === 'yearly' ? 'year' : 'month'}
                        </span>
                      </div>

                      <ul className="space-y-2 pt-3 text-[11px] border-t border-slate-50 text-slate-655 font-medium">
                        {pricingPlans.starter.benefits.map((b, idx) => (
                          <li key={idx} className="flex gap-1.5 items-start">
                            <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => handleSelectPlan('starter')}
                      className="w-full py-2.5 mt-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all hover:scale-[1.01] active:scale-99"
                    >
                      Choose Starter Plan
                    </button>
                  </div>

                  {/* Pro Tier (Recommended / Highlighted) */}
                  <div className="border-[2px] border-indigo-650 rounded-2xl p-5 flex flex-col justify-between shadow-xs relative bg-gradient-to-b from-indigo-50/15 to-transparent">
                    {/* Glowing Popular Badge */}
                    <div className="absolute top-0 right-4 -translate-y-1/2 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-[8px] font-black tracking-widest px-2.5 py-0.5 rounded-full uppercase shadow-xs">
                      Recommended
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">{pricingPlans.pro.name}</h3>
                        <p className="text-[10px] text-slate-500 font-semibold mt-1">{pricingPlans.pro.description}</p>
                      </div>
                      
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-extrabold text-slate-950 font-display">
                          ₹{billingCycle === 'yearly' ? pricingPlans.pro.priceYearly : pricingPlans.pro.priceMonthly}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          /{billingCycle === 'yearly' ? 'year' : 'month'}
                        </span>
                      </div>

                      <ul className="space-y-2 pt-3 text-[11px] border-t border-slate-100 text-slate-700 font-semibold">
                        {pricingPlans.pro.benefits.map((b, idx) => (
                          <li key={idx} className="flex gap-1.5 items-start">
                            <Check className="w-3.5 h-3.5 text-indigo-655 shrink-0 mt-0.5" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => handleSelectPlan('pro')}
                      className="w-full py-2.5 mt-5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs hover:scale-[1.01] active:scale-99"
                    >
                      Choose Pro Plan
                    </button>
                  </div>

                  {/* Enterprise Tier */}
                  <div className="border border-slate-150 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-300 transition-all bg-white relative">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">{pricingPlans.enterprise.name}</h3>
                        <p className="text-[10px] text-slate-400 font-semibold mt-1">{pricingPlans.enterprise.description}</p>
                      </div>
                      
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-extrabold text-slate-950 font-display">
                          Custom
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          /bespoke scale
                        </span>
                      </div>

                      <ul className="space-y-2 pt-3 text-[11px] border-t border-slate-50 text-slate-655 font-medium">
                        {pricingPlans.enterprise.benefits.map((b, idx) => (
                          <li key={idx} className="flex gap-1.5 items-start">
                            <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => handleSelectPlan('enterprise')}
                      className="w-full py-2.5 mt-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all hover:scale-[1.01] active:scale-99"
                    >
                      Choose Enterprise Plan
                    </button>
                  </div>

                </div>
              )}

              {/* ROI Calculator Tab */}
              {activeTab === 'roi' && (
                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  
                  {/* Sliders Form */}
                  <div className="md:col-span-6 space-y-6 text-left">
                    <h3 className="text-sm font-extrabold text-slate-800 font-display">ROI Parameter Estimator</h3>
                    
                    <div className="space-y-2.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <span>Bookings Hosted / Month</span>
                        <span className="font-extrabold text-slate-800 text-sm font-display">{monthlyBookings}</span>
                      </div>
                      <input
                        type="range"
                        min={5}
                        max={100}
                        step={5}
                        value={monthlyBookings}
                        onChange={(e) => setMonthlyBookings(Number(e.target.value))}
                        className="w-full accent-indigo-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <span>Avg Booking Ticket Size</span>
                        <span className="font-extrabold text-slate-800 text-sm font-display">{formatCurrency(avgBookingValue * 100)}</span>
                      </div>
                      <input
                        type="range"
                        min={50000}
                        max={1000000}
                        step={25000}
                        value={avgBookingValue}
                        onChange={(e) => setAvgBookingValue(Number(e.target.value))}
                        className="w-full accent-indigo-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1 text-slate-500 text-xs">
                      <span className="font-bold text-slate-700 block">How are these values estimated?</span>
                      <p className="leading-relaxed">
                        Industry standards show that automated CRM follow-ups, payment alerts, and slot security prevent approximately **12%** of bookings from leaking to competitors.
                      </p>
                    </div>
                  </div>

                  {/* Calculations breakdown */}
                  <div className="md:col-span-6 bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-2xl text-white space-y-5 border border-slate-850 shadow-md">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estimated Value Generated</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Annual Leakage Saved</span>
                        <span className="text-2xl font-extrabold text-indigo-400 font-display block mt-1">
                          {formatCurrency(estimatedLeakageSaved * 100)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 border-t border-slate-800/80 pt-3 text-xs">
                        <div>
                          <span className="text-[9px] text-slate-400 block uppercase tracking-wider">Monthly Admin Hours Saved</span>
                          <span className="font-bold text-slate-200 mt-1 block">
                            {adminHoursRecovered} Hours
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block uppercase tracking-wider">Est. Return on Investment</span>
                          <span className="font-bold text-emerald-400 mt-1 block">
                            {estimatedRoiRatio}x Cost
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800/80 space-y-3">
                      <div className="flex gap-2 items-start text-[11px] text-slate-400 font-medium">
                        <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                        <p>
                          Pro plan costs only ₹14,999/year. Upgrade now to secure your venue leaks.
                        </p>
                      </div>
                      <button
                        onClick={() => handleSelectPlan('pro')}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                      >
                        Upgrade to Pro Now
                      </button>
                    </div>
                  </div>

                </div>
              )}
            </>
          )}

        </div>
      </div>
    </>
  );
}
