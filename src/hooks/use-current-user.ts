'use client';

import { useQuery } from '@tanstack/react-query';

import { authService } from '@/services/auth.service';

export function useCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'current-user'],
    queryFn: authService.getCurrentUser,
  });
}
