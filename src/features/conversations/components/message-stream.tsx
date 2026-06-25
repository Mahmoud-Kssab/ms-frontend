import { useEffect, useRef } from 'react';
import { LockKeyhole } from 'lucide-react';

import { ConversationThread } from '../types/workspace';

interface MessageStreamProps {
  thread: ConversationThread | null;
}

export function MessageStream({ thread }: MessageStreamProps) {
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [thread?.id, thread?.messages.length]);

  if (!thread) {
    return <div className="flex flex-1 items-center justify-center bg-surface px-6 text-sm text-muted">Select a conversation to view its messages.</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto bg-surface px-4 py-5 sm:px-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-3">
        {thread.messages.map((message) => {
          if (message.direction === 'internal') {
            return (
              <article key={message.id} className="w-full border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-800">
                  <LockKeyhole aria-hidden="true" size={14} />
                  INTERNAL NOTE
                  <span className="font-normal text-amber-700">{message.author} at {message.timestamp}</span>
                </div>
                <p className="mt-2 leading-6">{message.body}</p>
              </article>
            );
          }

          const isOutgoing = message.direction === 'outgoing';
          return (
            <article key={message.id} className={isOutgoing ? 'ml-auto max-w-[85%] sm:max-w-[70%]' : 'mr-auto max-w-[85%] sm:max-w-[70%]'}>
              <div className={['rounded-md px-4 py-3 text-sm leading-6 shadow-panel', isOutgoing ? 'bg-brand text-white' : 'bg-white text-ink'].join(' ')}>{message.body}</div>
              <p className={['mt-1 text-xs text-muted', isOutgoing ? 'text-right' : 'text-left'].join(' ')}>{message.author} · {message.timestamp}</p>
            </article>
          );
        })}
        <div ref={messageEndRef} />
      </div>
    </div>
  );
}
