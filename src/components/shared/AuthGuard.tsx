import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { useDataStore } from '@/stores/data-store';
import { GlobalLoader } from './GlobalLoader';

export function AuthGuard() {
  const user = useAuthStore((s) => s.user);
  const sessionChecked = useAuthStore((s) => s.sessionChecked);
  const authLoading = useAuthStore((s) => s.isLoading);
  const dataLoading = useDataStore((s) => s.isLoading);
  const location = useLocation();

  // Show premium loader if we are checking the session or downloading the initial workspace data
  if (!sessionChecked || authLoading || dataLoading) {
    return (
      <GlobalLoader
        message={!sessionChecked ? 'Checking Security Session' : 'Synchronizing VenuePro'}
        subtitle={
          !sessionChecked
            ? 'Securing connection and identifying active user...'
            : 'Downloading event register, customer entries, and financial status...'
        }
      />
    );
  }

  // If checked and no user session, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If onboarding is not completed, redirect to /onboarding
  const isOnboardingPage = location.pathname === '/onboarding';
  
  if (user.email === 'admin@shreemangalam.com') {
    if (!localStorage.getItem('venuepro_onboarding_completed')) {
      localStorage.setItem('venuepro_onboarding_completed', 'true');
    }
  }

  const isCompleted = localStorage.getItem('venuepro_onboarding_completed') === 'true';
  
  if (!isCompleted && !isOnboardingPage) {
    return <Navigate to="/onboarding" replace />;
  }

  // Authenticated: mount children routes
  return <Outlet />;
}
