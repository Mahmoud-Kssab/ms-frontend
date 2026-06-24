'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { usePermissionContext } from '../providers/permission-provider';
import { PermissionKey } from '../types/rbac';

interface RouteGuardProps {
  permissions: PermissionKey[];
  children: ReactNode;
  redirectTo?: string;
}

export function RouteGuard({
  permissions,
  children,
  redirectTo = '/unauthorized',
}: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { hasEveryPermission, isLoading, user } = usePermissionContext();
  const isAllowed = Boolean(user) && hasEveryPermission(permissions);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!isLoading && user && !isAllowed) {
      const returnTo = encodeURIComponent(pathname);
      router.replace(`${redirectTo}?from=${returnTo}`);
    }
  }, [isAllowed, isLoading, pathname, redirectTo, router, user]);

  if (isLoading || !isAllowed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface px-6">
        <div className="text-sm font-medium text-muted">Checking access...</div>
      </main>
    );
  }

  return <>{children}</>;
}
