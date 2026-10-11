export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export type FetchPage<T> = (
  page: number,
  limit: number,
  signal?: AbortSignal
) => Promise<Paginated<T>>;