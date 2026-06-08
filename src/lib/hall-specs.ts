// Auto-generated venue specification catalog (151 fields, 12 categories)
// Source: VenuePro Builder Guide — Venue Fields section

export type FieldKind = 'text'|'textarea'|'number'|'decimal'|'year'|'boolean'|'yesno_count'|'select'|'tags';

export interface SpecField { key: string; label: string; kind: FieldKind; desc: string; required: boolean; options?: string[]; }
export interface SpecCategory { key: string; icon: string; title: string; fields: SpecField[]; }

export const HALL_SPEC_CATALOG: SpecCategory[] = [
  {
    "key": "basic_information",
    "icon": "🏛️",
    "title": "Basic Information",
    "fields": [
      {
        "key": "venue_hall_name",
        "label": "Venue / Hall Name",
        "kind": "text",
        "desc": "Official name as known to customers",
        "required": true
      },
      {
        "key": "hall_type",
        "label": "Hall Type",
        "kind": "select",
        "desc": "Main Banquet, Party Hall, Conference, Lawn, Terrace, Rooftop, Poolside, Board Room",
        "required": true,
        "options": [
          "Main Banquet",
          "Party Hall",
          "Conference",
          "Lawn",
          "Terrace",
          "Rooftop",
          "Poolside",
          "Board Room"
        ]
      },
      {
        "key": "floor_number",
        "label": "Floor Number",
        "kind": "number",
        "desc": "0=Ground, -1=Basement, 1/2/3... for upper floors",
        "required": true
      },
      {
        "key": "short_description",
        "label": "Short Description",
        "kind": "textarea",
        "desc": "What makes this hall special? Used in customer-facing portal",
        "required": false
      },
      {
        "key": "year_of_establishment",
        "label": "Year of Establishment",
        "kind": "year",
        "desc": "Builds trust with customers",
        "required": false
      },
      {
        "key": "last_renovated",
        "label": "Last Renovated",
        "kind": "year",
        "desc": "Signals modernity to premium customers",
        "required": false
      }
    ]
  },
  {
    "key": "dimensions_physical_space",
    "icon": "📐",
    "title": "Dimensions & Physical Space",
    "fields": [
      {
        "key": "total_area_sq_ft",
        "label": "Total Area (sq ft)",
        "kind": "number",
        "desc": "Total usable carpet area",
        "required": true
      },
      {
        "key": "hall_length_ft",
        "label": "Hall Length (ft)",
        "kind": "decimal",
        "desc": "Interior dimension",
        "required": false
      },
      {
        "key": "hall_width_ft",
        "label": "Hall Width (ft)",
        "kind": "decimal",
        "desc": "Interior dimension",
        "required": false
      },
      {
        "key": "ceiling_height_ft",
        "label": "Ceiling Height (ft)",
        "kind": "decimal",
        "desc": "Critical for decorator planning — chandeliers, draping",
        "required": false
      },
      {
        "key": "stage_area_sq_ft",
        "label": "Stage Area (sq ft)",
        "kind": "number",
        "desc": "Dedicated stage dimensions",
        "required": false
      },
      {
        "key": "stage_height_ft",
        "label": "Stage Height (ft)",
        "kind": "decimal",
        "desc": "How high is the stage from floor level",
        "required": false
      },
      {
        "key": "stage_dimensions_l_w",
        "label": "Stage Dimensions (L × W)",
        "kind": "text",
        "desc": "For performance and decoration planning",
        "required": false
      },
      {
        "key": "entrance_door_width_ft",
        "label": "Entrance Door Width (ft)",
        "kind": "decimal",
        "desc": "Critical for large props, photo booths, horse entries",
        "required": false
      },
      {
        "key": "entrance_door_height_ft",
        "label": "Entrance Door Height (ft)",
        "kind": "decimal",
        "desc": "Important for tall arches and floral gates",
        "required": false
      },
      {
        "key": "number_of_entry_points",
        "label": "Number of Entry Points",
        "kind": "number",
        "desc": "Main + service + emergency exits",
        "required": false
      },
      {
        "key": "outdoor_attached_area_sq_ft",
        "label": "Outdoor Attached Area (sq ft)",
        "kind": "number",
        "desc": "Garden, lawn, or pre-function area",
        "required": false
      },
      {
        "key": "pre_function_area_sq_ft",
        "label": "Pre-function Area (sq ft)",
        "kind": "number",
        "desc": "Lobby / reception area before main hall",
        "required": false
      }
    ]
  },
  {
    "key": "capacity_seating",
    "icon": "👥",
    "title": "Capacity & Seating",
    "fields": [
      {
        "key": "minimum_capacity",
        "label": "Minimum Capacity",
        "kind": "number",
        "desc": "Minimum viable guest count for the hall to make sense",
        "required": true
      },
      {
        "key": "maximum_capacity_seated",
        "label": "Maximum Capacity (Seated)",
        "kind": "number",
        "desc": "With round banquet tables and chairs",
        "required": true
      },
      {
        "key": "comfortable_capacity",
        "label": "Comfortable Capacity",
        "kind": "number",
        "desc": "Recommended count for best experience — typically 80% of max",
        "required": false
      },
      {
        "key": "cocktail_standing_capacity",
        "label": "Cocktail / Standing Capacity",
        "kind": "number",
        "desc": "For reception / cocktail events without seated dinner",
        "required": false
      },
      {
        "key": "theatre_style_capacity",
        "label": "Theatre-Style Capacity",
        "kind": "number",
        "desc": "Rows of chairs facing stage — for corporate events",
        "required": false
      },
      {
        "key": "classroom_style_capacity",
        "label": "Classroom-Style Capacity",
        "kind": "number",
        "desc": "Tables + chairs — for training sessions",
        "required": false
      },
      {
        "key": "u_shape_capacity",
        "label": "U-Shape Capacity",
        "kind": "number",
        "desc": "For board meetings and workshops",
        "required": false
      },
      {
        "key": "cluster_boardroom_capacity",
        "label": "Cluster/Boardroom Capacity",
        "kind": "number",
        "desc": "Central table arrangement for conferences",
        "required": false
      },
      {
        "key": "dining_tables_available_own",
        "label": "Dining Tables Available (own)",
        "kind": "number",
        "desc": "Round tables owned by the venue — 6-seater or 8-seater?",
        "required": false
      },
      {
        "key": "chairs_available_own",
        "label": "Chairs Available (own)",
        "kind": "number",
        "desc": "Total chairs the venue provides",
        "required": false
      },
      {
        "key": "sofa_sets_available",
        "label": "Sofa Sets Available",
        "kind": "number",
        "desc": "For bridal reception area",
        "required": false
      },
      {
        "key": "highchairs_baby_chairs",
        "label": "Highchairs / Baby chairs",
        "kind": "yesno_count",
        "desc": "For family events with children",
        "required": false
      }
    ]
  },
  {
    "key": "air_conditioning_climate_control",
    "icon": "❄️",
    "title": "Air Conditioning & Climate Control",
    "fields": [
      {
        "key": "ac_type",
        "label": "AC Type",
        "kind": "select",
        "desc": "Central AC / Split ACs / Cassette ACs / No AC / Industrial Coolers",
        "required": true,
        "options": [
          "Central AC",
          "Split ACs",
          "Cassette ACs",
          "No AC",
          "Industrial Coolers"
        ]
      },
      {
        "key": "total_ac_tonnage",
        "label": "Total AC Tonnage",
        "kind": "decimal",
        "desc": "Critical metric for guests — 1 ton per 100-150 sq ft standard",
        "required": false
      },
      {
        "key": "ac_brand",
        "label": "AC Brand",
        "kind": "text",
        "desc": "Daikin, Voltas, Blue Star, LG, Samsung, Other",
        "required": false
      },
      {
        "key": "number_of_ac_units",
        "label": "Number of AC Units",
        "kind": "number",
        "desc": "Total installed units",
        "required": false
      },
      {
        "key": "star_rating_energy",
        "label": "Star Rating (Energy)",
        "kind": "select",
        "desc": "Energy efficiency — premium halls highlight this",
        "required": false,
        "options": [
          "2★",
          "3★",
          "4★",
          "5★"
        ]
      },
      {
        "key": "air_purifiers",
        "label": "Air Purifiers",
        "kind": "yesno_count",
        "desc": "Post-COVID, this is a premium selling point",
        "required": false
      },
      {
        "key": "heating_for_winter",
        "label": "Heating (for winter)",
        "kind": "boolean",
        "desc": "North India venues especially need this",
        "required": false
      },
      {
        "key": "ventilation_type",
        "label": "Ventilation Type",
        "kind": "select",
        "desc": "Natural / Mechanical / Hybrid",
        "required": false,
        "options": [
          "Natural",
          "Mechanical",
          "Hybrid"
        ]
      },
      {
        "key": "industrial_coolers",
        "label": "Industrial Coolers",
        "kind": "yesno_count",
        "desc": "For lawn/outdoor areas or non-AC halls",
        "required": false
      },
      {
        "key": "ac_coverage",
        "label": "AC Coverage %",
        "kind": "select",
        "desc": "Some venues have partial AC coverage",
        "required": false,
        "options": [
          "100%",
          "75%",
          "50%"
        ]
      },
      {
        "key": "humidity_control",
        "label": "Humidity Control",
        "kind": "boolean",
        "desc": "For coastal city venues — premium feature",
        "required": false
      },
      {
        "key": "outdoor_misting_system",
        "label": "Outdoor Misting System",
        "kind": "boolean",
        "desc": "For lawn events in summer — guests love this",
        "required": false
      }
    ]
  },
  {
    "key": "washrooms_restrooms",
    "icon": "🚿",
    "title": "Washrooms & Restrooms",
    "fields": [
      {
        "key": "total_washrooms",
        "label": "Total Washrooms",
        "kind": "number",
        "desc": "All washrooms including attached rooms",
        "required": true
      },
      {
        "key": "gents_washrooms",
        "label": "Gents Washrooms",
        "kind": "number",
        "desc": "Dedicated gents restrooms",
        "required": true
      },
      {
        "key": "ladies_washrooms",
        "label": "Ladies Washrooms",
        "kind": "number",
        "desc": "Dedicated ladies restrooms",
        "required": true
      },
      {
        "key": "differently_abled_washroom",
        "label": "Differently-Abled Washroom",
        "kind": "boolean",
        "desc": "Accessibility compliance — increasingly required",
        "required": false
      },
      {
        "key": "western_style_toilets",
        "label": "Western-Style Toilets",
        "kind": "number",
        "desc": "Count of western-style toilet seats",
        "required": false
      },
      {
        "key": "indian_style_toilets",
        "label": "Indian-Style Toilets",
        "kind": "number",
        "desc": "Count of Indian-style toilet pans",
        "required": false
      },
      {
        "key": "urinals_gents",
        "label": "Urinals (Gents)",
        "kind": "number",
        "desc": "For large events — helps estimate restroom throughput",
        "required": false
      },
      {
        "key": "washroom_location",
        "label": "Washroom Location",
        "kind": "select",
        "desc": "Inside hall / Outside hall / Separate block / Both inside and outside",
        "required": false,
        "options": [
          "Inside hall",
          "Outside hall",
          "Separate block",
          "Both inside and outside"
        ]
      },
      {
        "key": "attached_washroom_in_bridal_suite",
        "label": "Attached Washroom in Bridal Suite",
        "kind": "boolean",
        "desc": "Premium feature for bridal getting-ready",
        "required": false
      },
      {
        "key": "hot_water_available",
        "label": "Hot Water Available",
        "kind": "boolean",
        "desc": "For bridal suites and multi-day events",
        "required": false
      },
      {
        "key": "sanitary_bin_provided",
        "label": "Sanitary Bin Provided",
        "kind": "boolean",
        "desc": "Basic hygiene standard — important for ladies washroom",
        "required": false
      },
      {
        "key": "washroom_attendant",
        "label": "Washroom Attendant",
        "kind": "boolean",
        "desc": "Staff assigned to maintain washrooms during events",
        "required": false
      }
    ]
  },
  {
    "key": "lighting_electrical",
    "icon": "💡",
    "title": "Lighting & Electrical",
    "fields": [
      {
        "key": "primary_lighting_type",
        "label": "Primary Lighting Type",
        "kind": "select",
        "desc": "LED Panels / Chandeliers / Recessed / Industrial / Mix",
        "required": true,
        "options": [
          "LED Panels",
          "Chandeliers",
          "Recessed",
          "Industrial",
          "Mix"
        ]
      },
      {
        "key": "lighting_control",
        "label": "Lighting Control",
        "kind": "select",
        "desc": "Manual switches / Dimmer switches / Smart/App-controlled / DMX",
        "required": false,
        "options": [
          "Manual switches",
          "Dimmer switches",
          "Smart/App-controlled",
          "DMX"
        ]
      },
      {
        "key": "chandelier_count",
        "label": "Chandelier Count",
        "kind": "number",
        "desc": "Number and approximate size",
        "required": false
      },
      {
        "key": "stage_lighting_inhouse",
        "label": "Stage Lighting (inhouse)",
        "kind": "boolean",
        "desc": "Does the venue own stage lighting or decorator must bring?",
        "required": false
      },
      {
        "key": "stage_lighting_type",
        "label": "Stage Lighting Type",
        "kind": "tags",
        "desc": "Beam lights, PAR cans, Follow spotlight, LED wash, Moving heads",
        "required": false
      },
      {
        "key": "uplighting_wall",
        "label": "Uplighting (wall)",
        "kind": "boolean",
        "desc": "Ambient uplighting — key for Instagram-worthy photos",
        "required": false
      },
      {
        "key": "emergency_lighting",
        "label": "Emergency Lighting",
        "kind": "boolean",
        "desc": "Fire safety compliance requirement",
        "required": false
      },
      {
        "key": "natural_light",
        "label": "Natural Light",
        "kind": "select",
        "desc": "No windows / Limited / Good / Excellent (with skylights)",
        "required": false,
        "options": [
          "No windows",
          "Limited",
          "Good",
          "Excellent (with skylights)"
        ]
      },
      {
        "key": "blackout_capability",
        "label": "Blackout Capability",
        "kind": "boolean",
        "desc": "Full blackout for DJ events, laser shows, presentations",
        "required": false
      },
      {
        "key": "total_power_load_kva",
        "label": "Total Power Load (kVA)",
        "kind": "number",
        "desc": "Sanctioned load — critical for DJ and lighting setups",
        "required": false
      },
      {
        "key": "power_points_15a",
        "label": "Power Points (15A)",
        "kind": "number",
        "desc": "Available 15A sockets around the hall",
        "required": false
      },
      {
        "key": "3_phase_connection",
        "label": "3-Phase Connection",
        "kind": "boolean",
        "desc": "Required for heavy DJ and industrial AC setups",
        "required": false
      },
      {
        "key": "generator_backup",
        "label": "Generator Backup",
        "kind": "select",
        "desc": "None / Partial / 100% backup / UPS (instant switchover)",
        "required": false,
        "options": [
          "None",
          "Partial",
          "100% backup",
          "UPS (instant switchover)"
        ]
      },
      {
        "key": "generator_capacity_kva",
        "label": "Generator Capacity (kVA)",
        "kind": "number",
        "desc": "Size of the backup generator",
        "required": false
      },
      {
        "key": "outdoor_lighting",
        "label": "Outdoor Lighting",
        "kind": "boolean",
        "desc": "Parking and approach area lighting for night events",
        "required": false
      }
    ]
  },
  {
    "key": "audio_visual_technology",
    "icon": "🎤",
    "title": "Audio, Visual & Technology",
    "fields": [
      {
        "key": "pa_sound_system_inhouse",
        "label": "PA Sound System (inhouse)",
        "kind": "boolean",
        "desc": "Permanent speaker setup provided by venue",
        "required": false
      },
      {
        "key": "sound_system_watts",
        "label": "Sound System Watts",
        "kind": "number",
        "desc": "Total wattage of inhouse sound system",
        "required": false
      },
      {
        "key": "wireless_microphones",
        "label": "Wireless Microphones",
        "kind": "number",
        "desc": "Count of wireless handheld mics provided",
        "required": false
      },
      {
        "key": "lapel_collar_mics",
        "label": "Lapel/Collar Mics",
        "kind": "number",
        "desc": "For corporate events and anchor use",
        "required": false
      },
      {
        "key": "projector_inhouse",
        "label": "Projector (inhouse)",
        "kind": "boolean",
        "desc": "Does venue own a projector?",
        "required": false
      },
      {
        "key": "projector_lumens",
        "label": "Projector Lumens",
        "kind": "number",
        "desc": "Brightness — 5000+ lm for large halls with ambient light",
        "required": false
      },
      {
        "key": "led_video_wall",
        "label": "LED Video Wall",
        "kind": "boolean",
        "desc": "Pixel pitch and dimensions — premium for weddings",
        "required": false
      },
      {
        "key": "led_screen_size",
        "label": "LED Screen Size",
        "kind": "text",
        "desc": "Width × height of the screen",
        "required": false
      },
      {
        "key": "projection_screen_retractable",
        "label": "Projection Screen (retractable)",
        "kind": "boolean",
        "desc": "Pull-down screen dimensions",
        "required": false
      },
      {
        "key": "dj_console_space",
        "label": "DJ Console Space",
        "kind": "boolean",
        "desc": "Dedicated area with power for DJ setup",
        "required": false
      },
      {
        "key": "wifi_available",
        "label": "WiFi Available",
        "kind": "boolean",
        "desc": "For event guests and live streaming",
        "required": false
      },
      {
        "key": "wifi_speed_mbps",
        "label": "WiFi Speed (Mbps)",
        "kind": "number",
        "desc": "Actual available bandwidth for events",
        "required": false
      },
      {
        "key": "video_conferencing",
        "label": "Video Conferencing",
        "kind": "boolean",
        "desc": "Zoom Room / Cisco / Basic webcam setup for hybrid events",
        "required": false
      },
      {
        "key": "presentation_clicker",
        "label": "Presentation Clicker",
        "kind": "boolean",
        "desc": "Wireless presentation remote — basic but often forgotten",
        "required": false
      },
      {
        "key": "recording_facility",
        "label": "Recording Facility",
        "kind": "boolean",
        "desc": "In-hall recording capability for events",
        "required": false
      }
    ]
  },
  {
    "key": "parking_accessibility",
    "icon": "🚗",
    "title": "Parking & Accessibility",
    "fields": [
      {
        "key": "parking_type",
        "label": "Parking Type",
        "kind": "select",
        "desc": "Self-parking / Valet / Both / No parking / Street parking",
        "required": true,
        "options": [
          "Self-parking",
          "Valet",
          "Both",
          "No parking",
          "Street parking"
        ]
      },
      {
        "key": "car_parking_capacity",
        "label": "Car Parking Capacity",
        "kind": "number",
        "desc": "Total cars that can be parked simultaneously",
        "required": true
      },
      {
        "key": "two_wheeler_parking",
        "label": "Two-Wheeler Parking",
        "kind": "number",
        "desc": "Dedicated two-wheeler spaces",
        "required": false
      },
      {
        "key": "valet_parking",
        "label": "Valet Parking",
        "kind": "boolean",
        "desc": "Included or chargeable to customers?",
        "required": false
      },
      {
        "key": "covered_parking",
        "label": "Covered Parking",
        "kind": "boolean",
        "desc": "Weather-protected parking — premium in monsoon cities",
        "required": false
      },
      {
        "key": "multi_level_parking",
        "label": "Multi-Level Parking",
        "kind": "boolean",
        "desc": "Stacked or multi-storey parking structure",
        "required": false
      },
      {
        "key": "ev_charging_points",
        "label": "EV Charging Points",
        "kind": "number",
        "desc": "Growing requirement for premium urban venues",
        "required": false
      },
      {
        "key": "wheelchair_accessible",
        "label": "Wheelchair Accessible",
        "kind": "boolean",
        "desc": "Ramps, lifts, accessible pathways from entrance to hall",
        "required": false
      },
      {
        "key": "elevator_available",
        "label": "Elevator Available",
        "kind": "boolean",
        "desc": "Essential for upper-floor halls — capacity in persons",
        "required": false
      },
      {
        "key": "loading_dock_service_entry",
        "label": "Loading Dock / Service Entry",
        "kind": "boolean",
        "desc": "Separate entry for caterers, decorators, DJ — reduces chaos",
        "required": false
      },
      {
        "key": "bus_coach_parking",
        "label": "Bus/Coach Parking",
        "kind": "boolean",
        "desc": "For large weddings with guest transportation",
        "required": false
      },
      {
        "key": "nearest_metro_station",
        "label": "Nearest Metro Station",
        "kind": "text",
        "desc": "For urban venues — major selling point",
        "required": false
      }
    ]
  },
  {
    "key": "rooms_operational_facilities",
    "icon": "🛋️",
    "title": "Rooms & Operational Facilities",
    "fields": [
      {
        "key": "bridal_suite",
        "label": "Bridal Suite",
        "kind": "boolean",
        "desc": "Dedicated bridal getting-ready room with vanity, mirror, AC",
        "required": false
      },
      {
        "key": "bridal_suite_ac",
        "label": "Bridal Suite — AC",
        "kind": "boolean",
        "desc": "Separate AC for bridal room independent of main hall",
        "required": false
      },
      {
        "key": "groom_s_room",
        "label": "Groom's Room",
        "kind": "boolean",
        "desc": "Separate getting-ready area for groom's side",
        "required": false
      },
      {
        "key": "green_room_artist_room",
        "label": "Green Room / Artist Room",
        "kind": "boolean",
        "desc": "For performers, entertainers, anchor",
        "required": false
      },
      {
        "key": "catering_kitchen",
        "label": "Catering Kitchen",
        "kind": "select",
        "desc": "Inhouse kitchen / Outside caterer allowed / Both / No kitchen",
        "required": false,
        "options": [
          "Inhouse kitchen",
          "Outside caterer allowed",
          "Both",
          "No kitchen"
        ]
      },
      {
        "key": "kitchen_area_sqft",
        "label": "Kitchen Area (sqft)",
        "kind": "number",
        "desc": "Size of available kitchen space",
        "required": false
      },
      {
        "key": "commercial_lpg_connection",
        "label": "Commercial LPG Connection",
        "kind": "boolean",
        "desc": "For inhouse catering — commercial gas line availability",
        "required": false
      },
      {
        "key": "pantry_service_area",
        "label": "Pantry / Service Area",
        "kind": "boolean",
        "desc": "Staging area for catering service — near hall entry",
        "required": false
      },
      {
        "key": "cold_storage_walk_in_chiller",
        "label": "Cold Storage / Walk-in Chiller",
        "kind": "boolean",
        "desc": "For large events with inhouse catering",
        "required": false
      },
      {
        "key": "bar_setup_area",
        "label": "Bar Setup Area",
        "kind": "boolean",
        "desc": "Dedicated space for bar service with drainage",
        "required": false
      },
      {
        "key": "d_cor_storage_room",
        "label": "Décor Storage Room",
        "kind": "boolean",
        "desc": "For event décor items — in/out without affecting other guests",
        "required": false
      },
      {
        "key": "office_manager_room",
        "label": "Office / Manager Room",
        "kind": "boolean",
        "desc": "On-site management office for event coordination",
        "required": false
      },
      {
        "key": "prayer_room_temple",
        "label": "Prayer Room / Temple",
        "kind": "boolean",
        "desc": "For religious events and traditional weddings",
        "required": false
      },
      {
        "key": "children_s_play_area",
        "label": "Children's Play Area",
        "kind": "boolean",
        "desc": "For family events — growing demand",
        "required": false
      },
      {
        "key": "smoking_zone",
        "label": "Smoking Zone",
        "kind": "boolean",
        "desc": "Designated outdoor smoking area",
        "required": false
      },
      {
        "key": "first_aid_room",
        "label": "First Aid Room",
        "kind": "boolean",
        "desc": "Safety compliance — often required for large events",
        "required": false
      }
    ]
  },
  {
    "key": "catering_food_beverage",
    "icon": "🍽️",
    "title": "Catering & Food & Beverage",
    "fields": [
      {
        "key": "catering_policy",
        "label": "Catering Policy",
        "kind": "select",
        "desc": "Inhouse only / Outside allowed / Both / Only decoration inhouse",
        "required": true,
        "options": [
          "Inhouse only",
          "Outside allowed",
          "Both",
          "Only decoration inhouse"
        ]
      },
      {
        "key": "veg_non_veg_policy",
        "label": "Veg/Non-Veg Policy",
        "kind": "select",
        "desc": "Pure Veg only / Non-veg allowed / No restrictions",
        "required": false,
        "options": [
          "Pure Veg only",
          "Non-veg allowed",
          "No restrictions"
        ]
      },
      {
        "key": "alcohol_policy",
        "label": "Alcohol Policy",
        "kind": "select",
        "desc": "Not allowed / Allowed (BYOB) / Available via venue / Bar service arranged",
        "required": false,
        "options": [
          "Not allowed",
          "Allowed (BYOB)",
          "Available via venue",
          "Bar service arranged"
        ]
      },
      {
        "key": "outdoor_catering_allowed",
        "label": "Outdoor Catering Allowed",
        "kind": "boolean",
        "desc": "If outside caterer, is there a corkage/facility fee?",
        "required": false
      },
      {
        "key": "approved_caterer_list",
        "label": "Approved Caterer List",
        "kind": "tags",
        "desc": "Names of approved/empanelled caterers the venue works with",
        "required": false
      },
      {
        "key": "buffet_setup_space",
        "label": "Buffet Setup Space",
        "kind": "number",
        "desc": "How many buffet counters can be set up simultaneously",
        "required": false
      },
      {
        "key": "live_counter_setup",
        "label": "Live Counter Setup",
        "kind": "yesno_count",
        "desc": "Space for live cooking counters (chaat, dosa, pan, etc.)",
        "required": false
      },
      {
        "key": "ice_cream_counter_space",
        "label": "Ice Cream Counter Space",
        "kind": "boolean",
        "desc": "Power point + space for ice cream setup",
        "required": false
      },
      {
        "key": "service_style_offered",
        "label": "Service Style Offered",
        "kind": "tags",
        "desc": "Plated service / Buffet / Cocktail / Sit-down / High-tea",
        "required": false
      },
      {
        "key": "minimum_per_plate_veg",
        "label": "Minimum Per-Plate (Veg ₹)",
        "kind": "number",
        "desc": "Inhouse catering minimum per-head for veg menu",
        "required": false
      },
      {
        "key": "minimum_per_plate_non_veg",
        "label": "Minimum Per-Plate (Non-veg ₹)",
        "kind": "number",
        "desc": "Inhouse catering minimum for non-veg menu",
        "required": false
      },
      {
        "key": "jain_menu_available",
        "label": "Jain Menu Available",
        "kind": "boolean",
        "desc": "No root vegetables, no onion-garlic — important for Jain events",
        "required": false
      }
    ]
  },
  {
    "key": "safety_security_compliance",
    "icon": "🛡️",
    "title": "Safety, Security & Compliance",
    "fields": [
      {
        "key": "fire_noc",
        "label": "Fire NOC",
        "kind": "boolean",
        "desc": "Fire safety No Objection Certificate from local authority",
        "required": false
      },
      {
        "key": "fire_extinguisher_count",
        "label": "Fire Extinguisher Count",
        "kind": "number",
        "desc": "Total fire extinguishers installed",
        "required": false
      },
      {
        "key": "fire_sprinkler_system",
        "label": "Fire Sprinkler System",
        "kind": "boolean",
        "desc": "Automatic overhead sprinkler coverage",
        "required": false
      },
      {
        "key": "smoke_detectors",
        "label": "Smoke Detectors",
        "kind": "yesno_count",
        "desc": "Smoke alarm coverage of the hall",
        "required": false
      },
      {
        "key": "fire_alarm_system",
        "label": "Fire Alarm System",
        "kind": "boolean",
        "desc": "Manual call points and sounder system",
        "required": false
      },
      {
        "key": "emergency_exit_count",
        "label": "Emergency Exit Count",
        "kind": "number",
        "desc": "Dedicated emergency exit doors with signage",
        "required": false
      },
      {
        "key": "cctv_coverage",
        "label": "CCTV Coverage",
        "kind": "select",
        "desc": "None / Entrance only / Partial / Full coverage",
        "required": false,
        "options": [
          "None",
          "Entrance only",
          "Partial",
          "Full coverage"
        ]
      },
      {
        "key": "cctv_camera_count",
        "label": "CCTV Camera Count",
        "kind": "number",
        "desc": "Total installed cameras",
        "required": false
      },
      {
        "key": "security_guards_during_event",
        "label": "Security Guards (during event)",
        "kind": "number",
        "desc": "Guards provided by venue vs to be arranged separately",
        "required": false
      },
      {
        "key": "fssai_license",
        "label": "FSSAI License",
        "kind": "boolean",
        "desc": "Food safety license if venue provides inhouse catering",
        "required": false
      },
      {
        "key": "trade_license",
        "label": "Trade License",
        "kind": "boolean",
        "desc": "Municipal trade license for banquet operations",
        "required": false
      },
      {
        "key": "entertainment_license",
        "label": "Entertainment License",
        "kind": "boolean",
        "desc": "Required for DJ events / live music in most states",
        "required": false
      },
      {
        "key": "iprs_music_license",
        "label": "IPRS (Music License)",
        "kind": "boolean",
        "desc": "Music rights license — required for DJ events legally",
        "required": false
      },
      {
        "key": "liquor_license_type",
        "label": "Liquor License Type",
        "kind": "select",
        "desc": "None / FL-3 / FL-4 / Bar license / Guest brings own",
        "required": false,
        "options": [
          "None",
          "FL-3",
          "FL-4",
          "Bar license",
          "Guest brings own"
        ]
      },
      {
        "key": "insurance_coverage",
        "label": "Insurance Coverage",
        "kind": "boolean",
        "desc": "Public liability insurance for events",
        "required": false
      }
    ]
  },
  {
    "key": "restrictions_policies",
    "icon": "📋",
    "title": "Restrictions & Policies",
    "fields": [
      {
        "key": "noise_cutoff_time",
        "label": "Noise Cutoff Time",
        "kind": "text",
        "desc": "Latest time music/DJ is allowed — critical for booking",
        "required": true
      },
      {
        "key": "djs_allowed",
        "label": "DJs Allowed",
        "kind": "boolean",
        "desc": "Are DJs permitted? Until what time?",
        "required": false
      },
      {
        "key": "live_band_allowed",
        "label": "Live Band Allowed",
        "kind": "boolean",
        "desc": "Live music performances permitted?",
        "required": false
      },
      {
        "key": "fireworks_allowed",
        "label": "Fireworks Allowed",
        "kind": "select",
        "desc": "Not allowed / Outdoor only / Cold pyrotechnics only / Full fireworks",
        "required": false,
        "options": [
          "Not allowed",
          "Outdoor only",
          "Cold pyrotechnics only",
          "Full fireworks"
        ]
      },
      {
        "key": "firecrackers_policy",
        "label": "Firecrackers Policy",
        "kind": "select",
        "desc": "Not allowed / Outdoor only / Specific area only",
        "required": false,
        "options": [
          "Not allowed",
          "Outdoor only",
          "Specific area only"
        ]
      },
      {
        "key": "floral_d_cor_restrictions",
        "label": "Floral Décor Restrictions",
        "kind": "tags",
        "desc": "No real flowers / No ceiling draping / No nailing to walls / No open flames",
        "required": false
      },
      {
        "key": "drone_photography",
        "label": "Drone Photography",
        "kind": "boolean",
        "desc": "Indoor and/or outdoor drone — some venues prohibit",
        "required": false
      },
      {
        "key": "pets_allowed",
        "label": "Pets Allowed",
        "kind": "boolean",
        "desc": "Some wedding venues allow pet involvement in ceremonies",
        "required": false
      },
      {
        "key": "outside_food_policy",
        "label": "Outside Food Policy",
        "kind": "select",
        "desc": "Not allowed / Allowed with fee / Freely allowed",
        "required": false,
        "options": [
          "Not allowed",
          "Allowed with fee",
          "Freely allowed"
        ]
      },
      {
        "key": "d_cor_by_outside_vendor",
        "label": "Décor by Outside Vendor",
        "kind": "boolean",
        "desc": "Can customers bring external decorators?",
        "required": false
      },
      {
        "key": "cancellation_policy",
        "label": "Cancellation Policy",
        "kind": "text",
        "desc": "How many days notice? What % refund? Describe the policy clearly",
        "required": false
      },
      {
        "key": "rescheduling_policy",
        "label": "Rescheduling Policy",
        "kind": "text",
        "desc": "Conditions under which date change is allowed",
        "required": false
      }
    ]
  }
];
