import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { ResponseShapeError } from '@/lib/api/errors';
import { makeOrder } from '@/test/fixtures';
import { makeTestQueryClient, mockFetch } from '@/test/utils';
import type { Order, Page } from '@/types/common';
import { queryKeys } from './keys';
import {
  orderListOptions,
  useOrders,
  useUpdateOrderStatus,
} from './orders';
import { shouldRetry } from './query-client';

const page = (items: Order[]): Page<Order> => ({
  items,
  page: 1,
  pageSize: 5,
  total: items.length,
  totalPages: 1,
});

// Hooks cannot be called outside a component. renderHook mounts a tiny one
// for us; the wrapper supplies the QueryClient the hook expects.
function setup() {
  const queryClient = makeTestQueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
}

describe('useOrders', () => {
  it('goes from pending to success with validated data', async () => {
    mockFetch({ 'GET /api/orders': { body: page([makeOrder()]) } });
    const { wrapper } = setup();

    const { result } = renderHook(
      () => useOrders({ page: 1, pageSize: 5 }),
      { wrapper },
    );

    expect(result.current.isPending).toBe(true);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.items[0]?.customer).toBe('Brian');
  });

  it('fails when the response does not match the schema', async () => {
    mockFetch({ 'GET /api/orders': { body: { items: 'not an array' } } });
    const { wrapper } = setup();

    const { result } = renderHook(
      () => useOrders({ page: 1, pageSize: 5 }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(ResponseShapeError);
  });
});

describe('useUpdateOrderStatus', () => {
  const pendingParams = { page: 1, pageSize: 50, status: 'PENDING' } as const;

  it('removes the order from the pending list before the server answers', async () => {
    const order = makeOrder();
    // The server "answers" only when the test calls respond().
    const { promise: serverAnswers, resolve: respond } =
      Promise.withResolvers<void>();
    mockFetch({
      'PATCH /api/orders/ord-001': {
        body: { ...order, status: 'COMPLETED' },
        wait: serverAnswers,
      },
      'GET /api/orders': { body: page([]) },
    });
    const { queryClient, wrapper } = setup();
    const key = orderListOptions(pendingParams).queryKey;
    queryClient.setQueryData(key, page([order]));

    const { result } = renderHook(() => useUpdateOrderStatus(), { wrapper });
    act(() => result.current.mutate({ id: 'ord-001', status: 'COMPLETED' }));

    // Optimistic: already gone while the request is still in flight.
    await waitFor(() =>
      expect(queryClient.getQueryData(key)?.items).toEqual([]),
    );
    expect(result.current.isPending).toBe(true);

    respond();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(
      queryClient.getQueryData(queryKeys.orders.detail('ord-001')),
    ).toMatchObject({ status: 'COMPLETED' });
  });

  it('puts the order back when the server refuses', async () => {
    const order = makeOrder();
    mockFetch({
      'PATCH /api/orders/ord-001': {
        status: 409,
        body: {
          error: { code: 'INVALID_TRANSITION', message: 'Already completed.' },
        },
      },
    });
    const { queryClient, wrapper } = setup();
    const key = orderListOptions(pendingParams).queryKey;
    queryClient.setQueryData(key, page([order]));

    const { result } = renderHook(() => useUpdateOrderStatus(), { wrapper });
    act(() => result.current.mutate({ id: 'ord-001', status: 'COMPLETED' }));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Already completed.');
    expect(queryClient.getQueryData(key)?.items).toEqual([order]);
  });
});

describe('retry policy', () => {
  it('retries server errors but not client errors', async () => {
    const { HttpError, NetworkError } = await import('@/lib/api/errors');

    expect(shouldRetry(0, new HttpError(503, 'DOWN', 'down'))).toBe(true);
    expect(shouldRetry(0, new NetworkError(null))).toBe(true);
    expect(shouldRetry(0, new HttpError(404, 'NOT_FOUND', 'gone'))).toBe(false);
    expect(shouldRetry(2, new HttpError(503, 'DOWN', 'down'))).toBe(false);
  });
});
