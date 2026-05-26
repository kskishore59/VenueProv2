import { useEffect, useState } from 'react';
import { Outlet, useLocation, NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { useDataStore } from '@/stores/data-store';
import { hasPermission } from '@/lib/permissions';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { ErrorFallback } from '@/components/shared/ErrorFallback';
import { GlobalLoader } from '@/components/shared/GlobalLoader';
import { LayoutDashboard, CalendarDays, IndianRupee, Settings, Plus, PhoneIncoming, Users, HelpCircle, Receipt } from 'lucide-react';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/dashboard': 'Dashboard',
  '/bookings': 'Bookings Calendar',
  '/leads': 'Leads & Inquiries',
  '/customers': 'Customers Directory',
  '/payments': 'Payments Ledger',
  '/venues': 'Venue Configuration',
  '/expenses': 'Expense Tracker',
  '/import': 'Import Workspace Data',
  '/settings': 'Settings & Workspace',
  '/help': 'Help Center & Guides',
};

function SkeletonPage() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 bg-gray-200 skeleton" />
        <div className="h-4 w-72 bg-gray-200 skeleton" />
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="h-28 bg-white border border-gray-100 rounded-2xl p-5 skeleton" />
        <div className="h-28 bg-white border border-gray-100 rounded-2xl p-5 skeleton" />
        <div className="h-28 bg-white border border-gray-100 rounded-2xl p-5 skeleton" />
      </div>

      {/* List / Table Skeleton */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <div className="h-6 w-32 bg-gray-200 skeleton" />
        <div className="space-y-3 pt-2">
          <div className="h-14 bg-gray-50 rounded-xl skeleton" />
          <div className="h-14 bg-gray-50 rounded-xl skeleton" />
          <div className="h-14 bg-gray-50 rounded-xl skeleton" />
          <div className="h-14 bg-gray-50 rounded-xl skeleton" />
        </div>
      </div>
    </div>
  );
}

