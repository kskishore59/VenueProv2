import { useState, useEffect } from 'react';
import { Mail, Shield, UserMinus, Plus, Clock, Ban, Check, Copy } from 'lucide-react';
import { useDataStore } from '@/stores/data-store';
import { useUIStore } from '@/stores/ui-store';
import type { StaffRole } from '@/types/staff';
import { toast } from 'sonner';

const roles: { value: StaffRole; label: string; desc: string }[] = [
  { value: 'owner', label: 'Owner', desc: 'Full administrative access' },
  { value: 'manager', label: 'Manager', desc: 'Can manage bookings, customers, leads' },
  { value: 'finance', label: 'Finance', desc: 'Can manage payments and expenses' },
  { value: 'staff', label: 'Staff', desc: 'ReadOnly access to calendar' },
];

export function StaffManagement() {
  const organization = useDataStore((s) => s.organization);
  const staffProfiles = useDataStore((s) => s.staffProfiles);
  const pendingInvites = useDataStore((s) => s.pendingInvites);
  const fetchStaff = useDataStore((s) => s.fetchStaff);
  const inviteStaff = useDataStore((s) => s.inviteStaff);
  const updateStaffRole = useDataStore((s) => s.updateStaffRole);
  const deleteStaff = useDataStore((s) => s.deleteStaff);
  const cancelInvite = useDataStore((s) => s.cancelInvite);

  const showConfirm = useUIStore((s) => s.showConfirm);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'manager' | 'finance' | 'staff'>('staff');
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    try {
      await inviteStaff(inviteEmail.trim(), inviteRole);
      setInviteEmail('');
      setInviteRole('staff');
    } catch (err) {
      // toast is shown in store
    } finally {
      setIsInviting(false);
    }
  };

  const handleRoleChange = async (id: string, role: StaffRole) => {
    try {
      await updateStaffRole(id, role);
    } catch (e) {
      toast.error('Failed to update role');
    }
  };

  const handleDeleteStaff = (id: string, name: string) => {
    showConfirm({
      title: 'Remove Staff Member',
      description: `Are you sure you want to remove ${name} from your organization? they will lose all access immediately.`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deleteStaff(id);
        } catch (e) {
          toast.error('Failed to remove staff');
        }
      },
    });
  };

  const handleCancelInvite = (id: string, email: string) => {
    showConfirm({
      title: 'Cancel Invitation',
      description: `Are you sure you want to cancel the pending invite to ${email}?`,
      variant: 'warning',
      onConfirm: async () => {
        try {
          await cancelInvite(id);
        } catch (e) {
          toast.error('Failed to cancel invitation');
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Invite Form */}
      <div className="bg-white rounded-2xl border border-gray-150 p-5 sm:p-6 shadow-2xs">
        <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
          <Shield className="w-4 h-4 text-brand-600" />
          Invite Staff Member
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Add new managers, finance, or calendar staff. Since invitations are self-serve, you can click the copy icon 📋 next to any pending invite to copy their link, or click the envelope icon ✉️ to open a pre-filled invitation email to send directly.
        </p>
        
        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                placeholder="staff@venuepro.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none transition-all"
              />
            </div>
          </div>
          
          <div className="w-full sm:w-44">
            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Role Type</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-200 outline-none bg-white"
            >
              <option value="manager">Manager</option>
              <option value="finance">Finance</option>
              <option value="staff">Staff</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isInviting || !inviteEmail}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isInviting ? (
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Send Invite
          </button>
        </form>
      </div>

      {/* Active Staff List */}
      <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-sm font-bold text-gray-900">Active Staff Directory ({staffProfiles.length})</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {staffProfiles.map((member) => (
            <div key={member.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 hover:bg-gray-50/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-700 text-sm font-bold">
                    {member.full_name ? member.full_name[0] : member.email[0]}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">{member.full_name || 'Staff User'}</span>
                    {member.role === 'owner' && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-50 text-purple-600 border border-purple-100">Owner</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    {member.email}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                {/* Role select */}
                {member.role !== 'owner' ? (
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.id, e.target.value as StaffRole)}
                    className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-brand-200 outline-none bg-white"
                  >
                    <option value="manager">Manager</option>
                    <option value="finance">Finance</option>
                    <option value="staff">Staff</option>
                  </select>
                ) : (
                  <span className="text-xs text-gray-400 font-medium capitalize pr-3">{member.role}</span>
                )}

                {member.role !== 'owner' && (
                  <button
                    onClick={() => handleDeleteStaff(member.id, member.full_name || member.email)}
                    className="p-2 rounded-lg hover:bg-rose-50 text-rose-500 hover:text-rose-600 transition-colors"
                    title="Remove member"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Invites List */}
      {pendingInvites.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-2xs">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
            <Clock className="w-4 h-4 text-warning-500 animate-pulse" />
            <h3 className="text-sm font-bold text-gray-900">Pending Invitations ({pendingInvites.length})</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {pendingInvites.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-gray-50/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-warning-50 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-warning-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{invite.email}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-0.5">
                      <span className="capitalize font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.25 rounded">{invite.role}</span>
                      <span>•</span>
                      <span>Sent {new Date(invite.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${invite.email}?subject=${encodeURIComponent(`Invitation to join ${organization.name} on VenuePro`)}&body=${encodeURIComponent(
                      `Hi,\n\nYou have been invited to join ${organization.name} on VenuePro as a ${invite.role}.\n\nPlease click the link below to sign up and join the team:\n\n${window.location.origin}/signup?email=${encodeURIComponent(invite.email)}\n\nBest regards,\nThe ${organization.name} Team`
                    )}`}
                    className="p-2 rounded-lg hover:bg-brand-50 text-brand-600 hover:text-brand-700 transition-colors flex items-center justify-center"
                    title="Send invite email via your mail app"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/signup?email=${encodeURIComponent(invite.email)}`;
                      navigator.clipboard.writeText(url);
                      toast.success(`Sign-up link copied for ${invite.email}! 📋`);
                    }}
                    className="p-2 rounded-lg hover:bg-brand-50 text-brand-600 hover:text-brand-700 transition-colors"
                    title="Copy sign-up invitation link"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCancelInvite(invite.id, invite.email)}
                    className="p-2 rounded-lg hover:bg-rose-50 text-rose-500 hover:text-rose-600 transition-colors"
                    title="Cancel invite"
                  >
                    <Ban className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
