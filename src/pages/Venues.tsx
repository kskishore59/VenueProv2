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
  Copy,
  ChefHat,
  Download,
  FileText
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
import { EmptyState } from '@/components/shared/EmptyState';
import type { Menu, MenuItem, DishType, SpicinessLevel } from '@/types/menu';
import { dishTypeLabels, spicinessLabels, menuCategories } from '@/types/menu';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.37 5.054L2 22l5.132-1.347a9.936 9.936 0 0 0 4.88 1.28h.005c5.502 0 9.985-4.479 9.988-9.987C22 6.478 17.518 2 12.012 2zm5.835 14.288c-.24.672-1.214 1.272-1.665 1.342-.456.07-1.048.14-3.011-.64-2.505-1.01-4.14-3.57-4.26-3.73-.125-.16-1.002-1.32-1.002-2.52 0-1.2.626-1.79.845-2.04.223-.25.485-.31.646-.31.162 0 .324.004.464.01.146.007.342-.056.536.4.2.47.68 1.656.738 1.777.06.12.097.26.018.42-.078.16-.178.26-.297.394-.12.133-.25.28-.358.375-.12.1-.247.21-.106.45.142.24.63 1.03 1.353 1.67.93.824 1.708 1.08 1.95 1.2.24.12.38.1.522-.06.14-.17.61-.71.772-.95.163-.24.325-.2.548-.12.223.08 1.417.67 1.66.79.243.12.404.18.463.28.06.1.06.58-.18 1.25z" />
  </svg>
);

