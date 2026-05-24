import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';
import { useDataStore } from '@/stores/data-store';
import { hallTypeLabels } from '@/types/venue';
import { toast } from 'sonner';

const hallTypes = ['main_banquet_hall', 'conference_room', 'lawn_garden', 'terrace', 'boardroom', 'other'] as const;

export function AddHallModal() {
  const isOpen = useUIStore((s) => s.isAddHallOpen);
  const closeAddHall = useUIStore((s) => s.closeAddHall);
  const createHall = useDataStore((s) => s.createHall);

  const [name, setName] = useState('');
  const [type, setType] = useState<string>('main_banquet_hall');
  const [capMin, setCapMin] = useState('');
  const [capMax, setCapMax] = useState('');
  const [areaSqft, setAreaSqft] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) { toast.error('Hall name is required'); return; }
    if (!capMax) { toast.error('Maximum capacity is required'); return; }

    setIsSubmitting(true);
    try {
      await createHall({
        name: name.trim(),
        type,
        capacity_min: Number(capMin) || 0,
        capacity_max: Number(capMax),
        area_sqft: areaSqft ? Number(areaSqft) : undefined,
        base_price_paise: basePrice ? Number(basePrice) * 100 : undefined,
      });

      toast.success('Hall added! 🏛️', { description: name });
      handleClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add hall');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    closeAddHall();
    setName(''); setType('main_banquet_hall'); setCapMin(''); setCapMax(''); setAreaSqft(''); setBasePrice('');
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 drawer-overlay" onClick={handleClose} />
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="bg-white w-full sm:w-[440px] sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto shadow-2xl modal-content">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Add Hall / Space</h3>
            <button onClick={handleClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                Hall Name <span className="text-danger-500">*</span>
              </label>
              <input type="text" placeholder="e.g., Grand Ballroom" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-300 outline-none transition-all" autoFocus />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-300 outline-none transition-all appearance-none bg-white">
                {hallTypes.map((t) => <option key={t} value={t}>{hallTypeLabels[t]}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Min Capacity</label>
                <input type="number" placeholder="50" value={capMin} onChange={(e) => setCapMin(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-300 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                  Max Capacity <span className="text-danger-500">*</span>
                </label>
                <input type="number" placeholder="500" value={capMax} onChange={(e) => setCapMax(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-300 outline-none transition-all" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Area (sq ft)</label>
                <input type="number" placeholder="5000" value={areaSqft} onChange={(e) => setAreaSqft(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-300 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Base Price (₹)</label>
                <input type="number" placeholder="2,50,000" value={basePrice} onChange={(e) => setBasePrice(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-300 outline-none transition-all" />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 space-y-2.5">
            <button onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 active:scale-[0.98] transition-all shadow-sm disabled:opacity-55 disabled:cursor-not-allowed">
              {isSubmitting ? (
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {isSubmitting ? 'Registering Hall...' : 'Add Hall'}
            </button>
            <button onClick={handleClose}
              className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
