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

  // Elaborate Marketplace Fields
  floor_number: number;
  description: string | null;
  capacity_comfortable: number;
  hall_length: number | null;
  hall_width: number | null;
  hall_height: number | null;
  ceiling_height: number | null;
  floors_within_hall: number;
  amenities_config: HallAmenitiesConfig;
  facilities_config: HallFacilitiesConfig;
  pricing_config: HallPricingConfig;
  media_config: HallMediaConfig;
  images: string[];
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

export interface HallAmenitiesConfig {
  seating?: {
    theatre_style?: boolean;
    classroom_style?: boolean;
    banquet_round?: boolean;
    u_shape?: boolean;
    cocktail_standing?: boolean;
    custom_arrangements?: boolean;
  };
  av_tech?: {
    projector?: boolean;
    projector_lumens?: string;
    led_screen?: boolean;
    pa_sound_system?: boolean;
    wireless_mics?: boolean;
    wireless_mics_count?: number;
    presentation_clicker?: boolean;
    video_conference?: boolean;
    live_streaming?: boolean;
    dj_console_space?: boolean;
    stage_lighting?: boolean;
    stage_lighting_type?: string;
  };
  comfort?: {
    central_ac?: boolean;
    central_ac_tonnage?: string;
    split_ac?: boolean;
    split_ac_count?: number;
    industrial_coolers?: boolean;
    ceiling_fans?: boolean;
    air_purifiers?: boolean;
    heating?: boolean;
  };
  convenience?: {
    wifi?: boolean;
    wifi_speed?: string;
    generator_backup?: string; // 'none' | 'partial' | '100%'
    elevator_access?: boolean;
    ground_floor_access?: boolean;
    loading_dock?: boolean;
    valet_parking?: boolean;
    self_parking?: boolean;
    self_parking_capacity?: number;
  };
}

export interface HallFacilitiesConfig {
  total_washrooms?: number;
  gents_washrooms?: number;
  ladies_washrooms?: number;
  disabled_washroom?: boolean;
  bridal_suite?: boolean;
  bridal_suite_sqft?: number;
  groom_room?: boolean;
  green_room?: boolean;
  catering_kitchen?: 'none' | 'inhouse' | 'outside_allowed' | 'both';
  bartender_space?: boolean;
  outdoor_space_attached?: boolean;
  outdoor_space_sqft?: number;
  decor_storage?: boolean;
  security_post?: boolean;
}

export interface HallPricingConfig {
  base_rental?: number;
  morning_slot?: number;
  evening_slot?: number;
  night_slot?: number;
  full_day?: number;
  weekend_premium?: number; // percentage
  season_premium?: number; // percentage
  advance_deposit?: number; // percentage, default 25
  min_booking_hours?: number;
  overtime_rate?: number;
  catering_veg?: number;
  catering_nonveg?: number;
  catering_jain?: number;
  decor_packages?: { name: string; price: number }[];
}

export interface HallMediaConfig {
  tour_360_url?: string;
  youtube_video_url?: string;
  cover_photo_index?: number;
}

export const hallTypeLabels: Record<HallType, string> = {
  banquet_hall: 'Banquet Hall',
  conference_room: 'Conference Room',
  lawn: 'Lawn / Garden',
  terrace: 'Terrace / Rooftop',
  boardroom: 'Board Room',
  other: 'Other / Custom Space',
};
