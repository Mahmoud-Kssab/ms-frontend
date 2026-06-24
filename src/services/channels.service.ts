import { apiClient } from './api-client';

export type ChannelProvider = 'whatsapp' | 'telegram' | 'messenger' | 'instagram';
export type ChannelCredentials = Record<string, string>;

export interface ChannelSummary {
  id: string;
  provider: ChannelProvider;
  externalId: string;
  name: string;
  credentials: ChannelCredentials;
  profile: Record<string, unknown>;
  isActive: boolean;
}

export interface TestChannelResponse {
  provider: ChannelProvider;
  externalId: string;
  name: string;
  profile: Record<string, unknown>;
}

export const channelsService = {
  async listChannels(): Promise<ChannelSummary[]> {
    const { data } = await apiClient.get<ChannelSummary[]>('/api/v1/channels');
    return data;
  },

  async testConnection(payload: {
    provider: ChannelProvider;
    credentials: ChannelCredentials;
  }): Promise<TestChannelResponse> {
    const { data } = await apiClient.post<TestChannelResponse>(
      '/api/v1/channels/test-connection',
      payload,
    );
    return data;
  },

  async createChannel(payload: {
    provider: ChannelProvider;
    name: string;
    credentials: ChannelCredentials;
  }): Promise<ChannelSummary> {
    const { data } = await apiClient.post<ChannelSummary>('/api/v1/channels', payload);
    return data;
  },

  async updateChannel(
    channelId: string,
    payload: {
      name?: string;
      credentials?: ChannelCredentials;
    },
  ): Promise<ChannelSummary> {
    const { data } = await apiClient.patch<ChannelSummary>(
      `/api/v1/channels/${channelId}`,
      payload,
    );
    return data;
  },
};
