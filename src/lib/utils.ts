import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';

/**
 * Tailwind class merge helper
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format paise amount to Indian Rupee string
 * 350000000 → "₹35,00,000"
 */
export function formatCurrency(paise: number): string {
  const rupees = paise / 100;
  return '₹' + rupees.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });
}

/**
 * Format paise amount with decimals
 * 350050 → "₹3,500.50"
 */
export function formatCurrencyDetailed(paise: number): string {
  const rupees = paise / 100;
  return '₹' + rupees.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}

/**
 * Convert rupees to paise for storage
 */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/**
 * Convert paise to rupees for display/input
 */
export function paiseToRupees(paise: number): number {
  return paise / 100;
}

/**
 * Format ISO date string to DD/MM/YYYY
 */
export function formatDate(isoDate: string): string {
  try {
    return format(parseISO(isoDate), 'dd/MM/yyyy');
  } catch {
    return isoDate;
  }
}

/**
 * Format ISO date string to readable format
 * "15 Dec 2025"
 */
export function formatDateReadable(isoDate: string): string {
  try {
    return format(parseISO(isoDate), 'dd MMM yyyy');
  } catch {
    return isoDate;
  }
}

/**
 * Format time string (HH:mm) to readable format
 * "14:30" → "2:30 PM"
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
}

/**
 * Format Indian phone number for display
 * "9876543210" → "+91 98765 43210"
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
}

/**
 * Validate Indian phone number (10 digits starting with 6-9)
 */
export function validateIndianPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone.replace(/\D/g, ''));
}

/**
 * Get WhatsApp deep link URL
 */
export function getWhatsAppUrl(phone: string, message?: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const base = `https://wa.me/91${cleaned}`;
  if (message) {
    return `${base}?text=${encodeURIComponent(message)}`;
  }
  return base;
}

/**
 * Generate booking number
 * "VP-2025-00042"
 */
export function generateBookingNumber(sequence: number): string {
  const year = new Date().getFullYear();
  return `VP-${year}-${String(sequence).padStart(5, '0')}`;
}

/**
 * Calculate balance for a booking
 */
export function calculateBalance(totalPaise: number, paidPaise: number): number {
  return totalPaise - paidPaise;
}

/**
 * Get initials from a name
 * "Rahul Sharma" → "RS"
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Get relative time string
 * "2 hours ago", "3 days ago"
 */
export function getRelativeTime(dateStr: string): string {
  const date = parseISO(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return formatDate(dateStr);
}

export function parseDatabaseError(err: any): string {
  if (!err) return 'An unexpected error occurred.';
  
  const code = err.code ? String(err.code) : '';
  const msg = typeof err === 'string' ? err : err.message || JSON.stringify(err);
  const msgLower = msg.toLowerCase();
  
  if (code === '42501' || msgLower.includes('row-level security') || msgLower.includes('violates row-level security') || msgLower.includes('permission denied') || msgLower.includes('new row violates')) {
    return 'Access Denied: You do not have permission to perform this action.';
  }
  if (code === '23P01' || msgLower.includes('bookings_no_overlap') || msgLower.includes('exclusion constraint')) {
    return 'Error: The selected hall is already booked for this date and time range. Please choose a different timing.';
  }
  if (code === '23505' || msgLower.includes('unique constraint') || msgLower.includes('already exists')) {
    if (msgLower.includes('phone') || (err.details && String(err.details).toLowerCase().includes('phone'))) {
      return 'Error: A customer or record with this phone number already exists.';
    }
    if (msgLower.includes('booking_number')) {
      return 'Error: A booking with this booking number already exists.';
    }
    return 'Error: A duplicate record already exists in the database.';
  }
  if (code === '23503' || msgLower.includes('foreign key constraint') || msgLower.includes('violates foreign key')) {
    return 'Error: This record is linked to other data and cannot be deleted or modified.';
  }
  if (msgLower.includes('too many requests') || msgLower.includes('rate limit') || msgLower.includes('429')) {
    return 'Rate Limit Exceeded: You are performing actions too quickly. Please wait a few seconds and try again.';
  }
  if (msgLower.includes('network') || msgLower.includes('failed to fetch')) {
    return 'Network Error: Please check your internet connection and try again.';
  }
  
  return msg;
}

/**
 * Client-side CSV Exporter utility
 */
export function exportToCSV(data: any[], headers: string[], filename: string) {
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const val = row[header] === null || row[header] === undefined ? '' : String(row[header]);
          const escaped = val.replace(/"/g, '""');
          return escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')
            ? `"${escaped}"`
            : escaped;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

