import type { Organization } from '@/types/organization';

export type UserRole = 'owner' | 'manager' | 'finance' | 'staff';
export type PermissionResource = 'bookings' | 'payments' | 'leads' | 'customers' | 'expenses' | 'settings';
export type PermissionAction = 'create' | 'read' | 'update' | 'delete';

export interface RolePermissions {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

export type PermissionsMap = Record<PermissionResource, RolePermissions>;

export const defaultRolePermissions: Record<Exclude<UserRole, 'owner'>, PermissionsMap> = {
  manager: {
    bookings: { create: true, read: true, update: true, delete: false },
    payments: { create: false, read: true, update: false, delete: false },
    leads: { create: true, read: true, update: true, delete: true },
    customers: { create: true, read: true, update: true, delete: false },
    expenses: { create: false, read: false, update: false, delete: false },
    settings: { create: false, read: true, update: false, delete: false },
  },
  finance: {
    bookings: { create: false, read: true, update: false, delete: false },
    payments: { create: true, read: true, update: true, delete: true },
    leads: { create: false, read: false, update: false, delete: false },
    customers: { create: false, read: true, update: false, delete: false },
    expenses: { create: true, read: true, update: true, delete: true },
    settings: { create: false, read: false, update: false, delete: false },
  },
  staff: {
    bookings: { create: false, read: true, update: false, delete: false },
    payments: { create: false, read: false, update: false, delete: false },
    leads: { create: false, read: false, update: false, delete: false },
    customers: { create: false, read: true, update: false, delete: false },
    expenses: { create: false, read: false, update: false, delete: false },
    settings: { create: false, read: false, update: false, delete: false },
  },
};

export function hasPermission(
  role: UserRole | undefined | null,
  resource: PermissionResource,
  action: PermissionAction,
  orgSettings?: Organization['settings']
): boolean {
  if (!role) return false;
  if (role === 'owner') return true; // Owner always has full access

  // Check if owner custom configured permissions in org settings
  const customPermissions = orgSettings?.permissions?.[role];
  if (customPermissions && customPermissions[resource]) {
    const res = customPermissions[resource];
    return !!res[action];
  }

  // Fallback to defaults
  const defaults = defaultRolePermissions[role as Exclude<UserRole, 'owner'>];
  if (defaults && defaults[resource]) {
    const res = defaults[resource];
    return !!res[action];
  }

  return false;
}
