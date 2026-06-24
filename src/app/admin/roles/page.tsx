import { AppShell } from '@/components/app-shell';
import { RolesManagement } from '@/features/rbac/components/roles-management';
import { RouteGuard } from '@/features/rbac/components/route-guard';
import { PERMISSIONS } from '@/features/rbac/constants/permissions';

export default function RolesPage() {
  return (
    <RouteGuard permissions={[PERMISSIONS.RoleRead]}>
      <AppShell>
        <main className="mx-auto min-h-screen max-w-7xl px-6 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold">Roles</h1>
            <p className="mt-1 text-sm text-muted">
              Create roles and control which platform permissions each role grants.
            </p>
          </div>

          <RolesManagement />
        </main>
      </AppShell>
    </RouteGuard>
  );
}
