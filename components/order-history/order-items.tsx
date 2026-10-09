import { formatMoney } from '@/lib/pricing';
import type { OrderItem } from '@/types/common';

// One small component reused by the pending cards, the history table and the
// detail page, instead of the same markup pasted three times.
export default function OrderItems({ items }: { items: OrderItem[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id} className="flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-800">
                {item.productName}
              </span>
              <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">
                {item.quantity}x
              </span>
            </div>

            <p className="mt-1 text-xs text-gray-500">
              {[
                item.size === 'REGULAR' ? null : item.size.toLowerCase(),
                ...item.extras.map((extra) => extra.name.toLowerCase()),
              ]
                .filter((part) => part !== null)
                .join(', ')}
            </p>
          </div>

          <p className="whitespace-nowrap font-medium text-gray-700">
            {formatMoney(item.subtotal)}
          </p>
        </li>
      ))}
    </ul>
  );
}
