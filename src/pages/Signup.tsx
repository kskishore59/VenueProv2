import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { Mail, Lock, Eye, EyeOff, Loader2, User, Building2, ShieldCheck, AlertTriangle, Inbox } from 'lucide-react';
import { toast } from 'sonner';

export default function Signup() {
  const navigate = useNavigate();
  const signUp = useAuthStore((s) => s.signUp);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const user = useAuthStore((s) => s.user);
  const sessionChecked = useAuthStore((s) => s.sessionChecked);

  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(emailParam);
  const [orgName, setOrgName] = useState(emailParam ? 'Accepting Invite' : '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [localError, setLocalError] = useState<string | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  useEffect(() => {
    if (sessionChecked && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [sessionChecked, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!fullName.trim()) {
      setLocalError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setLocalError('Please enter a valid email address.');
      return;
    }
    if (!orgName.trim()) {
      setLocalError('Please enter your Venue/Organization name.');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    try {
      const res = await signUp(email, password, fullName, orgName);
      
      if (res.sessionCreated) {
        toast.success('Organization registered successfully! 🎉', {
          description: `Logged in as ${fullName} @ ${orgName}`,
        });
        navigate('/dashboard');
      } else {
        // If email confirmation is required by Supabase configuration
        setRegisteredEmail(email);
        toast.info('Verification link sent! 📧', {
          description: 'Please check your email to complete registration.',
        });
      }
    } catch (err: any) {
      console.error(err);
      // Errors are also captured in useAuthStore.error
    }
  };

  // Render Verification Success Screen
  if (registeredEmail) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Background Glows */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-brand-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />

        <div className="w-full max-w-[460px] z-10 animate-fade-in text-center">
          <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] shadow-2xl rounded-3xl p-8 relative">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            <div className="w-16 h-16 rounded-full bg-brand-500/15 flex items-center justify-center border border-brand-500/30 mx-auto mb-6">
              <Inbox className="w-8 h-8 text-brand-400" />
            </div>

            <h2 className="text-2xl font-extrabold text-white mb-2">Check Your Inbox</h2>
            <p className="text-sm text-slate-400 mb-6">
              We've sent a verification link to <strong className="text-brand-300">{registeredEmail}</strong>.
            </p>

            <div className="bg-slate-900/50 rounded-2xl border border-white/[0.06] p-4 text-left text-xs text-slate-400 space-y-2 mb-6">
              <p className="font-semibold text-slate-200">What's next?</p>
              <ul className="list-disc pl-4 space-y-1.5">
                <li>Click the confirmation link in the email to activate your account.</li>
                <li>Your venue database, settings, and tables will be instantly provisioned.</li>
                <li>You'll then be redirected to log into your dashboard.</li>
              </ul>
            </div>

            <Link
              to="/login"
              className="w-full flex items-center justify-center px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 active:scale-[0.98] text-white font-bold text-sm transition-all"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-brand-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />

      {/* Decorative floating grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="w-full max-w-[460px] z-10 animate-fade-in">
        {/* Logo / Title */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/20 border border-white/10 mb-4 animate-pulse-soft">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-1.5">
            VenuePro <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30">V2</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Register your venue and start managing events</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] shadow-2xl rounded-3xl p-8 relative">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          <h2 className="text-xl font-bold text-white mb-5">Create Account</h2>

          {/* Alert Messages */}
          {(localError || error) && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/20 text-rose-200 text-xs flex items-start gap-2.5 animate-fade-in">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
              <span>{localError || error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Rahul Sharma"
                  value={fullName}
                  disabled={isLoading}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (localError) setLocalError(null);
                  }}
                  className="w-full bg-slate-900/50 border border-white/[0.08] text-white pl-11 pr-4 py-2.5 rounded-xl text-sm placeholder-slate-600 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="rahul@myvenue.com"
                  value={email}
                  disabled={isLoading || !!emailParam}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (localError) setLocalError(null);
                  }}
                  className="w-full bg-slate-900/50 border border-white/[0.08] text-white pl-11 pr-4 py-2.5 rounded-xl text-sm placeholder-slate-600 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Venue / Organization Name</label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Royal Heritage Banquet"
                  value={orgName}
                  disabled={isLoading || !!emailParam}
                  onChange={(e) => {
                    setOrgName(e.target.value);
                    if (localError) setLocalError(null);
                  }}
                  className="w-full bg-slate-900/50 border border-white/[0.08] text-white pl-11 pr-4 py-2.5 rounded-xl text-sm placeholder-slate-600 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all disabled:opacity-50"
                />
              </div>
              {emailParam && (
                <p className="text-[10px] text-brand-400 mt-1 font-medium">
                  Joining existing team organization automatically.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    disabled={isLoading}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (localError) setLocalError(null);
                    }}
                    className="w-full bg-slate-900/50 border border-white/[0.08] text-white pl-11 pr-4 py-2.5 rounded-xl text-sm placeholder-slate-600 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Confirm</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    disabled={isLoading}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (localError) setLocalError(null);
                    }}
                    className="w-full bg-slate-900/50 border border-white/[0.08] text-white pl-11 pr-11 py-2.5 rounded-xl text-sm placeholder-slate-600 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed text-white font-bold text-sm transition-all shadow-lg shadow-brand-600/10 mt-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <span>Register Venue</span>
              )}
            </button>
          </form>

          {/* Footer inside Card */}
          <div className="mt-6 text-center text-xs text-slate-400 border-t border-white/[0.06] pt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold hover:underline">
              Sign In instead
            </Link>
          </div>
        </div>

        {/* Security badge at bottom */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 mt-5">
          <ShieldCheck className="w-4 h-4" />
          <span>Automatic organization profile creation on SQL trigger</span>
        </div>
      </div>
    </div>
  );
}
