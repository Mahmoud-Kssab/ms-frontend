import { AppShell } from '@/components/app-shell';
import { AccessManagement } from '@/features/rbac/components/access-management';
import { RouteGuard } from '@/features/rbac/components/route-guard';
import { PERMISSIONS } from '@/features/rbac/constants/permissions';

export default function UsersPage() {
  return (
    <RouteGuard permissions={[PERMISSIONS.UserRead, PERMISSIONS.RoleRead]}>
      <AppShell>
        <main className="mx-auto min-h-screen max-w-7xl px-6 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold">Users</h1>
            <p className="mt-1 text-sm text-muted">
              Manage user profiles, passwords, status, roles, and permissions.
            </p>
          </div>

          <AccessManagement />
        </main>
      </AppShell>
    </RouteGuard>
  );
}
