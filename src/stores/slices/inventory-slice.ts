import type { StateCreator } from 'zustand';
import type { DataState } from '../data-store';
import type { InventoryItem, BookingInventoryAllocation, InventoryCategory } from '@/types/inventory';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { toast } from 'sonner';
import { parseDatabaseError } from '@/lib/utils';
import { assertActiveSubscription } from '../data-store';

function uuid() {
  return self.crypto.randomUUID();
}

const mockInventoryItems: InventoryItem[] = [
  { id: 'inv-item-001', org_id: 'org-demo-001', name: 'Premium Banquet Chairs', category: 'furniture', description: 'Gold cushioned chairs for seating guests', total_quantity: 400, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'inv-item-002', org_id: 'org-demo-001', name: 'Round Dining Tables (8-Seater)', category: 'furniture', description: 'Wooden round tables', total_quantity: 45, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'inv-item-003', org_id: 'org-demo-001', name: 'LED Wall Screen 16x9', category: 'av', description: 'P2.5 High definition screen for stage backdrop', total_quantity: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'inv-item-004', org_id: 'org-demo-001', name: 'Premium Floral Arch', category: 'decor', description: 'Artificial rose and orchid arch setup', total_quantity: 4, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'inv-item-005', org_id: 'org-demo-001', name: 'Silver Plate Cutlery Sets', category: 'tableware', description: 'Premium silverware plates and forks', total_quantity: 500, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

const mockAllocations: BookingInventoryAllocation[] = [
  { id: 'alloc-001', org_id: 'org-demo-001', booking_id: 'book-001', inventory_item_id: 'inv-item-001', quantity: 150, created_at: new Date().toISOString() },
  { id: 'alloc-002', org_id: 'org-demo-001', booking_id: 'book-001', inventory_item_id: 'inv-item-002', quantity: 20, created_at: new Date().toISOString() },
  { id: 'alloc-003', org_id: 'org-demo-001', booking_id: 'book-002', inventory_item_id: 'inv-item-003', quantity: 1, created_at: new Date().toISOString() }
];

export interface InventorySlice {
  inventoryItems: InventoryItem[];
  inventoryAllocations: BookingInventoryAllocation[];
  fetchInventory: () => Promise<void>;
  createInventoryItem: (data: {
    name: string;
    category: InventoryCategory;
    description?: string | null;
    total_quantity: number;
  }) => Promise<InventoryItem>;
  updateInventoryItem: (id: string, data: Partial<InventoryItem>) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
  fetchAllocationsForBooking: (bookingId: string) => Promise<BookingInventoryAllocation[]>;
  allocateInventory: (bookingId: string, items: { inventory_item_id: string; quantity: number }[]) => Promise<void>;
  checkInventoryAvailability: (bookingId: string | null, date: string, startTime: string, endTime: string, itemId: string, quantityNeeded: number) => { available: number; success: boolean };
}

export const createInventorySlice: StateCreator<
  DataState,
  [],
  [],
  InventorySlice
> = (set, get) => ({
  inventoryItems: isSupabaseConfigured() ? [] : [...mockInventoryItems],
  inventoryAllocations: isSupabaseConfigured() ? [] : [...mockAllocations],

  fetchInventory: async () => {
    const state = get();
    if (state.isOnline) {
      try {
        const [itemsRes, allocsRes] = await Promise.all([
          supabase.from('inventory_items').select('*').order('name'),
          supabase.from('booking_inventory_allocations').select('*')
        ]);
        if (itemsRes.error) throw itemsRes.error;
        if (allocsRes.error) throw allocsRes.error;
        set({
          inventoryItems: itemsRes.data || [],
          inventoryAllocations: allocsRes.data || []
        });
      } catch (err) {
        console.error('Database fetchInventory failed:', err);
      }
    }
  },

  createInventoryItem: async (data) => {
    const state = get();
    if (!assertActiveSubscription(state.organization)) {
      throw new Error('Subscription required');
    }

    const newItemData = {
      ...data,
      org_id: state.organization.id,
      description: data.description || null
    };

    if (state.isOnline) {
      try {
        const { data: dbItem, error } = await supabase
          .from('inventory_items')
          .insert(newItemData)
          .select()
          .single();
        if (error) throw error;
        set((s) => ({ inventoryItems: [...s.inventoryItems, dbItem].sort((a, b) => a.name.localeCompare(b.name)) }));
        toast.success(`Inventory item "${data.name}" added successfully.`);
        return dbItem;
      } catch (err) {
        console.error('Database createInventoryItem failed:', err);
        toast.error(parseDatabaseError(err));
        throw err;
      }
    }

    // Offline / Fallback
    const localItem: InventoryItem = {
      id: uuid(),
      org_id: state.organization.id,
      name: data.name,
      category: data.category,
      description: data.description || null,
      total_quantity: data.total_quantity,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    set((s) => ({ inventoryItems: [...s.inventoryItems, localItem].sort((a, b) => a.name.localeCompare(b.name)) }));
    toast.success(`Inventory item "${data.name}" added successfully (Offline Mode).`);
    return localItem;
  },

  updateInventoryItem: async (id, data) => {
    const state = get();
    if (state.isOnline) {
      try {
        const { error } = await supabase.from('inventory_items').update(data).eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.error('Database updateInventoryItem failed:', err);
        toast.error(parseDatabaseError(err));
        return;
      }
    }
    set((s) => ({
      inventoryItems: s.inventoryItems.map((item) => item.id === id ? { ...item, ...data, updated_at: new Date().toISOString() } : item)
    }));
    toast.success('Inventory stock updated.');
  },

  deleteInventoryItem: async (id) => {
    const state = get();
    if (state.isOnline) {
      try {
        const { error } = await supabase.from('inventory_items').delete().eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.error('Database deleteInventoryItem failed:', err);
        toast.error(parseDatabaseError(err));
        return;
      }
    }
    set((s) => ({
      inventoryItems: s.inventoryItems.filter((item) => item.id !== id),
      inventoryAllocations: s.inventoryAllocations.filter((a) => a.inventory_item_id !== id)
    }));
    toast.success('Inventory item deleted.');
  },

  fetchAllocationsForBooking: async (bookingId) => {
    const state = get();
    if (state.isOnline) {
      try {
        const { data, error } = await supabase
          .from('booking_inventory_allocations')
          .select('*')
          .eq('booking_id', bookingId);
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.error('Database fetchAllocationsForBooking failed:', err);
      }
    }
    return state.inventoryAllocations.filter((a) => a.booking_id === bookingId);
  },

  allocateInventory: async (bookingId, items) => {
    const state = get();
    if (state.isOnline) {
      try {
        // First delete existing allocations for this booking
        const { error: deleteError } = await supabase
          .from('booking_inventory_allocations')
          .delete()
          .eq('booking_id', bookingId);

        if (deleteError) throw deleteError;

        if (items.length === 0) {
          set((s) => ({
            inventoryAllocations: s.inventoryAllocations.filter((a) => a.booking_id !== bookingId)
          }));
          return;
        }

        const newAllocData = items.map((item) => ({
          org_id: state.organization.id,
          booking_id: bookingId,
          inventory_item_id: item.inventory_item_id,
          quantity: item.quantity
        }));

        const { data: dbAllocs, error: insertError } = await supabase
          .from('booking_inventory_allocations')
          .insert(newAllocData)
          .select();

        if (insertError) throw insertError;

        set((s) => ({
          inventoryAllocations: [
            ...s.inventoryAllocations.filter((a) => a.booking_id !== bookingId),
            ...(dbAllocs || [])
          ]
        }));
      } catch (err) {
        console.error('Database allocateInventory failed:', err);
        toast.error(parseDatabaseError(err));
        throw err;
      }
    } else {
      // Offline implementation
      const newAllocs: BookingInventoryAllocation[] = items.map((item) => ({
        id: uuid(),
        org_id: state.organization.id,
        booking_id: bookingId,
        inventory_item_id: item.inventory_item_id,
        quantity: item.quantity,
        created_at: new Date().toISOString()
      }));

      set((s) => ({
        inventoryAllocations: [
          ...s.inventoryAllocations.filter((a) => a.booking_id !== bookingId),
          ...newAllocs
        ]
      }));
    }
  },

  checkInventoryAvailability: (bookingId, date, startTime, endTime, itemId, quantityNeeded) => {
    const state = get();
    
    // Find item's total stock
    const item = state.inventoryItems.find((i) => i.id === itemId);
    if (!item) return { available: 0, success: false };

    // Find all overlapping bookings (exclude current booking, cancelled bookings)
    const overlappingBookings = state.bookings.filter(
      (b) =>
        b.event_date === date &&
        b.status !== 'cancelled' &&
        b.id !== bookingId &&
        // Overlap condition
        startTime < b.end_time &&
        endTime > b.start_time
    );

    // Sum up allocations of this item on those overlapping bookings
    const overlappingBookingIds = overlappingBookings.map((b) => b.id);
    const totalAllocatedOverlapping = state.inventoryAllocations
      .filter((a) => a.inventory_item_id === itemId && overlappingBookingIds.includes(a.booking_id))
      .reduce((sum, a) => sum + a.quantity, 0);

    const available = item.total_quantity - totalAllocatedOverlapping;
    return {
      available: Math.max(0, available),
      success: available >= quantityNeeded
    };
  }
});
