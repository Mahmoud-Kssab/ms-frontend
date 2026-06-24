import Link from 'next/link';
import { MessageSquare } from 'lucide-react';

import { AppShell } from '@/components/app-shell';
import { PermissionAction } from '@/features/rbac/components/permission-action';
import { RouteGuard } from '@/features/rbac/components/route-guard';
import { PERMISSIONS } from '@/features/rbac/constants/permissions';

export default function HomePage() {
  return (
    <RouteGuard permissions={[PERMISSIONS.ChatRead]}>
      <AppShell>
      <main className="mx-auto min-h-screen max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Unified Inbox</h1>
            <p className="mt-1 text-sm text-muted">
              RBAC-aware inbox controls with client-side permission checks.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center rounded-md bg-ink px-4 text-sm font-medium text-white"
          >
            Dashboard
          </Link>
        </div>

        <section className="grid min-h-[520px] gap-0 overflow-hidden rounded-md border border-border bg-white shadow-panel lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="border-b border-border lg:border-b-0 lg:border-r">
            {['WhatsApp order question', 'Instagram campaign lead', 'Messenger support'].map(
              (title, index) => (
                <button
                  key={title}
                  type="button"
                  className={[
                    'flex w-full items-start gap-3 border-b border-border px-5 py-4 text-left last:border-b-0',
                    index === 0 ? 'bg-emerald-50' : 'hover:bg-surface',
                  ].join(' ')}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-surface text-brand">
                    <MessageSquare aria-hidden="true" size={18} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{title}</span>
                    <span className="mt-1 block text-xs text-muted">
                      Latest customer message preview
                    </span>
                  </span>
                </button>
              ),
            )}
          </div>

          <div className="flex flex-col">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-base font-semibold">WhatsApp order question</h2>
              <p className="mt-1 text-sm text-muted">Assigned to Maya Hassan</p>
            </div>

            <div className="flex-1 space-y-3 bg-surface px-5 py-5">
              <div className="max-w-lg rounded-md bg-white px-4 py-3 text-sm shadow-panel">
                Hi, can I change my delivery address?
              </div>
              <div className="ml-auto max-w-lg rounded-md bg-brand px-4 py-3 text-sm text-white shadow-panel">
                Yes, send the new address and we will update it.
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-4">
              <p className="text-xs text-muted">
                Destructive actions stay disabled when permission is missing.
              </p>
              <PermissionAction
                permission={PERMISSIONS.ChatDelete}
                deniedReason="Requires chat:delete."
                className="inline-flex h-9 items-center gap-2 rounded-md bg-danger px-3 text-sm font-medium text-white"
              >
                Delete Conversation
              </PermissionAction>
            </div>
          </div>
        </section>
      </main>
      </AppShell>
    </RouteGuard>
  );
}