export const downloadMenuPDF = (menu: Menu, orgName: string) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    toast.error('Popup blocker is active. Please enable popups to print/download PDF.');
    return;
  }
  
  const vegNonvegLabel = menu.food_type === 'both' ? 'Veg & Non-Veg' : menu.food_type === 'veg' ? 'Pure Vegetarian' : menu.food_type === 'non_veg' ? 'Non-Vegetarian' : 'Jain Friendly';
  const foodColor = menu.food_type === 'veg' ? '#10b981' : menu.food_type === 'non_veg' ? '#ef4444' : '#6366f1';
  
  // Group items by category
  const categoriesMap: Record<string, MenuItem[]> = {};
  menu.items.forEach(item => {
    if (!categoriesMap[item.category]) {
      categoriesMap[item.category] = [];
    }
    categoriesMap[item.category].push(item);
  });
  
  const categoriesHtml = Object.entries(categoriesMap).map(([category, items]) => `
    <div class="category-section">
      <h3 class="category-header">${category}</h3>
      <div class="dishes-grid">
        ${items.map(item => `
          <div class="dish-card">
            <div class="dish-header">
              <span class="dish-name">${item.name}</span>
              <div class="dish-badges">
                <span class="dish-badge badge-${item.type}">${item.type.replace('_', ' ').toUpperCase()}</span>
                ${item.spiciness ? `<span class="dish-badge badge-spiciness">${item.spiciness.replace('_', ' ').toUpperCase()}</span>` : ''}
                ${item.extra_charge_paise ? `<span class="dish-badge badge-premium">+₹${item.extra_charge_paise / 100}</span>` : ''}
              </div>
            </div>
            ${item.description ? `<p class="dish-desc">${item.description}</p>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  const tagsHtml = menu.tags && menu.tags.length > 0 ? `
    <div class="tags-container">
      ${menu.tags.map(t => `<span class="tag">✦ ${t}</span>`).join('')}
    </div>
  ` : '';

  printWindow.document.write(`
    <html>
      <head>
        <title>${menu.name} - Catering Menu</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap');
          body {
            font-family: 'Outfit', sans-serif;
            color: #1e293b;
            margin: 0;
            padding: 40px;
            background-color: #ffffff;
            -webkit-print-color-adjust: exact;
          }
          .header {
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 20px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .org-title {
            font-size: 14px;
            font-weight: 800;
            color: #4f46e5;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin: 0 0 5px 0;
          }
          .menu-title {
            font-size: 28px;
            font-weight: 800;
            color: #0f172a;
            margin: 0;
            letter-spacing: -0.5px;
          }
          .price-block {
            text-align: right;
          }
          .price-val {
            font-size: 24px;
            font-weight: 800;
            color: #4f46e5;
          }
          .price-unit {
            font-size: 12px;
            color: #64748b;
            font-weight: 600;
          }
          .meta-row {
            display: flex;
            gap: 15px;
            margin-bottom: 25px;
            font-size: 13px;
            font-weight: 600;
          }
          .meta-badge {
            background-color: #f1f5f9;
            padding: 6px 12px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            color: #334155;
          }
          .meta-badge.food-type {
            border-left: 4px solid ${foodColor};
          }
          .tags-container {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 30px;
          }
          .tag {
            font-size: 11px;
            font-weight: 600;
            background-color: #faf5ff;
            color: #7c3aed;
            border: 1px solid #f3e8ff;
            padding: 4px 10px;
            border-radius: 6px;
          }
          .category-section {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          .category-header {
            font-size: 16px;
            font-weight: 800;
            text-transform: uppercase;
            color: #4f46e5;
            border-bottom: 2px solid #f1f5f9;
            padding-bottom: 8px;
            margin: 0 0 15px 0;
            letter-spacing: 1px;
          }
          .dishes-grid {
            display: grid;
            grid-template-cols: 1fr 1fr;
            gap: 15px;
          }
          @media (max-width: 600px) {
            .dishes-grid {
              grid-template-cols: 1fr;
            }
          }
          .dish-card {
            border: 1px solid #f1f5f9;
            background-color: #f8fafc;
            padding: 12px 16px;
            border-radius: 12px;
          }
          .dish-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
            margin-bottom: 4px;
          }
          .dish-name {
            font-size: 14px;
            font-weight: 600;
            color: #0f172a;
          }
          .dish-badges {
            display: flex;
            gap: 4px;
          }
          .dish-badge {
            font-size: 8px;
            font-weight: 800;
            padding: 2px 5px;
            border-radius: 4px;
          }
          .badge-veg { background-color: #dcfce7; color: #15803d; }
          .badge-non_veg { background-color: #fee2e2; color: #b91c1c; }
          .badge-vegan { background-color: #ecfdf5; color: #047857; }
          .badge-jain { background-color: #fef3c7; color: #d97706; }
          .badge-spiciness { background-color: #ffedd5; color: #c2410c; }
          .badge-premium { background-color: #f3e8ff; color: #6b21a8; border: 1px solid #e9d5ff; }
          .dish-desc {
            font-size: 11px;
            color: #64748b;
            margin: 0;
            line-height: 1.4;
          }
          .footer-note {
            margin-top: 50px;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
            border-top: 1px solid #f1f5f9;
            padding-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="org-title">${orgName}</div>
            <h1 class="menu-title">${menu.name}</h1>
          </div>
          <div class="price-block">
            <div class="price-val">₹${menu.price_paise / 100}</div>
            <div class="price-unit">per plate</div>
          </div>
        </div>
        
        <div class="meta-row">
          <div class="meta-badge food-type">${vegNonvegLabel}</div>
          <div class="meta-badge">${menu.category}</div>
        </div>
        
        ${tagsHtml}
        
        ${categoriesHtml}
        
        <div class="footer-note">
          Generated via VenuePro V2 Governance Console. Surcharges on premium items apply as noted.
        </div>
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

export const copyMenuToClipboard = (menu: Menu) => {
  const vegNonvegLabel = menu.food_type === 'both' ? 'Veg & Non-Veg' : menu.food_type === 'veg' ? 'Pure Vegetarian' : menu.food_type === 'non_veg' ? 'Non-Vegetarian' : 'Jain Friendly';
  
  // Group items by category
  const categoriesMap: Record<string, MenuItem[]> = {};
  menu.items.forEach(item => {
    if (!categoriesMap[item.category]) {
      categoriesMap[item.category] = [];
    }
    categoriesMap[item.category].push(item);
  });
  
  let text = `=======================================\n`;
  text += `${menu.name.toUpperCase()}\n`;
  text += `=======================================\n`;
  text += `Price: ₹${menu.price_paise / 100} / plate\n`;
  text += `Type: ${vegNonvegLabel}\n`;
  text += `Category: ${menu.category}\n`;
  if (menu.tags && menu.tags.length > 0) {
    text += `Highlights: ${menu.tags.join(' • ')}\n`;
  }
  text += `\n`;
  
  Object.entries(categoriesMap).forEach(([category, items]) => {
    text += `--- ${category.toUpperCase()} ---\n`;
    items.forEach(item => {
      let dishDetails = `- ${item.name}`;
      const badges: string[] = [];
      badges.push(item.type.toUpperCase());
      if (item.spiciness) {
        badges.push(item.spiciness.replace('_', ' ').toUpperCase());
      }
      if (item.extra_charge_paise) {
        badges.push(`+₹${item.extra_charge_paise / 100}`);
      }
      dishDetails += ` (${badges.join(', ')})`;
      if (item.description) {
        dishDetails += ` - ${item.description}`;
      }
      text += `${dishDetails}\n`;
    });
    text += `\n`;
  });
  
  text += `Generated via VenuePro.`;
  
  navigator.clipboard.writeText(text);
  toast.success('Catering menu copied to clipboard! 📋');
};

type TabType = 'basic' | 'dimensions' | 'amenities' | 'facilities' | 'pricing' | 'media';

export default function Venues() {
  const halls = useDataStore((s) => s.halls);
  const createHall = useDataStore((s) => s.createHall);
  const updateHall = useDataStore((s) => s.updateHall);
  const deleteHall = useDataStore((s) => s.deleteHall);
  const uploadMedia = useDataStore((s) => s.uploadMedia);

  // Catering Menu Store & Local States
  const menus = useDataStore((s) => s.menus);
  const createMenu = useDataStore((s) => s.createMenu);
  const updateMenu = useDataStore((s) => s.updateMenu);
  const deleteMenu = useDataStore((s) => s.deleteMenu);

  const [currentTab, setCurrentTab] = useState<'halls' | 'menus'>('halls');
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);

  // Menu Form fields
  const [menuName, setMenuName] = useState('');
  const [menuPrice, setMenuPrice] = useState('');
  const [menuFoodType, setMenuFoodType] = useState<'veg' | 'non_veg' | 'both' | 'jain'>('veg');
  const [menuCategory, setMenuCategory] = useState('Buffet');
  const [menuTags, setMenuTags] = useState<string[]>([]);
  const [newMenuTag, setNewMenuTag] = useState('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [newDishName, setNewDishName] = useState('');
  const [newDishCategory, setNewDishCategory] = useState<string>('Starters');
  const [newDishType, setNewDishType] = useState<DishType>('veg');
  const [newDishDescription, setNewDishDescription] = useState('');
  const [newDishExtraCharge, setNewDishExtraCharge] = useState('');
  const [newDishSpiciness, setNewDishSpiciness] = useState<SpicinessLevel>('medium');
  const [menuSelectedHallIds, setMenuSelectedHallIds] = useState<string[]>([]);
  const [isSavingMenu, setIsSavingMenu] = useState(false);

  const handleOpenAddMenu = () => {
    setEditingMenuId(null);
    setMenuName('');
    setMenuPrice('');
    setMenuFoodType('veg');
    setMenuCategory('Buffet');
    setMenuTags([]);
    setMenuItems([]);
    setNewDishName('');
    setNewDishCategory('Starters');
    setNewDishType('veg');
    setNewDishDescription('');
    setNewDishExtraCharge('');
    setNewDishSpiciness('medium');
    setMenuSelectedHallIds([]);
    setIsMenuDrawerOpen(true);
  };

  const handleOpenEditMenu = (menu: any) => {
    setEditingMenuId(menu.id);
    setMenuName(menu.name);
    setMenuPrice(String(menu.price_paise / 100));
    setMenuFoodType(menu.food_type);
    setMenuCategory(menu.category);
    setMenuTags(menu.tags || []);
    setMenuItems(menu.items || []);
    setNewDishName('');
    setNewDishCategory('Starters');
    setNewDishType('veg');
    setNewDishDescription('');
    setNewDishExtraCharge('');
    setNewDishSpiciness('medium');
    setMenuSelectedHallIds(menu.hall_ids || []);
    setIsMenuDrawerOpen(true);
  };

  const handleAddMenuTag = () => {
    if (newMenuTag.trim() && !menuTags.includes(newMenuTag.trim())) {
      setMenuTags([...menuTags, newMenuTag.trim()]);
      setNewMenuTag('');
    }
  };

  const handleRemoveMenuTag = (tag: string) => {
    setMenuTags(menuTags.filter(t => t !== tag));
  };

  const handleAddMenuItem = () => {
    if (!newDishName.trim()) {
      toast.error('Dish name is required');
      return;
    }
    const cleanName = newDishName.trim();
    if (menuItems.some(i => i.name.toLowerCase() === cleanName.toLowerCase())) {
      toast.error('A dish with this name is already in the package.');
      return;
    }
    const extraVal = Number(newDishExtraCharge);
    const extraChargePaise = (isNaN(extraVal) || extraVal <= 0) ? 0 : extraVal * 100;
    
    const newDish: MenuItem = {
      name: cleanName,
      category: newDishCategory,
      type: newDishType,
      description: newDishDescription.trim() || undefined,
      extra_charge_paise: extraChargePaise || undefined,
      spiciness: newDishSpiciness
    };

    setMenuItems([...menuItems, newDish]);
    
    // Reset dish inputs
    setNewDishName('');
    setNewDishDescription('');
    setNewDishExtraCharge('');
    setNewDishSpiciness('medium');
  };

  const handleRemoveMenuItem = (itemToRemove: MenuItem) => {
    setMenuItems(menuItems.filter(i => i.name !== itemToRemove.name));
  };

  const handleSaveMenu = async () => {
    if (!menuName.trim()) {
      toast.error('Menu name is required');
      return;
    }
    const priceVal = Number(menuPrice);
    if (isNaN(priceVal) || priceVal <= 0) {
      toast.error('Valid plate price is required');
      return;
    }

    setIsSavingMenu(true);
    try {
      const data = {
        name: menuName.trim(),
        price_paise: priceVal * 100,
        food_type: menuFoodType,
        category: menuCategory.trim(),
        tags: menuTags,
        items: menuItems,
        hall_ids: menuSelectedHallIds,
      };

      if (editingMenuId) {
        await updateMenu(editingMenuId, data);
        toast.success('Menu package updated! 🍽️');
      } else {
        await createMenu(data);
        toast.success('New menu package created! 🎉');
      }
      setIsMenuDrawerOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save menu package');
    } finally {
      setIsSavingMenu(false);
    }
  };

  const handleDeleteMenu = async (id: string) => {
    if (confirm('Are you sure you want to delete this menu package?')) {
      try {
        await deleteMenu(id);
        toast.success('Menu package deleted.');
      } catch (err: any) {
        toast.error('Failed to delete menu package');
      }
    }
  };

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
  const [type, setType] = useState<HallType>('banquet_hall');
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
    setType('banquet_hall');
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
          <h1 className="text-2xl font-bold text-gray-900">
            {currentTab === 'halls' ? 'Venues & Spaces' : 'Catering Menus'}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {currentTab === 'halls'
              ? 'Configure halls, dimensions, pricing premiums, and facilities'
              : 'Configure catering menu packages, pricing, and associate them with halls'}
          </p>
        </div>
        {canManageVenues && (
          <button
            onClick={currentTab === 'halls' ? handleOpenAdd : handleOpenAddMenu}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 active:scale-95 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> {currentTab === 'halls' ? 'Add Space' : 'Add Menu Package'}
          </button>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 border-b border-gray-150 pb-px">
        <button
          onClick={() => setCurrentTab('halls')}
          className={cn(
            'px-4 py-2 text-xs font-bold border-b-2 -mb-px transition-all flex items-center gap-1.5',
            currentTab === 'halls'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-gray-400 hover:text-gray-655'
          )}
        >
          <Building2 className="w-3.5 h-3.5" />
          Spaces & Halls ({halls.length})
        </button>
        <button
          onClick={() => setCurrentTab('menus')}
          className={cn(
            'px-4 py-2 text-xs font-bold border-b-2 -mb-px transition-all flex items-center gap-1.5',
            currentTab === 'menus'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-gray-400 hover:text-gray-655'
          )}
        >
          <ChefHat className="w-3.5 h-3.5" />
          Catering Menus ({menus.length})
        </button>
      </div>

      {/* Venues Grid */}
      {currentTab === 'halls' ? (halls.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No spaces configured"
          description="Add your first banquet hall, outdoor lawn, or conference room, define seating capacities, and set rental pricing."
          action={canManageVenues ? { label: "Add First Space", onClick: handleOpenAdd } : undefined}
        />
      ) : (
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

                  {/* Associated Menu Packages */}
                  <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100/50">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Catering Packages</span>
                    <div className="flex flex-wrap gap-1">
                      {menus.filter((m) => m.hall_ids?.includes(hall.id)).length === 0 ? (
                        <span className="text-[10px] text-gray-400 italic">No packages linked</span>
                      ) : (
                        menus.filter((m) => m.hall_ids?.includes(hall.id)).map((m) => (
                          <span key={m.id} className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold bg-white text-slate-700 border border-slate-200/50 shadow-3xs">
                            {m.name} (₹{m.price_paise / 100})
                          </span>
                        ))
                      )}
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
                        <WhatsAppIcon className={cn(
                          'w-5 h-5',
                        )} />
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
      )) : (
        menus.length === 0 ? (
          <EmptyState
            icon={ChefHat}
            title="No menu packages configured"
            description="Create your catering menu packages, price per plate, and associate them with your halls."
            action={canManageVenues ? { label: "Add Menu Package", onClick: handleOpenAddMenu } : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {menus.map((menu) => {
              const linkedHalls = halls.filter((h) => menu.hall_ids?.includes(h.id));
              
              return (
                <div key={menu.id} className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col p-5 space-y-4">
                  {/* Header info */}
                  <div className="flex justify-between items-start">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize tracking-wider",
                      menu.food_type === 'veg' && "bg-success-50 text-success-700 border-success-205",
                      menu.food_type === 'non_veg' && "bg-rose-50 text-rose-700 border-rose-205",
                      menu.food_type === 'both' && "bg-violet-50 text-violet-700 border-violet-205",
                      menu.food_type === 'jain' && "bg-amber-50 text-amber-700 border-amber-205"
                    )}>
                      {menu.food_type === 'both' ? 'Veg & Non-Veg' : menu.food_type.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-semibold text-gray-450 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                      {menu.category}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-gray-900 leading-tight">{menu.name}</h3>
                    <div className="flex items-baseline gap-1 text-brand-650">
                      <span className="text-xl font-extrabold font-display">₹{menu.price_paise / 100}</span>
                      <span className="text-xs font-semibold text-gray-450">/ plate</span>
                    </div>
                  </div>

                  {/* Special Tags */}
                  {menu.tags && menu.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {menu.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100/70 text-gray-600 border border-gray-150/50">
                          ✦ {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Included Items Grouped by Category */}
                  {menu.items && menu.items.length > 0 && (
                    <div className="space-y-2 pt-1 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dishes / Items ({menu.items.length})</span>
                      <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                        {Object.entries(
                          menu.items.reduce((acc, item) => {
                            const cat = item.category || 'Main Course';
                            if (!acc[cat]) acc[cat] = [];
                            acc[cat].push(item);
                            return acc;
                          }, {} as Record<string, MenuItem[]>)
                        ).map(([category, items]) => (
                          <div key={category} className="space-y-0.5">
                            <span className="text-[9px] font-black text-brand-600 uppercase tracking-wider block">{category}</span>
                            <div className="space-y-0.5">
                              {items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-[11px] text-gray-600 pl-1.5">
                                  <div className="flex items-center gap-1 min-w-0">
                                    <span className={cn(
                                      "w-1.5 h-1.5 rounded-full flex-shrink-0",
                                      item.type === 'veg' && "bg-success-500",
                                      item.type === 'non_veg' && "bg-rose-500",
                                      item.type === 'vegan' && "bg-emerald-500",
                                      item.type === 'jain' && "bg-amber-500",
                                    )} title={item.type} />
                                    <span className="truncate font-semibold">{item.name}</span>
                                  </div>
                                  {item.extra_charge_paise ? (
                                    <span className="text-[9px] font-bold text-purple-600 shrink-0">+₹{item.extra_charge_paise / 100}</span>
                                  ) : null}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Linked Halls list */}
                  <div className="border-t border-gray-100 pt-3 flex-1 flex flex-col justify-end">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Linked Spaces</span>
                    <div className="flex flex-wrap gap-1.5">
                      {linkedHalls.length === 0 ? (
                        <span className="text-xs text-gray-450 italic">Not linked to any space</span>
                      ) : (
                        linkedHalls.map((h) => (
                          <span key={h.id} className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-brand-50 text-brand-700 border border-brand-100/30">
                            {h.name}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Export and Management Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100/70">
                    <button
                      onClick={() => {
                        const orgName = useDataStore.getState().organization.name;
                        downloadMenuPDF(menu, orgName);
                      }}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-gray-150 flex items-center justify-center"
                      title="Download Menu PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => copyMenuToClipboard(menu)}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-gray-150 flex items-center justify-center"
                      title="Copy Menu to Clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    {canManageVenues && (
                      <>
                        <button
                          onClick={() => handleOpenEditMenu(menu)}
                          className="flex-1 py-2 text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl transition-all text-center"
                        >
                          Edit Package
                        </button>
                        <button
                          onClick={() => handleDeleteMenu(menu.id)}
                          className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100"
                          title="Delete Menu Package"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

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
                          <div className="pl-6">
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
                          <div className="pl-6">
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
              <div className="flex gap-2">
                {editingHallId && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to delete this space? This action cannot be undone.')) {
                        try {
                          await deleteHall(editingHallId);
                          setIsDrawerOpen(false);
                          resetForm();
                        } catch (err: any) {
                          toast.error(err.message || 'Failed to delete space');
                        }
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors text-sm font-semibold"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Space
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className={cn(
                    "rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-50 transition-colors py-2.5",
                    editingHallId ? "flex-1 px-4" : "w-full px-4"
                  )}
                >
                  Cancel
                </button>
              </div>
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

      {/* Menu Edit/Add Drawer Modal */}
      {isMenuDrawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 drawer-overlay animate-fade-in" onClick={() => setIsMenuDrawerOpen(false)} />
          <div className="fixed inset-y-0 right-0 max-w-md w-full z-50 bg-white shadow-2xl flex flex-col animate-slide-in">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-150 bg-gray-50/50 bg-white">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{editingMenuId ? 'Edit Menu Package' : 'Add Catering Menu'}</h3>
                <p className="text-xs text-gray-400 mt-0.5">Define price, tags, and select linked spaces</p>
              </div>
              <button onClick={() => setIsMenuDrawerOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider font-semibold">Package Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Royal Wedding Buffet"
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider font-semibold">Price / Plate (₹) *</label>
                  <input
                    type="number"
                    placeholder="800"
                    value={menuPrice}
                    onChange={(e) => setMenuPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider font-semibold">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Buffet, Hi-Tea"
                    value={menuCategory}
                    onChange={(e) => setMenuCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider font-semibold">Food Type</label>
                <select
                  value={menuFoodType}
                  onChange={(e) => setMenuFoodType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none bg-white font-semibold text-gray-700"
                >
                  <option value="veg">Pure Vegetarian</option>
                  <option value="non_veg">Non-Vegetarian</option>
                  <option value="both">Veg & Non-Veg</option>
                  <option value="jain">Jain Friendly</option>
                </select>
              </div>

              {/* Special Tags interactive adder */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider font-semibold">Special Menu Tags</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Welcome Drink"
                    value={newMenuTag}
                    onChange={(e) => setNewMenuTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddMenuTag();
                      }
                    }}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all font-semibold"
                  />
                  <button
                    type="button"
                    onClick={handleAddMenuTag}
                    className="px-4 py-2 bg-brand-50 text-brand-600 rounded-xl text-xs font-bold hover:bg-brand-100 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {menuTags.length === 0 ? (
                    <span className="text-xs text-gray-400 italic">No tags added yet</span>
                  ) : (
                    menuTags.map((tag, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">
                        {tag}
                        <button type="button" onClick={() => handleRemoveMenuTag(tag)} className="text-slate-400 hover:text-slate-600 font-black pl-1">×</button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Menu Items / Dishes interactive list */}
              <div className="space-y-4 border-t border-gray-100 pt-4">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Menu Items / Dishes</label>
                
                {/* Advanced Dish Inputs */}
                <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Dish Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Kadai Paneer"
                        value={newDishName}
                        onChange={(e) => setNewDishName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-brand-500 outline-none bg-white font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Category *</label>
                      <select
                        value={newDishCategory}
                        onChange={(e) => setNewDishCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-brand-500 outline-none bg-white font-bold text-gray-700"
                      >
                        {menuCategories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Type</label>
                      <select
                        value={newDishType}
                        onChange={(e) => setNewDishType(e.target.value as DishType)}
                        className="w-full px-2 py-2 rounded-xl border border-gray-200 text-[11px] focus:ring-1 focus:ring-brand-500 outline-none bg-white font-bold text-gray-700"
                      >
                        <option value="veg">Veg</option>
                        <option value="non_veg">Non-Veg</option>
                        <option value="vegan">Vegan</option>
                        <option value="jain">Jain</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Spiciness</label>
                      <select
                        value={newDishSpiciness}
                        onChange={(e) => setNewDishSpiciness(e.target.value as SpicinessLevel)}
                        className="w-full px-2 py-2 rounded-xl border border-gray-200 text-[11px] focus:ring-1 focus:ring-brand-500 outline-none bg-white font-bold text-gray-700"
                      >
                        <option value="mild">Mild</option>
                        <option value="medium">Medium</option>
                        <option value="spicy">Spicy</option>
                        <option value="extra_spicy">Extra Spicy</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Extra Fee (₹)</label>
                      <input
                        type="number"
                        placeholder="e.g. 50"
                        value={newDishExtraCharge}
                        onChange={(e) => setNewDishExtraCharge(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-brand-500 outline-none bg-white font-bold text-gray-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Description (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Creamy paneer with onions & bell peppers"
                      value={newDishDescription}
                      onChange={(e) => setNewDishDescription(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-brand-500 outline-none bg-white font-semibold"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddMenuItem}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-99 shadow-xs"
                  >
                    <Plus className="w-4 h-4" /> Add Dish to Package
                  </button>
                </div>

                {/* List of Added Dishes, Grouped by Category */}
                <div className="space-y-3.5 max-h-[280px] overflow-y-auto pr-1">
                  {menuItems.length === 0 ? (
                    <span className="text-xs text-gray-400 italic block text-center py-4 bg-gray-50 border border-dashed border-gray-200 rounded-2xl">No items or dishes added yet. Configure above to add.</span>
                  ) : (
                    Object.entries(
                      menuItems.reduce((acc, item) => {
                        if (!acc[item.category]) acc[item.category] = [];
                        acc[item.category].push(item);
                        return acc;
                      }, {} as Record<string, MenuItem[]>)
                    ).map(([category, items]) => (
                      <div key={category} className="space-y-2">
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-wider block border-b border-gray-100 pb-1">{category}</span>
                        <div className="space-y-1.5">
                          {items.map((item) => (
                            <div key={item.name} className="flex justify-between items-start bg-gray-50 border border-gray-150 rounded-xl p-3 text-xs gap-3">
                              <div className="space-y-0.5 min-w-0">
                                <div className="flex items-center flex-wrap gap-1.5">
                                  <span className="font-extrabold text-gray-800 truncate">{item.name}</span>
                                  <span className={cn(
                                    "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider",
                                    item.type === 'veg' && "bg-success-100 text-success-800",
                                    item.type === 'non_veg' && "bg-rose-100 text-rose-800",
                                    item.type === 'vegan' && "bg-emerald-100 text-emerald-800",
                                    item.type === 'jain' && "bg-amber-100 text-amber-800",
                                  )}>
                                    {item.type.replace('_', ' ')}
                                  </span>
                                  {item.spiciness && (
                                    <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 text-[8px] font-black uppercase tracking-wider">
                                      {item.spiciness.replace('_', ' ')}
                                    </span>
                                  )}
                                  {item.extra_charge_paise ? (
                                    <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 text-[8px] font-black tracking-wider">
                                      +₹{item.extra_charge_paise / 100}
                                    </span>
                                  ) : null}
                                </div>
                                {item.description && (
                                  <p className="text-[10px] text-gray-400 line-clamp-1 leading-normal">{item.description}</p>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveMenuItem(item)}
                                className="text-rose-500 hover:bg-rose-100/50 p-1.5 rounded-lg transition-colors shrink-0 self-center"
                                title="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Multi-select active halls mapping */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider font-semibold">Link to Spaces & Halls</label>
                <div className="border border-gray-150 rounded-2xl p-4 space-y-3 bg-gray-50/50">
                  {halls.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No halls configured to link</p>
                  ) : (
                    halls.map((hall) => (
                      <label key={hall.id} className="flex items-center gap-2.5 text-xs font-bold text-gray-700 cursor-pointer hover:text-gray-900 transition-colors">
                        <input
                          type="checkbox"
                          checked={menuSelectedHallIds.includes(hall.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setMenuSelectedHallIds([...menuSelectedHallIds, hall.id]);
                            } else {
                              setMenuSelectedHallIds(menuSelectedHallIds.filter((id) => id !== hall.id));
                            }
                          }}
                          className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer"
                        />
                        <span>{hall.name} ({hallTypeLabels[hall.type] || hall.type})</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 p-6 bg-gray-50/50 flex gap-3 shrink-0 bg-white">
              <button
                onClick={handleSaveMenu}
                disabled={isSavingMenu}
                className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all hover:scale-[1.01] active:scale-99 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSavingMenu && <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                <span>{editingMenuId ? 'Save Changes' : 'Create Package'}</span>
              </button>
              <button
                onClick={() => setIsMenuDrawerOpen(false)}
                className="px-5 py-3 border border-gray-250 hover:bg-gray-100 rounded-xl text-sm font-semibold text-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
