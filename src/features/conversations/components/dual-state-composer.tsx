import { FormEvent, KeyboardEvent, useState } from 'react';
import { LockKeyhole, Send } from 'lucide-react';

import { ComposerMode } from '../types/workspace';

interface DualStateComposerProps {
  canReply: boolean;
  onSubmit: (mode: ComposerMode, body: string) => void;
}

export function DualStateComposer({ canReply, onSubmit }: DualStateComposerProps) {
  const [mode, setMode] = useState<ComposerMode>('reply');
  const [body, setBody] = useState('');
  const isNote = mode === 'note';

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedBody = body.trim();

    if (!trimmedBody || (!isNote && !canReply)) {
      return;
    }

    onSubmit(mode, trimmedBody);
    setBody('');
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey) && !isNote) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <form onSubmit={submit} className={['border-t bg-white px-4 py-4 sm:px-6', isNote ? 'border-amber-300' : 'border-border'].join(' ')}>
      <div className="flex items-center gap-2" role="tablist" aria-label="Message type">
        <button type="button" role="tab" aria-selected={!isNote} onClick={() => setMode('reply')} className={['h-8 rounded-md px-3 text-sm font-medium', !isNote ? 'bg-brand text-white' : 'text-muted hover:bg-surface'].join(' ')}>Reply</button>
        <button type="button" role="tab" aria-selected={isNote} onClick={() => setMode('note')} className={['inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium', isNote ? 'bg-amber-100 text-amber-900' : 'text-muted hover:bg-surface'].join(' ')}><LockKeyhole aria-hidden="true" size={14} />Internal Note</button>
      </div>
      <div className="mt-3">
        <textarea value={body} onChange={(event) => setBody(event.target.value)} onKeyDown={handleKeyDown} rows={3} placeholder={isNote ? 'Add a private note for your team...' : 'Write a reply to the customer...'} className={['block w-full resize-none rounded-md border px-3 py-2.5 text-sm leading-6 outline-none placeholder:text-muted focus:ring-2', isNote ? 'border-amber-300 bg-amber-50 text-amber-950 focus:border-amber-500 focus:ring-amber-100' : 'border-border bg-white text-ink focus:border-brand focus:ring-emerald-100'].join(' ')} />
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className={['text-xs', isNote ? 'font-medium text-amber-800' : 'text-muted'].join(' ')}>{isNote ? 'Visible only to workspace teammates. Enter adds a new line.' : canReply ? 'Use Ctrl/Cmd + Enter to send.' : 'Replying requires chat:write.'}</p>
          <button type="submit" disabled={!body.trim() || (!isNote && !canReply)} title={!isNote && !canReply ? 'Requires chat:write.' : undefined} className={['inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50', isNote ? 'bg-amber-600 text-white hover:bg-amber-700' : 'bg-brand text-white hover:bg-emerald-800'].join(' ')}>{isNote ? <LockKeyhole aria-hidden="true" size={15} /> : <Send aria-hidden="true" size={15} />}{isNote ? 'Add note' : 'Send reply'}</button>
        </div>
      </div>
    </form>
  );
}
