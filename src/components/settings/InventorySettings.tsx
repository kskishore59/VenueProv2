import { useState, useEffect } from 'react';
import { useDataStore } from '@/stores/data-store';
import { Plus, Edit2, Trash2, Boxes, Package, Info, Search } from 'lucide-react';
import { toast } from 'sonner';
import { inventoryCategoryLabels, type InventoryItem, type InventoryCategory } from '@/types/inventory';
import { cn } from '@/lib/utils';

export function InventorySettings() {
  const inventoryItems = useDataStore((s) => s.inventoryItems);
  const createInventoryItem = useDataStore((s) => s.createInventoryItem);
  const updateInventoryItem = useDataStore((s) => s.updateInventoryItem);
  const deleteInventoryItem = useDataStore((s) => s.deleteInventoryItem);
  const fetchInventory = useDataStore((s) => s.fetchInventory);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<InventoryCategory | 'all'>('all');

  // Modal / form states
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<InventoryCategory>('furniture');
  const [quantity, setQuantity] = useState('0');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setName('');
    setCategory('furniture');
    setQuantity('0');
    setDescription('');
    setIsOpen(true);
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setQuantity(String(item.total_quantity));
    setDescription(item.description || '');
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Item name is required');
      return;
    }
    const qVal = parseInt(quantity, 10);
    if (isNaN(qVal) || qVal < 0) {
      toast.error('Total quantity must be a non-negative number');
      return;
    }

    setSubmitting(true);
    try {
      if (editingItem) {
        await updateInventoryItem(editingItem.id, {
          name: name.trim(),
          category,
          total_quantity: qVal,
          description: description.trim() || null
        });
      } else {
        await createInventoryItem({
          name: name.trim(),
          category,
          total_quantity: qVal,
          description: description.trim() || null
        });
      }
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save inventory item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, itemName: string) => {
    if (confirm(`Are you sure you want to delete "${itemName}"? Any current allocations to bookings will be detached.`)) {
      try {
        await deleteInventoryItem(id);
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete item');
      }
    }
  };

  // Filter items
  const filteredItems = inventoryItems.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Overview stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-gray-150 rounded-2xl flex items-center gap-4 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Catalog Items</p>
            <p className="text-xl font-extrabold text-gray-900 mt-0.5">{inventoryItems.length}</p>
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-150 rounded-2xl flex items-center gap-4 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Quantity Stock</p>
            <p className="text-xl font-extrabold text-gray-900 mt-0.5">
              {inventoryItems.reduce((acc, curr) => acc + curr.total_quantity, 0)}
            </p>
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-150 rounded-2xl flex items-center gap-4 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Categories Tracked</p>
            <p className="text-xl font-extrabold text-gray-900 mt-0.5">
              {new Set(inventoryItems.map(i => i.category)).size}
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-1 gap-2 max-w-md">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search catalog items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-250 text-xs focus:ring-1 focus:ring-brand-500 outline-none bg-white shadow-2xs"
            />
          </div>

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-gray-250 text-xs bg-white focus:ring-1 focus:ring-brand-500 outline-none shadow-2xs"
          >
            <option value="all">All Categories</option>
            {Object.entries(inventoryCategoryLabels).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-1.5 px-4.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-xs font-bold text-white transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {/* Main Grid / List */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-gray-250 rounded-2xl bg-white space-y-2">
          <Boxes className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-sm font-bold text-gray-700">No Inventory Items Found</h3>
          <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
            Create items such as VIP chairs, floral arches, round tables, or sound setups.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-2xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <th className="px-5 py-3.5">Item Details</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5 text-right">In Stock (Qty)</th>
                <th className="px-5 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-bold text-gray-900">{item.name}</p>
                      {item.description && (
                        <p className="text-[11px] text-gray-400 mt-0.5 leading-normal max-w-sm truncate">{item.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize tracking-wide",
                      item.category === 'furniture' && "bg-amber-50 text-amber-700 border-amber-100",
                      item.category === 'av' && "bg-blue-50 text-blue-700 border-blue-100",
                      item.category === 'decor' && "bg-pink-50 text-pink-700 border-pink-100",
                      item.category === 'tableware' && "bg-purple-50 text-purple-700 border-purple-100",
                      item.category === 'catering' && "bg-emerald-50 text-emerald-700 border-emerald-100",
                      item.category === 'other' && "bg-slate-50 text-slate-700 border-slate-100"
                    )}>
                      {inventoryCategoryLabels[item.category]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="font-extrabold text-gray-900 text-sm">{item.total_quantity}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-brand-600 hover:bg-brand-50/50 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-rose-600 hover:bg-rose-50/50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit/Add Modal overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-150 w-full max-w-md shadow-xl overflow-hidden animate-slide-in">
            <div className="px-6 py-4.5 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-gray-900">
                {editingItem ? 'Edit Inventory Item' : 'Add Catalog Inventory Item'}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP Chairs, LED Wall Screen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-250 text-xs focus:ring-1 focus:ring-brand-500 outline-none bg-white"
                />
              </div>

              {/* Category & Quantity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-250 text-xs bg-white focus:ring-1 focus:ring-brand-500 outline-none"
                  >
                    {Object.entries(inventoryCategoryLabels).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="100"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-250 text-xs focus:ring-1 focus:ring-brand-500 outline-none bg-white font-semibold"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  placeholder="Describe material, location, or usage guidelines..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-gray-250 text-xs focus:ring-1 focus:ring-brand-500 outline-none bg-white resize-none leading-normal"
                />
              </div>

              <div className="pt-2 flex gap-3 justify-end border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  {submitting && <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
