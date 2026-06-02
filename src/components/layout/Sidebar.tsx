import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, Users, PhoneIncoming,
  IndianRupee, Settings, ChevronLeft, ChevronRight, X,
  Building2, Receipt, UploadCloud, HelpCircle, LogOut,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import venueProLogo from '@/assets/venueProLogo.svg';
import favicon from '@/assets/favicon.svg';
import { useUIStore } from '@/stores/ui-store';
import { useDataStore } from '@/stores/data-store';
import { useAuthStore } from '@/stores/auth-store';
import { hasPermission } from '@/lib/permissions';
import type { PermissionResource } from '@/lib/permissions';

const navGroups = [
  {
    title: 'Overview',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/bookings', label: 'Bookings', icon: CalendarDays },
      { path: '/leads', label: 'Inquiries', icon: PhoneIncoming },
      { path: '/customers', label: 'Customers', icon: Users },
      { path: '/venues', label: 'Venues', icon: Building2 },
    ],
  },
  {
    title: 'Finances',
    items: [
      { path: '/payments', label: 'Payments', icon: IndianRupee },
      { path: '/expenses', label: 'Expenses', icon: Receipt },
    ],
  },
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
  const signOut = useAuthStore((s) => s.signOut);

  const navItemPermissions: Record<string, PermissionResource> = {
    '/bookings': 'bookings',
    '/leads': 'leads',
    '/customers': 'customers',
    '/expenses': 'expenses',
    '/payments': 'payments',
    '/import': 'settings',
    '/settings': 'settings',
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Filter groups based on permissions
  const allowedGroups = navGroups.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      const permResource = navItemPermissions[item.path];
      if (!permResource) return true;
      return hasPermission(role, permResource, 'read', organization?.settings);
    }),
  })).filter((group) => group.items.length > 0);

  const showSettings = hasPermission(role, 'settings', 'read', organization?.settings);
  const showImport = hasPermission(role, 'settings', 'read', organization?.settings);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[60] md:hidden drawer-overlay"
          onClick={() => setSidebarMobileOpen(false)}
        />
      )}

      {/* Sidebar aside panel */}
      <aside
        id="tour-sidebar-nav"
        className={cn(
          'fixed top-0 left-1 h-screen bg-white rounded-2xl border-gray-200 z-[70] lg:m-2 lg:ml-4 lg:pt-4',
          'flex flex-col transition-all duration-300 ease-in-out-[cubic-bezier(0.16,1,0.3,1)] shadow-md',
          // Desktop
          'hidden md:flex',
          collapsed ? 'w-[72px]' : 'w-[260px]',
          // Mobile
          mobileOpen && '!flex w-[280px] md:hidden shadow-xl drawer-content',
        )}
      >
        {/* Logo / Brand Header */}
        <div className={cn(
          'flex items-center h-20 px-5 border-b border-gray-50',
          collapsed ? 'justify-center' : 'gap-3',
        )}>
          <div className="flex items-center">
            {/* VenuePro Custom Logo */}
            {collapsed ? (
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden shadow-sm">
                <img
                  src={favicon}
                  alt="VenuePro Logo"
                  className="w-10 h-10 object-contain"
                />
              </div>
            ) : (
              <img
                src={venueProLogo}
                alt="VenuePro Logo"
                className="h-16 w-auto object-contain max-w-[160px]"
              />
            )}

            {/* Organization custom logo overlapping */}
            {!collapsed && organization?.logo_url && (
              <div className="w-8 h-8 rounded-full bg-white border border-gray-150 overflow-hidden shadow-2xs -ml-2 relative z-10 flex items-center justify-center transition-transform hover:translate-x-1 duration-300">
                <img
                  src={organization.logo_url}
                  alt={orgName}
                  className="w-full h-full object-contain p-0.5"
                />
              </div>
            )}
          </div>
          {!collapsed && organization?.logo_url && (
            <div className="min-w-0 animate-fade-in ml-1.5">
              <span className="text-xs font-bold text-gray-900 truncate block font-sans tracking-tight">
                {orgName.split(' ')[0]}
              </span>
            </div>
          )}
          {/* Mobile close button */}
          <button
            onClick={() => setSidebarMobileOpen(false)}
            className="ml-auto md:hidden p-1 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Scrollable Navigation Sections (Middle Area) */}
        <div className="flex-1 py-6 px-4 overflow-y-auto space-y-6 custom-scrollbar">
          {/* Dynamic Groups */}
          {allowedGroups.map((group) => (
            <div key={group.title} className="space-y-1.5">
              {!collapsed && (
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 block mb-1">
                  {group.title}
                </span>
              )}
              <nav className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path ||
                    (item.path === '/dashboard' && location.pathname === '/');
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      id={item.path === '/dashboard' ? 'tour-nav-dashboard' : undefined}
                      onClick={() => setSidebarMobileOpen(false)}
                      className={cn(
                        'group flex items-center rounded-xl transition-all lg:h-12 duration-250 ease-out',
                        collapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2 hover:translate-x-0.5',
                        isActive
                          ? 'text-brand-100 font-bold bg-brand-600'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 bg-transparent',
                      )}
                    >
                      <item.icon className={cn(
                        'flex-shrink-0 transition-colors duration-250',
                        collapsed ? 'w-6 h-6' : 'w-5 h-5',
                        isActive
                          ? 'text-brand-100 bg-brand-600'
                          : 'text-gray-400 group-hover:text-brand-600',
                      )} />
                      {!collapsed && (
                        <span className="text-[13.5px] font-semibold tracking-[-0.01em]">{item.label}</span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Fixed Bottom Settings Group (Pinned Footer) */}
        <div className="p-4 border-t border-gray-50 space-y-1.5 bg-white">
          {!collapsed && (
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 block mb-1">
              Settings
            </span>
          )}
          <nav className="space-y-0.5">
            {role === 'super_admin' && (
              <NavLink
                to="/super-admin"
                onClick={() => setSidebarMobileOpen(false)}
                className={cn(
                  'group flex items-center rounded-xl transition-all duration-250 ease-out mb-2',
                  collapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2 hover:translate-x-0.5',
                  location.pathname === '/super-admin'
                    ? 'text-indigo-950 font-bold bg-indigo-50 border border-indigo-100/50'
                    : 'text-gray-500 hover:text-indigo-650 bg-transparent',
                )}
              >
                <ShieldCheck className={cn(
                  'flex-shrink-0 transition-colors duration-250',
                  collapsed ? 'w-6 h-6' : 'w-5 h-5',
                  location.pathname === '/super-admin' ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600',
                )} />
                {!collapsed && (
                  <span className="text-[13.5px] font-semibold tracking-[-0.01em]">Super Admin Panel</span>
                )}
              </NavLink>
            )}

            {showSettings && (
              <NavLink
                to="/settings"
                id="tour-sidebar-settings"
                onClick={() => setSidebarMobileOpen(false)}
                className={cn(
                  'group flex items-center rounded-xl transition-all duration-250 ease-out',
                  collapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2 hover:translate-x-0.5',
                  location.pathname === '/settings'
                    ? 'text-gray-900 font-bold bg-transparent'
                    : 'text-gray-500 hover:text-gray-900 bg-transparent',
                )}
              >
                <Settings className={cn(
                  'flex-shrink-0 transition-colors duration-250',
                  collapsed ? 'w-6 h-6' : 'w-5 h-5',
                  location.pathname === '/settings' ? 'text-brand-600' : 'text-gray-400 group-hover:text-brand-600',
                )} />
                {!collapsed && (
                  <span className="text-[13.5px] font-semibold tracking-[-0.01em]">Setting</span>
                )}
              </NavLink>
            )}

            {showImport && (
              <NavLink
                to="/import"
                onClick={() => setSidebarMobileOpen(false)}
                className={cn(
                  'group flex items-center rounded-xl transition-all duration-250 ease-out',
                  collapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2 hover:translate-x-0.5',
                  location.pathname === '/import'
                    ? 'text-gray-900 font-bold bg-transparent'
                    : 'text-gray-500 hover:text-gray-900 bg-transparent',
                )}
              >
                <UploadCloud className={cn(
                  'flex-shrink-0 transition-colors duration-250',
                  collapsed ? 'w-6 h-6' : 'w-5 h-5',
                  location.pathname === '/import' ? 'text-brand-600' : 'text-gray-400 group-hover:text-brand-600',
                )} />
                {!collapsed && (
                  <span className="text-[13.5px] font-semibold tracking-[-0.01em]">Import Data</span>
                )}
              </NavLink>
            )}

            <NavLink
              to="/help"
              id="tour-sidebar-help"
              onClick={() => setSidebarMobileOpen(false)}
              className={cn(
                'group flex items-center rounded-xl transition-all duration-250 ease-out',
                collapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2 hover:translate-x-0.5',
                location.pathname === '/help'
                  ? 'text-gray-900 font-bold bg-transparent'
                  : 'text-gray-500 hover:text-gray-900 bg-transparent',
              )}
            >
              <HelpCircle className={cn(
                'flex-shrink-0 transition-colors duration-250',
                collapsed ? 'w-6 h-6' : 'w-5 h-5',
                location.pathname === '/help' ? 'text-brand-600' : 'text-gray-400 group-hover:text-brand-600',
              )} />
              {!collapsed && (
                <span className="text-[13.5px] font-semibold tracking-[-0.01em]">Help Center</span>
              )}
            </NavLink>

            {/* Logout Button */}
            <button
              onClick={handleSignOut}
              className={cn(
                'group flex items-center rounded-xl transition-all duration-250 ease-out w-full text-left',
                collapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2 hover:translate-x-0.5',
                'text-rose-500 hover:text-rose-600 bg-transparent',
              )}
            >
              <LogOut className={cn(
                'flex-shrink-0 transition-colors duration-250 text-rose-400 group-hover:text-rose-500',
                collapsed ? 'w-6 h-6' : 'w-5 h-5',
              )} />
              {!collapsed && (
                <span className="text-[13.5px] font-semibold tracking-[-0.01em]">Logout</span>
              )}
            </button>
          </nav>
        </div>

        {/* Desktop Collapse Toggle Button */}
        <div className="hidden md:flex items-center justify-center py-3 border-t border-gray-50">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-50 transition-all duration-200 text-gray-400 hover:text-gray-600"
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
