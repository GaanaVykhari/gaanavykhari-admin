export interface ApiResponse<T = unknown> {
  ok: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedData<T> {
  rows: T[];
  total: number;
  page: number;
  limit: number;
}
