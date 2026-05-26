import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Copy } from 'lucide-react';
import { useDataStore } from '@/stores/data-store';
import { hallTypeLabels, type Hall } from '@/types/venue';
import { toast } from 'sonner';
import { WhatsAppIcon } from '../shared/WhatsAppButton';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  hall: Hall;
}

export function getHallSpecsMessage(hall: Hall, orgName: string, recipientName?: string): string {
  const pricingConf = hall.pricing_config || {};
  const basePrice = pricingConf.base_rental || (hall.pricing?.base_price_paise ? hall.pricing.base_price_paise / 100 : 0);
  const vegPlate = pricingConf.catering_veg || (hall.pricing?.per_plate_veg_paise ? hall.pricing.per_plate_veg_paise / 100 : null);
  const nonvegPlate = pricingConf.catering_nonveg || (hall.pricing?.per_plate_nonveg_paise ? hall.pricing.per_plate_nonveg_paise / 100 : null);

  // Extract selected amenities dynamically
  const activeAmenities: string[] = [];
  const cfg = hall.amenities_config || {};

  // Comfort
  if (cfg.comfort) {
    if (cfg.comfort.central_ac) {
      activeAmenities.push(`Central AC${cfg.comfort.central_ac_tonnage ? ` (${cfg.comfort.central_ac_tonnage})` : ''}`);
    } else if (cfg.comfort.split_ac) {
      activeAmenities.push(`Split AC (${cfg.comfort.split_ac_count || 4} units)`);
    }
    if (cfg.comfort.industrial_coolers) activeAmenities.push('Industrial Coolers');
    if (cfg.comfort.heating) activeAmenities.push('Heating');
  }

  // AV & Tech
  if (cfg.av_tech) {
    if (cfg.av_tech.projector) activeAmenities.push(`Projector${cfg.av_tech.projector_lumens ? ` (${cfg.av_tech.projector_lumens})` : ''}`);
    if (cfg.av_tech.led_screen) activeAmenities.push('LED Screen/Wall');
    if (cfg.av_tech.pa_sound_system) activeAmenities.push('PA Sound System');
    if (cfg.av_tech.wireless_mics) activeAmenities.push(`Wireless Mics (${cfg.av_tech.wireless_mics_count || 2})`);
    if (cfg.av_tech.live_streaming) activeAmenities.push('Live Streaming');
    if (cfg.av_tech.dj_console_space) activeAmenities.push('DJ Console Space');
    if (cfg.av_tech.stage_lighting) activeAmenities.push(`Stage Lighting${cfg.av_tech.stage_lighting_type ? ` (${cfg.av_tech.stage_lighting_type})` : ''}`);
  }

  // Convenience
  if (cfg.convenience) {
    if (cfg.convenience.wifi) activeAmenities.push(`WiFi${cfg.convenience.wifi_speed ? ` (${cfg.convenience.wifi_speed})` : ''}`);
    if (cfg.convenience.generator_backup && cfg.convenience.generator_backup !== 'none') {
      activeAmenities.push(`Power Backup (${cfg.convenience.generator_backup})`);
    }
    if (cfg.convenience.elevator_access) activeAmenities.push('Elevator Access');
    if (cfg.convenience.valet_parking) activeAmenities.push('Valet Parking');
    if (cfg.convenience.self_parking) activeAmenities.push(`Self Parking (${cfg.convenience.self_parking_capacity || 0} cars)`);
  }

  // Fallback to static list if empty
  const finalAmenities = activeAmenities.length > 0
    ? activeAmenities.join(', ')
    : (hall.amenities && hall.amenities.length > 0 ? hall.amenities.join(', ') : 'N/A');

  // Facilities info
  const fac = hall.facilities_config || {};
  const activeFacilities: string[] = [];
  if (fac.bridal_suite) activeFacilities.push(`Bridal Suite${fac.bridal_suite_sqft ? ` (${fac.bridal_suite_sqft} sq ft)` : ''}`);
  if (fac.groom_room) activeFacilities.push("Groom's Changing Room");
  if (fac.green_room) activeFacilities.push('Green Room');
  if (fac.catering_kitchen && fac.catering_kitchen !== 'none') {
    const kitchenLabels = {
      inhouse: 'Inhouse Kitchen only',
      outside_allowed: 'Outside Catering Allowed',
      both: 'Inhouse & Outside Allowed'
    };
    activeFacilities.push(kitchenLabels[fac.catering_kitchen] || fac.catering_kitchen);
  }
  if (fac.outdoor_space_attached) activeFacilities.push(`Attached Outdoor Space${fac.outdoor_space_sqft ? ` (${fac.outdoor_space_sqft} sq ft)` : ''}`);
  if (fac.total_washrooms) activeFacilities.push(`${fac.total_washrooms} Washrooms`);

  const facilitiesText = activeFacilities.length > 0 ? `\n🏢 *Facilities*: ${activeFacilities.join(', ')}` : '';

  const nameStr = recipientName ? ` ${recipientName}` : '';
  const greeting = nameStr ? `Hello${nameStr},\n\n` : '';

  return `${greeting}Greetings from *${orgName}*! Here are the details for our venue space *${hall.name}*:\n\n` +
    `🏛️ *Type*: ${hallTypeLabels[hall.type] || hall.type}\n` +
    `👥 *Capacity*: Min ${hall.capacity_min} - Max ${hall.capacity_max} guests (Comfortable: ${hall.capacity_comfortable || 'N/A'})\n` +
    `📐 *Area*: ${hall.area_sqft ? hall.area_sqft.toLocaleString() + ' sq ft' : 'N/A'}` +
    (hall.hall_length && hall.hall_width ? ` (${hall.hall_length}x${hall.hall_width} ft)` : '') + `\n` +
    `💰 *Base Price*: ₹${basePrice.toLocaleString('en-IN')}\n` +
    `🟢 *Veg Plate*: ${vegPlate ? '₹' + vegPlate.toLocaleString('en-IN') : 'N/A'}\n` +
    `🔴 *Non-Veg Plate*: ${nonvegPlate ? '₹' + nonvegPlate.toLocaleString('en-IN') : 'N/A'}\n\n` +
    `✨ *Amenities*: ${finalAmenities}` +
    facilitiesText + `\n\n` +
    (hall.description ? `📝 *Description*: ${hall.description}\n\n` : '') +
    `Let us know if you would like to schedule a visit or place a hold on a tentative date!`;
}

