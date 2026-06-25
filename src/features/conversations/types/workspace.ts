import { ChannelProvider } from '@/services/channels.service';

export type ComposerMode = 'reply' | 'note';

export interface WorkspaceInbox {
  id: string;
  provider: ChannelProvider;
  name: string;
  unreadCount: number;
}

export interface ConversationMessage {
  id: string;
  body: string;
  author: string;
  timestamp: string;
  direction: 'incoming' | 'outgoing' | 'internal';
}

export interface ConversationThread {
  id: string;
  inboxId: string;
  customerName: string;
  customerInitials: string;
  preview: string;
  timestamp: string;
  unreadCount: number;
  assignee: string;
  messages: ConversationMessage[];
}
