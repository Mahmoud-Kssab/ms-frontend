import { apiClient } from './api-client';

export interface UserSummary {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
}

export const usersService = {
  async listUsers(): Promise<UserSummary[]> {
    const { data } = await apiClient.get<UserSummary[]>('/users');
    return data;
  },
};
