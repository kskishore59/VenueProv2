import type { Profile } from './auth';

export interface StaffInvite {
  id: string;
  org_id: string;
  email: string;
  role: 'manager' | 'finance' | 'staff';
  invited_by: string;
  status: 'pending' | 'accepted';
  created_at: string;
}

export type StaffRole = 'owner' | 'manager' | 'finance' | 'staff';

export const roleLabels: Record<StaffRole, string> = {
  owner: 'Owner',
  manager: 'Manager',
  finance: 'Finance Manager',
  staff: 'Staff Member',
};
