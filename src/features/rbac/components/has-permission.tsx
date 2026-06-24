'use client';

import { ReactNode } from 'react';

import { usePermissionContext } from '../providers/permission-provider';
import { PermissionKey } from '../types/rbac';

interface HasPermissionProps {
  permission: PermissionKey;
  children: ReactNode;
  fallback?: ReactNode;
}

export function HasPermission({
  permission,
  children,
  fallback = null,
}: HasPermissionProps) {
  const { hasPermission, isLoading } = usePermissionContext();

  if (isLoading) {
    return null;
  }

  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
}
