'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

import { PermissionProvider } from '@/features/rbac/providers/permission-provider';
import { createQueryClient } from '@/lib/query-client';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <PermissionProvider>{children}</PermissionProvider>
    </QueryClientProvider>
  );
}
