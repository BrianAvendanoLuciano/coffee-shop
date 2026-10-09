import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { type ProductFilters, api } from '@/lib/api/endpoints';
import { queryKeys } from './keys';

export const PRODUCTS_PAGE_SIZE = 8;

// Infinite query: one cache entry holding an array of pages. Each page tells
// us the cursor of the next one.
export function useInfiniteProducts(filters: ProductFilters) {
  return useInfiniteQuery({
    // The filters are part of the key, so each category/search combination
    // is cached separately and switching back to one is instant.
    queryKey: queryKeys.products.list(filters),
    // `signal` aborts the fetch when the key changes mid-request, e.g. the
    // user keeps typing in the search box.
    queryFn: ({ pageParam, signal }) =>
      api.products(
        { ...filters, cursor: pageParam, limit: PRODUCTS_PAGE_SIZE },
        signal,
      ),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    // The menu rarely changes, so keep it fresh for longer than the default.
    staleTime: 5 * 60_000,
    // While a new filter loads, keep showing the previous results instead of
    // flashing a skeleton.
    placeholderData: keepPreviousData,
    // Flatten the pages for the component; the cache keeps the page structure.
    select: (data) => data.pages.flatMap((page) => page.items),
  });
}
