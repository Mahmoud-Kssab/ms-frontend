import Link from 'next/link';
import { ArrowRight, Inbox } from 'lucide-react';

import { AppShell } from '@/components/app-shell';
import { RouteGuard } from '@/features/rbac/components/route-guard';
import { PERMISSIONS } from '@/features/rbac/constants/permissions';

export default function SettingsPage() {
  return (
    <RouteGuard permissions={[PERMISSIONS.SettingsManage]}>
      <AppShell>
        <main className="mx-auto min-h-screen max-w-7xl px-6 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold">Settings</h1>
            <p className="mt-1 text-sm text-muted">
              Workspace settings are protected by settings:manage.
            </p>
          </div>

          <section className="rounded-md border border-border bg-white p-5 shadow-panel">
            <Inbox aria-hidden="true" className="text-brand" size={22} />
            <h2 className="mt-4 text-base font-semibold">Inboxes</h2>
            <p className="mt-2 text-sm text-muted">
              Manage WhatsApp, Telegram, Messenger, and Instagram inbox connections.
            </p>
            <Link
              href="/settings/inboxes"
              className="mt-5 inline-flex h-9 items-center gap-2 rounded-md bg-ink px-3 text-sm font-medium text-white"
            >
              Open Inboxes
              <ArrowRight aria-hidden="true" size={15} />
            </Link>
          </section>
        </main>
      </AppShell>
    </RouteGuard>
  );
}
