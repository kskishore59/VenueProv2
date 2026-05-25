import { useEffect } from 'react';
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

  useEffect(() => {
    const title = pageTitles[location.pathname] || 'VenuePro';
    document.title = `${title} | VenuePro`;
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

  return (
    <div className="min-h-screen bg-surface-secondary">
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
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar (Application Bar style) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 w-full h-16 bg-white border-t border-gray-150 md:hidden shadow-lg">
        <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
          {/* Tab 1 */}
          {mobileTabs[0] && (
            <NavLink
              to={mobileTabs[0].path}
              className={({ isActive }) => cn(
                "inline-flex flex-col items-center justify-center px-2 group transition-colors",
                isActive ? "text-brand-600" : "text-gray-500 hover:text-brand-600"
              )}
            >
              {Tab1Icon && <Tab1Icon className="w-5 h-5 mb-0.5" />}
              <span className="text-[10px] font-semibold">{mobileTabs[0].label}</span>
            </NavLink>
          )}

          {/* Tab 2 */}
          {mobileTabs[1] && (
            <NavLink
              to={mobileTabs[1].path}
              className={({ isActive }) => cn(
                "inline-flex flex-col items-center justify-center px-2 group transition-colors",
                isActive ? "text-brand-600" : "text-gray-500 hover:text-brand-600"
              )}
            >
              {Tab2Icon && <Tab2Icon className="w-5 h-5 mb-0.5" />}
              <span className="text-[10px] font-semibold">{mobileTabs[1].label}</span>
            </NavLink>
          )}

          {/* Centered CTA Button */}
          <div className="flex items-center justify-center">
            {showQuickAdd ? (
              <button
                type="button"
                onClick={() => {
                  if (canCreateBooking) {
                    openQuickAdd();
                  } else {
                    openAddLead();
                  }
                }}
                className="inline-flex items-center justify-center w-11 h-11 font-bold bg-brand-600 text-white rounded-full hover:bg-brand-700 active:scale-95 transition-transform shadow-md focus:outline-none focus:ring-4 focus:ring-brand-200"
                title="Quick Add"
              >
                <Plus className="w-5.5 h-5.5" />
                <span className="sr-only">New booking/lead</span>
              </button>
            ) : (
              <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-300">
                <Plus className="w-5.5 h-5.5" />
              </div>
            )}
          </div>

          {/* Tab 3 */}
          {mobileTabs[2] && (
            <NavLink
              to={mobileTabs[2].path}
              className={({ isActive }) => cn(
                "inline-flex flex-col items-center justify-center px-2 group transition-colors",
                isActive ? "text-brand-600" : "text-gray-500 hover:text-brand-600"
              )}
            >
              {Tab3Icon && <Tab3Icon className="w-5 h-5 mb-0.5" />}
              <span className="text-[10px] font-semibold">{mobileTabs[2].label}</span>
            </NavLink>
          )}

          {/* Tab 4 */}
          {mobileTabs[3] && (
            <NavLink
              to={mobileTabs[3].path}
              className={({ isActive }) => cn(
                "inline-flex flex-col items-center justify-center px-2 group transition-colors",
                isActive ? "text-brand-600" : "text-gray-500 hover:text-brand-600"
              )}
            >
              {Tab4Icon && <Tab4Icon className="w-5 h-5 mb-0.5" />}
              <span className="text-[10px] font-semibold">{mobileTabs[3].label}</span>
            </NavLink>
          )}
        </div>
      </div>
    </div>
  );
}

