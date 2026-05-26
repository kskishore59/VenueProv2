import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { GlobalLoader } from '@/components/shared/GlobalLoader';
import { QuickAddBooking } from '@/components/booking/QuickAddBooking';
import { BookingDrawer } from '@/components/booking/BookingDrawer';
import { EditBookingDrawer } from '@/components/booking/EditBookingDrawer';
import { RecordPaymentModal } from '@/components/payments/RecordPaymentModal';
import { LeadDrawer } from '@/components/leads/LeadDrawer';
import { AddLeadForm } from '@/components/leads/AddLeadForm';
import { AddCustomerDrawer } from '@/components/customers/AddCustomerDrawer';
import { AddHallModal } from '@/components/settings/AddHallModal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { ErrorFallback } from '@/components/shared/ErrorFallback';

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Bookings = lazy(() => import('@/pages/Bookings'));
const Leads = lazy(() => import('@/pages/Leads'));
const Customers = lazy(() => import('@/pages/Customers'));
const Payments = lazy(() => import('@/pages/Payments'));
const Settings = lazy(() => import('@/pages/Settings'));
const Login = lazy(() => import('@/pages/Login'));
const Signup = lazy(() => import('@/pages/Signup'));
const Venues = lazy(() => import('@/pages/Venues'));
const Expenses = lazy(() => import('@/pages/Expenses'));
const Import = lazy(() => import('@/pages/Import'));
const Help = lazy(() => import('@/pages/Help'));
const Landing = lazy(() => import('@/pages/Landing'));

import { FeedbackWidget } from '@/components/shared/FeedbackWidget';
import { ReceiptModal } from '@/components/payments/ReceiptModal';
import { EditLeadDrawer } from '@/components/leads/EditLeadDrawer';
import { EditCustomerDrawer } from '@/components/customers/EditCustomerDrawer';
import { EditPaymentModal } from '@/components/payments/EditPaymentModal';
import { PermissionGuard } from '@/components/shared/PermissionGuard';
import { OnboardingTour } from '@/components/shared/OnboardingTour';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});

export default function App() {
  const checkSession = useAuthStore((s) => s.checkSession);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary
        fallback={(error, reset) => (
          <ErrorFallback
            error={error}
            reset={reset}
            variant="full"
            title="Application Error"
            message="VenuePro experienced a critical startup or routing error. We apologize for the inconvenience. Please try reloading."
          />
        )}
      >
        <BrowserRouter>
          <Suspense
            fallback={
              <GlobalLoader message="Loading VenuePro..." />
            }
          >
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected Workspace Routes */}
              <Route element={<AuthGuard />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/bookings" element={<PermissionGuard resource="bookings"><Bookings /></PermissionGuard>} />
                  <Route path="/leads" element={<PermissionGuard resource="leads"><Leads /></PermissionGuard>} />
                  <Route path="/customers" element={<PermissionGuard resource="customers"><Customers /></PermissionGuard>} />
                  <Route path="/payments" element={<PermissionGuard resource="payments"><Payments /></PermissionGuard>} />
                  <Route path="/venues" element={<PermissionGuard resource="bookings"><Venues /></PermissionGuard>} />
                  <Route path="/expenses" element={<PermissionGuard resource="expenses"><Expenses /></PermissionGuard>} />
                  <Route path="/import" element={<PermissionGuard resource="settings"><Import /></PermissionGuard>} />
                  <Route path="/settings" element={<PermissionGuard resource="settings"><Settings /></PermissionGuard>} />
                  <Route path="/help" element={<Help />} />
                </Route>
              </Route>

              {/* Catch-all Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>

          {/* Global Drawers & Modals */}
          <ErrorBoundary fallback={(error, reset) => <ErrorFallback error={error} reset={reset} variant="widget" title="Quick Add Booking Failed" />}><QuickAddBooking /></ErrorBoundary>
          <ErrorBoundary fallback={(error, reset) => <ErrorFallback error={error} reset={reset} variant="widget" title="Booking Detail Failed" />}><BookingDrawer /></ErrorBoundary>
          <ErrorBoundary fallback={(error, reset) => <ErrorFallback error={error} reset={reset} variant="widget" title="Edit Booking Failed" />}><EditBookingDrawer /></ErrorBoundary>
          <ErrorBoundary fallback={(error, reset) => <ErrorFallback error={error} reset={reset} variant="widget" title="Record Payment Failed" />}><RecordPaymentModal /></ErrorBoundary>
          <ErrorBoundary fallback={(error, reset) => <ErrorFallback error={error} reset={reset} variant="widget" title="Lead Detail Failed" />}><LeadDrawer /></ErrorBoundary>
          <ErrorBoundary fallback={(error, reset) => <ErrorFallback error={error} reset={reset} variant="widget" title="Edit Lead Failed" />}><EditLeadDrawer /></ErrorBoundary>
          <ErrorBoundary fallback={(error, reset) => <ErrorFallback error={error} reset={reset} variant="widget" title="Add Lead Failed" />}><AddLeadForm /></ErrorBoundary>
          <ErrorBoundary fallback={(error, reset) => <ErrorFallback error={error} reset={reset} variant="widget" title="Add Customer Failed" />}><AddCustomerDrawer /></ErrorBoundary>
          <ErrorBoundary fallback={(error, reset) => <ErrorFallback error={error} reset={reset} variant="widget" title="Edit Customer Failed" />}><EditCustomerDrawer /></ErrorBoundary>
          <ErrorBoundary fallback={(error, reset) => <ErrorFallback error={error} reset={reset} variant="widget" title="Edit Payment Failed" />}><EditPaymentModal /></ErrorBoundary>
          <ErrorBoundary fallback={(error, reset) => <ErrorFallback error={error} reset={reset} variant="widget" title="Add Hall Failed" />}><AddHallModal /></ErrorBoundary>
          <ErrorBoundary fallback={(error, reset) => <ErrorFallback error={error} reset={reset} variant="widget" title="Confirm Dialog Failed" />}><ConfirmDialog /></ErrorBoundary>
          <ErrorBoundary fallback={(error, reset) => <ErrorFallback error={error} reset={reset} variant="widget" title="Receipt Generator Failed" />}><ReceiptModal /></ErrorBoundary>
          <ErrorBoundary fallback={(error, reset) => <ErrorFallback error={error} reset={reset} variant="widget" title="Feedback Widget Failed" />}><FeedbackWidget /></ErrorBoundary>
          <ErrorBoundary fallback={(error, reset) => <ErrorFallback error={error} reset={reset} variant="widget" title="Onboarding Tour Failed" />}><OnboardingTour /></ErrorBoundary>

          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                borderRadius: '14px',
                fontSize: '13px',
                fontWeight: 500,
                fontFamily: "'Inter', system-ui, sans-serif",
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
              },
            }}
            richColors
            closeButton
          />
        </BrowserRouter>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

