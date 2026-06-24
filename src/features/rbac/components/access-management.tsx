'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Check, Users } from 'lucide-react';

import { rbacService } from '@/services/rbac.service';

import { PERMISSIONS } from '../constants/permissions';
import { usePermissionContext } from '../providers/permission-provider';
import { ManagedUser, Role } from '../types/rbac';

interface AccessManagementProps {
  initialUsers?: ManagedUser[];
  initialRoles?: Role[];
}

interface CreateUserFormState {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleIds: string[];
}

const createUserDraftStorageKey = 'inboxline:create-user-draft';
const emptyCreateUserForm: CreateUserFormState = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  roleIds: [] as string[],
};

function readCreateUserDraft(): CreateUserFormState {
  if (typeof window === 'undefined') {
    return emptyCreateUserForm;
  }

  const storedDraft = window.sessionStorage.getItem(createUserDraftStorageKey);

  if (!storedDraft) {
    return emptyCreateUserForm;
  }

  try {
    return {
      ...emptyCreateUserForm,
      ...JSON.parse(storedDraft),
    };
  } catch {
    return emptyCreateUserForm;
  }
}

export function AccessManagement({
  initialUsers = [],
  initialRoles = [],
}: AccessManagementProps) {
  const [users, setUsers] = useState(initialUsers);
  const [roles, setRoles] = useState(initialRoles);
  const [selectedUserId, setSelectedUserId] = useState(initialUsers[0]?.id ?? '');
  const [isLoading, setIsLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState('');
  const [messageTone, setMessageTone] = useState<'success' | 'warning' | 'error'>(
    'success',
  );
  const [createUserForm, setCreateUserForm] = useState(readCreateUserDraft);
  const [profileForm, setProfileForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
  });
  const [passwordForm, setPasswordForm] = useState({ password: '' });
  const { hasPermission, refreshPermissions } = usePermissionContext();
  const canManageUsers = hasPermission(PERMISSIONS.UserManage);

  const selectedUser = users.find((user) => user.id === selectedUserId);
  const messageClassName =
    messageTone === 'error'
      ? 'bg-red-100 text-red-800'
      : messageTone === 'warning'
        ? 'bg-amber-100 text-amber-800'
        : 'bg-emerald-100 text-emerald-800';

  useEffect(() => {
    async function loadAccessData() {
      setIsLoading(true);
      const [nextUsers, nextRoles] = await Promise.all([
        rbacService.listUsers(),
        rbacService.listRoles(),
      ]);

      setUsers(nextUsers);
      setRoles(nextRoles);
      setSelectedUserId((currentUserId) => currentUserId || nextUsers[0]?.id || '');
      setIsLoading(false);
    }

    void loadAccessData();
  }, []);

  useEffect(() => {
    window.sessionStorage.setItem(
      createUserDraftStorageKey,
      JSON.stringify(createUserForm),
    );
  }, [createUserForm]);

  useEffect(() => {
    if (!selectedUser) {
      setProfileForm({
        email: '',
        firstName: '',
        lastName: '',
      });
      setPasswordForm({ password: '' });
      return;
    }

    setProfileForm({
      email: selectedUser.email,
      firstName: selectedUser.firstName,
      lastName: selectedUser.lastName,
    });
    setPasswordForm({ password: '' });
  }, [selectedUser]);

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

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManageUsers) {
      showMessage('Creating users requires user:manage.', 'warning');
      return;
    }

    try {
      const createdUser = await rbacService.createUser(createUserForm);
      setUsers((currentUsers) => [createdUser, ...currentUsers]);
      setSelectedUserId(createdUser.id);
      setCreateUserForm(emptyCreateUserForm);
      showMessage(`User ${createdUser.email} created.`, 'success');
    } catch (error) {
      showMessage(getErrorMessage(error, 'Could not create this user.'), 'error');
    }
  }

  async function toggleUserRole(user: ManagedUser, roleId: string) {
    if (!canManageUsers) {
      showMessage('Role assignment requires user:manage.', 'warning');
      return;
    }

    const nextRoleIds = user.roleIds.includes(roleId)
      ? user.roleIds.filter((id) => id !== roleId)
      : [...user.roleIds, roleId];

    try {
      const updatedUser = await rbacService.updateUserRoles(user.id, nextRoleIds);
      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === updatedUser.id ? updatedUser : currentUser,
        ),
      );
      await refreshPermissions();
      showMessage('User roles updated.', 'success');
    } catch (error) {
      showMessage(getErrorMessage(error, 'Could not update user roles.'), 'error');
    }
  }

  async function updateUserProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedUser) {
      return;
    }

    if (!canManageUsers) {
      showMessage('Updating profiles requires user:manage.', 'warning');
      return;
    }

    try {
      const updatedUser = await rbacService.updateUserProfile(
        selectedUser.id,
        profileForm,
      );
      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === updatedUser.id ? updatedUser : currentUser,
        ),
      );
      await refreshPermissions();
      showMessage('User profile updated.', 'success');
    } catch (error) {
      showMessage(getErrorMessage(error, 'Could not update user profile.'), 'error');
    }
  }

  async function updateUserPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedUser) {
      return;
    }

    if (!canManageUsers) {
      showMessage('Updating passwords requires user:manage.', 'warning');
      return;
    }

    try {
      await rbacService.updateUserPassword(selectedUser.id, passwordForm);
      setPasswordForm({ password: '' });
      showMessage('User password updated.', 'success');
    } catch (error) {
      showMessage(getErrorMessage(error, 'Could not update user password.'), 'error');
    }
  }

  async function toggleUserStatus(user: ManagedUser) {
    if (!canManageUsers) {
      showMessage('Changing user status requires user:manage.', 'warning');
      return;
    }

    try {
      const updatedUser = await rbacService.updateUserStatus(user.id, {
        isActive: !user.isActive,
      });
      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === updatedUser.id ? updatedUser : currentUser,
        ),
      );
      await refreshPermissions();
      showMessage(
        `${updatedUser.email} ${updatedUser.isActive ? 'activated' : 'deactivated'}.`,
        'success',
      );
    } catch (error) {
      showMessage(getErrorMessage(error, 'Could not update user status.'), 'error');
    }
  }

  return (
    <div className="space-y-6">
      {isLoading ? (
        <section className="rounded-md border border-border bg-white p-5 text-sm text-muted shadow-panel">
          Loading access data...
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
          <h2 className="text-base font-semibold">Create User</h2>
          {!canManageUsers ? (
            <span className="rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
              Requires user:manage
            </span>
          ) : null}
        </div>
        <form onSubmit={(event) => void createUser(event)} className="mt-4 grid gap-3 lg:grid-cols-5">
          <input
            value={createUserForm.firstName}
            onChange={(event) =>
              setCreateUserForm((current) => ({
                ...current,
                firstName: event.target.value,
              }))
            }
            placeholder="First name"
            className="h-10 rounded-md border border-border px-3 text-sm"
            required
            disabled={!canManageUsers}
            title={!canManageUsers ? 'Requires user:manage.' : undefined}
          />
          <input
            value={createUserForm.lastName}
            onChange={(event) =>
              setCreateUserForm((current) => ({
                ...current,
                lastName: event.target.value,
              }))
            }
            placeholder="Last name"
            className="h-10 rounded-md border border-border px-3 text-sm"
            required
            disabled={!canManageUsers}
            title={!canManageUsers ? 'Requires user:manage.' : undefined}
          />
          <input
            value={createUserForm.email}
            onChange={(event) =>
              setCreateUserForm((current) => ({
                ...current,
                email: event.target.value,
              }))
            }
            type="email"
            placeholder="Email"
            className="h-10 rounded-md border border-border px-3 text-sm"
            required
            disabled={!canManageUsers}
            title={!canManageUsers ? 'Requires user:manage.' : undefined}
          />
          <input
            value={createUserForm.password}
            onChange={(event) =>
              setCreateUserForm((current) => ({
                ...current,
                password: event.target.value,
              }))
            }
            type="password"
            placeholder="Password"
            className="h-10 rounded-md border border-border px-3 text-sm"
            required
            minLength={8}
            disabled={!canManageUsers}
            title={!canManageUsers ? 'Requires user:manage.' : undefined}
          />
          <button
            type="submit"
            disabled={!canManageUsers}
            title={!canManageUsers ? 'Requires user:manage.' : undefined}
            className="h-10 rounded-md bg-ink px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Create
          </button>
        </form>
        <div className="mt-3 flex flex-wrap gap-2">
          {roles.map((role) => (
            <label key={role.id} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs">
                <input
                  type="checkbox"
                  checked={createUserForm.roleIds.includes(role.id)}
                  disabled={!canManageUsers}
                  title={!canManageUsers ? 'Requires user:manage.' : undefined}
                  onChange={() =>
                  setCreateUserForm((current) => ({
                    ...current,
                    roleIds: current.roleIds.includes(role.id)
                      ? current.roleIds.filter((id) => id !== role.id)
                      : [...current.roleIds, role.id],
                  }))
                }
              />
              {role.name}
            </label>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="rounded-md border border-border bg-white shadow-panel">
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            <Users aria-hidden="true" className="text-brand" size={20} />
            <div>
              <h2 className="text-base font-semibold">Users</h2>
              <p className="text-sm text-muted">Assign one or more roles to each user.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface text-xs uppercase text-muted">
                  <th className="px-5 py-3 font-semibold">User</th>
                  <th className="px-5 py-3 font-semibold">Roles</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className={[
                      'cursor-pointer border-b border-border last:border-b-0',
                      selectedUserId === user.id ? 'bg-emerald-50' : 'hover:bg-surface',
                    ].join(' ')}
                    onClick={() => setSelectedUserId(user.id)}
                  >
                    <td className="px-5 py-4">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-muted">{user.email}</div>
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {user.roleIds
                        .map((roleId) => roles.find((role) => role.id === roleId)?.name)
                        .filter(Boolean)
                        .join(', ')}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={[
                          'rounded-md px-2 py-1 text-xs font-medium',
                          user.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-700',
                        ].join(' ')}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        disabled={!canManageUsers}
                        onClick={(event) => {
                          event.stopPropagation();
                          void toggleUserStatus(user);
                        }}
                        className={[
                          'h-8 rounded-md px-3 text-xs font-medium disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500',
                          user.isActive
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200',
                        ].join(' ')}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-md border border-border bg-white p-5 shadow-panel">
          <h2 className="text-base font-semibold">Assigned Roles</h2>
          <p className="mt-1 text-sm text-muted">
            {selectedUser
              ? `Update access for ${selectedUser.name}.`
              : 'Select a user to manage roles.'}
          </p>
          {!canManageUsers ? (
            <p className="mt-2 text-xs font-medium text-amber-700">
              Role assignment requires user:manage.
            </p>
          ) : null}

          {selectedUser ? (
            <div className="mt-5 space-y-5">
              <div className="flex items-center justify-between gap-3 rounded-md border border-border p-3">
                <div>
                  <h3 className="text-sm font-semibold">Status</h3>
                  <p className="mt-1 text-xs text-muted">
                    {selectedUser.isActive
                      ? 'This user can log in and use assigned permissions.'
                      : 'This user cannot log in while inactive.'}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={!canManageUsers}
                  onClick={() => void toggleUserStatus(selectedUser)}
                  className={[
                    'h-9 rounded-md px-3 text-sm font-medium disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500',
                    selectedUser.isActive
                      ? 'bg-red-100 text-red-800 hover:bg-red-200'
                      : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200',
                  ].join(' ')}
                >
                  {selectedUser.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>

              <form
                onSubmit={(event) => void updateUserProfile(event)}
                className="space-y-3 rounded-md border border-border p-3"
              >
                <h3 className="text-sm font-semibold">Profile</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={profileForm.firstName}
                    onChange={(event) =>
                      setProfileForm((current) => ({
                        ...current,
                        firstName: event.target.value,
                      }))
                    }
                    placeholder="First name"
                    className="h-10 rounded-md border border-border px-3 text-sm"
                    disabled={!canManageUsers}
                    required
                  />
                  <input
                    value={profileForm.lastName}
                    onChange={(event) =>
                      setProfileForm((current) => ({
                        ...current,
                        lastName: event.target.value,
                      }))
                    }
                    placeholder="Last name"
                    className="h-10 rounded-md border border-border px-3 text-sm"
                    disabled={!canManageUsers}
                    required
                  />
                </div>
                <input
                  value={profileForm.email}
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  type="email"
                  placeholder="Email"
                  className="h-10 w-full rounded-md border border-border px-3 text-sm"
                  disabled={!canManageUsers}
                  required
                />
                <button
                  type="submit"
                  disabled={!canManageUsers}
                  className="h-9 rounded-md bg-ink px-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Update Profile
                </button>
              </form>

              <form
                onSubmit={(event) => void updateUserPassword(event)}
                className="space-y-3 rounded-md border border-border p-3"
              >
                <h3 className="text-sm font-semibold">Password</h3>
                <input
                  value={passwordForm.password}
                  onChange={(event) =>
                    setPasswordForm({
                      password: event.target.value,
                    })
                  }
                  type="password"
                  placeholder="New password"
                  className="h-10 w-full rounded-md border border-border px-3 text-sm"
                  disabled={!canManageUsers}
                  minLength={8}
                  required
                />
                <button
                  type="submit"
                  disabled={!canManageUsers}
                  className="h-9 rounded-md bg-ink px-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Update Password
                </button>
              </form>
            </div>
          ) : null}

          <div className="mt-5 space-y-3">
            {selectedUser
              ? roles.map((role) => (
                  <label
                    key={role.id}
                    className={[
                      'flex items-start gap-3 rounded-md border border-border p-3',
                      canManageUsers
                        ? 'cursor-pointer hover:bg-surface'
                        : 'cursor-not-allowed bg-surface text-muted',
                    ].join(' ')}
                    title={!canManageUsers ? 'Requires user:manage.' : undefined}
                  >
                    <input
                      type="checkbox"
                      checked={selectedUser.roleIds.includes(role.id)}
                      disabled={!canManageUsers}
                      onChange={() => void toggleUserRole(selectedUser, role.id)}
                      className="mt-1 h-4 w-4 rounded border-border text-brand"
                    />
                    <span>
                      <span className="block text-sm font-medium">{role.name}</span>
                      <span className="mt-1 block text-xs text-muted">
                        {role.description}
                      </span>
                    </span>
                  </label>
                ))
              : null}
          </div>
        </section>
      </div>

      <p className="text-xs leading-5 text-muted">
        UI permission checks improve the user experience only. Backend guards and API
        authorization remain the final security boundary for every action.
      </p>
    </div>
  );
}
