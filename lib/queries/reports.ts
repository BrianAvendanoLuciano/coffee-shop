import { queryOptions, useQueries, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/endpoints';
import { queryKeys } from './keys';
import { orderListOptions } from './orders';

export const reportSummaryOptions = queryOptions({
  queryKey: queryKeys.reports.summary,
  queryFn: ({ signal }) => api.reportSummary(signal),
});

// Dependent query: it cannot run until we know which employee to ask for.
// `enabled: false` keeps it idle; it starts by itself once the id arrives.
export function useEmployee(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.employees.detail(id ?? ''),
    queryFn: ({ signal }) => api.employee(id ?? '', signal),
    enabled: id !== undefined,
    // Staff names basically never change.
    staleTime: 60 * 60_000,
  });
}

// Parallel queries: independent requests fired together. `combine` merges the
// results into one object so the component has a single thing to read.
export function useReportData() {
  return useQueries({
    queries: [
      // throwOnError re-throws a failed query during render, handing it to
      // the nearest error boundary instead of returning it as `error`.
      { ...reportSummaryOptions, throwOnError: true },
      {
        ...orderListOptions({ page: 1, pageSize: 5, status: 'COMPLETED' }),
        throwOnError: true,
      },
    ],
    combine: ([summary, recent]) => ({
      summary: summary.data,
      recentCompleted: recent.data?.items,
      isPending: summary.isPending || recent.isPending,
    }),
  });
}
