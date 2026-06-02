import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Mail, Lock, Eye, EyeOff, Loader2, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import venueProLogo from '@/assets/venueProLogo.svg';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const signIn = useAuthStore((s) => s.signIn);
  const resendVerificationEmail = useAuthStore((s) => s.resendVerificationEmail);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const user = useAuthStore((s) => s.user);
  const sessionChecked = useAuthStore((s) => s.sessionChecked);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [resendingEmail, setResendingEmail] = useState(false);

  const isMockMode = !isSupabaseConfigured();

  const handleResendConfirmation = async () => {
    if (!email) {
      setLocalError('Please enter your email address to resend confirmation.');
      return;
    }
    setResendingEmail(true);
    try {
      await resendVerificationEmail(email);
      toast.success('Verification email resent! 📧', {
        description: `Check your inbox at ${email}`,
      });
      clearError();
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend verification email.');
    } finally {
      setResendingEmail(false);
    }
  };
  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (sessionChecked && user) {
      navigate(from, { replace: true });
    }
  }, [sessionChecked, user, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email) {
      setLocalError('Please enter your email address.');
      return;
    }
    if (!password) {
      setLocalError('Please enter your password.');
      return;
    }
    if (!email.includes('@')) {
      setLocalError('Please enter a valid email address.');
      return;
    }

    try {
      await signIn(email, password);
      toast.success('Welcome back! login successful. 🔑', {
        description: `Logged in as ${email}`,
      });
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error(err);
      // Errors are also captured in useAuthStore.error
    }
  };

  const handleDemoLogin = async () => {
    setEmail('demo@venuepro.com');
    setPassword('demo1234');

    // Slight timeout so user sees it autofill before submitting
    setTimeout(async () => {
      try {
        await signIn('demo@venuepro.com', 'demo1234');
        toast.success('Welcome back to Demo Mode! 🚀', {
          description: 'Logged in with offline mock workspace data.',
        });
        navigate(from, { replace: true });
      } catch (err) {
        toast.error('Demo login failed');
      }
    }, 400);
  };

  const handleSuperAdminDemoLogin = async () => {
    setEmail('superadmin@venuepro.in');
    setPassword('superadmin1234');

    // Slight timeout so user sees it autofill before submitting
    setTimeout(async () => {
      try {
        await signIn('superadmin@venuepro.in', 'superadmin1234');
        toast.success('Welcome back, Super Admin! 🛡️', {
          description: 'Logged in with system-wide administration privileges.',
        });
        navigate(from, { replace: true });
      } catch (err) {
        toast.error('Super Admin login failed');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 relative overflow-hidden font-sans bg-grid-pattern">
      {/* Decorative luxury gradient ambient blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] aspect-square rounded-full bg-gradient-to-tr from-brand-100/30 to-purple-100/20 blur-[120px] -z-10 animate-pulse-slow" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[45%] aspect-square rounded-full bg-gradient-to-tr from-indigo-100/30 to-brand-100/20 blur-[120px] -z-10 animate-pulse-slow" style={{ animationDelay: '3s' }} />

      <div className="w-full max-w-[440px] z-10 animate-fade-in">
        {/* Logo / Title */}
        <div className="flex flex-col items-center mb-8">
          <img
            src={venueProLogo}
            alt="VenuePro Logo"
            className="h-20 w-auto object-contain mb-3"
          />
          <p className="text-md text-slate-500 mt-1 font-medium">Premium Indian Venue Management System</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-3xl p-8 relative">

          <h2 className="text-xl font-bold text-slate-900 font-display mb-6">Sign In</h2>

          {/* Alert Messages */}
          {localError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-800 text-xs flex items-start gap-2.5 animate-fade-in">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-500 mt-0.5" />
              <span>{localError}</span>
            </div>
          )}

          {error && (
            error.includes('Email not confirmed') ? (
              <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-800 text-xs flex flex-col gap-2.5 animate-fade-in">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-500 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-amber-900">Email Verification Required</span>
                    <span className="text-amber-700">Please check your inbox to confirm your email before signing in.</span>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={resendingEmail || isLoading}
                  onClick={handleResendConfirmation}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-amber-100 text-amber-900 hover:bg-amber-200 active:scale-95 disabled:opacity-50 font-semibold text-xs transition-all border border-amber-200"
                >
                  {resendingEmail ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Resending...</span>
                    </>
                  ) : (
                    <span>Resend Verification Email</span>
                  )}
                </button>
              </div>
            ) : (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-800 text-xs flex items-start gap-2.5 animate-fade-in">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-500 mt-0.5" />
                <span>{error}</span>
              </div>
            )
          )}

          {/* Mock Mode Alert Banner */}
          {isMockMode && (
            <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-800 text-xs flex flex-col gap-2 animate-fade-in">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-500 mt-0.5" />
                <div>
                  <span className="font-semibold block text-amber-900">Local Mock Mode Active</span>
                  <span className="text-amber-700">Supabase credentials are not configured. You can select either administrative tier below to preview:</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-1.5">
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-amber-100 text-amber-900 hover:bg-amber-200 active:scale-[0.98] font-bold text-[11px] transition-all border border-amber-250"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Demo Venue Owner</span>
                </button>
                <button
                  type="button"
                  onClick={handleSuperAdminDemoLogin}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-indigo-100 text-indigo-900 hover:bg-indigo-200 active:scale-[0.98] font-bold text-[11px] transition-all border border-indigo-200"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Super Admin Panel</span>
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="name@venue.com"
                  value={email}
                  disabled={isLoading}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (localError) setLocalError(null);
                  }}
                  className="w-full bg-slate-50 border border-slate-100 text-slate-800 pl-11 pr-4 py-3 rounded-xl text-sm placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  disabled={isLoading}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (localError) setLocalError(null);
                  }}
                  className="w-full bg-slate-50 border border-slate-100 text-slate-800 pl-11 pr-11 py-3 rounded-xl text-sm placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 hover:scale-103 active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed text-white font-bold text-sm transition-all shadow-md shadow-brand-200 mt-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Footer inside Card */}
          <div className="mt-6 text-center text-sm text-slate-500 border-t border-slate-50 pt-5">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-600 hover:text-brand-700 font-semibold hover:underline">
              Create one now
            </Link>
          </div>
        </div>

        {/* Security badge at bottom */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 mt-6">
          <ShieldCheck className="w-4 h-4" />
          <span>Secured with Supabase SSL/TLS • Row-Level Access Policies</span>
        </div>
      </div>
    </div>
  );
}
