import { ConversationThread, WorkspaceInbox } from '../types/workspace';

export const workspaceInboxes: WorkspaceInbox[] = [
  { id: 'inbox-whatsapp', provider: 'whatsapp', name: 'WhatsApp Sales', unreadCount: 6 },
  { id: 'inbox-telegram', provider: 'telegram', name: 'Telegram Support', unreadCount: 2 },
  { id: 'inbox-messenger', provider: 'messenger', name: 'Facebook Messenger', unreadCount: 1 },
  { id: 'inbox-instagram', provider: 'instagram', name: 'Instagram Direct', unreadCount: 4 },
];

export const workspaceThreads: ConversationThread[] = [
  {
    id: 'thread-olivia',
    inboxId: 'inbox-whatsapp',
    customerName: 'Olivia Bennett',
    customerInitials: 'OB',
    preview: 'Can I change the delivery address?',
    timestamp: '2m',
    unreadCount: 2,
    assignee: 'Maya Hassan',
    messages: [
      {
        id: 'message-olivia-1',
        body: 'Hi, can I change the delivery address for order #1048?',
        author: 'Olivia Bennett',
        timestamp: '10:21 AM',
        direction: 'incoming',
      },
      {
        id: 'message-olivia-2',
        body: 'Checking the fulfillment status before we confirm the change.',
        author: 'Maya Hassan',
        timestamp: '10:23 AM',
        direction: 'internal',
      },
      {
        id: 'message-olivia-3',
        body: 'Yes, please send the new address and we will update it if the parcel has not left the warehouse.',
        author: 'Maya Hassan',
        timestamp: '10:25 AM',
        direction: 'outgoing',
      },
    ],
  },
  {
    id: 'thread-jacob',
    inboxId: 'inbox-whatsapp',
    customerName: 'Jacob Cole',
    customerInitials: 'JC',
    preview: 'Do you have this in matte black?',
    timestamp: '18m',
    unreadCount: 0,
    assignee: 'Maya Hassan',
    messages: [
      {
        id: 'message-jacob-1',
        body: 'Do you have this model in matte black?',
        author: 'Jacob Cole',
        timestamp: '10:04 AM',
        direction: 'incoming',
      },
    ],
  },
  {
    id: 'thread-nora',
    inboxId: 'inbox-telegram',
    customerName: 'Nora Williams',
    customerInitials: 'NW',
    preview: 'The tracking link is not opening.',
    timestamp: '31m',
    unreadCount: 1,
    assignee: 'Omar Samir',
    messages: [
      {
        id: 'message-nora-1',
        body: 'The tracking link is not opening for me.',
        author: 'Nora Williams',
        timestamp: '9:51 AM',
        direction: 'incoming',
      },
    ],
  },
  {
    id: 'thread-ethan',
    inboxId: 'inbox-messenger',
    customerName: 'Ethan Walker',
    customerInitials: 'EW',
    preview: 'Thanks, that solved it.',
    timestamp: '1h',
    unreadCount: 0,
    assignee: 'Omar Samir',
    messages: [
      {
        id: 'message-ethan-1',
        body: 'Thanks, that solved it.',
        author: 'Ethan Walker',
        timestamp: '9:18 AM',
        direction: 'incoming',
      },
    ],
  },
  {
    id: 'thread-sophia',
    inboxId: 'inbox-instagram',
    customerName: 'Sophia Reed',
    customerInitials: 'SR',
    preview: 'Is this available in a smaller size?',
    timestamp: '1h',
    unreadCount: 4,
    assignee: 'Maya Hassan',
    messages: [
      {
        id: 'message-sophia-1',
        body: 'Is this available in a smaller size?',
        author: 'Sophia Reed',
        timestamp: '9:02 AM',
        direction: 'incoming',
      },
    ],
  },
];
