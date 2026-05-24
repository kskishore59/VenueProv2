import type { ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useDataStore } from '@/stores/data-store';
import { hasPermission } from '@/lib/permissions';
import type { PermissionResource, PermissionAction } from '@/lib/permissions';
import { ShieldAlert } from 'lucide-react';

interface Props {
  resource: PermissionResource;
  action?: PermissionAction;
  children: ReactNode;
}

export function PermissionGuard({ resource, action = 'read', children }: Props) {
  const role = useAuthStore((s) => s.profile?.role);
  const organization = useDataStore((s) => s.organization);

  const allowed = hasPermission(role, resource, action, organization?.settings);

  if (!allowed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-white rounded-3xl border border-gray-150 shadow-2xs max-w-xl mx-auto my-12 animate-fade-in">
        <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Access Restricted</h2>
        <p className="text-sm text-gray-400 max-w-sm">
          Your account role ({role || 'guest'}) does not have permission to view or manage {resource}. Please contact the venue owner.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
