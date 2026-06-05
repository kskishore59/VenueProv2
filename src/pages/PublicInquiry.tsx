import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, Phone, Mail, User, MessageSquare, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useDataStore } from '@/stores/data-store';
import confetti from 'canvas-confetti';

export default function PublicInquiry() {
  const [searchParams] = useSearchParams();
  const orgId = searchParams.get('org');

  const [orgName, setOrgName] = useState<string>('Partner Venue');
  const [loadingOrg, setLoadingOrg] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [eventType, setEventType] = useState('wedding');
  const [guestCount, setGuestCount] = useState('');
  const [tentativeDate, setTentativeDate] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchOrgName() {
      if (!orgId) {
        setOrgName('VenuePro Partner Venue');
        setLoadingOrg(false);
        return;
      }

      if (!isSupabaseConfigured()) {
        // Mock mode: fetch from local store if same org
        const localOrg = useDataStore.getState().organization;
        if (localOrg && localOrg.id === orgId) {
          setOrgName(localOrg.name);
        } else {
          setOrgName('Alpha Grand Palace (Mock)');
        }
        setLoadingOrg(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('organizations')
          .select('name')
          .eq('id', orgId)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setOrgName(data.name);
        }
      } catch (err) {
        console.warn('Could not fetch public org name, falling back:', err);
        setOrgName('VenuePro Partner Venue');
      } finally {
        setLoadingOrg(false);
      }
    }

    fetchOrgName();
  }, [orgId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setErrorMessage('Name and phone number are required.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    const payload = {
      org_id: orgId || 'org-demo-001', // fallback
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || null,
      event_type: eventType,
      tentative_date: tentativeDate || null,
      guest_count: guestCount ? parseInt(guestCount, 10) : null,
      notes: message.trim() || null,
      source: 'website' as const,
      status: 'new' as const
    };

    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.from('leads').insert(payload);
        if (error) throw error;
      } else {
        // Mock Mode: Write to LocalStorage
        const currentLeads = useDataStore.getState().leads;
        const newLead = {
          ...payload,
          id: self.crypto.randomUUID(),
          budget_min_paise: null,
          budget_max_paise: null,
          assigned_to: null,
          follow_up_date: null,
          hall_preference: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        const updatedLeads = [newLead, ...currentLeads];
        useDataStore.setState({ leads: updatedLeads });
        localStorage.setItem('vp_leads', JSON.stringify(updatedLeads));
      }

      setSubmitted(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 }
      });
    } catch (err: any) {
      console.error('Failed to submit public inquiry:', err);
      setErrorMessage(err.message || 'Something went wrong. Please check your inputs and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingOrg) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading form configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-100 flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-150 shadow-xl overflow-hidden relative">
        {/* Banner */}
        <div className="bg-gradient-to-r from-brand-600 to-indigo-600 px-6 py-8 text-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Booking Request
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">{orgName}</h2>
          <p className="text-xs text-white/80 mt-1 font-medium">Please enter your event details below, and our team will get in touch with you shortly.</p>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {errorMessage && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-800 text-xs font-semibold flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Your Name *</label>
                  <div className="relative">
                    <User className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Contact Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Phone Number *</label>
                    <div className="relative">
                      <Phone className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        placeholder="9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Event Type & Guests */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Event Type</label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-500 outline-none transition-all bg-white"
                    >
                      <option value="wedding">Wedding</option>
                      <option value="reception">Reception</option>
                      <option value="engagement">Engagement</option>
                      <option value="sangeet">Sangeet/Haldi</option>
                      <option value="birthday">Birthday Party</option>
                      <option value="corporate">Corporate Event</option>
                      <option value="conference">Conference</option>
                      <option value="anniversary">Anniversary</option>
                      <option value="other">Other Celebration</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Estimated Guests</label>
                    <div className="relative">
                      <Users className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        placeholder="e.g. 250"
                        value={guestCount}
                        onChange={(e) => setGuestCount(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Tentative Date */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tentative Event Date</label>
                  <div className="relative">
                    <Calendar className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="date"
                      value={tentativeDate}
                      onChange={(e) => setTentativeDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Additional Details</label>
                  <div className="relative">
                    <MessageSquare className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3.5" />
                    <textarea
                      placeholder="Tell us about specific decor, catering, or timeline requirements..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-500 outline-none transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 active:scale-[0.98] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-55 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting && <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                  {submitting ? 'Submitting Inquiry...' : 'Submit Inquiry'}
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center space-y-4"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-500">
                  <CheckCircle2 className="w-10 h-10 animate-bounce" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-extrabold text-slate-900">Inquiry Received! 🎉</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Thank you for contacting us. Your details have been securely logged, and our events team will contact you shortly to discuss planning.
                  </p>
                </div>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2 rounded-xl border border-slate-250 text-xs font-bold text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"
                >
                  Submit Another Request
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-bold select-none">
          <span>Powered by</span>
          <span className="text-brand-600 font-black">VenuePro V2</span>
        </div>
      </div>
    </div>
  );
}
