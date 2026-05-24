import { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertTriangle, FileSpreadsheet, ArrowLeft, ArrowRight, Download, Check, Trash } from 'lucide-react';
import { useDataStore } from '@/stores/data-store';
import { validateIndianPhone, cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { CustomerSource } from '@/types/customer';
import type { EventType } from '@/types/booking';

type ImportType = 'customers' | 'bookings';

interface CustomerRow {
  name: string;
  phone: string;
  email: string;
  source: string;
  address: string;
  gstin: string;
  notes: string;
  status: 'valid' | 'invalid';
  errors: string[];
}

interface BookingRow {
  customerName: string;
  customerPhone: string;
  hallName: string;
  eventType: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  guests: string;
  totalAmount: string;
  advancePaid: string;
  eventStatus: string;
  notes: string;
  status: 'valid' | 'invalid';
  errors: string[];
}

export function ImportWizard() {
  const [importType, setImportType] = useState<ImportType>('customers');
  const [step, setStep] = useState(1);
  const [customerRows, setCustomerRows] = useState<CustomerRow[]>([]);
  const [bookingRows, setBookingRows] = useState<BookingRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const halls = useDataStore((s) => s.halls);
  const customers = useDataStore((s) => s.customers);
  const createCustomer = useDataStore((s) => s.createCustomer);
  const createBooking = useDataStore((s) => s.createBooking);

  // Download Sample CSV
  const downloadSample = () => {
    let headers = '';
    let rows = '';
    if (importType === 'customers') {
      headers = 'Name,Phone,Email,Source,Address,GSTIN,Notes\n';
      rows = 'Aarav Sharma,9876543210,aarav@gmail.com,whatsapp,"Sector 15, Gurgaon",36AABCT1332L1ZH,"Wants premium lighting"\nAditi Patel,9898989898,aditi@yahoo.com,google,"Andheri West, Mumbai",,"Referred by Sharma family"\n';
    } else {
      headers = 'CustomerName,CustomerPhone,HallName,EventType,EventDate,StartTime,EndTime,Guests,TotalPrice,AdvancePaid,Status,Notes\n';
      // Use existing hall name or default
      const hallName = halls.length > 0 ? halls[0].name : 'Main Banquet Hall';
      rows = `Rohan Gupta,9821345678,${hallName},wedding,2026-11-20,10:00,16:00,250,150000,37500,confirmed,"Includes decorations"\nKaran Malhotra,9711223344,${hallName},conference,2026-12-05,09:00,18:00,50,45000,10000,hold,"Corporate setup needed"\n`;
    }
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sample_${importType}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Basic CSV Parser
  const parseCSV = (text: string) => {
    const lines: string[] = [];
    let row = [''];
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        row.push('');
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++; // Skip \n
        }
        lines.push(row.join('\uFFFF')); // Unique separator for fields
        row = [''];
      } else {
        row[row.length - 1] += char;
      }
    }
    if (row.length > 1 || row[0] !== '') {
      lines.push(row.join('\uFFFF'));
    }

    return lines.map(line => line.split('\uFFFF').map(cell => cell.trim().replace(/^"|"$/g, '')));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsedData = parseCSV(text);
      if (parsedData.length < 2) {
        toast.error('CSV is empty or invalid');
        return;
      }

      const headers = parsedData[0].map(h => h.toLowerCase());
      const dataRows = parsedData.slice(1).filter(r => r.some(c => c !== ''));

      if (importType === 'customers') {
        const parsedRows: CustomerRow[] = dataRows.map((r) => {
          const rowData = {
            name: r[headers.indexOf('name')] || '',
            phone: r[headers.indexOf('phone')] || '',
            email: r[headers.indexOf('email')] || '',
            source: r[headers.indexOf('source')] || 'other',
            address: r[headers.indexOf('address')] || '',
            gstin: r[headers.indexOf('gstin')] || '',
            notes: r[headers.indexOf('notes')] || '',
          };

          const errors: string[] = [];
          if (!rowData.name) errors.push('Name is required');
          if (!rowData.phone) {
            errors.push('Phone is required');
          } else if (!validateIndianPhone(rowData.phone.replace(/\D/g, ''))) {
            errors.push('Phone number must be a valid 10-digit Indian number');
          }

          return {
            ...rowData,
            phone: rowData.phone.replace(/\D/g, ''),
            status: errors.length === 0 ? 'valid' : 'invalid',
            errors,
          };
        });

        setCustomerRows(parsedRows);
      } else {
        const parsedRows: BookingRow[] = dataRows.map((r) => {
          const rowData = {
            customerName: r[headers.indexOf('customername')] || '',
            customerPhone: r[headers.indexOf('customerphone')] || '',
            hallName: r[headers.indexOf('hallname')] || '',
            eventType: r[headers.indexOf('eventtype')] || 'other',
            eventDate: r[headers.indexOf('eventdate')] || '',
            startTime: r[headers.indexOf('starttime')] || '10:00',
            endTime: r[headers.indexOf('endtime')] || '22:00',
            guests: r[headers.indexOf('guests')] || '',
            totalAmount: r[headers.indexOf('totalprice')] || '0',
            advancePaid: r[headers.indexOf('advancepaid')] || '0',
            eventStatus: r[headers.indexOf('status')] || 'confirmed',
            notes: r[headers.indexOf('notes')] || '',
          };

          const errors: string[] = [];
          if (!rowData.customerName) errors.push('Customer Name is required');
          if (!rowData.customerPhone) {
            errors.push('Customer Phone is required');
          } else if (!validateIndianPhone(rowData.customerPhone.replace(/\D/g, ''))) {
            errors.push('Customer Phone must be 10-digits');
          }
          if (!rowData.hallName) {
            errors.push('Hall Name is required');
          } else {
            const hallExists = halls.some(h => h.name.toLowerCase() === rowData.hallName.toLowerCase());
            if (!hallExists) errors.push(`Hall "${rowData.hallName}" does not exist`);
          }
          if (!rowData.eventDate) errors.push('Event Date is required');
          if (!rowData.startTime) errors.push('Start Time is required');
          if (!rowData.endTime) errors.push('End Time is required');

          const allowedStatuses = ['inquiry', 'hold', 'confirmed', 'completed', 'cancelled'];
          if (rowData.eventStatus && !allowedStatuses.includes(rowData.eventStatus.toLowerCase())) {
            errors.push(`Status must be one of: ${allowedStatuses.join(', ')}`);
          }

          return {
            ...rowData,
            customerPhone: rowData.customerPhone.replace(/\D/g, ''),
            status: errors.length === 0 ? 'valid' : 'invalid',
            errors,
          };
        });

        setBookingRows(parsedRows);
      }

      setStep(3);
    };
    reader.readAsText(file);
  };

  const handleStartImport = async () => {
    setIsImporting(true);
    let successCount = 0;
    let failCount = 0;

    try {
      if (importType === 'customers') {
        const validRows = customerRows.filter(r => r.status === 'valid');
        for (const row of validRows) {
          try {
            await createCustomer({
              name: row.name,
              phone: row.phone,
              email: row.email || undefined,
              source: row.source as CustomerSource || 'other',
              address: row.address || undefined,
              gstin: row.gstin || undefined,
              notes: row.notes || undefined,
            });
            successCount++;
          } catch (e) {
            failCount++;
          }
        }
      } else {
        const validRows = bookingRows.filter(r => r.status === 'valid');
        for (const row of validRows) {
          try {
            // Find or create customer
            let customerObj = customers.find(c => c.phone === row.customerPhone);
            if (!customerObj) {
              customerObj = await createCustomer({
                name: row.customerName,
                phone: row.customerPhone,
                source: 'other',
              });
            }

            // Find hall
            const hallObj = halls.find(h => h.name.toLowerCase() === row.hallName.toLowerCase());
            if (!hallObj) throw new Error('Hall not found');

            await createBooking({
              customer_id: customerObj.id,
              hall_id: hallObj.id,
              event_type: row.eventType as EventType || 'other',
              event_date: row.eventDate,
              start_time: row.startTime,
              end_time: row.endTime,
              guest_count: row.guests ? Number(row.guests) : undefined,
              total_amount_paise: row.totalAmount ? Number(row.totalAmount) * 100 : 0,
              advance_amount_paise: row.advancePaid ? Number(row.advancePaid) * 100 : 0,
              status: (row.eventStatus?.toLowerCase() || 'confirmed') as any,
              notes: row.notes || undefined,
            });
            successCount++;
          } catch (e) {
            failCount++;
          }
        }
      }

      toast.success(`Import complete! 🎉 Imported ${successCount} records. ${failCount > 0 ? `Failed ${failCount}.` : ''}`);
      resetWizard();
    } catch (err: any) {
      toast.error('Import failed: ' + err.message);
    } finally {
      setIsImporting(false);
    }
  };

  const resetWizard = () => {
    setStep(1);
    setCustomerRows([]);
    setBookingRows([]);
    setFileName('');
  };

  const removeRow = (index: number) => {
    if (importType === 'customers') {
      setCustomerRows(prev => prev.filter((_, i) => i !== index));
    } else {
      setBookingRows(prev => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Import Wizard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Upload, validate, and import legacy sheets</p>
        </div>
        {step > 1 && (
          <button onClick={resetWizard} className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Start Over
          </button>
        )}
      </div>

      {/* Stepper Header */}
      <div className="grid grid-cols-3 bg-white rounded-2xl border border-gray-100 p-4 gap-4 text-center">
        {[
          { num: 1, title: 'Import Type' },
          { num: 2, title: 'Upload File' },
          { num: 3, title: 'Validate & Import' }
        ].map((s) => (
          <div key={s.num} className="flex items-center justify-center gap-2">
            <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
              step === s.num ? 'bg-brand-600 text-white' : step > s.num ? 'bg-success-100 text-success-600' : 'bg-gray-100 text-gray-400')}>
              {step > s.num ? <Check className="w-4 h-4" /> : s.num}
            </div>
            <span className={cn('text-sm font-semibold hidden md:inline', step === s.num ? 'text-gray-900' : 'text-gray-400')}>{s.title}</span>
          </div>
        ))}
      </div>

      {/* Wizard Steps */}
      <div className="bg-white rounded-3xl border border-gray-150 shadow-sm p-6 sm:p-8 min-h-[350px] flex flex-col justify-between">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">What would you like to import?</h2>
              <p className="text-sm text-gray-400">Choose the database table you want to upload legacy data to.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button onClick={() => setImportType('customers')}
                className={cn('p-5 rounded-2xl border-2 text-left transition-all',
                  importType === 'customers' ? 'border-brand-600 bg-brand-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300 bg-white')}>
                <div className="text-2xl mb-2">👤</div>
                <h3 className="font-bold text-gray-900">Customer Records</h3>
                <p className="text-xs text-gray-400 mt-1">Upload client directory. Fields: Name, Phone, Email, Source, Address, GSTIN, Notes.</p>
              </button>
              <button onClick={() => setImportType('bookings')}
                className={cn('p-5 rounded-2xl border-2 text-left transition-all',
                  importType === 'bookings' ? 'border-brand-600 bg-brand-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300 bg-white')}>
                <div className="text-2xl mb-2">📅</div>
                <h3 className="font-bold text-gray-900">Bookings & Events</h3>
                <p className="text-xs text-gray-400 mt-1">Upload bookings. Fields: Date, Hall, Customer Info, Price, AdvancePaid, Status, Notes.</p>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 flex items-center justify-between border border-gray-100">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-6 h-6 text-brand-600" />
                <div>
                  <h4 className="text-xs font-bold text-gray-700">Need a starting template?</h4>
                  <p className="text-[11px] text-gray-400">Download the structured CSV template before uploading.</p>
                </div>
              </div>
              <button onClick={downloadSample} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-white text-xs font-bold text-gray-600 transition-colors shadow-2xs">
                <Download className="w-3.5 h-3.5" /> Sample
              </button>
            </div>

            <div className="flex justify-end pt-4">
              <button onClick={() => setStep(2)} className="flex items-center gap-1.5 px-5 py-3 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-all shadow-sm">
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Upload CSV File</h2>
              <p className="text-sm text-gray-400">Upload the filled sheet mapping the columns correctly.</p>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 hover:border-brand-400 rounded-3xl p-10 text-center cursor-pointer bg-gray-50/30 hover:bg-brand-50/10 transition-all flex flex-col items-center justify-center group"
            >
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
              <div className="w-14 h-14 rounded-2xl bg-white border border-gray-150 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-xs">
                <UploadCloud className="w-6 h-6 text-brand-600" />
              </div>
              <h4 className="text-sm font-bold text-gray-800">Drag & Drop file here, or browse</h4>
              <p className="text-xs text-gray-400 mt-1">Supports CSV files up to 5MB</p>
            </div>

            <div className="flex justify-between pt-4">
              <button onClick={() => setStep(1)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                Back
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-bold text-gray-900">Validation Matrix</h2>
                <span className="text-xs text-gray-400 font-medium">File: {fileName}</span>
              </div>
              <p className="text-sm text-gray-400">Review validation status before committing records. Only valid rows will be imported.</p>
            </div>

            {/* Validation Table */}
            <div className="flex-1 border border-gray-150 rounded-2xl overflow-hidden max-h-[300px] overflow-y-auto my-4 bg-gray-50/50">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-white border-b border-gray-150 sticky top-0 font-bold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-3 pl-4">Status</th>
                    {importType === 'customers' ? (
                      <>
                        <th className="p-3">Name</th>
                        <th className="p-3">Phone</th>
                        <th className="p-3">Email</th>
                      </>
                    ) : (
                      <>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Hall</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Price</th>
                      </>
                    )}
                    <th className="p-3 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {importType === 'customers' ? (
                    customerRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/60 transition-colors group">
                        <td className="p-3 pl-4">
                          {row.status === 'valid' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-success-600 bg-success-50 px-2 py-0.5 rounded-full border border-success-100">
                              <CheckCircle2 className="w-3 h-3" /> Valid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-danger-600 bg-danger-50 px-2 py-0.5 rounded-full border border-danger-100" title={row.errors.join(', ')}>
                              <AlertTriangle className="w-3 h-3" /> Error
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-semibold text-gray-700">{row.name || <span className="text-rose-500 italic">Missing</span>}</td>
                        <td className="p-3 font-mono text-gray-600">{row.phone || <span className="text-rose-500 italic">Missing</span>}</td>
                        <td className="p-3 text-gray-500 truncate max-w-[120px]">{row.email || '—'}</td>
                        <td className="p-3 pr-4 text-right">
                          <button onClick={() => removeRow(idx)} className="p-1 rounded hover:bg-rose-50 text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    bookingRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/60 transition-colors group">
                        <td className="p-3 pl-4">
                          {row.status === 'valid' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-success-600 bg-success-50 px-2 py-0.5 rounded-full border border-success-100">
                              <CheckCircle2 className="w-3 h-3" /> Valid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-danger-600 bg-danger-50 px-2 py-0.5 rounded-full border border-danger-100" title={row.errors.join(', ')}>
                              <AlertTriangle className="w-3 h-3" /> Error
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <p className="font-semibold text-gray-700">{row.customerName || <span className="text-rose-500 italic">Missing</span>}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{row.customerPhone}</p>
                        </td>
                        <td className="p-3 text-gray-600 font-medium">{row.hallName || <span className="text-rose-500 italic">Missing</span>}</td>
                        <td className="p-3 text-gray-500">{row.eventDate || <span className="text-rose-500 italic">Missing</span>}</td>
                        <td className="p-3 font-semibold text-gray-700">₹{row.totalAmount}</td>
                        <td className="p-3 pr-4 text-right">
                          <button onClick={() => removeRow(idx)} className="p-1 rounded hover:bg-rose-50 text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Validation Statistics */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 bg-gray-50 px-4 rounded-xl border border-gray-150">
              <div className="flex gap-4 text-xs font-semibold">
                <span className="text-gray-500">
                  Total parsed: {importType === 'customers' ? customerRows.length : bookingRows.length}
                </span>
                <span className="text-success-600">
                  Valid: {importType === 'customers' ? customerRows.filter(r => r.status === 'valid').length : bookingRows.filter(r => r.status === 'valid').length}
                </span>
                <span className="text-danger-500">
                  Invalid: {importType === 'customers' ? customerRows.filter(r => r.status === 'invalid').length : bookingRows.filter(r => r.status === 'invalid').length}
                </span>
              </div>
              <div className="flex gap-2.5 w-full sm:w-auto">
                <button onClick={() => setStep(2)} className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
                  Back
                </button>
                <button
                  onClick={handleStartImport}
                  disabled={
                    isImporting || 
                    (importType === 'customers' ? customerRows.filter(r => r.status === 'valid').length === 0 : bookingRows.filter(r => r.status === 'valid').length === 0)
                  }
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-success-600 text-white text-sm font-semibold hover:bg-success-700 transition-all shadow-sm disabled:opacity-55 disabled:cursor-not-allowed"
                >
                  {isImporting ? (
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Commit Import
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
