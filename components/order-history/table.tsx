import moment from 'moment';
import Link from 'next/link';
import { formatMoney } from '@/lib/pricing';
import type { Order } from '@/types/common';
import OrderItems from './order-items';
import StatusBadge from './status-badge';

const COLUMNS = ['Date', 'Items', 'Customer', 'Total', 'Status'] as const;

type Props = {
  orders: Order[];
  // Called when a row is hovered or focused, so the parent can prefetch.
  onRowIntent?: (orderId: string) => void;
};

export default function OrderHistoryTable({ orders, onRowIntent }: Props) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
      <table className="w-full">
        <caption className="sr-only">Recent orders</caption>
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {COLUMNS.map((column) => (
              <th
                key={column}
                scope="col"
                className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {orders.map((order) => (
            <tr
              key={order.id}
              onMouseEnter={() => onRowIntent?.(order.id)}
              className="transition-colors hover:bg-amber-50/40"
            >
              <td className="w-24 px-5 py-4">
                <div className="flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-amber-50 text-amber-800">
                  <p className="text-lg font-bold leading-none">
                    {moment(order.createdAt).format('D')}
                  </p>
                  <p className="mt-1 text-xs font-medium uppercase">
                    {moment(order.createdAt).format('MMM')}
                  </p>
                </div>
              </td>

              <td className="px-5 py-4">
                <div className="min-w-70">
                  <Link
                    href={`/order-history/${order.id}`}
                    onFocus={() => onRowIntent?.(order.id)}
                    className="mb-2 inline-block text-xs font-medium text-amber-700 underline"
                  >
                    {order.orderNumber}
                  </Link>
                  <OrderItems items={order.items} />
                </div>
              </td>

              <td className="px-5 py-4 text-center text-sm text-gray-600">
                {order.customer || '-'}
              </td>

              <td className="px-5 py-4 text-center text-sm font-medium text-gray-700">
                {formatMoney(order.total)}
              </td>

              <td className="px-5 py-4 text-center">
                <StatusBadge status={order.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
