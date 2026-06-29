import { api } from '@/lib/api';
import type { PaginatedResponse, Product } from '@/types';
import { API_ENDPOINTS } from '@/constants/api';

export interface ProductQuery {
  q?: string;
  category_id?: string;
  min_price?: number;
  max_price?: number;
  materials?: string;
  is_preorder?: boolean;
  page?: number;
  limit?: number;
}

function buildQueryString(params: ProductQuery): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== '',
  );
  if (entries.length === 0) return '';
  return '?' + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
}

export const productsService = {
  list: (query: ProductQuery = {}, opts?: { revalidate?: number }) =>
    api.get<PaginatedResponse<Product>>(
      `${API_ENDPOINTS.PRODUCTS.LIST}${buildQueryString(query)}`,
      { revalidate: opts?.revalidate ?? 60, tags: ['products'] },
    ),

  detail: (slug: string, opts?: { revalidate?: number }) =>
    api.get<Product>(API_ENDPOINTS.PRODUCTS.DETAIL(slug), {
      revalidate: opts?.revalidate ?? 60,
      tags: [`product-${slug}`],
    }),
};