export function WhatsappShareModal({ isOpen, onClose, hall }: Props) {
  const organization = useDataStore((s) => s.organization);
  const leads = useDataStore((s) => s.leads);

  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [message, setMessage] = useState('');

  // Sync message template when name or selected lead changes
  useEffect(() => {
    setMessage(getHallSpecsMessage(hall, organization.name, recipientName));
  }, [recipientName, hall, organization.name]);

  // Handle lead selection change
  const handleLeadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const leadId = e.target.value;
    setSelectedLeadId(leadId);

    if (leadId) {
      const lead = leads.find((l) => l.id === leadId);
      if (lead) {
        setRecipientName(lead.name);
        setRecipientPhone(lead.phone);
      }
    } else {
      setRecipientName('');
      setRecipientPhone('');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    toast.success('Hall specifications copied to clipboard! 📋');
  };

  const handleSend = () => {
    let phone = recipientPhone.replace(/\D/g, ''); // strip non-digits
    if (!phone) {
      toast.error('Recipient phone number is required to send via WhatsApp');
      return;
    }

    // Default to prefixing 91 (India) if number is 10 digits
    if (phone.length === 10) {
      phone = '91' + phone;
    }

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    toast.success('Redirecting to WhatsApp... 💬');
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 bg-black/50 z-50 drawer-overlay animate-fade-in" onClick={onClose} />
      <div className="fixed inset-0 flex items-start sm:items-center justify-center p-4 z-50 overflow-y-auto">
        <div
          className="relative bg-white border border-gray-200 rounded-3xl w-full max-w-xl shadow-2xl flex flex-col p-4 md:p-6 my-auto overflow-hidden animate-scale-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-150 pb-4 mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <WhatsAppIcon className="w-5 h-5 text-emerald-600" />
                Share Hall Specifications
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Send hall layouts, capacity, and pricing to leads.</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors text-gray-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Lead selector */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Select Active Lead (Optional)</label>
              <select
                value={selectedLeadId}
                onChange={handleLeadChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none bg-white font-medium"
              >
                <option value="">-- Choose from Inquiries pipeline --</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.phone}) - {l.event_type || 'General'}
                  </option>
                ))}
              </select>
            </div>

            {/* Recipient info inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Recipient Name</label>
                <input
                  type="text"
                  placeholder="e.g. Suresh Verma"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Recipient WhatsApp Phone</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all font-mono"
                />
              </div>
            </div>

            {/* Message Preview */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Specs Text Message Preview</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={10}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-200 outline-none transition-all font-mono resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-t border-gray-150 pt-4 mt-5 gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-250 text-gray-600 hover:text-gray-900 hover:bg-gray-50 active:scale-95 transition-all text-xs font-bold"
              title="Copy details specs text to clipboard"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Specs</span>
            </button>

            <button
              onClick={handleSend}
              className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95 transition-all text-xs font-bold shadow-sm"
              title="Open WhatsApp Web or app to send text"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>Send via WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
