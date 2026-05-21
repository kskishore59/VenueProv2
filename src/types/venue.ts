export interface Hall {
  id: string;
  org_id: string;
  name: string;
  type: HallType;
  capacity_min: number;
  capacity_max: number;
  area_sqft: number | null;
  pricing: HallPricing;
  amenities: string[];
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export type HallType =
  | 'banquet_hall'
  | 'conference_room'
  | 'lawn'
  | 'terrace'
  | 'boardroom'
  | 'other';

export interface HallPricing {
  base_price_paise: number;
  per_plate_veg_paise: number | null;
  per_plate_nonveg_paise: number | null;
  decoration_paise: number | null;
  overtime_per_hour_paise: number | null;
}

export const hallTypeLabels: Record<HallType, string> = {
  banquet_hall: 'Banquet Hall',
  conference_room: 'Conference Room',
  lawn: 'Lawn / Garden',
  terrace: 'Terrace',
  boardroom: 'Board Room',
  other: 'Other',
};
