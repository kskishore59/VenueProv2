export type InventoryCategory = 'furniture' | 'av' | 'decor' | 'tableware' | 'catering' | 'other';

export const inventoryCategoryLabels: Record<InventoryCategory, string> = {
  furniture: 'Furniture',
  av: 'Audio/Visual',
  decor: 'Decoration',
  tableware: 'Tableware',
  catering: 'Catering Equipment',
  other: 'Other'
};

export interface InventoryItem {
  id: string;
  org_id: string;
  name: string;
  category: InventoryCategory;
  description: string | null;
  total_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface BookingInventoryAllocation {
  id: string;
  org_id: string;
  booking_id: string;
  inventory_item_id: string;
  quantity: number;
  created_at: string;
}
