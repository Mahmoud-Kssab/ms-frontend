import { apiClient } from './api-client';

export interface ConversationSummary {
  id: string;
  channelType: string;
  contactName: string;
  status: string;
  assignedToUserId: string | null;
  lastMessagePreview: string;
  updatedAt: string;
}

export const conversationsService = {
  async listConversations(): Promise<ConversationSummary[]> {
    const { data } = await apiClient.get<ConversationSummary[]>('/conversations');
    return data;
  },
};
