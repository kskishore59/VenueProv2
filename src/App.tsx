import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthGuard } from '@/components/shared/AuthGuard';
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
import Dashboard from '@/pages/Dashboard';
import Bookings from '@/pages/Bookings';
import Leads from '@/pages/Leads';
import Customers from '@/pages/Customers';
import Payments from '@/pages/Payments';
import Settings from '@/pages/Settings';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';

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
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Workspace Routes */}
            <Route element={<AuthGuard />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/leads" element={<Leads />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>

            {/* Catch-all Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Global Drawers & Modals */}
          <ErrorBoundary fallback={(error, reset) => <ErrorFallback error={error} reset={reset} variant="widget" title="Quick Add Booking Failed" />}><QuickAddBooking /></ErrorBoundary>
          <ErrorBoundary fallback={(error, reset) => <ErrorFallback error={error} reset={reset} variant="widget" title="Booking Detail Failed" />}><BookingDrawer /></ErrorBoundary>
          <ErrorBoundary fallback={(error, reset) => <ErrorFallback error={error} reset={reset} variant="widget" title="Edit Booking Failed" />}><EditBookingDrawer /></ErrorBoundary>
          <ErrorBoundary fallback={(error, reset) => <ErrorFallback error={error} reset={reset} variant="widget" title="Record Payment Failed" />}><RecordPaymentModal /></ErrorBoundary>
          <ErrorBoundary fallback={(error, reset) => <ErrorFallback error={error} reset={reset} variant="widget" title="Lead Detail Failed" />}><LeadDrawer /></ErrorBoundary>
          <ErrorBoundary fallback={(error, reset) => <ErrorFallback error={error} reset={reset} variant="widget" title="Add Lead Failed" />}><AddLeadForm /></ErrorBoundary>
          <ErrorBoundary fallback={(error, reset) => <ErrorFallback error={error} reset={reset} variant="widget" title="Add Customer Failed" />}><AddCustomerDrawer /></ErrorBoundary>
          <ErrorBoundary fallback={(error, reset) => <ErrorFallback error={error} reset={reset} variant="widget" title="Add Hall Failed" />}><AddHallModal /></ErrorBoundary>
          <ErrorBoundary fallback={(error, reset) => <ErrorFallback error={error} reset={reset} variant="widget" title="Confirm Dialog Failed" />}><ConfirmDialog /></ErrorBoundary>

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

