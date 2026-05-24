import { useState, useEffect } from 'react';
import { Search, Plus, Calendar, IndianRupee, FileText, Download, Receipt, Trash2, Edit2, Upload, ExternalLink, X, Check } from 'lucide-react';
import { cn, formatCurrency, formatDateReadable } from '@/lib/utils';
import { useDataStore } from '@/stores/data-store';
import { useUIStore } from '@/stores/ui-store';
import type { Expense, ExpenseCategory, ExpensePaymentMode } from '@/types/expense';
import { expenseCategoryLabels, expensePaymentModeLabels } from '@/types/expense';
import { toast } from 'sonner';

const categories: ExpenseCategory[] = ['catering', 'maintenance', 'utilities', 'marketing', 'staff_salary', 'decorations', 'miscellaneous'];
const paymentModes: ExpensePaymentMode[] = ['cash', 'upi', 'bank_transfer', 'cheque', 'card', 'online'];

export default function Expenses() {
  const expenses = useDataStore((s) => s.expenses);
  const fetchExpenses = useDataStore((s) => s.fetchExpenses);
  const createExpense = useDataStore((s) => s.createExpense);
  const updateExpense = useDataStore((s) => s.updateExpense);
  const deleteExpense = useDataStore((s) => s.deleteExpense);
  const uploadMedia = useDataStore((s) => s.uploadMedia);

  const isModalOpen = useUIStore((s) => s.isExpenseModalOpen);
  const selectedExpenseId = useUIStore((s) => s.selectedExpenseId);
  const openExpenseModal = useUIStore((s) => s.openExpenseModal);
  const closeExpenseModal = useUIStore((s) => s.closeExpenseModal);
  const showConfirm = useUIStore((s) => s.showConfirm);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'month' | '30days'>('all');

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('miscellaneous');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState<ExpensePaymentMode>('cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Sync Form when editing
  useEffect(() => {
    if (selectedExpenseId) {
      const exp = expenses.find((e) => e.id === selectedExpenseId);
      if (exp) {
        setTitle(exp.title);
        setCategory(exp.category);
        setAmount(String(exp.amount_paise / 100));
        setExpenseDate(exp.expense_date);
        setPaymentMode(exp.payment_mode);
        setReferenceNumber(exp.reference_number || '');
        setNotes(exp.notes || '');
        setReceiptUrl(exp.receipt_url);
      }
    } else {
      resetForm();
    }
  }, [selectedExpenseId, isModalOpen]);

  const resetForm = () => {
    setTitle('');
    setCategory('miscellaneous');
    setAmount('');
    setExpenseDate(new Date().toISOString().split('T')[0]);
    setPaymentMode('cash');
    setReferenceNumber('');
    setNotes('');
    setReceiptUrl(null);
  };

  // Filter Logic
  const filtered = expenses.filter((e) => {
    if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
    
    if (dateFilter === 'month') {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const expDate = new Date(e.expense_date);
      if (expDate.getMonth() !== currentMonth || expDate.getFullYear() !== currentYear) return false;
    } else if (dateFilter === '30days') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      if (new Date(e.expense_date) < thirtyDaysAgo) return false;
    }

    if (search) {
      const s = search.toLowerCase();
      return e.title.toLowerCase().includes(s) || e.reference_number?.toLowerCase().includes(s) || e.notes?.toLowerCase().includes(s);
    }
    return true;
  });

  const totalFilteredAmount = filtered.reduce((sum, e) => sum + e.amount_paise, 0);

  // Statistics
  const statsByCategory = categories.reduce((acc, cat) => {
    const total = expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount_paise, 0);
    acc[cat] = total;
    return acc;
  }, {} as Record<ExpenseCategory, number>);

  const totalAllTime = expenses.reduce((sum, e) => sum + e.amount_paise, 0);

  // File Upload
  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadMedia(file, 'receipts');
      setReceiptUrl(url);
      toast.success('Receipt uploaded successfully!');
    } catch (err) {
      toast.error('Failed to upload receipt');
    } finally {
      setIsUploading(false);
    }
  };

  // Form Submit
  const handleSaveExpense = async () => {
    if (!title.trim()) { toast.error('Title is required'); return; }
    if (!amount || Number(amount) <= 0) { toast.error('Enter a valid amount'); return; }

    setIsSaving(true);
    try {
      const expenseData = {
        title: title.trim(),
        category,
        amount_paise: Number(amount) * 100,
        expense_date: expenseDate,
        payment_mode: paymentMode,
        reference_number: referenceNumber.trim() || null,
        notes: notes.trim() || null,
        receipt_url: receiptUrl,
      };

      if (selectedExpenseId) {
        await updateExpense(selectedExpenseId, expenseData);
      } else {
        await createExpense(expenseData);
        toast.success('Expense recorded successfully! 💸');
      }
      closeExpenseModal();
    } catch (err) {
      toast.error('Failed to save expense');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteExpense = (id: string, name: string) => {
    showConfirm({
      title: 'Delete Expense',
      description: `Are you sure you want to delete the expense entry "${name}"?`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deleteExpense(id);
        } catch (e) {
          toast.error('Failed to delete expense');
        }
      }
    });
  };

  // Exports
  const exportCSV = () => {
    let headers = 'Date,Title,Category,Amount (INR),Payment Mode,Reference Number,Notes\n';
    let rows = filtered.map((e) => {
      return `"${e.expense_date}","${e.title.replace(/"/g, '""')}","${expenseCategoryLabels[e.category]}",${e.amount_paise / 100},"${expensePaymentModeLabels[e.payment_mode]}","${(e.reference_number || '').replace(/"/g, '""')}","${(e.notes || '').replace(/"/g, '""')}"`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Export downloaded!');
  };

  const exportPDF = () => {
    // Generate a printable window containing a nice table report
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Popup blocked. Please allow popups to export PDF/Print');
      return;
    }

    const rowsHtml = filtered.map((e) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${e.expense_date}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${e.title}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${expenseCategoryLabels[e.category]}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${expensePaymentModeLabels[e.payment_mode]}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold; text-align: right;">₹${(e.amount_paise / 100).toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Expense Report - VenuePro</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f5f5f5; text-align: left; padding: 10px; border-bottom: 2px solid #ddd; }
            h1 { margin-bottom: 5px; }
            .meta { font-size: 12px; color: #666; margin-bottom: 20px; }
            .total { font-size: 16px; font-weight: bold; text-align: right; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>Expense Tracker Report</h1>
          <div class="meta">Generated on ${new Date().toLocaleDateString()} • Total Spends: ₹${(totalFilteredAmount / 100).toLocaleString('en-IN')}</div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Expense Title</th>
                <th>Category</th>
                <th>Mode</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <div class="total">Total Filtered Amount: ₹${(totalFilteredAmount / 100).toLocaleString('en-IN')}</div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    toast.success('PDF Print Report triggered!');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expense Tracker</h1>
          <p className="text-sm text-gray-400 mt-0.5">Log, monitor, and analyze venue operating costs</p>
        </div>
        <button onClick={() => openExpenseModal()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 active:scale-95 transition-all shadow-sm">
          <Plus className="w-4 h-4" /> Record Spend
        </button>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Stats Cards */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-xs">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Total Spends logged</span>
            <span className="text-3xl font-extrabold text-gray-900">{formatCurrency(totalAllTime)}</span>
            <div className="flex gap-2.5 mt-4">
              <button onClick={exportCSV} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-600 transition-colors shadow-2xs">
                <Download className="w-3.5 h-3.5" /> CSV
              </button>
              <button onClick={exportPDF} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-600 transition-colors shadow-2xs">
                <FileText className="w-3.5 h-3.5" /> PDF / Print
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-xs">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Active Filter Cost</span>
            <span className="text-2xl font-bold text-brand-600">{formatCurrency(totalFilteredAmount)}</span>
            <span className="text-[10px] text-gray-400 mt-1 block">matching {filtered.length} entries</span>
          </div>
        </div>

        {/* Right Category Breakdown Chart (Percentage Bars) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-150 p-5 shadow-xs flex flex-col justify-between">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Category Allocations</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map((cat) => {
              const amount = statsByCategory[cat] || 0;
              const pct = totalAllTime > 0 ? (amount / totalAllTime) * 100 : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-700">{expenseCategoryLabels[cat].split(' (')[0]}</span>
                    <span className="text-gray-500">{pct.toFixed(0)}% ({formatCurrency(amount)})</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-600 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Expense Listing & Filters */}
      <div className="bg-white rounded-2xl border border-gray-150 shadow-xs overflow-hidden">
        {/* Filter Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 bg-gray-50/50">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search spends..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none bg-white" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none bg-white">
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{expenseCategoryLabels[c]}</option>
              ))}
            </select>
            <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value as any)}
              className="px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none bg-white">
              <option value="all">All Time</option>
              <option value="month">This Month</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* List */}
        <div className="divide-y divide-gray-100">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">No spends logged matching criteria</div>
          ) : (
            filtered.map((exp) => (
              <div key={exp.id} className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50/50 flex items-center justify-center flex-shrink-0">
                    <Receipt className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{exp.title}</h4>
                    <div className="flex flex-wrap items-center gap-x-2 text-xs text-gray-400 mt-0.5">
                      <span className="font-semibold text-gray-600 capitalize bg-gray-100 px-2 py-0.5 rounded-full">{expenseCategoryLabels[exp.category].split(' (')[0]}</span>
                      <span>•</span>
                      <span>{exp.expense_date}</span>
                      <span>•</span>
                      <span>{expensePaymentModeLabels[exp.payment_mode]}</span>
                      {exp.reference_number && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-gray-500 text-[10px]">Ref: {exp.reference_number}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(exp.amount_paise)}</p>
                    {exp.receipt_url && (
                      <a href={exp.receipt_url} target="_blank" rel="noreferrer" className="text-[10px] text-brand-600 font-semibold flex items-center gap-0.5 hover:underline justify-end mt-0.5">
                        Receipt <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 border-l border-gray-100 pl-4">
                    <button onClick={() => openExpenseModal(exp.id)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" title="Edit Spend">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteExpense(exp.id, exp.title)} className="p-2 rounded-lg hover:bg-rose-50 text-rose-500 transition-colors" title="Delete Spend">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Record Expense Modal */}
      {isModalOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50 drawer-overlay" onClick={closeExpenseModal} />
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white w-full sm:w-[460px] sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto shadow-2xl modal-content">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedExpenseId ? 'Edit Spend Details' : 'Record Spend'}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Enter operational spend fields</p>
                </div>
                <button onClick={closeExpenseModal} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Spend Title *</label>
                  <input type="text" placeholder="e.g. Electricity bill, repair gas..." value={title} onChange={(e) => setTitle(e.target.value)} required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none bg-white">
                      {categories.map((c) => (
                        <option key={c} value={c}>{expenseCategoryLabels[c].split(' (')[0]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Amount (₹) *</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="number" placeholder="2,500" value={amount} onChange={(e) => setAmount(e.target.value)} required
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all font-semibold" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Spend Date</label>
                    <input type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Payment Mode</label>
                    <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value as ExpensePaymentMode)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none bg-white">
                      {paymentModes.map((m) => (
                        <option key={m} value={m}>{expensePaymentModeLabels[m]}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Reference No. (optional)</label>
                  <input type="text" placeholder="TXN-xxxx, cheque ref..." value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all font-mono" />
                </div>

                {/* Receipt Upload */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Receipt / Invoice</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => document.getElementById('receipt-file-input')?.click()}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-600 flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50"
                    >
                      {isUploading ? (
                        <span className="w-3.5 h-3.5 rounded-full border border-gray-300 border-t-brand-600 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5 text-gray-500" />
                      )}
                      {receiptUrl ? 'Change Receipt' : 'Upload Receipt'}
                    </button>
                    <input
                      type="file"
                      id="receipt-file-input"
                      onChange={handleReceiptUpload}
                      accept="image/*,.pdf"
                      className="hidden"
                    />
                    {receiptUrl && (
                      <span className="text-xs text-success-600 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Attached
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Notes</label>
                  <textarea placeholder="Write short notes..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all resize-none" />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-100 space-y-2.5">
                <button onClick={handleSaveExpense}
                  disabled={isSaving || isUploading}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50">
                  {isSaving ? (
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {selectedExpenseId ? 'Update Spend Entry' : 'Save Spend Record'}
                </button>
                <button onClick={closeExpenseModal}
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
