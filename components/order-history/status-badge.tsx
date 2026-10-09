import type { OrderStatus } from '@/types/common';

// Record<OrderStatus, string> must have a style for every status. A new
// status in the schema fails the build here until it is given one, which a
// chain of ternaries would never have told us.
const STATUS_STYLES: Record<OrderStatus, string> = {
  COMPLETED: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}
