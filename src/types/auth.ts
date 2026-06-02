export interface Profile {
  id: string;
  org_id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  phone: string | null;
  is_active: boolean;
  created_at: string;
}

export type UserRole = 'owner' | 'manager' | 'staff' | 'finance' | 'super_admin';

export const userRoleLabels: Record<UserRole, string> = {
  owner: 'Owner',
  manager: 'Manager',
  staff: 'Staff',
  finance: 'Finance',
  super_admin: 'Super Admin',
};

export const userRolePermissions: Record<UserRole, string[]> = {
  owner: ['all'],
  manager: ['bookings', 'customers', 'leads', 'payments.view', 'settings.venue'],
  staff: ['bookings', 'customers', 'leads'],
  finance: ['payments', 'bookings.view', 'customers.view'],
  super_admin: ['all'],
};
