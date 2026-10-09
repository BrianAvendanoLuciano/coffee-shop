import {
  type QueryClient,
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useCallback } from 'react';
import { type OrderListParams, api } from '@/lib/api/endpoints';
import type { Order, OrderStatus, Page } from '@/types/common';
import { queryKeys } from './keys';

// queryOptions() bundles key + function + settings into one typed object that
// useQuery, prefetchQuery and setQueryData can all share.
export const orderListOptions = (params: OrderListParams) =>
  queryOptions({
    queryKey: queryKeys.orders.list(params),
    queryFn: ({ signal }) => api.orders(params, signal),
  });

export const orderDetailOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.orders.detail(id),
    queryFn: ({ signal }) => api.order(id, signal),
  });

const PENDING_PARAMS: OrderListParams = {
  page: 1,
  pageSize: 50,
  status: 'PENDING',
};

// Pagination: the page number is in the key, so every page is its own cache
// entry. keepPreviousData keeps page 1 on screen while page 2 loads.
export function useOrders(params: OrderListParams) {
  return useQuery({
    ...orderListOptions(params),
    placeholderData: keepPreviousData,
  });
}

// Background refetching: the queue polls, so an order placed on another till
// shows up here without anyone reloading.
export function usePendingOrders() {
  return useQuery({
    ...orderListOptions(PENDING_PARAMS),
    select: (page) => page.items,
    staleTime: 0,
    refetchInterval: 15_000,
  });
}

function findOrderInLists(queryClient: QueryClient, id: string) {
  const lists = queryClient.getQueriesData<Page<Order>>({
    queryKey: queryKeys.orders.lists(),
  });
  for (const [queryKey, page] of lists) {
    const order = page?.items.find((item) => item.id === id);
    if (order) {
      return {
        order,
        updatedAt: queryClient.getQueryState(queryKey)?.dataUpdatedAt,
      };
    }
  }
  return undefined;
}

export function useOrder(id: string) {
  const queryClient = useQueryClient();

  return useQuery({
    ...orderDetailOptions(id),
    // Initial data: if a list already holds this order, show it at once
    // instead of a spinner. Passing the list's timestamp lets staleTime
    // decide whether a background refetch is still needed.
    initialData: () => findOrderInLists(queryClient, id)?.order,
    initialDataUpdatedAt: () => findOrderInLists(queryClient, id)?.updatedAt,
  });
}

// Prefetching: warm the cache on hover so the detail page opens instantly.
export function usePrefetchOrder() {
  const queryClient = useQueryClient();

  return useCallback(
    (id: string) => {
      void queryClient.prefetchQuery({
        ...orderDetailOptions(id),
        // Do not refetch if we prefetched it a few seconds ago.
        staleTime: 10_000,
      });
    },
    [queryClient],
  );
}

type StatusChange = { id: string; status: OrderStatus };

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: StatusChange) =>
      api.updateOrderStatus(id, status),

    // Optimistic update: change the cache before the server answers, so the
    // UI responds immediately. Whatever onMutate returns is handed to the
    // later callbacks as `context`.
    onMutate: async ({ id, status }) => {
      // Stop in-flight refetches from overwriting the optimistic value.
      await queryClient.cancelQueries({ queryKey: queryKeys.orders.all });

      // Snapshot what we are about to change, for rollback.
      const previousLists = queryClient.getQueriesData<Page<Order>>({
        queryKey: queryKeys.orders.lists(),
      });
      const previousDetail = queryClient.getQueryData(
        orderDetailOptions(id).queryKey,
      );

      for (const [queryKey, page] of previousLists) {
        if (!page) continue;
        // The third key segment is the params object the list was built with.
        const filter = (queryKey[2] as OrderListParams | undefined)?.status;
        const items = page.items
          .map((order) => (order.id === id ? { ...order, status } : order))
          // An order leaves any list filtered to a different status.
          .filter((order) => !filter || order.status === filter);
        queryClient.setQueryData<Page<Order>>(queryKey, { ...page, items });
      }

      if (previousDetail) {
        queryClient.setQueryData(orderDetailOptions(id).queryKey, {
          ...previousDetail,
          status,
        });
      }

      return { previousLists, previousDetail };
    },

    // Roll back to the snapshot if the server refuses.
    onError: (_error, { id }, context) => {
      for (const [queryKey, page] of context?.previousLists ?? []) {
        queryClient.setQueryData(queryKey, page);
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(
          orderDetailOptions(id).queryKey,
          context.previousDetail,
        );
      }
    },

    // The response is the updated order: write it straight into the cache
    // rather than waiting for a refetch.
    onSuccess: (order) => {
      queryClient.setQueryData(orderDetailOptions(order.id).queryKey, order);
    },

    // Success or failure, mark the affected data stale so it is refetched and
    // the cache ends up matching the server. Returning the promise keeps the
    // mutation "pending" until the refetch finishes.
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.reports.summary }),
      ]),
  });
}
