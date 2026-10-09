'use client';

import moment from 'moment';
import Link from 'next/link';
import { use } from 'react';
import ContentWrapper from '@/components/dashboard/main-content-wrapper';
import OrderItems from '@/components/order-history/order-items';
import StatusBadge from '@/components/order-history/status-badge';
import QueryError from '@/components/query-error';
import { useToast } from '@/context/toast-context';
import { HttpStatus } from '@/lib/api/errors';
import { formatMoney } from '@/lib/pricing';
import { useOrder, useUpdateOrderStatus } from '@/lib/queries/orders';
import { useEmployee } from '@/lib/queries/reports';
import type { OrderStatus } from '@/types/common';

// Dynamic route: /order-history/ord-021 renders this file with id = 'ord-021'.
// `params` arrives as a Promise; React's use() unwraps it in a Client Component.
export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { notify } = useToast();

  const { data: order, error, isPending, refetch } = useOrder(id);
  // Dependent query: stays idle until the order (and its employeeId) exists.
  const employee = useEmployee(order?.employeeId);
  const updateStatus = useUpdateOrderStatus();

  const changeStatus = (status: OrderStatus) => {
    updateStatus.mutate(
      { id, status },
      { onError: (mutationError) => notify('error', mutationError.message) },
    );
  };

  return (
    <ContentWrapper>
      <Link href="/order-history" className="text-sm text-amber-700 underline">
        ← Back to order history
      </Link>

      {error ? (
        <div className="mt-6">
          {error.kind === 'http' && error.status === HttpStatus.NotFound ? (
            <p role="alert">There is no order with id “{id}”.</p>
          ) : (
            <QueryError error={error} onRetry={() => void refetch()} />
          )}
        </div>
      ) : isPending ? (
        <div
          aria-hidden
          className="mt-6 h-72 animate-pulse rounded-xl bg-slate-200"
        />
      ) : (
        <article className="mt-6 max-w-2xl rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <header className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h1 className="text-2xl font-semibold">{order.orderNumber}</h1>
              <p className="text-sm text-slate-500">
                {moment(order.createdAt).format('MMM D, YYYY · h:mm A')}
              </p>
            </div>
            <StatusBadge status={order.status} />
          </header>

          <dl className="my-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-slate-500">Customer</dt>
              <dd className="font-medium">{order.customer}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Served by</dt>
              <dd className="font-medium">
                {employee.isPending
                  ? 'Loading…'
                  : (employee.data?.name ?? order.employeeId)}
              </dd>
            </div>
          </dl>

          <OrderItems items={order.items} />

          <dl className="mt-6 space-y-1 border-t border-slate-200 pt-4 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatMoney(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Tax</dt>
              <dd>{formatMoney(order.tax)}</dd>
            </div>
            <div className="flex justify-between text-lg font-semibold">
              <dt>Total</dt>
              <dd>{formatMoney(order.total)}</dd>
            </div>
          </dl>

          {order.status === 'PENDING' && (
            <footer className="mt-6 flex gap-3">
              <button
                type="button"
                disabled={updateStatus.isPending}
                onClick={() => changeStatus('COMPLETED')}
                className="cursor-pointer rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-60"
              >
                Mark complete
              </button>
              <button
                type="button"
                disabled={updateStatus.isPending}
                onClick={() => changeStatus('CANCELLED')}
                className="cursor-pointer rounded-md px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-100 disabled:opacity-60"
              >
                Cancel order
              </button>
            </footer>
          )}
        </article>
      )}
    </ContentWrapper>
  );
}
