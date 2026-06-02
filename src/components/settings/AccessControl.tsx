import { useState } from 'react';
import { Shield, Check, RotateCcw, AlertTriangle } from 'lucide-react';
import { useDataStore } from '@/stores/data-store';
import { defaultRolePermissions } from '@/lib/permissions';
import type { PermissionResource, PermissionAction, UserRole } from '@/lib/permissions';
import { toast } from 'sonner';

const resourceLabels: Record<PermissionResource, string> = {
  bookings: 'Bookings & Calendar',
  payments: 'Payments & Receipts',
  leads: 'Inquiries & Leads',
  customers: 'Customer Directory',
  expenses: 'Expense Tracker',
  settings: 'System & Org Settings',
};

const actionLabels: Record<PermissionAction, string> = {
  read: 'View / Read',
  create: 'Add / Create',
  update: 'Edit / Update',
  delete: 'Cancel / Delete',
};

export function AccessControl() {
  const organization = useDataStore((s) => s.organization);
  const updateOrganization = useDataStore((s) => s.updateOrganization);

  const [activeRole, setActiveRole] = useState<'manager' | 'finance' | 'staff'>('manager');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize permissions state from org settings or fall back to defaults
  const [permissions, setPermissions] = useState<Record<string, any>>(() => {
    const existing = organization.settings.permissions;
    if (existing) return JSON.parse(JSON.stringify(existing)); // Deep clone
    return JSON.parse(JSON.stringify(defaultRolePermissions));
  });

  const handleToggle = (resource: PermissionResource, action: PermissionAction) => {
    setPermissions((prev) => {
      const clone = { ...prev };
      if (!clone[activeRole]) {
        clone[activeRole] = {
          bookings: { create: false, read: false, update: false, delete: false },
          payments: { create: false, read: false, update: false, delete: false },
          leads: { create: false, read: false, update: false, delete: false },
          customers: { create: false, read: false, update: false, delete: false },
          expenses: { create: false, read: false, update: false, delete: false },
          settings: { create: false, read: false, update: false, delete: false },
        };
      }
      if (!clone[activeRole][resource]) {
        clone[activeRole][resource] = { create: false, read: false, update: false, delete: false };
      }
      clone[activeRole][resource][action] = !clone[activeRole][resource][action];
      return clone;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateOrganization({
        settings: {
          ...organization.settings,
          permissions,
        },
      });
      toast.success('Access control permissions updated! 🛡️');
    } catch (e: any) {
      toast.error(e.message || 'Failed to save permissions');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setPermissions(JSON.parse(JSON.stringify(defaultRolePermissions)));
    toast.success('Permissions reset to system defaults. Hit save to apply.');
  };

  const currentRolePerms = permissions[activeRole] || defaultRolePermissions[activeRole];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-150 p-5 sm:p-6 shadow-2xs">
        <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
          <Shield className="w-4 h-4 text-brand-600" />
          Role-Based Access Control (RBAC)
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Configure precise functional permissions for each user role in your venue workspace. Owner holds absolute master access.
        </p>

        {/* Warning notification */}
        <div className="p-4 mb-5 bg-amber-50/50 text-amber-800 border border-amber-100 rounded-xl flex items-start gap-3 text-xs leading-relaxed">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">Critical Access Configuration</span>
            Modifying permissions takes effect immediately. Disabling read access restricts the role from viewing pages, menu elements, and quick action bars.
          </div>
        </div>

        {/* Role Tabs Selector */}
        <div className="flex gap-2 border-b border-gray-100 pb-3 mb-5">
          {(['manager', 'finance', 'staff'] as const).map((role) => (
            <button
              key={role}
              onClick={() => setActiveRole(role)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize border ${
                activeRole === role
                  ? 'bg-brand-600 border-brand-600 text-white shadow-xs'
                  : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              {role} Role
            </button>
          ))}
        </div>

        {/* Grid List of Resources */}
        <div className="space-y-4">
          {(Object.keys(resourceLabels) as PermissionResource[]).map((resKey) => {
            const resPerms = currentRolePerms[resKey] || { create: false, read: false, update: false, delete: false };
            return (
              <div key={resKey} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-gray-150 bg-gray-50/20 hover:bg-gray-50/50 transition-colors gap-3">
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-gray-900">{resourceLabels[resKey]}</span>
                  <span className="text-[10px] text-gray-400 block uppercase font-mono tracking-wider">{resKey} control settings</span>
                </div>

                {/* Checklist of Actions */}
                <div className="flex flex-wrap gap-x-6 gap-y-2.5">
                  {(['read', 'create', 'update', 'delete'] as PermissionAction[]).map((action) => (
                    <label key={action} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={!!resPerms[action]}
                        onChange={() => handleToggle(resKey, action)}
                        className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 transition-colors cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-gray-600 capitalize">{actionLabels[action]}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-150 mt-6 gap-4">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 hover:bg-gray-50 rounded-xl active:scale-95 transition-all"
            title="Reset active configuration to system defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 active:scale-95 transition-all shadow-sm disabled:opacity-50"
          >
            {isSaving ? (
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>Save Permissions</span>
          </button>
        </div>
      </div>
    </div>
  );
}
