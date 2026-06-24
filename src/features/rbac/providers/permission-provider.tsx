'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { authService, LoginRequest, RegisterRequest } from '@/services/auth.service';

import { PermissionKey, SessionUser } from '../types/rbac';

interface PermissionContextValue {
  user: SessionUser | null;
  permissions: PermissionKey[];
  isLoading: boolean;
  hasPermission: (permission: PermissionKey) => boolean;
  hasEveryPermission: (permissions: PermissionKey[]) => boolean;
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextValue | null>(null);

interface PermissionProviderProps {
  children: ReactNode;
}

export function PermissionProvider({ children }: PermissionProviderProps) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshPermissions = useCallback(async () => {
    setIsLoading(true);

    try {
      const sessionUser = await authService.getCurrentUser();
      setUser({
        id: sessionUser.id,
        name: `${sessionUser.firstName} ${sessionUser.lastName}`,
        email: sessionUser.email,
        permissions: sessionUser.permissions,
      });
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshPermissions();
  }, [refreshPermissions]);

  const permissions = useMemo(() => user?.permissions ?? [], [user]);
  const permissionSet = useMemo(() => new Set(permissions), [permissions]);

  const value = useMemo<PermissionContextValue>(
    () => ({
      user,
      permissions,
      isLoading,
      hasPermission: (permission) => permissionSet.has(permission),
      hasEveryPermission: (requiredPermissions) =>
        requiredPermissions.every((permission) => permissionSet.has(permission)),
      login: async (payload) => {
        const sessionUser = await authService.login(payload);
        setUser({
          id: sessionUser.id,
          name: `${sessionUser.firstName} ${sessionUser.lastName}`,
          email: sessionUser.email,
          permissions: sessionUser.permissions,
        });
      },
      register: async (payload) => {
        const sessionUser = await authService.register(payload);
        setUser({
          id: sessionUser.id,
          name: `${sessionUser.firstName} ${sessionUser.lastName}`,
          email: sessionUser.email,
          permissions: sessionUser.permissions,
        });
      },
      logout: async () => {
        await authService.logout();
        setUser(null);
      },
      refreshPermissions,
    }),
    [isLoading, permissionSet, permissions, refreshPermissions, user],
  );

  return (
    <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>
  );
}

export function usePermissionContext() {
  const context = useContext(PermissionContext);

  if (!context) {
    throw new Error('usePermissionContext must be used inside PermissionProvider.');
  }

  return context;
}
