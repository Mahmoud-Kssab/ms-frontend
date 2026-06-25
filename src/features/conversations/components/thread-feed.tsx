import { Search } from 'lucide-react';

import { ConversationThread } from '../types/workspace';

interface ThreadFeedProps {
  threads: ConversationThread[];
  selectedThreadId: string | null;
  onSelect: (threadId: string) => void;
}

export function ThreadFeed({ threads, selectedThreadId, onSelect }: ThreadFeedProps) {
  return (
    <section className="min-w-0 border-b border-border bg-white xl:border-b-0 xl:border-r" aria-label="Conversations">
      <div className="border-b border-border px-4 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Conversations</h2>
          <span className="text-xs text-muted">{threads.length} active</span>
        </div>
        <div className="relative mt-3">
          <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={15} />
          <input className="h-9 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm outline-none placeholder:text-muted focus:border-brand" placeholder="Search conversations" aria-label="Search conversations" />
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto xl:max-h-none xl:h-[calc(100vh-177px)]">
        {threads.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-muted">No conversations in this inbox.</div>
        ) : (
          threads.map((thread) => {
            const isSelected = thread.id === selectedThreadId;
            return (
              <button
                key={thread.id}
                type="button"
                onClick={() => onSelect(thread.id)}
                className={[
                  'flex w-full items-start gap-3 border-b border-border px-4 py-3.5 text-left transition-colors last:border-b-0',
                  isSelected ? 'bg-emerald-50' : 'hover:bg-surface',
                ].join(' ')}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold text-slate-600">{thread.customerInitials}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-semibold text-ink">{thread.customerName}</span>
                    <span className="shrink-0 text-xs text-muted">{thread.timestamp}</span>
                  </span>
                  <span className="mt-1 flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate text-sm text-muted">{thread.preview}</span>
                    {thread.unreadCount > 0 ? <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-semibold text-white">{thread.unreadCount}</span> : null}
                  </span>
                  <span className="mt-1.5 block text-xs text-muted">Assigned to {thread.assignee}</span>
                </span>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}
