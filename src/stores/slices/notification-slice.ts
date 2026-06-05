import type { StateCreator } from 'zustand';
import type { DataState } from '../data-store';
import type { Notification, NotificationType } from '@/types';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { formatCurrency, parseDatabaseError } from '@/lib/utils';
import { subDays, format } from 'date-fns';

function uuid() {
  return self.crypto.randomUUID();
}

const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    org_id: 'org-demo-001',
    title: 'Follow-up Due Today 🎯',
    message: 'Inquiry from Priya Sharma requires follow-up today.',
    type: 'lead_followup',
    is_read: false,
    link_to: '/leads',
    created_at: new Date().toISOString(),
  },
  {
    id: 'notif-002',
    org_id: 'org-demo-001',
    title: 'Payment Received 💰',
    message: 'Advance payment of ₹50,000 recorded for booking VP-2026-0248.',
    type: 'payment_received',
    is_read: true,
    link_to: '/payments',
    created_at: subDays(new Date(), 1).toISOString(),
  },
  {
    id: 'notif-003',
    org_id: 'org-demo-001',
    title: 'Welcome to VenuePro! ⚙️',
    message: 'Start by configuring your halls and base pricing in Settings.',
    type: 'system',
    is_read: false,
    link_to: '/settings',
    created_at: subDays(new Date(), 3).toISOString(),
  }
];

export interface NotificationSlice {
  notifications: Notification[];
  fetchNotifications: () => Promise<void>;
  createNotification: (data: {
    title: string;
    message: string;
    type: NotificationType;
    link_to?: string | null;
  }) => Promise<Notification>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  submitFeedback: (data: {
    rating: number;
    category: 'bug' | 'feature_request' | 'design' | 'other';
    message: string;
  }) => Promise<void>;
  runBackgroundChecks: () => Promise<void>;
}

export const createNotificationSlice: StateCreator<
  DataState,
  [],
  [],
  NotificationSlice
> = (set, get) => ({
  notifications: [],

  // ─── Notifications CRUD ──────────────────────────────────
  fetchNotifications: async () => {
    const state = get();
    if (state.isOnline) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('org_id', state.organization.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        set({ notifications: data || [] });
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    } else {
      if (get().notifications.length === 0) {
        set({ notifications: [...mockNotifications] });
      }
    }
  },

  createNotification: async (data) => {
    const state = get();
    const newNotif: Notification = {
      id: uuid(),
      org_id: state.organization.id,
      title: data.title,
      message: data.message,
      type: data.type,
      is_read: false,
      link_to: data.link_to || null,
      created_at: new Date().toISOString()
    };

    const triggerBrowserPush = () => {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(data.title, {
            body: data.message,
            icon: '/favicon.svg'
          });
        } catch (e) {
          console.error('Browser push notification display failed:', e);
        }
      }
    };

    if (state.isOnline) {
      try {
        const { data: dbNotif, error } = await supabase
          .from('notifications')
          .insert({
            org_id: state.organization.id,
            title: data.title,
            message: data.message,
            type: data.type,
            link_to: data.link_to || null,
            is_read: false
          })
          .select()
          .single();
        if (error) throw error;
        if (dbNotif) {
          set((s) => ({ notifications: [dbNotif, ...s.notifications] }));
          triggerBrowserPush();
          return dbNotif;
        }
      } catch (err) {
        console.error('Database createNotification failed:', err);
      }
    }

    set((s) => ({ notifications: [newNotif, ...s.notifications] }));
    triggerBrowserPush();
    return newNotif;
  },

  markNotificationRead: async (id) => {
    const state = get();
    if (state.isOnline) {
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.error('Database markNotificationRead failed:', err);
      }
    }
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      )
    }));
  },

  markAllNotificationsRead: async () => {
    const state = get();
    if (state.isOnline) {
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('org_id', state.organization.id)
          .eq('is_read', false);
        if (error) throw error;
      } catch (err) {
        console.error('Database markAllNotificationsRead failed:', err);
      }
    }
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, is_read: true }))
    }));
  },

  deleteNotification: async (id) => {
    const state = get();
    if (state.isOnline) {
      try {
        const { error } = await supabase
          .from('notifications')
          .delete()
          .eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.error('Database deleteNotification failed:', err);
      }
    }
    set((s) => ({
      notifications: s.notifications.filter((n) => n.id !== id)
    }));
  },

  // ─── Feedback Actions ────────────────────────────────────
  submitFeedback: async (data) => {
    const state = get();
    let userId = null;
    
    if (state.isOnline) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) userId = user.id;

        const { error } = await supabase
          .from('feedbacks')
          .insert({
            org_id: state.organization.id,
            user_id: userId,
            rating: data.rating,
            category: data.category,
            message: data.message
          });
        if (error) throw error;
        toast.success('Feedback submitted successfully! Thank you. ❤️');
      } catch (err: any) {
        console.error('Database submitFeedback failed:', err);
        toast.error(parseDatabaseError(err));
      }
    } else {
      console.log('Submitted Mock Feedback:', data);
      toast.success('Feedback recorded (Demo Mode)! Thank you. ❤️');
    }
  },

  // ─── Background Sync Checks ──────────────────────────────
  runBackgroundChecks: async () => {
    const state = get();
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    
    // Check 1: Leads due for follow-up today
    const leadsDue = state.leads.filter(
      (l) => l.status !== 'won' && l.status !== 'lost' && l.follow_up_date === todayStr
    );
    
    const processedTitlesAndMessages = new Set<string>();

    for (const lead of leadsDue) {
      const matchKey = `lead_followup:${lead.name}`;
      const exists = state.notifications.some(
        (n) => n.type === 'lead_followup' && n.link_to === '/leads' && n.message.includes(lead.name) && n.created_at.slice(0, 10) === todayStr
      );
      if (!exists && !processedTitlesAndMessages.has(matchKey)) {
        processedTitlesAndMessages.add(matchKey);
        await state.createNotification({
          title: 'Follow-up Due Today 🎯',
          message: `Inquiry from ${lead.name} (${lead.phone}) is scheduled for follow-up today.`,
          type: 'lead_followup',
          link_to: '/leads'
        });
      }
    }

    // Check 2: Bookings with pending balance payment due soon (within 3 days)
    const bookingsDue = state.bookings.filter(
      (b) => b.status === 'confirmed'
    );
    for (const b of bookingsDue) {
      const eventDate = new Date(b.event_date);
      const diffTime = eventDate.getTime() - new Date().getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 0 && diffDays <= 3) {
        const payments = state.getPaymentsForBooking(b.id);
        const totalPaid = payments.filter((p) => p.status === 'received').reduce((sum, p) => sum + p.amount_paise, 0);
        const balance = b.total_amount_paise - totalPaid;
        
        if (balance > 0) {
          const matchKey = `payment_due:${b.booking_number}`;
          const exists = state.notifications.some(
            (n) => n.type === 'payment_due' && n.message.includes(b.booking_number) && n.created_at.slice(0, 10) === todayStr
          );
          if (!exists && !processedTitlesAndMessages.has(matchKey)) {
            processedTitlesAndMessages.add(matchKey);
            await state.createNotification({
              title: 'Balance Payment Due ⏳',
              message: `Booking ${b.booking_number} is scheduled in ${diffDays} days and has a pending balance of ${formatCurrency(balance)}.`,
              type: 'payment_due',
              link_to: '/bookings'
            });
          }
        }
      }
    }
  }
});
