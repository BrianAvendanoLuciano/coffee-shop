import {
  cursorPageSchema,
  employeeSchema,
  orderSchema,
  pageSchema,
  productSchema,
  reportSummarySchema,
  sessionSchema,
} from '@/lib/schemas';
import type {
  CategoryId,
  CreateOrderInput,
  LoginInput,
  OrderStatus,
} from '@/types/common';
import { request, withQuery } from './client';

export type ProductFilters = {
  category?: CategoryId;
  q?: string;
};

export type OrderListParams = {
  page: number;
  pageSize: number;
  status?: OrderStatus;
};

// One typed function per endpoint. Components and hooks never build URLs or
// call fetch themselves, so the URL, the HTTP method and the response schema
// for an endpoint live in exactly one place.
export const api = {
  session: (signal?: AbortSignal) =>
    request('/api/auth/me', sessionSchema, { signal }),

  login: (input: LoginInput) =>
    request('/api/auth/login', sessionSchema, { method: 'POST', body: input }),

  logout: () => request('/api/auth/logout', sessionSchema, { method: 'POST' }),

  products: (
    params: ProductFilters & { cursor: number; limit: number },
    signal?: AbortSignal,
  ) =>
    request(
      withQuery('/api/products', params),
      cursorPageSchema(productSchema),
      { signal },
    ),

  orders: (params: OrderListParams, signal?: AbortSignal) =>
    request(withQuery('/api/orders', params), pageSchema(orderSchema), {
      signal,
    }),

  order: (id: string, signal?: AbortSignal) =>
    request(`/api/orders/${encodeURIComponent(id)}`, orderSchema, { signal }),

  createOrder: (input: CreateOrderInput, signal?: AbortSignal) =>
    request('/api/orders', orderSchema, { method: 'POST', body: input, signal }),

  updateOrderStatus: (id: string, status: OrderStatus) =>
    request(`/api/orders/${encodeURIComponent(id)}`, orderSchema, {
      method: 'PATCH',
      body: { status },
    }),

  employee: (id: string, signal?: AbortSignal) =>
    request(`/api/employees/${encodeURIComponent(id)}`, employeeSchema, {
      signal,
    }),

  reportSummary: (signal?: AbortSignal) =>
    request('/api/reports/summary', reportSummarySchema, { signal }),
};
