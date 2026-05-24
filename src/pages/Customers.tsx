import { useState } from 'react';
import { Search, Plus, Phone, Mail, MapPin, Edit } from 'lucide-react';
import { cn, formatCurrency, formatPhone, getInitials } from '@/lib/utils';
import { useDataStore } from '@/stores/data-store';
import { WhatsAppButton } from '@/components/shared/WhatsAppButton';
import { useUIStore } from '@/stores/ui-store';
import { customerSourceLabels } from '@/types/customer';

export default function Customers() {
  const [search, setSearch] = useState('');
  const openAddCustomer = useUIStore((s) => s.openAddCustomer);
  const openEditCustomer = useUIStore((s) => s.openEditCustomer);

  const customers = useDataStore((s) => s.customers);
  const bookings = useDataStore((s) => s.bookings);
  const payments = useDataStore((s) => s.payments);

  const filtered = customers.filter((c) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return c.name.toLowerCase().includes(s) || c.phone.includes(search);
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-400 mt-0.5">{customers.length} total customers</p>
        </div>
        <button onClick={openAddCustomer}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 active:scale-95 transition-all shadow-sm">
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="text" placeholder="Search by phone number or name..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none bg-white shadow-sm text-base" autoFocus />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        {filtered.map((customer) => {
          const bookingCount = bookings.filter((b) => b.customer_id === customer.id).length;
          const paidTotal = payments
            .filter((p) => {
              const bk = bookings.find((b) => b.id === p.booking_id);
              return bk?.customer_id === customer.id && p.status === 'received';
            })
            .reduce((s, p) => s + p.amount_paise, 0);

          return (
            <div key={customer.id} className="bg-white rounded-2xl border border-gray-100 p-5 card-hover group">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <span className="text-base font-bold text-brand-700">{getInitials(customer.name)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 truncate">{customer.name}</h3>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" />{formatPhone(customer.phone)}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => openEditCustomer(customer.id)} className="p-2 rounded-xl border border-gray-100 hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-all" title="Edit Customer">
                    <Edit className="w-4 h-4" />
                  </button>
                  <WhatsAppButton phone={customer.phone} size="md" customerId={customer.id} />
                </div>
              </div>

              {customer.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {customer.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500 capitalize">{tag}</span>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-50">
                <div className="text-center">
                  <p className="text-xs text-gray-400">Bookings</p>
                  <p className="text-sm font-bold text-gray-900">{bookingCount}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">Total Paid</p>
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(paidTotal)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">Source</p>
                  <p className="text-[11px] font-semibold text-brand-600">{customerSourceLabels[customer.source]}</p>
                </div>
              </div>

              {(customer.email || customer.address) && (
                <div className="mt-3 pt-3 border-t border-gray-50 space-y-1.5">
                  {customer.email && <p className="text-xs text-gray-400 flex items-center gap-1.5 truncate"><Mail className="w-3 h-3 flex-shrink-0" />{customer.email}</p>}
                  {customer.address && <p className="text-xs text-gray-400 flex items-center gap-1.5 truncate"><MapPin className="w-3 h-3 flex-shrink-0" />{customer.address}</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
