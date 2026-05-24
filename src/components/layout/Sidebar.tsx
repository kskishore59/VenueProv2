import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, Users, PhoneIncoming,
  IndianRupee, Settings, ChevronLeft, ChevronRight, X,
  Building2, Receipt, UploadCloud, HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';
import { useDataStore } from '@/stores/data-store';
import { useAuthStore } from '@/stores/auth-store';
import { hasPermission } from '@/lib/permissions';
import type { PermissionResource } from '@/lib/permissions';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },

  { path: '/bookings', label: 'Bookings', icon: CalendarDays },
  { path: '/leads', label: 'Inquiries', icon: PhoneIncoming },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/expenses', label: 'Expenses', icon: Receipt },
  { path: '/payments', label: 'Payments', icon: IndianRupee },
  { path: '/import', label: 'Import Data', icon: UploadCloud },
  { path: '/venues', label: 'Venues', icon: Building2 },
  { path: '/settings', label: 'Settings', icon: Settings },
  { path: '/help', label: 'Help & Guides', icon: HelpCircle },
];

export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const mobileOpen = useUIStore((s) => s.sidebarMobileOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const setSidebarMobileOpen = useUIStore((s) => s.setSidebarMobileOpen);
  const location = useLocation();
  const orgName = useDataStore((s) => s.organization?.name) || 'VenuePro Workspace';
  const role = useAuthStore((s) => s.profile?.role);
  const organization = useDataStore((s) => s.organization);

  const navItemPermissions: Record<string, PermissionResource> = {
    '/bookings': 'bookings',
    '/leads': 'leads',
    '/customers': 'customers',
    '/expenses': 'expenses',
    '/payments': 'payments',
    '/import': 'settings',
    '/settings': 'settings',
  };

  const allowedNavItems = navItems.filter((item) => {
    const permResource = navItemPermissions[item.path];
    if (!permResource) return true;
    return hasPermission(role, permResource, 'read', organization?.settings);
  });

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden drawer-overlay"
          onClick={() => setSidebarMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-screen bg-white border-r border-gray-200 z-50',
          'flex flex-col transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
          // Desktop
          'hidden md:flex',
          collapsed ? 'w-[72px]' : 'w-[260px]',
          // Mobile
          mobileOpen && '!flex w-[280px] md:hidden shadow-xl drawer-content',
        )}
      >
        {/* Logo / Brand */}
        <div className={cn(
          'flex items-center h-16 border-b border-gray-100 px-4',
          collapsed ? 'justify-center' : 'gap-3',
        )}>
          <div className="flex items-center">
            {/* VenuePro logo */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-brand-500 flex items-center justify-center flex-shrink-0 shadow-sm relative z-20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            
            {/* Organization custom logo overlapping */}
            {!collapsed && organization?.logo_url && (
              <div className="w-9 h-9 rounded-xl bg-white border border-gray-150 overflow-hidden shadow-xs -ml-2.5 relative z-10 flex items-center justify-center transition-transform hover:translate-x-1 duration-300">
                <img 
                  src={organization.logo_url} 
                  alt={orgName} 
                  className="w-full h-full object-contain p-0.5" 
                />
              </div>
            )}
          </div>
          {!collapsed && (
            <div className="min-w-0 animate-fade-in ml-1">
              <h1 className="text-sm font-bold text-gray-900 truncate">
                {orgName}
              </h1>
              <p className="text-[11px] text-gray-400 font-medium">VenuePro</p>
            </div>
          )}
          {/* Mobile close */}
          <button
            onClick={() => setSidebarMobileOpen(false)}
            className="ml-auto md:hidden p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav id="tour-sidebar-nav" className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {allowedNavItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path === '/dashboard' && location.pathname === '/');
            return (
              <NavLink
                key={item.path}
                to={item.path}
                id={item.path === '/dashboard' ? 'tour-nav-dashboard' : undefined}
                onClick={() => setSidebarMobileOpen(false)}
                className={cn(
                  'group flex items-center rounded-xl transition-all duration-200',
                  collapsed ? 'justify-center p-3' : 'gap-3 px-3.5 py-2.5',
                  isActive
                    ? 'bg-brand-50 text-brand-600 font-semibold shadow-xs'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700',
                )}
              >
                <item.icon className={cn(
                  'flex-shrink-0 transition-all duration-200',
                  collapsed ? 'w-5.5 h-5.5' : 'w-5 h-5',
                  isActive
                    ? 'text-brand-600'
                    : 'text-gray-400 group-hover:text-gray-600',
                )} />
                {!collapsed && (
                  <span className="text-[13.5px] tracking-[-0.01em]">{item.label}</span>
                )}
                {/* Active indicator dot for collapsed */}
                {collapsed && isActive && (
                  <div className="absolute right-0 w-1 h-5 bg-brand-600 rounded-l-full" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="hidden md:flex items-center justify-center py-3 border-t border-gray-100">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 text-gray-400 hover:text-gray-600"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
