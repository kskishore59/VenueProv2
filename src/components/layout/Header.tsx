import { useState } from 'react';
import { Menu, Bell, Search, Plus, LogOut } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';
import { getInitials } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/dashboard': 'Dashboard',
  '/bookings': 'Bookings',
  '/leads': 'Leads',
  '/customers': 'Customers',
  '/payments': 'Payments',
  '/settings': 'Settings',
};

export function Header() {
  const location = useLocation();
  const setSidebarMobileOpen = useUIStore((s) => s.setSidebarMobileOpen);
  const openQuickAdd = useUIStore((s) => s.openQuickAdd);
  const collapsed = useUIStore((s) => s.sidebarCollapsed);

  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const title = pageTitles[location.pathname] || 'VenuePro';
  const fullName = profile?.full_name || 'Venue Manager';

  const handleSignOut = async () => {
    setDropdownOpen(false);
    try {
      await signOut();
    } catch (err) {
      console.error('Failed to sign out:', err);
    }
  };

  return (
    <header
      className={cn(
        'fixed top-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-30',
        'flex items-center justify-between px-4 md:px-6 transition-all duration-300',
        collapsed ? 'left-0 md:left-[72px]' : 'left-0 md:left-[260px]',
      )}
    >
      {/* Left: Menu + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarMobileOpen(true)}
          className="md:hidden p-2 -ml-1 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h2>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Quick Add */}
        <button
          onClick={() => openQuickAdd()}
          className={cn(
            'flex items-center gap-2 px-3.5 py-2 rounded-xl',
            'bg-brand-600 text-white text-sm font-semibold',
            'hover:bg-brand-700 active:scale-95',
            'transition-all duration-200 shadow-sm hover:shadow-md',
            'hidden sm:flex',
          )}
        >
          <Plus className="w-4 h-4" />
          <span>New Booking</span>
        </button>

        {/* Mobile quick add */}
        <button
          onClick={() => openQuickAdd()}
          className={cn(
            'sm:hidden p-2.5 rounded-xl',
            'bg-brand-600 text-white',
            'hover:bg-brand-700 active:scale-95',
            'transition-all duration-200 shadow-sm',
          )}
        >
          <Plus className="w-5 h-5" />
        </button>

        {/* Search */}
        <button className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors text-gray-500 hidden md:flex">
          <Search className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors text-gray-500">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full animate-pulse-soft" />
        </button>

        {/* User Profile Dropdown Container */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 pl-2 pr-1 py-1 rounded-xl hover:bg-gray-50 transition-colors ml-1"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-bold">
                {getInitials(fullName)}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-700 hidden lg:block">
              {fullName.split(' ')[0]}
            </span>
          </button>

          {dropdownOpen && (
            <>
              {/* Overlay to handle clicking outside to close */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setDropdownOpen(false)} 
              />
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-gray-150 shadow-2xl p-2 z-50 animate-fade-in space-y-1">
                {/* User Details */}
                <div className="px-3 py-2.5 border-b border-gray-100 mb-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Signed In As</p>
                  <p className="text-sm font-bold text-gray-900 truncate">{fullName}</p>
                  <p className="text-xs text-gray-500 truncate mb-2">{profile?.email || 'mock@venuepro.com'}</p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-600 border border-brand-100 capitalize">
                    {profile?.role || 'owner'}
                  </span>
                </div>

                {/* Sign Out Trigger */}
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
