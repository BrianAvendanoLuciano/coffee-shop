'use client';

import dynamic from 'next/dynamic';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import ContentWrapper from '@/components/dashboard/main-content-wrapper';
import CartPanel from '@/components/order/cart-panel';
import OrderItem from '@/components/order/item';
import QueryError from '@/components/query-error';
import { CATEGORY_TABS, isCategoryId } from '@/constants/categories';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useOnVisible } from '@/hooks/useOnVisible';
import { useInfiniteProducts } from '@/lib/queries/products';
import type { Product } from '@/types/common';

// Lazy loading / code splitting: the dialog's JavaScript is a separate chunk
// that is only downloaded the first time someone taps "+", so it does not
// slow down the first paint of the menu.
const CustomizeDialog = dynamic(
  () => import('@/components/order/customize-dialog'),
  { ssr: false },
);

function OrderScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // The URL is the source of truth for the filters (?category=cat-tea&q=latte)
  // so a filtered view survives a reload and can be bookmarked. The raw
  // string is narrowed to a CategoryId before anything else trusts it.
  const categoryParam = searchParams.get('category');
  const category = isCategoryId(categoryParam) ? categoryParam : undefined;
  const q = searchParams.get('q') ?? '';

  // Controlled input: what you see in the box is exactly this state.
  const [searchText, setSearchText] = useState(q);
  const debouncedSearch = useDebouncedValue(searchText.trim());

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const setParam = useCallback(
    (name: string, value: string | undefined) => {
      const next = new URLSearchParams(searchParams);
      if (value) next.set(name, value);
      else next.delete(name);

      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  // Effect = synchronising with something outside React, here the URL. The
  // dependency array lists every value the effect reads; it re-runs only
  // when one of them changes.
  useEffect(() => {
    if (debouncedSearch !== q) setParam('q', debouncedSearch || undefined);
  }, [debouncedSearch, q, setParam]);

  // A new object every render would be a new query key every render.
  const filters = useMemo(
    () => ({ category, q: q || undefined }),
    [category, q],
  );

  const {
    data: products,
    error,
    isPending,
    isPlaceholderData,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteProducts(filters);

  const sentinelRef = useOnVisible<HTMLDivElement>(
    () => void fetchNextPage(),
    hasNextPage && !isFetchingNextPage,
  );

  // Stable function identity, so the memoized cards are not re-rendered
  // every time this component is.
  const handleSelectedProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
  }, []);

  const handleCloseDialog = useCallback(() => setSelectedProduct(null), []);

  return (
    <ContentWrapper>
      <h1 className="text-2xl font-semibold">Order</h1>
      <p>Choose something to enjoy.</p>

      <div className="flex flex-wrap justify-between gap-2 mt-4">
        <ul className="flex flex-wrap gap-1" aria-label="Categories">
          {CATEGORY_TABS.map((tab) => {
            const isActive = tab.id === (category ?? 'all');
            return (
              <li key={tab.id}>
                <button
                  type="button"
                  aria-pressed={isActive}
                  onClick={() =>
                    setParam('category', tab.id === 'all' ? undefined : tab.id)
                  }
                  className={`w-24 p-2 rounded-3xl cursor-pointer hover:bg-amber-500 hover:text-white ${
                    isActive ? 'bg-amber-500 text-white' : 'text-slate-600'
                  }`}
                >
                  {tab.label}
                </button>
              </li>
            );
          })}
        </ul>
        <div>
          <label htmlFor="product-search" className="sr-only">
            Search products
          </label>
          <input
            id="product-search"
            type="search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            className="text-sm w-64 p-2"
            placeholder="Search coffee, tea, pastries..."
          />
        </div>
      </div>
      <hr className="w-full border-b border-slate-200" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        <section aria-label="Products" aria-busy={isPending}>
          {/* Conditional rendering: exactly one of these branches shows. */}
          {error ? (
            <div className="mt-6">
              <QueryError error={error} onRetry={() => void refetch()} />
            </div>
          ) : isPending ? (
            <ProductGridSkeleton />
          ) : products.length === 0 ? (
            <p className="mt-10 text-center text-slate-500">
              No products match your search.
            </p>
          ) : (
            <div
              className={`mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 transition-opacity ${
                isPlaceholderData ? 'opacity-50' : ''
              }`}
            >
              {/* `key` tells React which card is which between renders. A
                  stable id (never the array index) lets it move and reuse
                  DOM nodes instead of rebuilding them when the list changes. */}
              {products.map((item) => (
                <OrderItem
                  key={item.id}
                  product={item}
                  handleSelectedProduct={handleSelectedProduct}
                />
              ))}
            </div>
          )}

          <div ref={sentinelRef} className="h-4" />
          {hasNextPage && (
            <div className="mt-2 flex justify-center">
              <button
                type="button"
                onClick={() => void fetchNextPage()}
                disabled={isFetchingNextPage}
                className="cursor-pointer rounded-3xl px-4 py-2 text-sm text-amber-700 hover:bg-amber-100 disabled:opacity-60"
              >
                {isFetchingNextPage ? 'Loading more…' : 'Load more'}
              </button>
            </div>
          )}
        </section>

        <CartPanel />
      </div>

      {/* The key resets the dialog's internal state (size, quantity, extras)
          whenever a different product is opened: a new key is a new component
          instance. */}
      {selectedProduct && (
        <CustomizeDialog
          key={selectedProduct.id}
          product={selectedProduct}
          onClose={handleCloseDialog}
        />
      )}
    </ContentWrapper>
  );
}

function ProductGridSkeleton() {
  return (
    <div
      aria-hidden
      className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {Array.from({ length: 8 }, (_, index) => (
        <div
          key={index}
          className="h-64 animate-pulse rounded-xl bg-slate-200"
        />
      ))}
    </div>
  );
}

export default function OrderPage() {
  // useSearchParams needs a Suspense boundary above it so the rest of the
  // page can still be prerendered.
  return (
    <Suspense fallback={null}>
      <OrderScreen />
    </Suspense>
  );
}
