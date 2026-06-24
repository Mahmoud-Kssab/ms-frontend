import { AppShell } from '@/components/app-shell';
import { InboxManagementDashboard } from '@/features/channels/components/inbox-management-dashboard';
import { RouteGuard } from '@/features/rbac/components/route-guard';
import { PERMISSIONS } from '@/features/rbac/constants/permissions';

export default function InboxesPage() {
  return (
    <RouteGuard permissions={[PERMISSIONS.ChannelRead]}>
      <AppShell>
        <main className="mx-auto min-h-screen max-w-7xl px-6 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold">Inboxes</h1>
            <p className="mt-1 text-sm text-muted">
              Manage connected messaging channels and workspace inbox credentials.
            </p>
          </div>

          <InboxManagementDashboard />
        </main>
      </AppShell>
    </RouteGuard>
  );
}
