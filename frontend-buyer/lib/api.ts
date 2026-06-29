import type { ApiResponse } from '@/types';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  token?: string;
  tags?: string[];
  revalidate?: number | false;
}

async function request<T>(
  url: string,
  { method = 'GET', body, token, tags, revalidate }: RequestOptions = {},
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const nextOptions: RequestInit['next'] = {};
  if (tags) nextOptions.tags = tags;
  if (revalidate !== undefined) nextOptions.revalidate = revalidate;

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    next: Object.keys(nextOptions).length > 0 ? nextOptions : undefined,
  });

  const json = (await res.json()) as ApiResponse<T>;

  if (!json.success) {
    throw new Error(json.error ?? 'Request failed');
  }

  return json.data;
}

// Convenience wrappers — used in service files
export const api = {
  get: <T>(url: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(url, { ...opts, method: 'GET' }),

  post: <T>(url: string, body: unknown, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(url, { ...opts, method: 'POST', body }),

  patch: <T>(url: string, body: unknown, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(url, { ...opts, method: 'PATCH', body }),

  delete: <T>(url: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(url, { ...opts, method: 'DELETE' }),
};
