'use client';

import { useId, useState } from 'react';
import Button from '@/components/button/button';
import Modal from '@/components/modal';
import { icons } from '@/components/navigation/icons';
import QueryError from '@/components/query-error';
import { useToast } from '@/context/toast-context';
import {
  usePendingOrders,
  useUpdateOrderStatus,
} from '@/lib/queries/orders';
import type { Order, OrderStatus } from '@/types/common';
import OrderItems from './order-items';

// What the confirmation dialog is asking about. `null` means it is closed.
type PendingAction = {
  order: Order;
  status: Extract<OrderStatus, 'COMPLETED' | 'CANCELLED'>;
};

const ICON_BUTTON =
  'flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 cursor-pointer';

export default function PendingOrders() {
  const { notify } = useToast();
  const titleId = useId();
  const { data: orders, error, isPending, isFetching, refetch } =
    usePendingOrders();
  const updateStatus = useUpdateOrderStatus();

  const [action, setAction] = useState<PendingAction | null>(null);

  const closeDialog = () => setAction(null);

  const confirm = () => {
    if (!action) return;
    const { order, status } = action;

    // The dialog closes at once and the card disappears at once (optimistic
    // update); the callbacks here run later, when the server has answered.
    closeDialog();
    updateStatus.mutate(
      { id: order.id, status },
      {
        onSuccess: () =>
          notify(
            'success',
            `${order.customer}'s order ${status === 'COMPLETED' ? 'completed' : 'cancelled'}.`,
          ),
        onError: (mutationError) =>
          notify('error', `${mutationError.message} The order was restored.`),
      },
    );
  };

  return (
    <section aria-labelledby="pending-heading">
      <div className="my-4">
        <h1 id="pending-heading" className="text-2xl font-semibold">
          Pending Orders
        </h1>
        <p>
          Let&apos;s get them their coffee
          {/* isPending: no data yet. isFetching: any request in flight,
              including a background refresh of data we already show. */}
          {isFetching && !isPending && (
            <span className="ml-2 text-xs text-slate-400">refreshing…</span>
          )}
        </p>
      </div>

      {error ? (
        <QueryError error={error} onRetry={() => void refetch()} />
      ) : isPending ? (
        <div
          aria-hidden
          className="h-32 animate-pulse rounded-xl bg-slate-200"
        />
      ) : orders.length === 0 ? (
        <p className="text-sm text-slate-500">All caught up.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {orders.map((order) => (
            <li key={order.id} className="bg-white p-4 rounded-xl">
              <div className="flex justify-between mb-2">
                <p className="text-xl font-bold">{order.customer}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    aria-label={`Cancel ${order.customer}'s order`}
                    onClick={() => setAction({ order, status: 'CANCELLED' })}
                    className={ICON_BUTTON}
                  >
                    {icons.x}
                  </button>
                  <button
                    type="button"
                    aria-label={`Complete ${order.customer}'s order`}
                    onClick={() => setAction({ order, status: 'COMPLETED' })}
                    className={ICON_BUTTON}
                  >
                    {icons.check}
                  </button>
                </div>
              </div>
              <OrderItems items={order.items} />
            </li>
          ))}
        </ul>
      )}

      <Modal open={action !== null} onClose={closeDialog} labelledBy={titleId}>
        <header className="flex justify-between">
          <h2 id={titleId} className="text-xl">
            {action?.status === 'CANCELLED' ? 'Cancel order' : 'Order complete'}
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={closeDialog}
            className={ICON_BUTTON}
          >
            {icons.x}
          </button>
        </header>
        <p className="my-10">
          {action?.status === 'CANCELLED'
            ? `Cancel ${action.order.customer}'s order?`
            : `Is ${action?.order.customer}'s order ready?`}
        </p>
        <footer>
          <Button type="button" onClick={confirm}>
            {action?.status === 'CANCELLED' ? 'Cancel order' : 'Order complete'}
          </Button>
        </footer>
      </Modal>
    </section>
  );
}
