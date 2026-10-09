'use client';

import { QueryErrorResetBoundary } from '@tanstack/react-query';
import ContentWrapper from '@/components/dashboard/main-content-wrapper';
import ErrorBoundary from '@/components/error-boundary';
import OrderHistoryTable from '@/components/order-history/table';
import { formatMoney } from '@/lib/pricing';
import { useReportData } from '@/lib/queries/reports';

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function ReportContent() {
  const { summary, recentCompleted, isPending } = useReportData();

  if (isPending || !summary || !recentCompleted) {
    return (
      <div aria-hidden className="h-96 animate-pulse rounded-xl bg-slate-200" />
    );
  }

  return (
    // Fragment: groups siblings without adding a wrapper element to the DOM.
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Revenue" value={formatMoney(summary.revenue)} />
        <StatTile label="Orders" value={String(summary.orderCount)} />
        <StatTile label="Pending" value={String(summary.byStatus.PENDING)} />
        <StatTile
          label="Cancelled"
          value={String(summary.byStatus.CANCELLED)}
        />
      </div>

      <h2 className="mt-8 mb-3 text-xl font-semibold">Best sellers</h2>
      <ol className="max-w-md rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        {summary.topProducts.map((product, index) => (
          <li
            key={product.name}
            className="flex justify-between border-b border-slate-100 py-2 last:border-0"
          >
            <span>
              {index + 1}. {product.name}
            </span>
            <span className="font-medium">{product.quantity} sold</span>
          </li>
        ))}
      </ol>

      <h2 className="mt-8 mb-3 text-xl font-semibold">Latest completed</h2>
      <OrderHistoryTable orders={recentCompleted} />
    </>
  );
}

export default function ReportPage() {
  return (
    <ContentWrapper>
      <h1 className="text-2xl font-semibold">Report</h1>
      <p className="mb-6">How the shop is doing.</p>

      {/* The queries on this page throw into the boundary. "Try again" has
          to do two things: tell TanStack Query to forget the failure (reset)
          and re-mount the children (the boundary clearing its own state). */}
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary onReset={reset} title="The report failed to load.">
            <ReportContent />
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    </ContentWrapper>
  );
}
