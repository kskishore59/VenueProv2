import { useState } from 'react';
import {
  Building2,
  Users,
  MapPin,
  Sparkles,
  Info,
  Layers,
  CheckSquare,
  UtensilsCrossed,
  IndianRupee,
  Image as ImageIcon,
  ChevronRight,
  X,
  Upload,
  Plus,
  Trash2,
  Check,
  ExternalLink,
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  Maximize2,
  Copy
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { useDataStore } from '@/stores/data-store';
import { useUIStore } from '@/stores/ui-store';
import type { Hall, HallType, HallAmenitiesConfig, HallFacilitiesConfig, HallPricingConfig, HallMediaConfig } from '@/types/venue';
import { hallTypeLabels } from '@/types/venue';
import { toast } from 'sonner';
import { WhatsappShareModal, getHallSpecsMessage } from '@/components/venues/WhatsappShareModal';
import { useAuthStore } from '@/stores/auth-store';
import { hasPermission } from '@/lib/permissions';

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="0" fill="currentColor" {...props}>
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.454L0 24zm6.59-4.846c1.6.95 3.198 1.451 4.772 1.453 5.425.002 9.843-4.393 9.847-9.81.002-2.623-1.012-5.09-2.856-6.938C16.57 1.994 14.1 1.01 11.493 1.01 6.068 1.01 1.65 5.406 1.646 10.825c-.001 1.61.425 3.18 1.232 4.58l-.936 3.42 3.51-.92 1.2.711zm12.502-8.312c-.328-.164-1.94-.959-2.24-1.07-.3-.11-.52-.165-.74.164-.22.33-.85 1.07-1.04 1.29-.19.22-.38.247-.71.082-.33-.164-1.39-.512-2.647-1.635-.98-.874-1.64-1.953-1.83-2.28-.19-.33-.02-.508.14-.671.15-.15.33-.356.5-.534.17-.178.22-.3.33-.5.11-.2.05-.38-.02-.54-.07-.16-.54-1.314-.74-1.8-.2-.48-.4-.41-.54-.41-.14 0-.3-.008-.46-.008-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2.01 0 1.188.86 2.336 1.08 2.63.22.3 1.7 2.593 4.11 3.633.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.09.46-.07 1.94-.79 2.22-1.52.27-.72.27-1.34.19-1.48-.08-.14-.3-.22-.62-.39z"/>
  </svg>
);

type TabType = 'basic' | 'dimensions' | 'amenities' | 'facilities' | 'pricing' | 'media';

