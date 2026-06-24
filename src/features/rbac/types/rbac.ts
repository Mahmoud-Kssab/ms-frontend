export type PermissionKey =
  | 'chat:read'
  | 'chat:write'
  | 'chat:assign'
  | 'chat:delete'
  | 'channel:read'
  | 'channel:manage'
  | 'contact:read'
  | 'contact:manage'
  | 'automation:read'
  | 'automation:manage'
  | 'settings:read'
  | 'settings:manage'
  | 'user:read'
  | 'user:manage'
  | 'role:read'
  | 'role:manage';

export interface PermissionDefinition {
  key: PermissionKey;
  label: string;
  group: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: PermissionKey[];
  isSystem: boolean;
}

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  roleIds: string[];
  isActive: boolean;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  permissions: PermissionKey[];
}
