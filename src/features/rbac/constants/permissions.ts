import { PermissionDefinition, PermissionKey } from '../types/rbac';

export const PERMISSIONS = {
  ChatRead: 'chat:read',
  ChatWrite: 'chat:write',
  ChatAssign: 'chat:assign',
  ChatDelete: 'chat:delete',
  ChannelRead: 'channel:read',
  ChannelManage: 'channel:manage',
  ContactRead: 'contact:read',
  ContactManage: 'contact:manage',
  AutomationRead: 'automation:read',
  AutomationManage: 'automation:manage',
  SettingsRead: 'settings:read',
  SettingsManage: 'settings:manage',
  UserRead: 'user:read',
  UserManage: 'user:manage',
  RoleRead: 'role:read',
  RoleManage: 'role:manage',
} as const satisfies Record<string, PermissionKey>;

export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  {
    key: PERMISSIONS.ChatRead,
    label: 'Read chats',
    group: 'Chats',
    description: 'View conversations and messages.',
  },
  {
    key: PERMISSIONS.ChatWrite,
    label: 'Reply to chats',
    group: 'Chats',
    description: 'Send replies inside conversations.',
  },
  {
    key: PERMISSIONS.ChatAssign,
    label: 'Assign chats',
    group: 'Chats',
    description: 'Assign conversations to teammates.',
  },
  {
    key: PERMISSIONS.ChatDelete,
    label: 'Delete chats',
    group: 'Chats',
    description: 'Delete or remove conversations.',
  },
  {
    key: PERMISSIONS.ChannelRead,
    label: 'View channels',
    group: 'Channels',
    description: 'View connected messaging channels.',
  },
  {
    key: PERMISSIONS.ChannelManage,
    label: 'Manage channels',
    group: 'Channels',
    description: 'Create, update, and disable channels.',
  },
  {
    key: PERMISSIONS.SettingsRead,
    label: 'View settings',
    group: 'Settings',
    description: 'View workspace settings.',
  },
  {
    key: PERMISSIONS.SettingsManage,
    label: 'Manage settings',
    group: 'Settings',
    description: 'Update workspace settings.',
  },
  {
    key: PERMISSIONS.UserRead,
    label: 'View users',
    group: 'Team',
    description: 'View team members.',
  },
  {
    key: PERMISSIONS.UserManage,
    label: 'Manage users',
    group: 'Team',
    description: 'Create, update, and deactivate team members.',
  },
  {
    key: PERMISSIONS.RoleRead,
    label: 'View roles',
    group: 'Team',
    description: 'View roles and role permissions.',
  },
  {
    key: PERMISSIONS.RoleManage,
    label: 'Manage roles',
    group: 'Team',
    description: 'Update role permission mappings.',
  },
];
