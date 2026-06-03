export type FoodType = 'veg' | 'non_veg' | 'both' | 'jain';
export type DishType = 'veg' | 'non_veg' | 'vegan' | 'jain';
export type SpicinessLevel = 'mild' | 'medium' | 'spicy' | 'extra_spicy';

export interface MenuItem {
  name: string;
  category: string; // Starters, Soups, Main Course, Desserts, Breads, Snacks, Beverages, Salads, Others
  type: DishType;
  description?: string;
  extra_charge_paise?: number; // Premium surcharge in paise
  spiciness?: SpicinessLevel;
}

export interface Menu {
  id: string;
  org_id: string;
  name: string;
  price_paise: number;
  food_type: FoodType;
  category: string;
  tags: string[];
  items: MenuItem[]; // Refactored from string[]
  hall_ids: string[];
  created_at: string;
}

export const foodTypeLabels: Record<FoodType, string> = {
  veg: 'Pure Vegetarian',
  non_veg: 'Non-Vegetarian',
  both: 'Veg & Non-Veg',
  jain: 'Jain Friendly',
};

export const dishTypeLabels: Record<DishType, string> = {
  veg: 'Veg',
  non_veg: 'Non-Veg',
  vegan: 'Vegan',
  jain: 'Jain',
};

export const spicinessLabels: Record<SpicinessLevel, string> = {
  mild: 'Mild',
  medium: 'Medium',
  spicy: 'Spicy',
  extra_spicy: 'Extra Spicy',
};

export const menuCategories = [
  'Starters',
  'Soups',
  'Main Course',
  'Desserts',
  'Breads',
  'Snacks',
  'Beverages',
  'Salads',
  'Others'
] as const;
