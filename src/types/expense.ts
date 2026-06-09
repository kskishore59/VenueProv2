export interface Expense {
  id: string;
  org_id: string;
  title: string;
  category: ExpenseCategory;
  amount_paise: number;
  expense_date: string;
  payment_mode: ExpensePaymentMode;
  reference_number: string | null;
  notes: string | null;
  receipt_url: string | null;
  created_at: string;
  updated_at: string;
}

export type ExpenseCategory =
  | 'catering'
  | 'maintenance'
  | 'utilities'
  | 'marketing'
  | 'staff_salary'
  | 'decorations'
  | 'internet'
  | 'cleaning'
  | 'fuel_diesel'
  | 'licensing_taxes'
  | 'petty_cash'
  | 'miscellaneous';

export type ExpensePaymentMode =
  | 'cash'
  | 'upi'
  | 'bank_transfer'
  | 'cheque'
  | 'card'
  | 'online';

export const expenseCategoryLabels: Record<ExpenseCategory, string> = {
  catering: 'Catering spend',
  maintenance: 'Venue Maintenance',
  utilities: 'Utilities (Electricity, Water)',
  marketing: 'Marketing & Advertising',
  staff_salary: 'Staff Salary / Wages',
  decorations: 'Decor & Theme expenses',
  internet: 'Internet & WiFi Costs',
  cleaning: 'Cleaning & Janitorial',
  fuel_diesel: 'Generator Fuel & Diesel',
  licensing_taxes: 'Licenses, Taxes & Permits',
  petty_cash: 'Untracked Petty Cash',
  miscellaneous: 'Miscellaneous Spends',
};

export const expensePaymentModeLabels: Record<ExpensePaymentMode, string> = {
  cash: 'Cash',
  upi: 'UPI / QR',
  bank_transfer: 'Bank Transfer',
  cheque: 'Cheque',
  card: 'Card Payment',
  online: 'Net Banking / Online',
};
