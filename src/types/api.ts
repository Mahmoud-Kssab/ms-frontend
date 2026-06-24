export interface ApiErrorResponse {
  message: string;
  statusCode: number;
  error?: string;
}

export interface PaginatedResponse<TItem> {
  items: TItem[];
  total: number;
  page: number;
  limit: number;
}
