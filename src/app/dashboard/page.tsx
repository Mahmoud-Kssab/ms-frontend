import Link from 'next/link';
import { ArrowRight, MessageSquare, ShieldCheck, Users } from 'lucide-react';

import { AppShell } from '@/components/app-shell';
import { HasPermission } from '@/features/rbac/components/has-permission';
import { PermissionAction } from '@/features/rbac/components/permission-action';
import { RouteGuard } from '@/features/rbac/components/route-guard';
import { PERMISSIONS } from '@/features/rbac/constants/permissions';

export default function DashboardPage() {
  return (
    <RouteGuard permissions={[]}>
      <AppShell>
        <main className="mx-auto min-h-screen max-w-7xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">
            Permission-aware navigation and actions for the shared inbox.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <section className="rounded-md border border-border bg-white p-5 shadow-panel">
            <MessageSquare aria-hidden="true" className="text-brand" size={22} />
            <h2 className="mt-4 text-base font-semibold">Conversation Access</h2>
            <p className="mt-2 text-sm text-muted">
              Users can read or reply only when their role grants chat permissions.
            </p>
            <div className="mt-5 flex gap-2">
              <PermissionAction
                permission={PERMISSIONS.ChatDelete}
                deniedReason="Requires chat:delete."
                className="inline-flex h-9 items-center gap-2 rounded-md bg-danger px-3 text-sm font-medium text-white"
              >
                Delete Conversation
              </PermissionAction>
            </div>
          </section>

          <section className="rounded-md border border-border bg-white p-5 shadow-panel">
            <Users aria-hidden="true" className="text-accent" size={22} />
            <h2 className="mt-4 text-base font-semibold">User Management</h2>
            <p className="mt-2 text-sm text-muted">
              User management is available to users with team visibility.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <HasPermission permission={PERMISSIONS.UserRead}>
                <Link
                  href="/admin/users"
                  className="inline-flex h-9 items-center gap-2 rounded-md bg-ink px-3 text-sm font-medium text-white"
                >
                  Open Users
                  <ArrowRight aria-hidden="true" size={15} />
                </Link>
              </HasPermission>
              <HasPermission permission={PERMISSIONS.RoleRead}>
                <Link
                  href="/admin/roles"
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-white px-3 text-sm font-medium text-ink"
                >
                  Open Roles
                  <ArrowRight aria-hidden="true" size={15} />
                </Link>
              </HasPermission>
            </div>
          </section>

          <section className="rounded-md border border-border bg-white p-5 shadow-panel">
            <ShieldCheck aria-hidden="true" className="text-brand" size={22} />
            <h2 className="mt-4 text-base font-semibold">Settings Guard</h2>
            <p className="mt-2 text-sm text-muted">
              Direct visits to restricted routes are redirected by the route guard.
            </p>
            <HasPermission
              permission={PERMISSIONS.SettingsManage}
              fallback={
                <p className="mt-5 text-sm font-medium text-muted">
                  Settings link hidden: missing settings:manage.
                </p>
              }
            >
              <Link
                href="/settings"
                className="mt-5 inline-flex h-9 items-center gap-2 rounded-md bg-brand px-3 text-sm font-medium text-white"
              >
                Open Settings
                <ArrowRight aria-hidden="true" size={15} />
              </Link>
            </HasPermission>
          </section>
        </div>
        </main>
      </AppShell>
    </RouteGuard>
  );
}
