import { useState, useEffect } from 'react';
import { X, MessageSquare, Copy, Send, HelpCircle } from 'lucide-react';
import { useDataStore } from '@/stores/data-store';
import { formatCurrency, formatDateReadable, formatTime } from '@/lib/utils';
import { eventTypeLabels } from '@/types/booking';
import { toast } from 'sonner';

interface WhatsappTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone: string;
  bookingId?: string;
  leadId?: string;
  customerId?: string;
}

interface TemplateOption {
  id: string;
  name: string;
  subject: string;
  templateText: string;
}

export function WhatsappTemplateModal({
  isOpen,
  onClose,
  phone,
  bookingId,
  leadId,
  customerId,
}: WhatsappTemplateModalProps) {
  const getBookingById = useDataStore((s) => s.getBookingById);
  const getCustomerById = useDataStore((s) => s.getCustomerById);
  const getLeadById = useDataStore((s) => s.getLeadById);
  const getHallById = useDataStore((s) => s.getHallById);
  const getPaymentsForBooking = useDataStore((s) => s.getPaymentsForBooking);
  const organization = useDataStore((s) => s.organization);

  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [editedMessage, setEditedMessage] = useState('');
  const [recipientName, setRecipientName] = useState('');

  // 1. Fetch relevant record context & compile variables
  useEffect(() => {
    if (!isOpen) return;

    const orgName = organization?.name || 'VenuePro';
    let vars: Record<string, string> = {
      org_name: orgName,
      customer_name: 'Valued Customer',
      lead_name: 'Valued Client',
    };

    let contextType: 'booking' | 'lead' | 'customer' | 'general' = 'general';

    if (bookingId) {
      contextType = 'booking';
      const booking = getBookingById(bookingId);
      if (booking) {
        const cust = getCustomerById(booking.customer_id);
        const hall = getHallById(booking.hall_id);
        const payments = getPaymentsForBooking(bookingId);
        const totalPaid = payments.filter((p) => p.status === 'received').reduce((s, p) => s + p.amount_paise, 0);
        const balance = booking.total_amount_paise - totalPaid;

        if (cust) {
          vars.customer_name = cust.name;
          setRecipientName(cust.name);
        }
        vars.hall_name = hall?.name || 'Main Hall';
        vars.event_date = formatDateReadable(booking.event_date);
        vars.start_time = formatTime(booking.start_time);
        vars.end_time = formatTime(booking.end_time);
        vars.event_type = eventTypeLabels[booking.event_type] || booking.event_type;
        vars.total_amount = formatCurrency(booking.total_amount_paise).replace('₹', 'Rs. ');
        vars.advance_amount = formatCurrency(booking.advance_amount_paise).replace('₹', 'Rs. ');
        vars.total_paid = formatCurrency(totalPaid).replace('₹', 'Rs. ');
        vars.balance_due = formatCurrency(balance).replace('₹', 'Rs. ');
        vars.guest_count = String(booking.guest_count || 0);
        vars.notes = booking.notes || 'No special requests';
      }
    } else if (leadId) {
      contextType = 'lead';
      const lead = getLeadById(leadId);
      if (lead) {
        vars.lead_name = lead.name;
        setRecipientName(lead.name);
        vars.event_type = lead.event_type ? eventTypeLabels[lead.event_type as keyof typeof eventTypeLabels] || lead.event_type : 'your upcoming event';
        vars.tentative_date = lead.tentative_date ? formatDateReadable(lead.tentative_date) : 'TBD';
        vars.guest_count = String(lead.guest_count || 0);
        vars.budget_min = lead.budget_min_paise ? formatCurrency(lead.budget_min_paise).replace('₹', 'Rs. ') : 'TBD';
        vars.budget_max = lead.budget_max_paise ? formatCurrency(lead.budget_max_paise).replace('₹', 'Rs. ') : 'TBD';
        vars.hall_preference = lead.hall_preference || 'Main Hall';
      }
    } else if (customerId) {
      contextType = 'customer';
      const cust = getCustomerById(customerId);
      if (cust) {
        vars.customer_name = cust.name;
        setRecipientName(cust.name);
      }
    }

    // Define templates based on context type
    let compiledTemplates: TemplateOption[] = [];

    if (contextType === 'booking') {
      compiledTemplates = [
        {
          id: 'booking_confirm',
          name: 'Booking Confirmation',
          subject: 'Confirm booking schedule and financial terms',
          templateText: `Hello {{customer_name}},\n\nWe are pleased to confirm your booking at *{{org_name}}*!\n\n📅 *Event Date*: {{event_date}}\n🏛️ *Hall*: {{hall_name}}\n🕒 *Timings*: {{start_time}} to {{end_time}}\n📊 *Event Type*: {{event_type}}\n\n💳 *Total Amount*: {{total_amount}}\n💰 *Advance Paid*: {{advance_amount}}\n⏳ *Balance Due*: {{balance_due}}\n\nThank you for choosing us! Looking forward to hosting a memorable event.\n\nWarm regards,\n*{{org_name}}*`,
        },
        {
          id: 'payment_reminder',
          name: 'Payment Balance Reminder',
          subject: 'Friendly reminder to clear pending dues',
          templateText: `Hello {{customer_name}},\n\nThis is a friendly reminder regarding the balance payment for your booking at *{{org_name}}* ({{hall_name}}) on {{event_date}}.\n\n💳 *Total Cost*: {{total_amount}}\n💰 *Paid to Date*: {{total_paid}}\n⏳ *Pending Balance*: {{balance_due}}\n\nKindly clear the dues at your earliest convenience to avoid any last-minute hassles.\n\nWarm regards,\n*{{org_name}}*`,
        },
        {
          id: 'setup_details',
          name: 'Event Setup Preferences',
          subject: 'Ask customer to finalize hall decoration and setup details',
          templateText: `Hello {{customer_name}},\n\nWith your event at *{{org_name}}* ({{hall_name}}) coming up on {{event_date}}, we would love to finalize the setup preferences with you.\n\n👥 *Expected Guests*: {{guest_count}}\n🕒 *Timings*: {{start_time}} - {{end_time}}\n📝 *Current Notes*: {{notes}}\n\nPlease reply with any specific decoration needs, catering timings, or stage layout preferences so we can prepare accordingly.\n\nBest regards,\n*{{org_name}}*`,
        },
      ];
    } else if (contextType === 'lead') {
      compiledTemplates = [
        {
          id: 'lead_followup',
          name: 'Inquiry Follow-up',
          subject: 'Check-in on active date inquiry and venue package status',
          templateText: `Hello {{lead_name}},\n\nThank you for reaching out to *{{org_name}}* regarding your upcoming {{event_type}}! We wanted to check if you had a chance to review our packages.\n\n📅 *Tentative Date*: {{tentative_date}}\n👥 *Estimated Guests*: {{guest_count}}\n\nLet us know if you would like to block the date tentatively or discuss custom packages.\n\nBest regards,\n*{{org_name}}*`,
        },
        {
          id: 'site_visit',
          name: 'Schedule Site Visit',
          subject: 'Invite lead to visit the venue hall and facilities',
          templateText: `Hello {{lead_name}},\n\nWe would love to show you around *{{org_name}}*! A site tour is the best way to visualize your event in our beautiful spaces.\n\nWe have slots available this week. Please let us know if a particular date and time works for you to visit.\n\nBest regards,\n*{{org_name}}*`,
        },
        {
          id: 'quote_proposal',
          name: 'Pricing & Quote Summary',
          subject: 'Brief summary of estimated pricing for guests / budget',
          templateText: `Hello {{lead_name}},\n\nHere is a quick estimate for your proposed {{event_type}} at *{{org_name}}*:\n\n🏛️ *Preferred Space*: {{hall_preference}}\n👥 *Estimated Guests*: {{guest_count}}\n💰 *Budget Range*: {{budget_min}} - {{budget_max}}\n\nWe can customize this further based on your specific requirements (catering, decor, DJ, etc.). Let us know when we can connect for a detailed quote!\n\nBest regards,\n*{{org_name}}*`,
        },
      ];
    } else {
      // General or customer context
      compiledTemplates = [
        {
          id: 'general_greeting',
          name: 'General Follow-up',
          subject: 'Greeting check-in for customer relations',
          templateText: `Hello {{customer_name}},\n\nGreetings from *{{org_name}}*!\n\nWe value your association with us. Please let us know if there is anything we can assist you with today (booking a new event, checking availability, or receipts).\n\nBest regards,\n*{{org_name}}*`,
        },
        {
          id: 'promo_brochure',
          name: 'Venue Promotion',
          subject: 'Information brochure and features pitch',
          templateText: `Hello {{customer_name}},\n\nGreetings from *{{org_name}}*!\n\nPlanning a family event, wedding, or corporate conference? We have premium halls, central AC, catering packages, and ample parking space. Let us know if we can help you host your next event!\n\nBest regards,\n*{{org_name}}*`,
        },
      ];
    }

    // Parse placeholders for each template option
    const parsedOptions = compiledTemplates.map((t) => {
      let parsed = t.templateText;
      Object.entries(vars).forEach(([k, val]) => {
        parsed = parsed.replaceAll(`{{${k}}}`, val);
      });
      return {
        ...t,
        templateText: parsed,
      };
    });

    setTemplates(parsedOptions);
    if (parsedOptions.length > 0) {
      setSelectedTemplateId(parsedOptions[0].id);
      setEditedMessage(parsedOptions[0].templateText);
    }
  }, [isOpen, bookingId, leadId, customerId, organization, phone]);

  // Handle template selection change
  const handleSelectTemplate = (id: string) => {
    setSelectedTemplateId(id);
    const tmpl = templates.find((t) => t.id === id);
    if (tmpl) {
      setEditedMessage(tmpl.templateText);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editedMessage);
    toast.success('Message copied to clipboard! 📋');
  };

  const handleSend = () => {
    let cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone) {
      toast.error('Recipient phone number is required to send via WhatsApp');
      return;
    }

    if (cleanPhone.length === 10) {
      cleanPhone = '91' + cleanPhone;
    }

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(editedMessage)}`;
    window.open(whatsappUrl, '_blank');
    toast.success('Redirecting to WhatsApp... 💬');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 drawer-overlay animate-fade-in" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div
          className="relative bg-white border border-gray-250 rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col p-6 overflow-hidden animate-scale-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-150 pb-4 mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                WhatsApp message templates
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Send context-specific texts to <span className="font-bold text-gray-600">{recipientName || phone}</span>
              </p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors text-gray-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Grid Layout: Template Options & Editor */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-5 min-h-[340px]">
            {/* Left Column: Template Selection Tabs (2/5 size) */}
            <div className="md:col-span-2 flex flex-col gap-2 pr-0 md:pr-3 border-r-0 md:border-r border-gray-150">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Select Template</label>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {templates.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => handleSelectTemplate(tmpl.id)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                      selectedTemplateId === tmpl.id
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-bold text-gray-900 block mb-0.5">{tmpl.name}</span>
                    <span className="text-[10px] text-gray-400 line-clamp-1">{tmpl.subject}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Message Editor & Preview (3/5 size) */}
            <div className="md:col-span-3 flex flex-col justify-between">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Message Preview & Edit</label>
                <textarea
                  value={editedMessage}
                  onChange={(e) => setEditedMessage(e.target.value)}
                  rows={10}
                  className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300 outline-none transition-all font-mono leading-relaxed resize-none bg-gray-50/20"
                />
              </div>

              {/* Tips banner */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-2 mt-3">
                <HelpCircle className="w-4.5 h-4.5 text-brand-500 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  Variables are parsed below. Text formatting like *bold* is kept intact for WhatsApp display. You can edit this text freely before sending.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between border-t border-gray-150 pt-4 mt-5 gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-250 text-gray-600 hover:text-gray-900 hover:bg-gray-50 active:scale-95 transition-all text-xs font-bold"
              title="Copy message to clipboard"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Message</span>
            </button>

            <button
              onClick={handleSend}
              className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95 transition-all text-xs font-bold shadow-sm"
              title="Open WhatsApp Web or app to send text"
            >
              <Send className="w-4 h-4" />
              <span>Send via WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