export function AppLayout() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const location = useLocation();

  const role = useAuthStore((s) => s.profile?.role);
  const organization = useDataStore((s) => s.organization);

  const openQuickAdd = useUIStore((s) => s.openQuickAdd);
  const openAddLead = useUIStore((s) => s.openAddLead);

  const canCreateBooking = hasPermission(role, 'bookings', 'create', organization?.settings);
  const canCreateLead = hasPermission(role, 'leads', 'create', organization?.settings);
  const showQuickAdd = canCreateBooking || canCreateLead;

  const [transitionLoading, setTransitionLoading] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const dataLoading = useDataStore((s) => s.isLoading);

  useEffect(() => {
    const title = pageTitles[location.pathname] || 'VenuePro';
    document.title = `${title} | VenuePro`;
  }, [location.pathname]);

  // Handle route page transition loading timers
  useEffect(() => {
    setQuickAddOpen(false);
    setTransitionLoading(true);
    const isDataLoaded = !dataLoading;
    const targetDuration = isDataLoaded ? 0 : 500;
    const startTime = Date.now();

    let timer: any;

    if (dataLoading) {
      const interval = setInterval(() => {
        if (!useDataStore.getState().isLoading) {
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(0, 500 - elapsed);
          setTimeout(() => {
            setTransitionLoading(false);
          }, remaining);
          clearInterval(interval);
        }
      }, 50);
      return () => clearInterval(interval);
    } else {
      timer = setTimeout(() => {
        setTransitionLoading(false);
      }, targetDuration);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  // Build the 4 dynamic navigation tabs based on permissions
  const getMobileTabs = () => {
    const tabs = [];

    // Tab 1: Dashboard is always first
    tabs.push({ path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard });

    // Tab 2: Bookings (default) / Leads / Customers
    if (hasPermission(role, 'bookings', 'read', organization?.settings)) {
      tabs.push({ path: '/bookings', label: 'Bookings', icon: CalendarDays });
    } else if (hasPermission(role, 'leads', 'read', organization?.settings)) {
      tabs.push({ path: '/leads', label: 'Inquiries', icon: PhoneIncoming });
    } else {
      tabs.push({ path: '/customers', label: 'Customers', icon: Users });
    }

    // Tab 4: Payments (default) / Expenses / Customers
    if (hasPermission(role, 'payments', 'read', organization?.settings)) {
      tabs.push({ path: '/payments', label: 'Payments', icon: IndianRupee });
    } else if (hasPermission(role, 'expenses', 'read', organization?.settings)) {
      tabs.push({ path: '/expenses', label: 'Expenses', icon: Receipt });
    } else {
      tabs.push({ path: '/customers', label: 'Customers', icon: Users });
    }

    // Tab 5: Settings (default) / Help
    if (hasPermission(role, 'settings', 'read', organization?.settings)) {
      tabs.push({ path: '/settings', label: 'Settings', icon: Settings });
    } else {
      tabs.push({ path: '/help', label: 'Help', icon: HelpCircle });
    }

    return tabs;
  };

  const mobileTabs = getMobileTabs();

  const Tab1Icon = mobileTabs[0]?.icon;
  const Tab2Icon = mobileTabs[1]?.icon;
  const Tab3Icon = mobileTabs[2]?.icon;
  const Tab4Icon = mobileTabs[3]?.icon;

  const showLoader = transitionLoading || dataLoading;
  const showSkeleton = dataLoading;

  return (
    <div className="min-h-screen bg-[#e6e6fa]/10">
      <Sidebar />
      <Header />
      <main
        className={cn(
          'pt-16 pb-20 md:pb-0 min-h-screen transition-all duration-300',
          collapsed ? 'md:pl-[72px]' : 'md:pl-[260px]',
        )}
      >
        <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
          <ErrorBoundary
            fallback={(error, reset) => (
              <ErrorFallback
                error={error}
                reset={reset}
                variant="full"
                title="Page Rendering Error"
                message="We encountered an issue rendering this section of VenuePro. You can retry or navigate to a different section using the sidebar."
              />
            )}
          >
            {showSkeleton ? <SkeletonPage /> : <Outlet />}
          </ErrorBoundary>
        </div>
      </main>

      {/* Centered Route Loader Spinner Overlay */}
      {showLoader && (
        <GlobalLoader variant="overlay" message="Loading page..." />
      )}

      {/* Mobile Bottom Navigation Bar (Application Bar style) */}
      <div id="tour-mobile-nav" className="fixed z-50 w-[calc(100%-1.5rem)] max-w-lg h-18 -translate-x-1/2 bg-white backdrop-blur-md border border-gray-150 rounded-full bottom-4 left-1/2 shadow-xl md:hidden p-2">
        <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-small">
          {/* Tab 1 */}
          {mobileTabs[0] && (
            <NavLink
              to={mobileTabs[0].path}
              className={({ isActive }) => cn(
                "inline-flex flex-col items-center justify-center px-2 rounded-s-full group transition-all duration-200 hover:bg-gray-50/55 active:scale-98",
                isActive ? "text-brand-600 font-bold" : "text-gray-400 hover:text-brand-600"
              )}
            >
              {Tab1Icon && <Tab1Icon className="w-5 h-5 mb-0.5" />}
              <span className="text-[9px] font-bold">{mobileTabs[0].label}</span>
            </NavLink>
          )}

          {/* Tab 2 */}
          {mobileTabs[1] && (
            <NavLink
              to={mobileTabs[1].path}
              className={({ isActive }) => cn(
                "inline-flex flex-col items-center justify-center px-2 group transition-all duration-200 hover:bg-gray-50/55 active:scale-98",
                isActive ? "text-brand-600 font-bold" : "text-gray-400 hover:text-brand-600"
              )}
            >
              {Tab2Icon && <Tab2Icon className="w-5 h-5 mb-0.5" />}
              <span className="text-[9px] font-bold">{mobileTabs[1].label}</span>
            </NavLink>
          )}

          {/* Centered CTA Button */}
          <div className="flex items-center justify-center relative">
            {showQuickAdd ? (
              <>
                <button
                  type="button"
                  id="tour-mobile-quick-add"
                  onClick={() => setQuickAddOpen(!quickAddOpen)}
                  className="inline-flex items-center justify-center w-11 h-11 font-bold bg-brand-600 text-white rounded-full hover:bg-brand-700 active:scale-95 transition-all shadow-md focus:outline-none focus:ring-4 focus:ring-brand-200"
                  title="Quick Add"
                >
                  <Plus className={cn("w-5 h-5 transition-transform duration-200", quickAddOpen && "rotate-45")} />
                  <span className="sr-only">New booking/lead</span>
                </button>

                {quickAddOpen && (
                  <>
                    {/* Backdrop Overlay to close */}
                    <div
                      className="fixed inset-0 z-40 bg-black/5 md:hidden"
                      onClick={() => setQuickAddOpen(false)}
                    />
                    {/* Dropdown Menu floating upwards */}
                    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-52 rounded-2xl bg-white border border-gray-150 shadow-2xl p-2 z-50 animate-scale-up space-y-1">
                      {canCreateBooking && (
                        <button
                          onClick={() => {
                            setQuickAddOpen(false);
                            openQuickAdd();
                          }}
                          className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2.5"
                        >
                          <span className="text-base text-brand-600">📅</span>
                          <span>New Booking</span>
                        </button>
                      )}
                      {canCreateLead && (
                        <button
                          onClick={() => {
                            setQuickAddOpen(false);
                            openAddLead();
                          }}
                          className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2.5"
                        >
                          <span className="text-base text-brand-600">🎯</span>
                          <span>New Lead / Enquiry</span>
                        </button>
                      )}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-300">
                <Plus className="w-5 h-5" />
              </div>
            )}
          </div>

          {/* Tab 3 */}
          {mobileTabs[2] && (
            <NavLink
              to={mobileTabs[2].path}
              className={({ isActive }) => cn(
                "inline-flex flex-col items-center justify-center px-2 group transition-all duration-200 hover:bg-gray-50/55 active:scale-98",
                isActive ? "text-brand-600 font-bold" : "text-gray-400 hover:text-brand-600"
              )}
            >
              {Tab3Icon && <Tab3Icon className="w-5 h-5 mb-0.5" />}
              <span className="text-[9px] font-bold">{mobileTabs[2].label}</span>
            </NavLink>
          )}

          {/* Tab 4 */}
          {mobileTabs[3] && (
            <NavLink
              to={mobileTabs[3].path}
              id="tour-mobile-settings"
              className={({ isActive }) => cn(
                "inline-flex flex-col items-center justify-center px-2 rounded-e-full group transition-all duration-200 hover:bg-gray-50/55 active:scale-98",
                isActive ? "text-brand-600 font-bold" : "text-gray-400 hover:text-brand-600"
              )}
            >
              {Tab4Icon && <Tab4Icon className="w-5 h-5 mb-0.5" />}
              <span className="text-[9px] font-bold">{mobileTabs[3].label}</span>
            </NavLink>
          )}
        </div>
      </div>
    </div>
  );
}

