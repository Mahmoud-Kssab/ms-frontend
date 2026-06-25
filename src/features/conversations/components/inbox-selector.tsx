import { Facebook, Instagram, MessageCircle, Send } from 'lucide-react';

import { ChannelProvider } from '@/services/channels.service';

import { WorkspaceInbox } from '../types/workspace';

interface InboxSelectorProps {
  inboxes: WorkspaceInbox[];
  selectedInboxId: string;
  onSelect: (inboxId: string) => void;
}

const providerVisuals: Record<
  ChannelProvider,
  { label: string; icon: typeof MessageCircle; className: string }
> = {
  whatsapp: { label: 'WhatsApp', icon: MessageCircle, className: 'bg-emerald-100 text-emerald-700' },
  telegram: { label: 'Telegram', icon: Send, className: 'bg-sky-100 text-sky-700' },
  messenger: { label: 'Messenger', icon: Facebook, className: 'bg-blue-100 text-blue-700' },
  instagram: { label: 'Instagram', icon: Instagram, className: 'bg-pink-100 text-pink-700' },
};

export function InboxSelector({ inboxes, selectedInboxId, onSelect }: InboxSelectorProps) {
  return (
    <section className="flex min-w-0 flex-col border-b border-border bg-white xl:border-b-0 xl:border-r" aria-label="Inboxes">
      <div className="flex items-center justify-between px-4 py-4">
        <h2 className="text-sm font-semibold text-ink">Inboxes</h2>
        <span className="text-xs font-medium text-muted">{inboxes.length}</span>
      </div>
      <div className="flex gap-2 overflow-x-auto px-3 pb-3 xl:block xl:space-y-1 xl:px-3">
        {inboxes.map((inbox) => {
          const visual = providerVisuals[inbox.provider];
          const Icon = visual.icon;
          const isSelected = inbox.id === selectedInboxId;

          return (
            <button
              key={inbox.id}
              type="button"
              onClick={() => onSelect(inbox.id)}
              className={[
                'flex min-w-[190px] items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors xl:min-w-0 xl:w-full',
                isSelected ? 'bg-ink text-white' : 'text-ink hover:bg-surface',
              ].join(' ')}
            >
              <span className={['flex h-9 w-9 shrink-0 items-center justify-center rounded-md', isSelected ? 'bg-white/15 text-white' : visual.className].join(' ')}>
                <Icon aria-hidden="true" size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{inbox.name}</span>
                <span className={['mt-0.5 block text-xs', isSelected ? 'text-white/70' : 'text-muted'].join(' ')}>{visual.label}</span>
              </span>
              {inbox.unreadCount > 0 ? (
                <span className={['flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold', isSelected ? 'bg-white text-ink' : 'bg-brand text-white'].join(' ')}>
                  {inbox.unreadCount}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
