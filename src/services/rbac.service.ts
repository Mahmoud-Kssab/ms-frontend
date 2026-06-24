import {
  ManagedUser,
  PermissionDefinition,
  PermissionKey,
  Role,
} from '@/features/rbac/types/rbac';

import { apiClient } from './api-client';

export const rbacService = {
  async listUsers(): Promise<ManagedUser[]> {
    const { data } = await apiClient.get<ManagedUser[]>('/users');
    return data;
  },

  async listRoles(): Promise<Role[]> {
    const { data } = await apiClient.get<Role[]>('/roles');
    return data;
  },

  async listPermissions(): Promise<PermissionDefinition[]> {
    const { data } = await apiClient.get<PermissionDefinition[]>('/permissions');
    return data;
  },

  async createUser(payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    roleIds: string[];
  }): Promise<ManagedUser> {
    const { data } = await apiClient.post<ManagedUser>('/users', payload);
    return data;
  },

  async createRole(payload: {
    name: string;
    description: string;
    permissions: PermissionKey[];
  }): Promise<Role> {
    const { data } = await apiClient.post<Role>('/roles', payload);
    return data;
  },

  async updateUserRoles(userId: string, roleIds: string[]): Promise<ManagedUser> {
    const { data } = await apiClient.patch<ManagedUser>(`/users/${userId}/roles`, {
      roleIds,
    });
    return data;
  },

  async updateUserProfile(
    userId: string,
    payload: {
      email: string;
      firstName: string;
      lastName: string;
    },
  ): Promise<ManagedUser> {
    const { data } = await apiClient.patch<ManagedUser>(
      `/users/${userId}/profile`,
      payload,
    );
    return data;
  },

  async updateUserPassword(
    userId: string,
    payload: {
      password: string;
    },
  ): Promise<ManagedUser> {
    const { data } = await apiClient.patch<ManagedUser>(
      `/users/${userId}/password`,
      payload,
    );
    return data;
  },

  async updateUserStatus(
    userId: string,
    payload: {
      isActive: boolean;
    },
  ): Promise<ManagedUser> {
    const { data } = await apiClient.patch<ManagedUser>(
      `/users/${userId}/status`,
      payload,
    );
    return data;
  },

  async updateRolePermissions(
    roleId: string,
    permissions: PermissionKey[],
  ): Promise<Role> {
    const { data } = await apiClient.patch<Role>(`/roles/${roleId}/permissions`, {
      permissions,
    });
    return data;
  },
};
