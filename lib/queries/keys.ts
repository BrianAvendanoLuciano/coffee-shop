import type { OrderListParams, ProductFilters } from '@/lib/api/endpoints';

// Query keys are the cache's addresses. Building them through one factory
// keeps them hierarchical, from general to specific:
//
//   ['orders']                       everything about orders
//   ['orders', 'list']               every list, any page or filter
//   ['orders', 'list', { page: 2 }]  one list
//   ['orders', 'detail', 'ord-001']  one order
//
// Invalidating a prefix invalidates everything beneath it.
export const queryKeys = {
  session: ['session'] as const,

  products: {
    all: ['products'] as const,
    list: (filters: ProductFilters) => ['products', 'list', filters] as const,
  },

  orders: {
    all: ['orders'] as const,
    lists: () => ['orders', 'list'] as const,
    list: (params: OrderListParams) => ['orders', 'list', params] as const,
    details: () => ['orders', 'detail'] as const,
    detail: (id: string) => ['orders', 'detail', id] as const,
  },

  employees: {
    detail: (id: string) => ['employees', 'detail', id] as const,
  },

  reports: {
    summary: ['reports', 'summary'] as const,
  },
};
