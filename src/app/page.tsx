import { AppShell } from '@/components/app-shell';
import { ConversationWorkspace } from '@/features/conversations/components/conversation-workspace';
import { RouteGuard } from '@/features/rbac/components/route-guard';
import { PERMISSIONS } from '@/features/rbac/constants/permissions';

export default function HomePage() {
  return (
    <RouteGuard permissions={[PERMISSIONS.ChatRead]}>
      <AppShell>
        <main className="xl:p-5">
          <ConversationWorkspace />
        </main>
      </AppShell>
    </RouteGuard>
  );
}
