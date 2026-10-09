import ContentWrapper from '@/components/dashboard/main-content-wrapper';
import ErrorBoundary from '@/components/error-boundary';
import PendingOrders from '@/components/order-history/pending-orders';
import RecentOrders from '@/components/order-history/recent-orders';

// This page needs no hooks itself, so it stays a Server Component and only
// the two interactive sections ship JavaScript. Each has its own boundary:
// if one crashes while rendering, the other keeps working.
export default function OrderHistoryPage() {
  return (
    <ContentWrapper>
      <ErrorBoundary title="Pending orders failed to load.">
        <PendingOrders />
      </ErrorBoundary>

      <hr className="border-b border-slate-200 my-6" />

      <ErrorBoundary title="Recent orders failed to load.">
        <RecentOrders />
      </ErrorBoundary>
    </ContentWrapper>
  );
}
