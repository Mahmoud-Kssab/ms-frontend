'use client';

import { useMemo, useState } from 'react';

import { PERMISSIONS } from '@/features/rbac/constants/permissions';
import { usePermissionContext } from '@/features/rbac/providers/permission-provider';

import { workspaceInboxes, workspaceThreads } from '../data/workspace-seed';
import { ComposerMode, ConversationThread } from '../types/workspace';
import { DualStateComposer } from './dual-state-composer';
import { InboxSelector } from './inbox-selector';
import { MessageStream } from './message-stream';
import { ThreadFeed } from './thread-feed';

export function ConversationWorkspace() {
  const [selectedInboxId, setSelectedInboxId] = useState(workspaceInboxes[0].id);
  const [threads, setThreads] = useState<ConversationThread[]>(workspaceThreads);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(workspaceThreads[0].id);
  const { hasPermission, user } = usePermissionContext();
  const visibleThreads = useMemo(() => threads.filter((thread) => thread.inboxId === selectedInboxId), [selectedInboxId, threads]);
  const selectedThread = threads.find((thread) => thread.id === selectedThreadId) ?? null;

  function selectInbox(inboxId: string) {
    setSelectedInboxId(inboxId);
    const nextThread = threads.find((thread) => thread.inboxId === inboxId);
    setSelectedThreadId(nextThread?.id ?? null);
  }

  function addMessage(mode: ComposerMode, body: string) {
    if (!selectedThreadId) {
      return;
    }

    const timestamp = new Intl.DateTimeFormat([], { hour: 'numeric', minute: '2-digit' }).format(new Date());
    setThreads((currentThreads) => currentThreads.map((thread) => {
      if (thread.id !== selectedThreadId) {
        return thread;
      }

      return {
        ...thread,
        preview: mode === 'note' ? 'Internal note added' : body,
        timestamp: 'now',
        messages: [...thread.messages, {
          id: `local-${Date.now()}`,
          body,
          author: user?.name ?? 'You',
          timestamp,
          direction: mode === 'note' ? 'internal' : 'outgoing',
        }],
      };
    }));
  }

  return (
    <section className="grid min-h-[calc(100vh-64px)] overflow-hidden border-y border-border bg-white xl:grid-cols-[240px_340px_minmax(0,1fr)] xl:border-x" aria-label="Conversation workspace">
      <InboxSelector inboxes={workspaceInboxes} selectedInboxId={selectedInboxId} onSelect={selectInbox} />
      <ThreadFeed threads={visibleThreads} selectedThreadId={selectedThreadId} onSelect={setSelectedThreadId} />
      <section className="flex min-h-[640px] min-w-0 flex-col bg-surface xl:min-h-0" aria-label="Active conversation">
        <header className="flex items-center justify-between gap-4 border-b border-border bg-white px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-ink">{selectedThread?.customerName ?? 'No conversation selected'}</h1>
            <p className="mt-0.5 truncate text-sm text-muted">{selectedThread ? `Assigned to ${selectedThread.assignee}` : 'Choose a conversation from the list.'}</p>
          </div>
          {selectedThread ? <span className="shrink-0 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">Open</span> : null}
        </header>
        <MessageStream thread={selectedThread} />
        {selectedThread ? <DualStateComposer canReply={hasPermission(PERMISSIONS.ChatWrite)} onSubmit={addMessage} /> : null}
      </section>
    </section>
  );
}