export default function Venues() {
  const halls = useDataStore((s) => s.halls);
  const createHall = useDataStore((s) => s.createHall);
  const updateHall = useDataStore((s) => s.updateHall);
  const uploadMedia = useDataStore((s) => s.uploadMedia);

  const role = useAuthStore((s) => s.profile?.role);
  const organization = useDataStore((s) => s.organization);
  const canManageVenues = role === 'owner' || role === 'manager' || hasPermission(role, 'settings', 'update', organization?.settings);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingHallId, setEditingHallId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // WhatsApp sharing states
  const [selectedHallForShare, setSelectedHallForShare] = useState<Hall | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<HallType>('main_banquet_hall');
  const [floorNumber, setFloorNumber] = useState(0);
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [capacityMin, setCapacityMin] = useState(50);
  const [capacityMax, setCapacityMax] = useState(500);
  const [capacityComfortable, setCapacityComfortable] = useState(350);
  const [areaSqft, setAreaSqft] = useState('');
  const [hallLength, setHallLength] = useState('');
  const [hallWidth, setHallWidth] = useState('');
  const [hallHeight, setHallHeight] = useState('');
  const [ceilingHeight, setCeilingHeight] = useState('');
  const [floorsWithinHall, setFloorsWithinHall] = useState(1);

  // Amenities
  const [amenitiesSeating, setAmenitiesSeating] = useState<Record<string, boolean>>({
    theatre_style: false,
    classroom_style: false,
    banquet_round: false,
    u_shape: false,
    cocktail_standing: false,
    custom_arrangements: false,
  });

  const [amenitiesAV, setAmenitiesAV] = useState({
    projector: false,
    projector_lumens: '',
    led_screen: false,
    pa_sound_system: false,
    wireless_mics: false,
    wireless_mics_count: 2,
    presentation_clicker: false,
    video_conference: false,
    live_streaming: false,
    dj_console_space: false,
    stage_lighting: false,
    stage_lighting_type: '',
  });

  const [amenitiesComfort, setAmenitiesComfort] = useState({
    central_ac: false,
    central_ac_tonnage: '',
    split_ac: false,
    split_ac_count: 4,
    industrial_coolers: false,
    ceiling_fans: false,
    air_purifiers: false,
    heating: false,
  });

  const [amenitiesConvenience, setAmenitiesConvenience] = useState({
    wifi: false,
    wifi_speed: '',
    generator_backup: 'none' as 'none' | 'partial' | '100%',
    elevator_access: false,
    ground_floor_access: false,
    loading_dock: false,
    valet_parking: false,
    self_parking: false,
    self_parking_capacity: 0,
  });

  // Facilities
  const [totalWashrooms, setTotalWashrooms] = useState(4);
  const [gentsWashrooms, setGentsWashrooms] = useState(2);
  const [ladiesWashrooms, setLadiesWashrooms] = useState(2);
  const [disabledWashroom, setDisabledWashroom] = useState(false);
  const [bridalSuite, setBridalSuite] = useState(false);
  const [bridalSuiteSqft, setBridalSuiteSqft] = useState('');
  const [groomRoom, setGroomRoom] = useState(false);
  const [greenRoom, setGreenRoom] = useState(false);
  const [cateringKitchen, setCateringKitchen] = useState<'none' | 'inhouse' | 'outside_allowed' | 'both'>('inhouse');
  const [bartenderSpace, setBartenderSpace] = useState(false);
  const [outdoorSpaceAttached, setOutdoorSpaceAttached] = useState(false);
  const [outdoorSpaceSqft, setOutdoorSpaceSqft] = useState('');
  const [decorStorage, setDecorStorage] = useState(false);
  const [securityPost, setSecurityPost] = useState(false);

  // Pricing
  const [baseRental, setBaseRental] = useState('');
  const [morningSlot, setMorningSlot] = useState('');
  const [eveningSlot, setEveningSlot] = useState('');
  const [nightSlot, setNightSlot] = useState('');
  const [fullDay, setFullDay] = useState('');
  const [weekendPremium, setWeekendPremium] = useState('0');
  const [seasonPremium, setSeasonPremium] = useState('0');
  const [advanceDeposit, setAdvanceDeposit] = useState('25');
  const [minBookingHours, setMinBookingHours] = useState(4);
  const [overtimeRate, setOvertimeRate] = useState('');
  const [cateringVeg, setCateringVeg] = useState('');
  const [cateringNonveg, setCateringNonveg] = useState('');
  const [cateringJain, setCateringJain] = useState('');

  // Decor packages
  const [decorPackages, setDecorPackages] = useState<{ name: string; price: number }[]>([]);
  const [newPackageName, setNewPackageName] = useState('');
  const [newPackagePrice, setNewPackagePrice] = useState('');

  // Media
  const [images, setImages] = useState<string[]>([]);
  const [coverPhotoIndex, setCoverPhotoIndex] = useState(0);
  const [tour360Url, setTour360Url] = useState('');
  const [youtubeVideoUrl, setYoutubeVideoUrl] = useState('');

  const resetForm = () => {
    setName('');
    setType('main_banquet_hall');
    setFloorNumber(0);
    setDescription('');
    setIsActive(true);

    setCapacityMin(50);
    setCapacityMax(500);
    setCapacityComfortable(350);
    setAreaSqft('');
    setHallLength('');
    setHallWidth('');
    setHallHeight('');
    setCeilingHeight('');
    setFloorsWithinHall(1);

    setAmenitiesSeating({
      theatre_style: false,
      classroom_style: false,
      banquet_round: false,
      u_shape: false,
      cocktail_standing: false,
      custom_arrangements: false,
    });

    setAmenitiesAV({
      projector: false,
      projector_lumens: '',
      led_screen: false,
      pa_sound_system: false,
      wireless_mics: false,
      wireless_mics_count: 2,
      presentation_clicker: false,
      video_conference: false,
      live_streaming: false,
      dj_console_space: false,
      stage_lighting: false,
      stage_lighting_type: '',
    });

    setAmenitiesComfort({
      central_ac: false,
      central_ac_tonnage: '',
      split_ac: false,
      split_ac_count: 4,
      industrial_coolers: false,
      ceiling_fans: false,
      air_purifiers: false,
      heating: false,
    });

    setAmenitiesConvenience({
      wifi: false,
      wifi_speed: '',
      generator_backup: 'none',
      elevator_access: false,
      ground_floor_access: false,
      loading_dock: false,
      valet_parking: false,
      self_parking: false,
      self_parking_capacity: 0,
    });

    setTotalWashrooms(4);
    setGentsWashrooms(2);
    setLadiesWashrooms(2);
    setDisabledWashroom(false);
    setBridalSuite(false);
    setBridalSuiteSqft('');
    setGroomRoom(false);
    setGreenRoom(false);
    setCateringKitchen('inhouse');
    setBartenderSpace(false);
    setOutdoorSpaceAttached(false);
    setOutdoorSpaceSqft('');
    setDecorStorage(false);
    setSecurityPost(false);

    setBaseRental('');
    setMorningSlot('');
    setEveningSlot('');
    setNightSlot('');
    setFullDay('');
    setWeekendPremium('0');
    setSeasonPremium('0');
    setAdvanceDeposit('25');
    setMinBookingHours(4);
    setOvertimeRate('');
    setCateringVeg('');
    setCateringNonveg('');
    setCateringJain('');

    setDecorPackages([]);
    setNewPackageName('');
    setNewPackagePrice('');

    setImages([]);
    setCoverPhotoIndex(0);
    setTour360Url('');
    setYoutubeVideoUrl('');

    setActiveTab('basic');
    setEditingHallId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (hall: Hall) => {
    resetForm();
    setEditingHallId(hall.id);
    setName(hall.name);
    setType(hall.type);
    setFloorNumber(hall.floor_number);
    setDescription(hall.description || '');
    setIsActive(hall.is_active);

    setCapacityMin(hall.capacity_min);
    setCapacityMax(hall.capacity_max);
    setCapacityComfortable(hall.capacity_comfortable);
    setAreaSqft(hall.area_sqft ? String(hall.area_sqft) : '');
    setHallLength(hall.hall_length ? String(hall.hall_length) : '');
    setHallWidth(hall.hall_width ? String(hall.hall_width) : '');
    setHallHeight(hall.hall_height ? String(hall.hall_height) : '');
    setCeilingHeight(hall.ceiling_height ? String(hall.ceiling_height) : '');
    setFloorsWithinHall(hall.floors_within_hall || 1);

    // Config defaults
    if (hall.amenities_config) {
      const cfg = hall.amenities_config;
      if (cfg.seating) setAmenitiesSeating({ ...amenitiesSeating, ...cfg.seating });
      if (cfg.av_tech) setAmenitiesAV({ ...amenitiesAV, ...cfg.av_tech });
      if (cfg.comfort) setAmenitiesComfort({ ...amenitiesComfort, ...cfg.comfort });
      if (cfg.convenience) {
        setAmenitiesConvenience({
          ...amenitiesConvenience,
          ...cfg.convenience,
          generator_backup: (cfg.convenience.generator_backup === '100%' || cfg.convenience.generator_backup === 'partial')
            ? cfg.convenience.generator_backup
            : 'none'
        });
      }
    }

    if (hall.facilities_config) {
      const fc = hall.facilities_config;
      setTotalWashrooms(fc.total_washrooms ?? 4);
      setGentsWashrooms(fc.gents_washrooms ?? 2);
      setLadiesWashrooms(fc.ladies_washrooms ?? 2);
      setDisabledWashroom(!!fc.disabled_washroom);
      setBridalSuite(!!fc.bridal_suite);
      setBridalSuiteSqft(fc.bridal_suite_sqft ? String(fc.bridal_suite_sqft) : '');
      setGroomRoom(!!fc.groom_room);
      setGreenRoom(!!fc.green_room);
      setCateringKitchen(fc.catering_kitchen || 'inhouse');
      setBartenderSpace(!!fc.bartender_space);
      setOutdoorSpaceAttached(!!fc.outdoor_space_attached);
      setOutdoorSpaceSqft(fc.outdoor_space_sqft ? String(fc.outdoor_space_sqft) : '');
      setDecorStorage(!!fc.decor_storage);
      setSecurityPost(!!fc.security_post);
    }

    if (hall.pricing_config) {
      const pc = hall.pricing_config;
      setBaseRental(pc.base_rental ? String(pc.base_rental) : '');
      setMorningSlot(pc.morning_slot ? String(pc.morning_slot) : '');
      setEveningSlot(pc.evening_slot ? String(pc.evening_slot) : '');
      setNightSlot(pc.night_slot ? String(pc.night_slot) : '');
      setFullDay(pc.full_day ? String(pc.full_day) : '');
      setWeekendPremium(pc.weekend_premium ? String(pc.weekend_premium) : '0');
      setSeasonPremium(pc.season_premium ? String(pc.season_premium) : '0');
      setAdvanceDeposit(pc.advance_deposit ? String(pc.advance_deposit) : '25');
      setMinBookingHours(pc.min_booking_hours || 4);
      setOvertimeRate(pc.overtime_rate ? String(pc.overtime_rate) : '');
      setCateringVeg(pc.catering_veg ? String(pc.catering_veg) : '');
      setCateringNonveg(pc.catering_nonveg ? String(pc.catering_nonveg) : '');
      setCateringJain(pc.catering_jain ? String(pc.catering_jain) : '');
      setDecorPackages(pc.decor_packages || []);
    } else {
      // Fallback from old model
      setBaseRental(String(hall.pricing.base_price_paise / 100));
      setCateringVeg(hall.pricing.per_plate_veg_paise ? String(hall.pricing.per_plate_veg_paise / 100) : '');
      setCateringNonveg(hall.pricing.per_plate_nonveg_paise ? String(hall.pricing.per_plate_nonveg_paise / 100) : '');
      setOvertimeRate(hall.pricing.overtime_per_hour_paise ? String(hall.pricing.overtime_per_hour_paise / 100) : '');
    }

    if (hall.media_config) {
      const mc = hall.media_config;
      setTour360Url(mc.tour_360_url || '');
      setYoutubeVideoUrl(mc.youtube_video_url || '');
      setCoverPhotoIndex(mc.cover_photo_index || 0);
    }
    setImages(hall.images || []);

    setIsDrawerOpen(true);
  };

  const handleAddDecorPackage = () => {
    if (!newPackageName.trim()) {
      toast.error('Package name is required');
      return;
    }
    if (!newPackagePrice || Number(newPackagePrice) <= 0) {
      toast.error('Valid package price is required');
      return;
    }
    setDecorPackages([...decorPackages, { name: newPackageName.trim(), price: Number(newPackagePrice) }]);
    setNewPackageName('');
    setNewPackagePrice('');
  };

  const handleRemoveDecorPackage = (index: number) => {
    setDecorPackages(decorPackages.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (images.length + files.length > 10) {
      toast.error('You can upload up to 10 photos only.');
      return;
    }

    setIsUploading(true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadMedia(files[i], 'venuepro-media');
        urls.push(url);
      }
      setImages([...images, ...urls]);
      toast.success('Media uploaded successfully!');
    } catch (err) {
      toast.error('Failed to upload media files');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
    if (coverPhotoIndex >= updated.length) {
      setCoverPhotoIndex(Math.max(0, updated.length - 1));
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Hall name is required (Tab 1)');
      return;
    }
    if (!capacityMax || Number(capacityMax) <= 0) {
      toast.error('Maximum capacity is required and must be greater than 0 (Tab 2)');
      return;
    }

    setIsSaving(true);

    const baseRentalValue = baseRental ? Number(baseRental) : 0;
    const basePricePaise = baseRentalValue * 100;

    const data = {
      name: name.trim(),
      type,
      capacity_min: Number(capacityMin) || 0,
      capacity_max: Number(capacityMax),
      area_sqft: areaSqft ? Number(areaSqft) : undefined,
      base_price_paise: basePricePaise,
      floor_number: Number(floorNumber),
      description: description.trim() || undefined,
      capacity_comfortable: Number(capacityComfortable) || 0,
      hall_length: hallLength ? Number(hallLength) : undefined,
      hall_width: hallWidth ? Number(hallWidth) : undefined,
      hall_height: hallHeight ? Number(hallHeight) : undefined,
      ceiling_height: ceilingHeight ? Number(ceilingHeight) : undefined,
      floors_within_hall: Number(floorsWithinHall) || 1,
      is_active: isActive,
      images,

      amenities_config: {
        seating: amenitiesSeating,
        av_tech: amenitiesAV,
        comfort: amenitiesComfort,
        convenience: amenitiesConvenience,
      },

      facilities_config: {
        total_washrooms: Number(totalWashrooms),
        gents_washrooms: Number(gentsWashrooms),
        ladies_washrooms: Number(ladiesWashrooms),
        disabled_washroom: disabledWashroom,
        bridal_suite: bridalSuite,
        bridal_suite_sqft: bridalSuite ? Number(bridalSuiteSqft) : undefined,
        groom_room: groomRoom,
        green_room: greenRoom,
        catering_kitchen: cateringKitchen,
        bartender_space: bartenderSpace,
        outdoor_space_attached: outdoorSpaceAttached,
        outdoor_space_sqft: outdoorSpaceAttached ? Number(outdoorSpaceSqft) : undefined,
        decor_storage: decorStorage,
        security_post: securityPost,
      },

      pricing_config: {
        base_rental: baseRentalValue,
        morning_slot: morningSlot ? Number(morningSlot) : undefined,
        evening_slot: eveningSlot ? Number(eveningSlot) : undefined,
        night_slot: nightSlot ? Number(nightSlot) : undefined,
        full_day: fullDay ? Number(fullDay) : undefined,
        weekend_premium: Number(weekendPremium) || 0,
        season_premium: Number(seasonPremium) || 0,
        advance_deposit: Number(advanceDeposit) || 25,
        min_booking_hours: Number(minBookingHours) || 4,
        overtime_rate: overtimeRate ? Number(overtimeRate) : undefined,
        catering_veg: cateringVeg ? Number(cateringVeg) : undefined,
        catering_nonveg: cateringNonveg ? Number(cateringNonveg) : undefined,
        catering_jain: cateringJain ? Number(cateringJain) : undefined,
        decor_packages: decorPackages,
      },

      media_config: {
        tour_360_url: tour360Url.trim() || undefined,
        youtube_video_url: youtubeVideoUrl.trim() || undefined,
        cover_photo_index: coverPhotoIndex,
      },
    };

    try {
      if (editingHallId) {
        await updateHall(editingHallId, data);
        toast.success('Venue configuration updated! 🏛️');
      } else {
        await createHall(data);
        toast.success('New Venue / Hall added successfully! 🎉');
      }
      setIsDrawerOpen(false);
      resetForm();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save venue details');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Venues & Spaces</h1>
          <p className="text-sm text-gray-400 mt-0.5">Configure halls, dimensions, pricing premiums, and facilities</p>
        </div>
        {canManageVenues && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 active:scale-95 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Space
          </button>
        )}
      </div>

      {/* Venues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {halls.map((hall) => {
          const coverPhoto = hall.images && hall.images.length > 0 
            ? hall.images[hall.media_config?.cover_photo_index || 0] || hall.images[0]
            : 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1000&auto=format&fit=crop';
          
          const pricingConf = hall.pricing_config || {};
          const basePrice = pricingConf.base_rental || (hall.pricing.base_price_paise / 100);
          const vegPlate = pricingConf.catering_veg || (hall.pricing.per_plate_veg_paise ? hall.pricing.per_plate_veg_paise / 100 : null);
          const nonvegPlate = pricingConf.catering_nonveg || (hall.pricing.per_plate_nonveg_paise ? hall.pricing.per_plate_nonveg_paise / 100 : null);

          return (
            <div key={hall.id} className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col group">
              {/* Card Thumbnail */}
              <div className="relative h-48 overflow-hidden bg-gray-100 flex-shrink-0">
                <img
                  src={coverPhoto}
                  alt={hall.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs uppercase tracking-wider">
                    {hallTypeLabels[hall.type] || hall.type}
                  </span>
                  {hall.floor_number !== undefined && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-gray-700 backdrop-blur-xs">
                      Floor {hall.floor_number === 0 ? 'G' : hall.floor_number}
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3">
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs tracking-wider uppercase",
                    hall.is_active 
                      ? "bg-success-100 text-success-700 border border-success-200" 
                      : "bg-gray-100 text-gray-400 border border-gray-200"
                  )}>
                    {hall.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Capacity Overlay at bottom-left */}
                <div className="absolute bottom-3 left-3 text-white flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-white/95" />
                  <span className="text-xs font-bold">{hall.capacity_comfortable || hall.capacity_max} guests comfortable</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-gray-900 truncate">{hall.name}</h3>
                  {hall.description ? (
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{hall.description}</p>
                  ) : (
                    <p className="text-xs text-gray-300 italic">No description provided</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 border-y border-gray-100 py-3 text-xs">
                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Base Price</span>
                    <span className="font-bold text-gray-900">{formatCurrency(basePrice * 100)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Area (Sq Ft)</span>
                    <span className="font-bold text-gray-800">{hall.area_sqft ? `${hall.area_sqft.toLocaleString()} sqft` : 'N/A'}</span>
                  </div>
                  <div className="mt-1">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Veg Catering</span>
                    <span className="font-bold text-success-600">{vegPlate ? `₹${vegPlate}/pl` : 'N/A'}</span>
                  </div>
                  <div className="mt-1">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Non-Veg Catering</span>
                    <span className="font-bold text-rose-600">{nonvegPlate ? `₹${nonvegPlate}/pl` : 'N/A'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        setSelectedHallForShare(hall);
                        setIsShareModalOpen(true);
                      }}
                      className="p-2 rounded-xl border border-gray-150 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-250 transition-all flex items-center justify-center"
                      title="Share Hall Details on WhatsApp"
                    >
                      <WhatsAppIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        const orgName = useDataStore.getState().organization.name;
                        const message = getHallSpecsMessage(hall, orgName);
                        navigator.clipboard.writeText(message);
                        toast.success('Hall specifications copied to clipboard! 📋');
                      }}
                      className="p-2 rounded-xl border border-gray-150 text-gray-400 hover:text-brand-600 hover:bg-brand-50 hover:border-brand-250 transition-all flex items-center justify-center"
                      title="Copy Specifications to Clipboard"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {hall.media_config?.tour_360_url && (
                      <a href={hall.media_config.tour_360_url} target="_blank" rel="noreferrer" title="360 Tour" className="p-2 rounded-xl border border-gray-150 text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-all">
                        <Maximize2 className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {hall.media_config?.youtube_video_url && (
                      <a href={hall.media_config.youtube_video_url} target="_blank" rel="noreferrer" title="Youtube video" className="p-2 rounded-xl border border-gray-150 text-gray-400 hover:text-danger-600 hover:bg-danger-50 transition-all">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  {canManageVenues && (
                    <button
                      onClick={() => handleOpenEdit(hall)}
                      className="flex items-center gap-1 px-3.5 py-2 text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors active:scale-95"
                    >
                      Configure Details <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 6-Tab Edit/Add Drawer */}
      {isDrawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 drawer-overlay animate-fade-in" onClick={() => setIsDrawerOpen(false)} />
          <div className="fixed inset-y-0 right-0 max-w-2xl w-full z-50 bg-white shadow-2xl flex flex-col animate-slide-in">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-150 bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{editingHallId ? 'Edit Hall Settings' : 'Add New Venue Space'}</h3>
                <p className="text-xs text-gray-400 mt-0.5">Elaborate marketplace configuration</p>
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Vertical Tab Bar */}
            <div className="flex border-b border-gray-150 bg-white overflow-x-auto scrollbar-none sticky top-0 z-10 px-4">
              {(['basic', 'dimensions', 'amenities', 'facilities', 'pricing', 'media'] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'px-4 py-3 text-xs font-bold border-b-2 -mb-px transition-all capitalize flex items-center gap-1.5 whitespace-nowrap flex-shrink-0',
                    activeTab === tab 
                      ? 'border-brand-600 text-brand-600' 
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  )}
                >
                  {tab === 'basic' && <Info className="w-3.5 h-3.5" />}
                  {tab === 'dimensions' && <Layers className="w-3.5 h-3.5" />}
                  {tab === 'amenities' && <CheckSquare className="w-3.5 h-3.5" />}
                  {tab === 'facilities' && <UtensilsCrossed className="w-3.5 h-3.5" />}
                  {tab === 'pricing' && <IndianRupee className="w-3.5 h-3.5" />}
                  {tab === 'media' && <ImageIcon className="w-3.5 h-3.5" />}
                  {tab.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Tab 1: Basic Info */}
              {activeTab === 'basic' && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Hall Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Grand Ballroom"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Hall Type</label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value as HallType)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none bg-white font-medium"
                      >
                        {Object.entries(hallTypeLabels).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Floor Number</label>
                      <input
                        type="number"
                        placeholder="0 for ground, -1 for basement"
                        value={floorNumber}
                        onChange={(e) => setFloorNumber(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider font-semibold">Description</label>
                    <textarea
                      placeholder="Write a descriptive pitch about this hall space..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={5}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all resize-none leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-150">
                    <div>
                      <span className="text-xs font-bold text-gray-900 block">Space Availability (Active)</span>
                      <span className="text-[10px] text-gray-400">If inactive, this space won't be available for new bookings.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsActive(!isActive)}
                      className="text-brand-600 hover:scale-105 active:scale-95 transition-all"
                    >
                      {isActive ? (
                        <ToggleRight className="w-10 h-10 text-brand-600" />
                      ) : (
                        <ToggleLeft className="w-10 h-10 text-gray-300" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: Dimensions & Capacity */}
              {activeTab === 'dimensions' && (
                <div className="space-y-6">
                  <div className="p-4 bg-brand-50/50 text-brand-700 rounded-xl border border-brand-100 flex items-start gap-2 text-xs">
                    <Sparkles className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-bold block">Capacity and Area specs</span>
                      Please input accurate sizing parameters. Capacity constraints block excessive bookings.
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Min Guests</label>
                      <input
                        type="number"
                        placeholder="50"
                        value={capacityMin}
                        onChange={(e) => setCapacityMin(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Max Guests *</label>
                      <input
                        type="number"
                        placeholder="500"
                        value={capacityMax}
                        onChange={(e) => setCapacityMax(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Comfortable</label>
                      <input
                        type="number"
                        placeholder="350"
                        value={capacityComfortable}
                        onChange={(e) => setCapacityComfortable(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Total Area (Sq Ft)</label>
                      <input
                        type="number"
                        placeholder="e.g. 5000"
                        value={areaSqft}
                        onChange={(e) => setAreaSqft(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Floors Within Hall</label>
                      <input
                        type="number"
                        placeholder="For duplex/multi-level halls"
                        value={floorsWithinHall}
                        onChange={(e) => setFloorsWithinHall(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Length (ft)</label>
                      <input
                        type="number"
                        placeholder="100"
                        value={hallLength}
                        onChange={(e) => setHallLength(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Width (ft)</label>
                      <input
                        type="number"
                        placeholder="50"
                        value={hallWidth}
                        onChange={(e) => setHallWidth(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Height (ft)</label>
                      <input
                        type="number"
                        placeholder="18"
                        value={hallHeight}
                        onChange={(e) => setHallHeight(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Ceiling (ft)</label>
                      <input
                        type="number"
                        placeholder="15"
                        value={ceilingHeight}
                        onChange={(e) => setCeilingHeight(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Amenities Checkbox Grid */}
              {activeTab === 'amenities' && (
                <div className="space-y-6">
                  
                  {/* Seating Style */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest border-b border-gray-100 pb-2">Seating Style</h4>
                    <div className="grid grid-cols-2 gap-3.5">
                      {Object.keys(amenitiesSeating).map((key) => (
                        <label key={key} className="flex items-center gap-2.5 text-xs text-gray-600 font-semibold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={amenitiesSeating[key]}
                            onChange={(e) => setAmenitiesSeating({ ...amenitiesSeating, [key]: e.target.checked })}
                            className="w-4 h-4 rounded text-brand-600 border-gray-300 focus:ring-brand-200"
                          />
                          {key.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* AV & Tech */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest border-b border-gray-100 pb-2">AV & Tech</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center gap-2.5 text-xs text-gray-600 font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={amenitiesAV.projector}
                          onChange={(e) => setAmenitiesAV({ ...amenitiesAV, projector: e.target.checked })}
                          className="w-4 h-4 rounded text-brand-600 border-gray-300 focus:ring-brand-200"
                        />
                        Projector Setup
                      </label>
                      {amenitiesAV.projector && (
                        <input
                          type="text"
                          placeholder="e.g. 5000 Lumens HD"
                          value={amenitiesAV.projector_lumens}
                          onChange={(e) => setAmenitiesAV({ ...amenitiesAV, projector_lumens: e.target.value })}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:ring-2 focus:ring-brand-200"
                        />
                      )}

                      <label className="flex items-center gap-2.5 text-xs text-gray-600 font-semibold cursor-pointer col-span-2">
                        <input
                          type="checkbox"
                          checked={amenitiesAV.led_screen}
                          onChange={(e) => setAmenitiesAV({ ...amenitiesAV, led_screen: e.target.checked })}
                          className="w-4 h-4 rounded text-brand-600 border-gray-300 focus:ring-brand-200"
                        />
                        LED Screen/Wall
                      </label>

                      <label className="flex items-center gap-2.5 text-xs text-gray-600 font-semibold cursor-pointer col-span-2">
                        <input
                          type="checkbox"
                          checked={amenitiesAV.pa_sound_system}
                          onChange={(e) => setAmenitiesAV({ ...amenitiesAV, pa_sound_system: e.target.checked })}
                          className="w-4 h-4 rounded text-brand-600 border-gray-300 focus:ring-brand-200"
                        />
                        PA Sound System
                      </label>

                      <label className="flex items-center gap-2.5 text-xs text-gray-600 font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={amenitiesAV.wireless_mics}
                          onChange={(e) => setAmenitiesAV({ ...amenitiesAV, wireless_mics: e.target.checked })}
                          className="w-4 h-4 rounded text-brand-600 border-gray-300 focus:ring-brand-200"
                        />
                        Wireless Microphones
                      </label>
                      {amenitiesAV.wireless_mics && (
                        <input
                          type="number"
                          placeholder="Mics count"
                          value={amenitiesAV.wireless_mics_count}
                          onChange={(e) => setAmenitiesAV({ ...amenitiesAV, wireless_mics_count: Number(e.target.value) })}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:ring-2 focus:ring-brand-200"
                        />
                      )}

                      <label className="flex items-center gap-2.5 text-xs text-gray-600 font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={amenitiesAV.stage_lighting}
                          onChange={(e) => setAmenitiesAV({ ...amenitiesAV, stage_lighting: e.target.checked })}
                          className="w-4 h-4 rounded text-brand-600 border-gray-300 focus:ring-brand-200"
                        />
                        Stage Lighting
                      </label>
                      {amenitiesAV.stage_lighting && (
                        <input
                          type="text"
                          placeholder="e.g. RGB PARs, DMX Console"
                          value={amenitiesAV.stage_lighting_type}
                          onChange={(e) => setAmenitiesAV({ ...amenitiesAV, stage_lighting_type: e.target.value })}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:ring-2 focus:ring-brand-200"
                        />
                      )}
                    </div>
                  </div>

                  {/* Comfort */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest border-b border-gray-100 pb-2">Comfort</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center gap-2.5 text-xs text-gray-600 font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={amenitiesComfort.central_ac}
                          onChange={(e) => setAmenitiesComfort({ ...amenitiesComfort, central_ac: e.target.checked })}
                          className="w-4 h-4 rounded text-brand-600 border-gray-300 focus:ring-brand-200"
                        />
                        Central AC
                      </label>
                      {amenitiesComfort.central_ac && (
                        <input
                          type="text"
                          placeholder="e.g. 50 Tons"
                          value={amenitiesComfort.central_ac_tonnage}
                          onChange={(e) => setAmenitiesComfort({ ...amenitiesComfort, central_ac_tonnage: e.target.value })}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:ring-2 focus:ring-brand-200"
                        />
                      )}

                      <label className="flex items-center gap-2.5 text-xs text-gray-600 font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={amenitiesComfort.split_ac}
                          onChange={(e) => setAmenitiesComfort({ ...amenitiesComfort, split_ac: e.target.checked })}
                          className="w-4 h-4 rounded text-brand-600 border-gray-300 focus:ring-brand-200"
                        />
                        Split AC units
                      </label>
                      {amenitiesComfort.split_ac && (
                        <input
                          type="number"
                          placeholder="Count"
                          value={amenitiesComfort.split_ac_count}
                          onChange={(e) => setAmenitiesComfort({ ...amenitiesComfort, split_ac_count: Number(e.target.value) })}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:ring-2 focus:ring-brand-200"
                        />
                      )}

                      <label className="flex items-center gap-2.5 text-xs text-gray-600 font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={amenitiesComfort.industrial_coolers}
                          onChange={(e) => setAmenitiesComfort({ ...amenitiesComfort, industrial_coolers: e.target.checked })}
                          className="w-4 h-4 rounded text-brand-600 border-gray-300 focus:ring-brand-200"
                        />
                        Industrial Coolers
                      </label>
                      <label className="flex items-center gap-2.5 text-xs text-gray-600 font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={amenitiesComfort.ceiling_fans}
                          onChange={(e) => setAmenitiesComfort({ ...amenitiesComfort, ceiling_fans: e.target.checked })}
                          className="w-4 h-4 rounded text-brand-600 border-gray-300 focus:ring-brand-200"
                        />
                        Ceiling Fans
                      </label>
                    </div>
                  </div>

                  {/* Convenience */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest border-b border-gray-100 pb-2">Convenience</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center gap-2.5 text-xs text-gray-600 font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={amenitiesConvenience.wifi}
                          onChange={(e) => setAmenitiesConvenience({ ...amenitiesConvenience, wifi: e.target.checked })}
                          className="w-4 h-4 rounded text-brand-600 border-gray-300 focus:ring-brand-200"
                        />
                        WiFi Internet
                      </label>
                      {amenitiesConvenience.wifi && (
                        <input
                          type="text"
                          placeholder="e.g. 100 Mbps fiber"
                          value={amenitiesConvenience.wifi_speed}
                          onChange={(e) => setAmenitiesConvenience({ ...amenitiesConvenience, wifi_speed: e.target.value })}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:ring-2 focus:ring-brand-200"
                        />
                      )}

                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Generator Backup</label>
                        <select
                          value={amenitiesConvenience.generator_backup}
                          onChange={(e) => setAmenitiesConvenience({ ...amenitiesConvenience, generator_backup: e.target.value as any })}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none bg-white focus:ring-2 focus:ring-brand-200"
                        >
                          <option value="none">No Generator</option>
                          <option value="partial">Partial Backup (Lights & Fans only)</option>
                          <option value="100%">100% Full Backup (Including ACs)</option>
                        </select>
                      </div>

                      <label className="flex items-center gap-2.5 text-xs text-gray-600 font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={amenitiesConvenience.elevator_access}
                          onChange={(e) => setAmenitiesConvenience({ ...amenitiesConvenience, elevator_access: e.target.checked })}
                          className="w-4 h-4 rounded text-brand-600 border-gray-300 focus:ring-brand-200"
                        />
                        Elevator Access
                      </label>
                      <label className="flex items-center gap-2.5 text-xs text-gray-600 font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={amenitiesConvenience.valet_parking}
                          onChange={(e) => setAmenitiesConvenience({ ...amenitiesConvenience, valet_parking: e.target.checked })}
                          className="w-4 h-4 rounded text-brand-600 border-gray-300 focus:ring-brand-200"
                        />
                        Valet Parking Offered
                      </label>

                      <label className="flex items-center gap-2.5 text-xs text-gray-600 font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={amenitiesConvenience.self_parking}
                          onChange={(e) => setAmenitiesConvenience({ ...amenitiesConvenience, self_parking: e.target.checked })}
                          className="w-4 h-4 rounded text-brand-600 border-gray-300 focus:ring-brand-200"
                        />
                        Self-Parking Lot
                      </label>
                      {amenitiesConvenience.self_parking && (
                        <input
                          type="number"
                          placeholder="Cars capacity"
                          value={amenitiesConvenience.self_parking_capacity}
                          onChange={(e) => setAmenitiesConvenience({ ...amenitiesConvenience, self_parking_capacity: Number(e.target.value) })}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:ring-2 focus:ring-brand-200"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Facilities */}
              {activeTab === 'facilities' && (
                <div className="space-y-6">
                  
                  {/* Washrooms */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest border-b border-gray-100 pb-2">Washrooms</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Total</label>
                        <input
                          type="number"
                          value={totalWashrooms}
                          onChange={(e) => setTotalWashrooms(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-200 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Gents</label>
                        <input
                          type="number"
                          value={gentsWashrooms}
                          onChange={(e) => setGentsWashrooms(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-200 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Ladies</label>
                        <input
                          type="number"
                          value={ladiesWashrooms}
                          onChange={(e) => setLadiesWashrooms(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-200 outline-none"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2.5 text-xs text-gray-600 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={disabledWashroom}
                        onChange={(e) => setDisabledWashroom(e.target.checked)}
                        className="w-4 h-4 rounded text-brand-600 border-gray-300 focus:ring-brand-200"
                      />
                      Differently-Abled / Wheelchair Washroom Available
                    </label>
                  </div>

                  {/* Changing Suites */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest border-b border-gray-100 pb-2">Changing Suites & Green Rooms</h4>
                    <div className="grid grid-cols-2 gap-4">
                      
                      <div className="col-span-2 space-y-2">
                        <label className="flex items-center gap-2.5 text-xs text-gray-600 font-semibold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={bridalSuite}
                            onChange={(e) => setBridalSuite(e.target.checked)}
                            className="w-4 h-4 rounded text-brand-600 border-gray-300 focus:ring-brand-200"
                          />
                          Bridal Suite / Getting Ready Room
                        </label>
                        {bridalSuite && (
                          <div className="pl-6.5">
                            <input
                              type="number"
                              placeholder="Suite Area in Sq Ft"
                              value={bridalSuiteSqft}
                              onChange={(e) => setBridalSuiteSqft(e.target.value)}
                              className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:ring-2 focus:ring-brand-200 w-full max-w-[200px]"
                            />
                          </div>
                        )}
                      </div>

                      <label className="flex items-center gap-2.5 text-xs text-gray-600 font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={groomRoom}
                          onChange={(e) => setGroomRoom(e.target.checked)}
                          className="w-4 h-4 rounded text-brand-600 border-gray-300 focus:ring-brand-200"
                        />
                        Groom's Changing Room
                      </label>

                      <label className="flex items-center gap-2.5 text-xs text-gray-600 font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={greenRoom}
                          onChange={(e) => setGreenRoom(e.target.checked)}
                          className="w-4 h-4 rounded text-brand-600 border-gray-300 focus:ring-brand-200"
                        />
                        Green Room / Artist Room
                      </label>
                    </div>
                  </div>

                  {/* Kitchen & F&B */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest border-b border-gray-100 pb-2">Kitchen & Bar Space</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Catering Kitchen</label>
                        <select
                          value={cateringKitchen}
                          onChange={(e) => setCateringKitchen(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none bg-white focus:ring-2 focus:ring-brand-200"
                        >
                          <option value="none">No Kitchen space attached</option>
                          <option value="inhouse">Inhouse Catering only</option>
                          <option value="outside_allowed">Outside Catering Allowed</option>
                          <option value="both">Both (Inhouse & Outside Allowed)</option>
                        </select>
                      </div>

                      <label className="flex items-center gap-2.5 text-xs text-gray-600 font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={bartenderSpace}
                          onChange={(e) => setBartenderSpace(e.target.checked)}
                          className="w-4 h-4 rounded text-brand-600 border-gray-300 focus:ring-brand-200"
                        />
                        Dedicated Bartender Setup Space
                      </label>
                    </div>
                  </div>

                  {/* Attached Outdoor / Storage / Security */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest border-b border-gray-100 pb-2">Other spaces</h4>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2.5 text-xs text-gray-600 font-semibold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={outdoorSpaceAttached}
                            onChange={(e) => setOutdoorSpaceAttached(e.target.checked)}
                            className="w-4 h-4 rounded text-brand-600 border-gray-300 focus:ring-brand-200"
                          />
                          Attached Outdoor Space (Garden / Balcony)
                        </label>
                        {outdoorSpaceAttached && (
                          <div className="pl-6.5">
                            <input
                              type="number"
                              placeholder="Outdoor Area in Sq Ft"
                              value={outdoorSpaceSqft}
                              onChange={(e) => setOutdoorSpaceSqft(e.target.value)}
                              className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:ring-2 focus:ring-brand-200 w-full max-w-[200px]"
                            />
                          </div>
                        )}
                      </div>

                      <label className="flex items-center gap-2.5 text-xs text-gray-600 font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={decorStorage}
                          onChange={(e) => setDecorStorage(e.target.checked)}
                          className="w-4 h-4 rounded text-brand-600 border-gray-300 focus:ring-brand-200"
                        />
                        Decor Storage Room Available
                      </label>

                      <label className="flex items-center gap-2.5 text-xs text-gray-600 font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={securityPost}
                          onChange={(e) => setSecurityPost(e.target.checked)}
                          className="w-4 h-4 rounded text-brand-600 border-gray-300 focus:ring-brand-200"
                        />
                        Dedicated Security Guard Post
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: Pricing */}
              {activeTab === 'pricing' && (
                <div className="space-y-6">
                  
                  {/* Slots and Rent */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest border-b border-gray-100 pb-2">Base Rentals</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Base Space Rental (₹) *</label>
                        <input
                          type="number"
                          placeholder="e.g. 150000"
                          value={baseRental}
                          onChange={(e) => setBaseRental(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Morning Slot Price (₹)</label>
                        <input
                          type="number"
                          placeholder="6am - 12pm"
                          value={morningSlot}
                          onChange={(e) => setMorningSlot(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Evening Slot Price (₹)</label>
                        <input
                          type="number"
                          placeholder="12pm - 6pm"
                          value={eveningSlot}
                          onChange={(e) => setEveningSlot(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Night Slot Price (₹)</label>
                        <input
                          type="number"
                          placeholder="6pm - 12am"
                          value={nightSlot}
                          onChange={(e) => setNightSlot(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Full Day Price (₹)</label>
                        <input
                          type="number"
                          placeholder="6am - 12am"
                          value={fullDay}
                          onChange={(e) => setFullDay(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all font-semibold text-brand-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Premium and Policies */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest border-b border-gray-100 pb-2">Premiums & Policies</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Weekend Premium (%)</label>
                        <input
                          type="number"
                          placeholder="e.g. 10"
                          value={weekendPremium}
                          onChange={(e) => setWeekendPremium(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Season Premium (%)</label>
                        <input
                          type="number"
                          placeholder="Wedding Season (Nov-Mar)"
                          value={seasonPremium}
                          onChange={(e) => setSeasonPremium(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Advance Deposit (%)</label>
                        <input
                          type="number"
                          placeholder="Default 25%"
                          value={advanceDeposit}
                          onChange={(e) => setAdvanceDeposit(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Min Booking Hours</label>
                        <input
                          type="number"
                          placeholder="Default 4 hours"
                          value={minBookingHours}
                          onChange={(e) => setMinBookingHours(Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Overtime Hourly Rate (₹)</label>
                        <input
                          type="number"
                          placeholder="Hourly overtime penalty"
                          value={overtimeRate}
                          onChange={(e) => setOvertimeRate(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Catering Plate Rates */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest border-b border-gray-100 pb-2">Catering Plate Prices (₹)</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Veg Plate</label>
                        <input
                          type="number"
                          placeholder="800"
                          value={cateringVeg}
                          onChange={(e) => setCateringVeg(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-200 outline-none font-bold text-success-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Non-Veg Plate</label>
                        <input
                          type="number"
                          placeholder="1000"
                          value={cateringNonveg}
                          onChange={(e) => setCateringNonveg(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-200 outline-none font-bold text-rose-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Jain Veg Plate</label>
                        <input
                          type="number"
                          placeholder="850"
                          value={cateringJain}
                          onChange={(e) => setCateringJain(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-200 outline-none font-bold text-amber-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Decoration Packages */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest border-b border-gray-100 pb-2">Decoration Packages</h4>
                    
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Package Name (e.g. Royal Floral)"
                        value={newPackageName}
                        onChange={(e) => setNewPackageName(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none focus:ring-2 focus:ring-brand-200"
                      />
                      <input
                        type="number"
                        placeholder="Price (₹)"
                        value={newPackagePrice}
                        onChange={(e) => setNewPackagePrice(e.target.value)}
                        className="w-[100px] px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none focus:ring-2 focus:ring-brand-200"
                      />
                      <button
                        type="button"
                        onClick={handleAddDecorPackage}
                        className="px-3.5 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-600 text-xs font-bold transition-colors active:scale-95 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {decorPackages.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">No custom decoration packages listed.</p>
                      ) : (
                        decorPackages.map((pkg, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-gray-50 border border-gray-150 rounded-xl px-3.5 py-2.5 text-xs">
                            <span className="font-semibold text-gray-800">{pkg.name}</span>
                            <div className="flex items-center gap-3">
                              <span className="font-extrabold text-gray-900">₹{pkg.price.toLocaleString('en-IN')}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveDecorPackage(idx)}
                                className="text-rose-500 hover:bg-rose-100/50 p-1.5 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 6: Media and Links */}
              {activeTab === 'media' && (
                <div className="space-y-6">
                  
                  {/* Photo Upload Grid */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest border-b border-gray-100 pb-2">Photos (Up to 10)</h4>
                    
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={isUploading || images.length >= 10}
                        onClick={() => document.getElementById('hall-images-input')?.click()}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-600 flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50"
                      >
                        {isUploading ? (
                          <span className="w-3.5 h-3.5 rounded-full border border-gray-300 border-t-brand-600 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5 text-gray-500" />
                        )}
                        Upload Photos
                      </button>
                      <span className="text-[10px] text-gray-400 font-semibold">{images.length}/10 uploaded</span>
                      <input
                        type="file"
                        id="hall-images-input"
                        onChange={handleImageUpload}
                        accept="image/*"
                        multiple
                        className="hidden"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3.5 pt-2">
                      {images.map((img, idx) => (
                        <div key={idx} className="relative aspect-video rounded-xl border border-gray-150 overflow-hidden bg-gray-50 group shadow-3xs">
                          <img src={img} alt="Preview" className="w-full h-full object-cover" />
                          
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setCoverPhotoIndex(idx)}
                              className={cn(
                                "p-1.5 rounded-lg text-xs font-bold transition-all active:scale-95",
                                coverPhotoIndex === idx 
                                  ? "bg-success-600 text-white" 
                                  : "bg-white text-gray-700 hover:bg-gray-100"
                              )}
                              title="Set Primary Cover"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                              title="Delete Photo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {coverPhotoIndex === idx && (
                            <span className="absolute bottom-1.5 left-1.5 bg-brand-600 text-white text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded shadow-2xs tracking-wider">
                              Cover
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Virtual and Video Tours */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest border-b border-gray-100 pb-2">Virtual & Video Tours</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">360° Virtual Tour URL</label>
                        <input
                          type="url"
                          placeholder="https://my.matterport.com/show/?m=xxxxxxxx"
                          value={tour360Url}
                          onChange={(e) => setTour360Url(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">YouTube Tour Video URL</label>
                        <input
                          type="url"
                          placeholder="https://www.youtube.com/watch?v=xxxxxxxx"
                          value={youtubeVideoUrl}
                          onChange={(e) => setYoutubeVideoUrl(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Actions */}
            <div className="px-6 py-4 border-t border-gray-150 space-y-2.5 bg-gray-50/50">
              <button
                onClick={handleSave}
                disabled={isSaving || isUploading}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50"
              >
                {isSaving ? (
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                {editingHallId ? 'Update Venue Space' : 'Register Venue Space'}
              </button>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
      {isShareModalOpen && selectedHallForShare && (
        <WhatsappShareModal
          isOpen={isShareModalOpen}
          onClose={() => {
            setIsShareModalOpen(false);
            setSelectedHallForShare(null);
          }}
          hall={selectedHallForShare}
        />
      )}
    </div>
  );
}
