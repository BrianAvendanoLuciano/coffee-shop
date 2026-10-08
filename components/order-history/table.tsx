import { Order, OrderItems } from '@/types/common';
import moment from 'moment';

type OrderData = Order & {
  orderItems: OrderItems[];
};

export type OrderHistoryDataType = {
  columns: string[];
  data: OrderData[];
};

export default function OrderHistoryTable({
  columns,
  data,
}: OrderHistoryDataType) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {data.map((orderData) => (
            <tr
              key={orderData.id}
              className="transition-colors hover:bg-amber-50/40"
            >
              {/* Date */}
              <td className="w-24 px-5 py-4">
                <div className="flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-amber-50 text-amber-800">
                  <p className="text-lg font-bold leading-none">
                    {moment(orderData.createdAt).format('D')}
                  </p>
                  <p className="mt-1 text-xs font-medium uppercase">
                    {moment(orderData.createdAt).format('MMM')}
                  </p>
                </div>
              </td>

              {/* Order Items */}
              <td className="px-5 py-4">
                <div className="min-w-[280px] space-y-3">
                  {orderData.orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-6"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800">
                            {item.productName}
                          </span>

                          <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">
                            {item.quantity}x
                          </span>
                        </div>

                        {item.variant && (
                          <p className="mt-1 text-xs text-gray-500">
                            {item.variant.name}
                            {item.variant.price > 0 && (
                              <span className="ml-1 text-amber-700">
                                +₱{item.variant.price.toFixed(2)}
                              </span>
                            )}
                          </p>
                        )}
                      </div>

                      <p className="whitespace-nowrap font-medium text-gray-700">
                        ₱{item.subtotal.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </td>

              {/* Employee */}
              <td className="px-5 py-4 text-center">
                <span className="inline-flex rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700">
                  {orderData.employeeId}
                </span>
              </td>

              {/* Customer */}
              <td className="px-5 py-4 text-center text-sm text-gray-600">
                {orderData.customer || '-'}
              </td>

              {/* Status */}
              <td className="px-5 py-4 text-center">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    orderData.status === 'COMPLETED'
                      ? 'bg-green-100 text-green-700'
                      : orderData.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-700'
                        : orderData.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {orderData.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
