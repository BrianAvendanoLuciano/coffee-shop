'use client';

import { useEffect } from 'react';
import Button from '@/components/button/button';
import ContentWrapper from '@/components/dashboard/main-content-wrapper';

// Route-level error boundary. Next.js wraps every page in this group with
// it, so an unexpected render error shows this inside the dashboard shell
// (the sidebar stays) instead of a blank screen.
export default function DashboardError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ContentWrapper>
      <div role="alert" className="max-w-md">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="my-4 text-sm text-slate-600">{error.message}</p>
        <Button type="button" onClick={() => retry()}>
          Try again
        </Button>
      </div>
    </ContentWrapper>
  );
}
