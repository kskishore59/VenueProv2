import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { useDataStore } from '@/stores/data-store';

export function AuthGuard() {
  const user = useAuthStore((s) => s.user);
  const sessionChecked = useAuthStore((s) => s.sessionChecked);
  const authLoading = useAuthStore((s) => s.isLoading);
  const dataLoading = useDataStore((s) => s.isLoading);
  const location = useLocation();

  // Show premium loader if we are checking the session or downloading the initial workspace data
  if (!sessionChecked || authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
        <div className="relative w-full max-w-sm bg-white/70 backdrop-blur-md border border-slate-200 shadow-2xl rounded-3xl p-8 text-center space-y-6 animate-fade-in">
          <div className="relative w-16 h-16 mx-auto bg-brand-50 rounded-full border border-brand-100 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-900 animate-pulse">
              {!sessionChecked ? 'Checking Security Session' : 'Synchronizing VenuePro'}
            </h3>
            <p className="text-xs text-gray-400">
              {!sessionChecked 
                ? 'Securing connection and identifying active user...' 
                : 'Downloading event register, customer entries, and financial status...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If checked and no user session, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated: mount children routes
  return <Outlet />;
}
