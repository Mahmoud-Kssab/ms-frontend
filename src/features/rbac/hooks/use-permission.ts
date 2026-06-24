'use client';

import { usePermissionContext } from '../providers/permission-provider';
import { PermissionKey } from '../types/rbac';

export function usePermission(permission: PermissionKey) {
  const { hasPermission, isLoading } = usePermissionContext();

  return {
    isLoading,
    hasPermission: hasPermission(permission),
  };
}

export function usePermissions(permissions: PermissionKey[]) {
  const { hasEveryPermission, isLoading } = usePermissionContext();

  return {
    isLoading,
    hasPermissions: hasEveryPermission(permissions),
  };
}
