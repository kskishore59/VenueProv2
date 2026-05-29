import { create } from 'zustand';

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  toggleSidebar: () => void;
  setSidebarMobileOpen: (open: boolean) => void;

  // Calendar
  selectedDate: Date;
  calendarView: 'month' | 'week';
  setSelectedDate: (date: Date) => void;
  setCalendarView: (view: 'month' | 'week') => void;

  // Drawers & Modals
  isBookingDrawerOpen: boolean;
  selectedBookingId: string | null;
  isQuickAddOpen: boolean;
  quickAddDate: string | null;
  isPaymentModalOpen: boolean;
  paymentBookingId: string | null;
  isLeadDrawerOpen: boolean;
  selectedLeadId: string | null;
  isAddLeadOpen: boolean;
  isEditBookingOpen: boolean;
  editBookingId: string | null;
  isAddCustomerOpen: boolean;
  isAddHallOpen: boolean;

  // Phase 3 States
  isImportOpen: boolean;
  isExpenseModalOpen: boolean;
  selectedExpenseId: string | null;
  isEditLeadOpen: boolean;
  selectedEditLeadId: string | null;
  isEditCustomerOpen: boolean;
  selectedEditCustomerId: string | null;
  isEditPaymentOpen: boolean;
  selectedEditPaymentId: string | null;

  // Subscription Modal State
  isSubscriptionModalOpen: boolean;

  // Receipt Modal State
  isReceiptModalOpen: boolean;
  receiptMode: 'receipt' | 'invoice' | null;
  receiptPaymentId: string | null;
  receiptBookingId: string | null;

  // Confirm Dialog
  confirmDialog: {
    open: boolean;
    title: string;
    description: string;
    variant: 'danger' | 'warning' | 'info';
    onConfirm: (() => void) | null;
  };

  // Drawer/Modal actions
  openBookingDrawer: (bookingId: string) => void;
  closeBookingDrawer: () => void;
  openQuickAdd: (date?: string) => void;
  closeQuickAdd: () => void;
  openPaymentModal: (bookingId: string) => void;
  closePaymentModal: () => void;
  openLeadDrawer: (leadId: string) => void;
  closeLeadDrawer: () => void;
  openAddLead: () => void;
  closeAddLead: () => void;
  openEditBooking: (bookingId: string) => void;
  closeEditBooking: () => void;
  openAddCustomer: () => void;
  closeAddCustomer: () => void;
  openAddHall: () => void;
  closeAddHall: () => void;
  
  // Phase 3 Actions
  openImport: () => void;
  closeImport: () => void;
  openExpenseModal: (expenseId?: string | null) => void;
  closeExpenseModal: () => void;
  openEditLead: (leadId: string) => void;
  closeEditLead: () => void;
  openEditCustomer: (customerId: string) => void;
  closeEditCustomer: () => void;
  openEditPayment: (paymentId: string) => void;
  closeEditPayment: () => void;

  openReceiptModal: (mode: 'receipt' | 'invoice', id: string) => void;
  closeReceiptModal: () => void;

  openSubscriptionModal: () => void;
  closeSubscriptionModal: () => void;

  showConfirm: (opts: { title: string; description: string; variant?: 'danger' | 'warning' | 'info'; onConfirm: () => void }) => void;
  closeConfirm: () => void;

  // Search
  globalSearchOpen: boolean;
  setGlobalSearchOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  // Sidebar
  sidebarCollapsed: false,
  sidebarMobileOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarMobileOpen: (open) => set({ sidebarMobileOpen: open }),

  // Calendar
  selectedDate: new Date(),
  calendarView: 'month',
  setSelectedDate: (date) => set({ selectedDate: date }),
  setCalendarView: (view) => set({ calendarView: view }),

  // Drawers & Modals
  isBookingDrawerOpen: false,
  selectedBookingId: null,
  isQuickAddOpen: false,
  quickAddDate: null,
  isPaymentModalOpen: false,
  paymentBookingId: null,
  isLeadDrawerOpen: false,
  selectedLeadId: null,
  isAddLeadOpen: false,
  isEditBookingOpen: false,
  editBookingId: null,
  isAddCustomerOpen: false,
  isAddHallOpen: false,

  // Phase 3 States
  isImportOpen: false,
  isExpenseModalOpen: false,
  selectedExpenseId: null,
  isEditLeadOpen: false,
  selectedEditLeadId: null,
  isEditCustomerOpen: false,
  selectedEditCustomerId: null,
  isEditPaymentOpen: false,
  selectedEditPaymentId: null,

  // Receipt Modal State
  isReceiptModalOpen: false,
  receiptMode: null,
  receiptPaymentId: null,
  receiptBookingId: null,

  // Confirm Dialog
  confirmDialog: { open: false, title: '', description: '', variant: 'danger', onConfirm: null },

  // Actions
  openBookingDrawer: (bookingId) =>
    set({ isBookingDrawerOpen: true, selectedBookingId: bookingId }),
  closeBookingDrawer: () =>
    set({ isBookingDrawerOpen: false, selectedBookingId: null }),
  openQuickAdd: (date) =>
    set({ isQuickAddOpen: true, quickAddDate: date || null }),
  closeQuickAdd: () =>
    set({ isQuickAddOpen: false, quickAddDate: null }),
  openPaymentModal: (bookingId) =>
    set({ isPaymentModalOpen: true, paymentBookingId: bookingId }),
  closePaymentModal: () =>
    set({ isPaymentModalOpen: false, paymentBookingId: null }),
  openLeadDrawer: (leadId) =>
    set({ isLeadDrawerOpen: true, selectedLeadId: leadId }),
  closeLeadDrawer: () =>
    set({ isLeadDrawerOpen: false, selectedLeadId: null }),
  openAddLead: () => set({ isAddLeadOpen: true }),
  closeAddLead: () => set({ isAddLeadOpen: false }),
  openEditBooking: (bookingId) =>
    set({ isEditBookingOpen: true, editBookingId: bookingId, isBookingDrawerOpen: false }),
  closeEditBooking: () =>
    set({ isEditBookingOpen: false, editBookingId: null }),
  openAddCustomer: () => set({ isAddCustomerOpen: true }),
  closeAddCustomer: () => set({ isAddCustomerOpen: false }),
  openAddHall: () => set({ isAddHallOpen: true }),
  closeAddHall: () => set({ isAddHallOpen: false }),

  // Phase 3 Actions
  openImport: () => set({ isImportOpen: true }),
  closeImport: () => set({ isImportOpen: false }),
  openExpenseModal: (expenseId) => set({ isExpenseModalOpen: true, selectedExpenseId: expenseId || null }),
  closeExpenseModal: () => set({ isExpenseModalOpen: false, selectedExpenseId: null }),
  openEditLead: (leadId) => set({ isEditLeadOpen: true, selectedEditLeadId: leadId }),
  closeEditLead: () => set({ isEditLeadOpen: false, selectedEditLeadId: null }),
  openEditCustomer: (customerId) => set({ isEditCustomerOpen: true, selectedEditCustomerId: customerId }),
  closeEditCustomer: () => set({ isEditCustomerOpen: false, selectedEditCustomerId: null }),
  openEditPayment: (paymentId) => set({ isEditPaymentOpen: true, selectedEditPaymentId: paymentId }),
  closeEditPayment: () => set({ isEditPaymentOpen: false, selectedEditPaymentId: null }),

  openReceiptModal: (mode, id) => set({
    isReceiptModalOpen: true,
    receiptMode: mode,
    receiptPaymentId: mode === 'receipt' ? id : null,
    receiptBookingId: mode === 'invoice' ? id : null
  }),
  closeReceiptModal: () => set({
    isReceiptModalOpen: false,
    receiptMode: null,
    receiptPaymentId: null,
    receiptBookingId: null
  }),

  showConfirm: (opts) =>
    set({
      confirmDialog: {
        open: true,
        title: opts.title,
        description: opts.description,
        variant: opts.variant || 'danger',
        onConfirm: opts.onConfirm,
      },
    }),
  closeConfirm: () =>
    set({ confirmDialog: { open: false, title: '', description: '', variant: 'danger', onConfirm: null } }),

  // Search
  globalSearchOpen: false,
  setGlobalSearchOpen: (open) => set({ globalSearchOpen: open }),

  // Subscription Modal
  isSubscriptionModalOpen: false,
  openSubscriptionModal: () => set({ isSubscriptionModalOpen: true }),
  closeSubscriptionModal: () => set({ isSubscriptionModalOpen: false }),
}));
