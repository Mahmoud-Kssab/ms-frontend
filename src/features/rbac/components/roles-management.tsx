'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Check, ShieldCheck } from 'lucide-react';

import { rbacService } from '@/services/rbac.service';

import { PERMISSION_DEFINITIONS, PERMISSIONS } from '../constants/permissions';
import { usePermissionContext } from '../providers/permission-provider';
import { PermissionKey, Role } from '../types/rbac';

const emptyRoleForm = {
  name: '',
  description: '',
  permissions: [] as PermissionKey[],
};

export function RolesManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [roleForm, setRoleForm] = useState(emptyRoleForm);
  const [saveMessage, setSaveMessage] = useState('');
  const [messageTone, setMessageTone] = useState<'success' | 'warning' | 'error'>(
    'success',
  );
  const { hasPermission, refreshPermissions } = usePermissionContext();
  const canManageRoles = hasPermission(PERMISSIONS.RoleManage);
  const selectedRole = roles.find((role) => role.id === selectedRoleId);
  const messageClassName =
    messageTone === 'error'
      ? 'bg-red-100 text-red-800'
      : messageTone === 'warning'
        ? 'bg-amber-100 text-amber-800'
        : 'bg-emerald-100 text-emerald-800';

  const permissionGroups = useMemo(
    () =>
      PERMISSION_DEFINITIONS.reduce<Record<string, typeof PERMISSION_DEFINITIONS>>(
        (groups, permission) => {
          groups[permission.group] = groups[permission.group] ?? [];
          groups[permission.group].push(permission);
          return groups;
        },
        {},
      ),
    [],
  );

  useEffect(() => {
    async function loadRoles() {
      setIsLoading(true);
      const nextRoles = await rbacService.listRoles();
      setRoles(nextRoles);
      setSelectedRoleId((currentRoleId) => currentRoleId || nextRoles[0]?.id || '');
      setIsLoading(false);
    }

    void loadRoles();
  }, []);

  function showMessage(message: string, tone: 'success' | 'warning' | 'error') {
    setSaveMessage(message);
    setMessageTone(tone);
  }

  function getErrorMessage(error: unknown, fallbackMessage: string) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      typeof error.response === 'object' &&
      error.response !== null &&
      'data' in error.response &&
      typeof error.response.data === 'object' &&
      error.response.data !== null &&
      'message' in error.response.data &&
      typeof error.response.data.message === 'string'
    ) {
      return error.response.data.message;
    }

    return fallbackMessage;
  }

  function toggleCreatePermission(permission: PermissionKey) {
    setRoleForm((current) => ({
      ...current,
      permissions: current.permissions.includes(permission)
        ? current.permissions.filter((key) => key !== permission)
        : [...current.permissions, permission],
    }));
  }

  async function createRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canManageRoles) {
      showMessage('Creating roles requires role:manage.', 'warning');
      return;
    }

    try {
      const createdRole = await rbacService.createRole(roleForm);
      setRoles((currentRoles) => [...currentRoles, createdRole].sort(sortRoles));
      setSelectedRoleId(createdRole.id);
      setRoleForm(emptyRoleForm);
      await refreshPermissions();
      showMessage(`Role ${createdRole.name} created.`, 'success');
    } catch (error) {
      showMessage(getErrorMessage(error, 'Could not create this role.'), 'error');
    }
  }

  async function toggleRolePermission(role: Role, permission: PermissionKey) {
    if (!canManageRoles) {
      showMessage('Editing role permissions requires role:manage.', 'warning');
      return;
    }

    const nextPermissions = role.permissions.includes(permission)
      ? role.permissions.filter((key) => key !== permission)
      : [...role.permissions, permission];

    try {
      const updatedRole = await rbacService.updateRolePermissions(
        role.id,
        nextPermissions,
      );
      setRoles((currentRoles) =>
        currentRoles.map((currentRole) =>
          currentRole.id === updatedRole.id ? updatedRole : currentRole,
        ),
      );
      await refreshPermissions();
      showMessage('Role permissions updated.', 'success');
    } catch (error) {
      showMessage(
        getErrorMessage(error, 'Could not update role permissions.'),
        'error',
      );
    }
  }

  return (
    <div className="space-y-6">
      {isLoading ? (
        <section className="rounded-md border border-border bg-white p-5 text-sm text-muted shadow-panel">
          Loading roles...
        </section>
      ) : null}

      {saveMessage ? (
        <section
          className={[
            'flex items-center gap-2 rounded-md px-4 py-3 text-sm font-medium',
            messageClassName,
          ].join(' ')}
        >
          <Check aria-hidden="true" size={16} />
          {saveMessage}
        </section>
      ) : null}

      <section className="rounded-md border border-border bg-white p-5 shadow-panel">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Create Role</h2>
          {!canManageRoles ? (
            <span className="rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
              Requires role:manage
            </span>
          ) : null}
        </div>

        <form onSubmit={(event) => void createRole(event)} className="mt-4 space-y-4">
          <div className="grid gap-3 lg:grid-cols-[260px_minmax(0,1fr)_140px]">
            <input
              value={roleForm.name}
              onChange={(event) =>
                setRoleForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              placeholder="Role name"
              className="h-10 rounded-md border border-border px-3 text-sm"
              disabled={!canManageRoles}
              minLength={2}
              required
            />
            <input
              value={roleForm.description}
              onChange={(event) =>
                setRoleForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="Description"
              className="h-10 rounded-md border border-border px-3 text-sm"
              disabled={!canManageRoles}
            />
            <button
              type="submit"
              disabled={!canManageRoles}
              className="h-10 rounded-md bg-ink px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Create
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {Object.entries(permissionGroups).map(([group, permissions]) => (
              <div key={group} className="rounded-md border border-border">
                <div className="border-b border-border bg-surface px-4 py-3 text-sm font-semibold">
                  {group}
                </div>
                <div className="divide-y divide-border">
                  {permissions.map((permission) => (
                    <label
                      key={permission.key}
                      className={[
                        'flex items-start gap-3 px-4 py-3',
                        canManageRoles
                          ? 'cursor-pointer hover:bg-surface'
                          : 'cursor-not-allowed bg-surface text-muted',
                      ].join(' ')}
                    >
                      <input
                        type="checkbox"
                        checked={roleForm.permissions.includes(permission.key)}
                        disabled={!canManageRoles}
                        onChange={() => toggleCreatePermission(permission.key)}
                        className="mt-1 h-4 w-4 rounded border-border text-brand"
                      />
                      <span>
                        <span className="block text-sm font-medium">
                          {permission.label}
                        </span>
                        <span className="mt-1 block text-xs text-muted">
                          {permission.description}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </form>
      </section>

      <section className="rounded-md border border-border bg-white shadow-panel">
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <ShieldCheck aria-hidden="true" className="text-brand" size={20} />
          <div>
            <h2 className="text-base font-semibold">Role Permissions</h2>
            <p className="text-sm text-muted">
              Select a role and update its permission mapping.
            </p>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="border-b border-border lg:border-b-0 lg:border-r">
            {roles.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRoleId(role.id)}
                className={[
                  'flex w-full items-start gap-3 border-b border-border px-5 py-4 text-left last:border-b-0',
                  selectedRoleId === role.id ? 'bg-emerald-50' : 'hover:bg-surface',
                ].join(' ')}
              >
                <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-md bg-surface text-brand">
                  <ShieldCheck aria-hidden="true" size={17} />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{role.name}</span>
                  <span className="mt-1 block text-xs text-muted">
                    {role.permissions.length} permissions
                  </span>
                </span>
              </button>
            ))}
          </div>

          <div className="p-5">
            {selectedRole ? (
              <div className="grid gap-5 lg:grid-cols-2">
                {Object.entries(permissionGroups).map(([group, permissions]) => (
                  <div key={group} className="rounded-md border border-border">
                    <div className="border-b border-border bg-surface px-4 py-3 text-sm font-semibold">
                      {group}
                    </div>
                    <div className="divide-y divide-border">
                      {permissions.map((permission) => (
                        <label
                          key={permission.key}
                          className={[
                            'flex items-start gap-3 px-4 py-3',
                            canManageRoles
                              ? 'cursor-pointer hover:bg-surface'
                              : 'cursor-not-allowed bg-surface text-muted',
                          ].join(' ')}
                          title={!canManageRoles ? 'Requires role:manage.' : undefined}
                        >
                          <input
                            type="checkbox"
                            checked={selectedRole.permissions.includes(permission.key)}
                            disabled={!canManageRoles}
                            onChange={() =>
                              void toggleRolePermission(selectedRole, permission.key)
                            }
                            className="mt-1 h-4 w-4 rounded border-border text-brand"
                          />
                          <span>
                            <span className="block text-sm font-medium">
                              {permission.label}
                            </span>
                            <span className="mt-1 block text-xs text-muted">
                              {permission.description}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}

function sortRoles(firstRole: Role, secondRole: Role) {
  return firstRole.name.localeCompare(secondRole.name);
}
