import { useState, useEffect } from 'react';
import {
  Menu, Bell, Search, Plus, LogOut, RefreshCw,
  HelpCircle, Check, Trash2, Calendar, AlertCircle, PhoneIncoming, Info, IndianRupee
} from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { cn, getInitials, getRelativeTime } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { useDataStore } from '@/stores/data-store';
import { hasPermission } from '@/lib/permissions';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/dashboard': 'Dashboard',
  '/bookings': 'Bookings',
  '/leads': 'Leads',
  '/customers': 'Customers',
  '/payments': 'Payments',
  '/settings': 'Settings',
  '/expenses': 'Expenses',
  '/venues': 'Venues',
  '/help': 'Help & Guides',
};

const notifIcons: Record<string, any> = {
  booking_created: Calendar,
  booking_cancelled: AlertCircle,
  payment_received: IndianRupee,
  payment_due: AlertCircle,
  lead_followup: PhoneIncoming,
  system: Info,
};

const notifColors: Record<string, string> = {
  booking_created: 'bg-blue-50 text-blue-500',
  booking_cancelled: 'bg-rose-50 text-rose-500',
  payment_received: 'bg-emerald-50 text-emerald-500',
  payment_due: 'bg-amber-50 text-amber-500',
  lead_followup: 'bg-purple-50 text-purple-500',
  system: 'bg-slate-50 text-slate-500',
};

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const setSidebarMobileOpen = useUIStore((s) => s.setSidebarMobileOpen);
  const openQuickAdd = useUIStore((s) => s.openQuickAdd);
  const openAddLead = useUIStore((s) => s.openAddLead);
  const collapsed = useUIStore((s) => s.sidebarCollapsed);

  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);
  const syncData = useDataStore((s) => s.syncData);
  const isSyncing = useDataStore((s) => s.isLoading);

  const notifications = useDataStore((s) => s.notifications);
  const fetchNotifications = useDataStore((s) => s.fetchNotifications);
  const markNotificationRead = useDataStore((s) => s.markNotificationRead);
  const markAllNotificationsRead = useDataStore((s) => s.markAllNotificationsRead);
  const deleteNotification = useDataStore((s) => s.deleteNotification);

  const role = useAuthStore((s) => s.profile?.role);
  const organization = useDataStore((s) => s.organization);

  const canCreateBooking = hasPermission(role, 'bookings', 'create', organization?.settings);
  const canCreateLead = hasPermission(role, 'leads', 'create', organization?.settings);
  const showQuickAdd = canCreateBooking || canCreateLead;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const title = pageTitles[location.pathname] || 'VenuePro';
  const fullName = profile?.full_name || 'Venue Manager';
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (notifFilter === 'unread') return !n.is_read;
    return true;
  });

  const handleNotificationClick = (n: any) => {
    markNotificationRead(n.id);
    setNotificationsOpen(false);
    if (n.link_to) {
      navigate(n.link_to);
    }
  };

  const handleSignOut = async () => {
    setDropdownOpen(false);
    try {
      await signOut();
    } catch (err) {
      console.error('Failed to sign out:', err);
    }
  };

  const handleSync = async () => {
    try {
      await syncData();
    } catch (err) {
      console.error('Sync failed:', err);
    }
  };

  return (
    <header
      className={cn(
        'fixed top-0 right-0 h-16 backdrop-blur-md   z-30',
        'flex items-center justify-between px-4 md:px-6 transition-all duration-300',
        collapsed ? 'left-0 md:left-[72px]' : 'left-0 md:left-[260px]',
      )}
    >
      {/* Left: Menu + Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setSidebarMobileOpen(true)}
          className="md:hidden p-2 -ml-1 rounded-xl hover:bg-gray-100 transition-colors flex-shrink-0"
        >
          <Menu className="w-4 h-4 text-gray-600" />
        </button>
        {/* <div className="min-w-0">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight truncate">{title}</h2>
        </div> */}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Quick Add Dropdown Container */}
        {showQuickAdd && (
          <div id="tour-quick-add-btn" className="relative hidden md:block">
            <button
              onClick={() => setQuickAddOpen(!quickAddOpen)}
              className={cn(
                'w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center',
                'hover:bg-brand-700 active:scale-95 shadow-sm hover:shadow-md',
                'transition-all duration-200'
              )}
              title="Quick Add"
            >
              <Plus className="w-4 h-4" />
            </button>

            {quickAddOpen && (
              <>
                {/* Overlay */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setQuickAddOpen(false)}
                />
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-gray-150 shadow-2xl p-2 z-50 animate-fade-in space-y-1">
                  {canCreateBooking && (
                    <button
                      onClick={() => {
                        setQuickAddOpen(false);
                        openQuickAdd();
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2.5"
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
                      className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2.5"
                    >
                      <span className="text-base text-brand-600">🎯</span>
                      <span>New Lead / Enquiry</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Sync/Refresh */}
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className={cn(
            'w-9 h-9 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 shadow-2xs transition-all duration-200 active:scale-95 relative',
            isSyncing && 'text-brand-600'
          )}
          title="Sync Data"
        >
          <RefreshCw className={cn('w-4 h-4', isSyncing && 'animate-spin')} />
        </button>

        {/* Help Center Shortcut */}
        <Link
          to="/help"
          id="tour-help-btn"
          className="w-9 h-9 rounded-full bg-white border border-gray-100 hidden sm:flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 shadow-2xs transition-all duration-200 active:scale-95"
          title="Help Center"
        >
          <HelpCircle className="w-4 h-4" />
        </Link>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            id="tour-notifications-btn"
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setDropdownOpen(false);
              setQuickAddOpen(false);
            }}
            className={cn(
              "relative w-9 h-9 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 shadow-2xs transition-all duration-200 active:scale-95",
              unreadCount > 0 && "text-brand-600 bg-brand-50/50 hover:bg-brand-50"
            )}
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-danger-500 rounded-full animate-pulse-soft" />
            )}
          </button>

          {notificationsOpen && (
            <>
              {/* Overlay */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setNotificationsOpen(false)}
              />

              {/* Dropdown Menu */}
              <div className="fixed left-4 right-4 top-16 md:absolute md:left-auto md:right-0 md:top-auto md:mt-2 md:w-96 rounded-2xl bg-white border border-gray-150 shadow-2xl p-4 z-50 animate-fade-in flex flex-col max-h-[480px]">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 mb-2.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-brand-50 text-[10px] font-bold text-brand-700">
                        {unreadCount} Unread
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllNotificationsRead()}
                      className="text-[11px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 hover:underline transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-gray-50 pb-2 mb-2">
                  <button
                    onClick={() => setNotifFilter('all')}
                    className={cn(
                      "px-3 py-1 rounded-lg text-[10px] font-bold transition-all",
                      notifFilter === 'all'
                        ? "bg-brand-50 text-brand-700 shadow-3xs"
                        : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                    )}
                  >
                    All ({notifications.length})
                  </button>
                  <button
                    onClick={() => setNotifFilter('unread')}
                    className={cn(
                      "px-3 py-1 rounded-lg text-[10px] font-bold transition-all",
                      notifFilter === 'unread'
                        ? "bg-brand-50 text-brand-700 shadow-3xs"
                        : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                    )}
                  >
                    Unread ({unreadCount})
                  </button>
                </div>

                {/* Scrollable list */}
                <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[280px] pr-0.5 custom-scrollbar">
                  {filteredNotifications.length === 0 ? (
                    <div className="py-8 text-center flex flex-col items-center justify-center gap-2">
                      <span className="text-2xl">🎉</span>
                      <p className="text-xs font-semibold text-gray-500">All caught up!</p>
                      <p className="text-[10px] text-gray-400">No notifications to show here.</p>
                    </div>
                  ) : (
                    filteredNotifications.map((n) => {
                      const Icon = notifIcons[n.type] || Info;
                      const colorClass = notifColors[n.type] || 'bg-slate-50 text-slate-500';
                      return (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={cn(
                            "flex gap-3 p-2.5 rounded-xl transition-all cursor-pointer relative group border",
                            n.is_read
                              ? "bg-white border-transparent hover:bg-gray-50/70"
                              : "bg-brand-50/10 border-brand-50/30 hover:bg-brand-50/20"
                          )}
                        >
                          {/* Left icon wrapper */}
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-3xs", colorClass)}>
                            <Icon className="w-4 h-4" />
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0 pr-6">
                            <div className="flex items-center gap-1.5">
                              <p className={cn("text-xs leading-normal truncate", !n.is_read ? "font-bold text-gray-900" : "font-semibold text-gray-700")}>
                                {n.title}
                              </p>
                              {!n.is_read && (
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-600 flex-shrink-0 animate-pulse" />
                              )}
                            </div>
                            <p className="text-[11px] text-gray-400 leading-normal line-clamp-2 mt-0.5">
                              {n.message}
                            </p>
                            <p className="text-[9px] font-semibold text-gray-400 mt-1">
                              {getRelativeTime(n.created_at)}
                            </p>
                          </div>

                          {/* Close/delete button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(n.id);
                            }}
                            className="absolute top-2.5 right-2.5 p-1 rounded-md bg-white border border-gray-150 opacity-0 group-hover:opacity-100 hover:text-rose-600 transition-opacity hover:shadow-xs"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3 text-gray-400 hover:text-rose-500" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Visual Divider */}
        <div className="h-6 w-[1px] bg-gray-200 mx-2.5 self-center hidden sm:block" />

        {/* User Profile Dropdown Container */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 hover:opacity-85 transition-all duration-200 ml-1.5"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-2xs overflow-hidden border border-gray-100">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-xs font-bold">
                  {getInitials(fullName)}
                </span>
              )}
            </div>
            <span className="text-sm font-bold text-gray-800 hidden sm:block">
              {fullName}
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
