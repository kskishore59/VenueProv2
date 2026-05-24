import { useState, useEffect } from 'react';
import { X, Check, Trash2, Phone } from 'lucide-react';
import { cn, validateIndianPhone } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';
import { useDataStore } from '@/stores/data-store';
import { customerSourceLabels, type CustomerSource } from '@/types/customer';
import { toast } from 'sonner';

const sources: CustomerSource[] = ['walk_in', 'phone_call', 'whatsapp', 'google', 'referral', 'social_media', 'justdial', 'website', 'other'];

export function EditCustomerDrawer() {
  const isOpen = useUIStore((s) => s.isEditCustomerOpen);
  const customerId = useUIStore((s) => s.selectedEditCustomerId);
  const closeEditCustomer = useUIStore((s) => s.closeEditCustomer);
  const showConfirm = useUIStore((s) => s.showConfirm);

  const customer = useDataStore((s) => (customerId ? s.getCustomerById(customerId) : undefined));
  const updateCustomer = useDataStore((s) => s.updateCustomer);
  const deleteCustomer = useDataStore((s) => s.deleteCustomer);
  const bookings = useDataStore((s) => s.bookings);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [source, setSource] = useState<CustomerSource>('walk_in');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setPhone(customer.phone);
      setEmail(customer.email || '');
      setSource(customer.source);
      setAddress(customer.address || '');
      setNotes(customer.notes || '');
    }
  }, [customer]);

  if (!isOpen || !customerId || !customer) return null;

  const handleSave = async () => {
    if (isSaving) return;
    if (!name.trim()) { toast.error('Name is required'); return; }
    if (!validateIndianPhone(phone)) { toast.error('Enter a valid 10-digit phone number'); return; }

    setIsSaving(true);
    try {
      await updateCustomer(customerId, {
        name: name.trim(),
        phone,
        email: email || null,
        source,
        address: address || null,
        notes: notes || null,
      });
      toast.success('Customer updated! 👤');
      closeEditCustomer();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update customer');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    // Check active bookings
    const hasActiveBookings = bookings.some(
      (b) => b.customer_id === customerId && b.status !== 'completed' && b.status !== 'cancelled'
    );

    if (hasActiveBookings) {
      toast.error('Cannot delete customer with active or upcoming bookings');
      return;
    }

    showConfirm({
      title: 'Delete Customer',
      description: `Are you sure you want to delete customer "${customer.name}"? This action cannot be undone.`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deleteCustomer(customerId);
          closeEditCustomer();
        } catch (err: any) {
          toast.error(err.message || 'Failed to delete customer');
        }
      },
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50 drawer-overlay" onClick={closeEditCustomer} />
      <div className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl flex flex-col drawer-content">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Edit Customer</h2>
            <p className="text-xs text-gray-400 mt-0.5">{customer.name}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              id="btn-ec-delete"
              onClick={handleDelete}
              className="p-2 rounded-xl hover:bg-rose-50 text-rose-500 transition-colors"
              title="Delete Customer"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button onClick={closeEditCustomer} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
              Name <span className="text-danger-500">*</span>
            </label>
            <input id="input-ec-name" type="text" placeholder="Customer name" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-300 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
              Phone <span className="text-danger-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input id="input-ec-phone" type="tel" placeholder="98765 43210" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-300 outline-none transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Email</label>
            <input id="input-ec-email" type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-300 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Source</label>
            <select id="select-ec-source" value={source} onChange={(e) => setSource(e.target.value as CustomerSource)}
              className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-300 outline-none transition-all appearance-none bg-white">
              {sources.map((s) => <option key={s} value={s}>{customerSourceLabels[s]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Address</label>
            <textarea id="textarea-ec-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full address..."
              rows={2} className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-300 outline-none transition-all resize-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Notes</label>
            <textarea id="textarea-ec-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any notes..."
              rows={2} className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-300 outline-none transition-all resize-none" />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4 space-y-2.5">
          <button id="btn-ec-save" onClick={handleSave}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 active:scale-[0.98] transition-all shadow-sm disabled:opacity-55 disabled:cursor-not-allowed">
            {isSaving ? (
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {isSaving ? 'Saving Changes...' : 'Save Changes'}
          </button>
          <button id="btn-ec-cancel" onClick={closeEditCustomer}
            className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
