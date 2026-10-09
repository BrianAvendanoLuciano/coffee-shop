'use client';

import { useState } from 'react';
import QueryError from '@/components/query-error';
import { ORDER_STATUSES } from '@/lib/schemas';
import { useOrders, usePrefetchOrder } from '@/lib/queries/orders';
import type { OrderStatus } from '@/types/common';
import OrderHistoryTable from './table';

const PAGE_SIZE = 5;

const PAGER_BUTTON =
  'cursor-pointer rounded-md px-3 py-1.5 text-sm ring-1 ring-slate-200 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50';

function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

export default function RecentOrders() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<OrderStatus | undefined>(undefined);

  const { data, error, isPending, isPlaceholderData, refetch } = useOrders({
    page,
    pageSize: PAGE_SIZE,
    status,
  });
  const prefetchOrder = usePrefetchOrder();

  const handleStatusChange = (value: string) => {
    setStatus(isOrderStatus(value) ? value : undefined);
    // Two state updates in one event handler are batched into one render.
    setPage(1);
  };

  return (
    <section aria-labelledby="recent-heading">
      <div className="my-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 id="recent-heading" className="text-2xl font-semibold">
            Recent Orders
          </h1>
          <p>Newest first</p>
        </div>
        <label className="text-sm">
          Status{' '}
          <select
            value={status ?? ''}
            onChange={(event) => handleStatusChange(event.target.value)}
            className="ml-1 rounded-md bg-white px-2 py-1.5 ring-1 ring-slate-200"
          >
            <option value="">All</option>
            {ORDER_STATUSES.map((option) => (
              <option key={option} value={option}>
                {option.charAt(0) + option.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? (
        <QueryError error={error} onRetry={() => void refetch()} />
      ) : isPending ? (
        <div
          aria-hidden
          className="h-96 animate-pulse rounded-2xl bg-slate-200"
        />
      ) : (
        <>
          {/* isPlaceholderData: we are still showing the previous page while
              the next one loads, so dim it to signal "not current". */}
          <div
            className={`transition-opacity ${isPlaceholderData ? 'opacity-50' : ''}`}
          >
            {data.items.length === 0 ? (
              <p className="text-sm text-slate-500">No orders found.</p>
            ) : (
              <OrderHistoryTable
                orders={data.items}
                onRowIntent={prefetchOrder}
              />
            )}
          </div>

          <nav
            aria-label="Pagination"
            className="mt-4 flex items-center justify-end gap-3"
          >
            <button
              type="button"
              className={PAGER_BUTTON}
              disabled={page === 1}
              onClick={() => setPage((current) => current - 1)}
            >
              Previous
            </button>
            <span className="text-sm" aria-live="polite">
              Page {data.page} of {data.totalPages}
            </span>
            <button
              type="button"
              className={PAGER_BUTTON}
              disabled={isPlaceholderData || page >= data.totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </button>
          </nav>
        </>
      )}
    </section>
  );
}
