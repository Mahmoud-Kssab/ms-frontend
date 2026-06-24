import { PermissionKey } from '@/features/rbac/types/rbac';

import { apiClient } from './api-client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleIds?: string[];
}

export interface CurrentUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  permissions: PermissionKey[];
}

export const authService = {
  async login(payload: LoginRequest): Promise<CurrentUser> {
    const { data } = await apiClient.post<CurrentUser>('/auth/login', payload);
    return data;
  },

  async register(payload: RegisterRequest): Promise<CurrentUser> {
    const { data } = await apiClient.post<CurrentUser>('/auth/register', payload);
    return data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async getCurrentUser(): Promise<CurrentUser> {
    const { data } = await apiClient.get<CurrentUser>('/auth/me');
    return data;
  },
};
