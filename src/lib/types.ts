/** Shape of every list endpoint's response (backend `paginate()` helper). */
export type Paginated<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
