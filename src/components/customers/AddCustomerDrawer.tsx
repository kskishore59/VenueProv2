import { useState } from 'react';
import { X, Plus, Phone } from 'lucide-react';
import { cn, validateIndianPhone } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';
import { useDataStore } from '@/stores/data-store';
import { customerSourceLabels, type CustomerSource } from '@/types/customer';
import { toast } from 'sonner';

const sources: CustomerSource[] = ['walk_in', 'phone_call', 'whatsapp', 'google', 'referral', 'social_media', 'justdial', 'website', 'other'];

export function AddCustomerDrawer() {
  const isOpen = useUIStore((s) => s.isAddCustomerOpen);
  const closeAddCustomer = useUIStore((s) => s.closeAddCustomer);
  const createCustomer = useDataStore((s) => s.createCustomer);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [source, setSource] = useState<CustomerSource>('walk_in');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!name.trim()) { toast.error('Name is required'); return; }
    if (!validateIndianPhone(phone)) { toast.error('Enter a valid 10-digit phone number'); return; }

    setIsSubmitting(true);
    try {
      await createCustomer({ name: name.trim(), phone, email: email || undefined, source, address: address || undefined, notes: notes || undefined });
      toast.success('Customer added! 👤', { description: `${name} — ${phone}` });
      handleClose();
    } catch (err) {
      toast.error('Failed to add customer');
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    closeAddCustomer();
    setName(''); setPhone(''); setEmail(''); setSource('walk_in'); setAddress(''); setNotes('');
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50 drawer-overlay" onClick={handleClose} />
      <div className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl flex flex-col drawer-content">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Add Customer</h2>
            <p className="text-xs text-gray-400 mt-0.5">Create a new customer record</p>
          </div>
          <button onClick={handleClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
              Name <span className="text-danger-500">*</span>
            </label>
            <input id="input-ac-name" type="text" placeholder="Customer name" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-300 outline-none transition-all" autoFocus />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
              Phone <span className="text-danger-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input id="input-ac-phone" type="tel" placeholder="98765 43210" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-300 outline-none transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Email</label>
            <input id="input-ac-email" type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-300 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Source</label>
            <select id="select-ac-source" value={source} onChange={(e) => setSource(e.target.value as CustomerSource)}
              className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-300 outline-none transition-all appearance-none bg-white">
              {sources.map((s) => <option key={s} value={s}>{customerSourceLabels[s]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Address</label>
            <textarea id="textarea-ac-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full address..."
              rows={2} className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-300 outline-none transition-all resize-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Notes</label>
            <textarea id="textarea-ac-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any notes..."
              rows={2} className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-300 outline-none transition-all resize-none" />
          </div>
        </div>

        <div className="border-t border-gray-100 px-6 py-4 space-y-2.5">
          <button id="btn-ac-submit" onClick={handleSubmit} disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? 'Adding Customer...' : (
              <>
                <Plus className="w-4 h-4" /> Add Customer
              </>
            )}
          </button>
          <button id="btn-ac-cancel" onClick={handleClose}
            className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
