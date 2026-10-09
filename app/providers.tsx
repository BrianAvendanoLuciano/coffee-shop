'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { type ReactNode, useEffect, useState } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { ToastProvider } from '@/context/toast-context';
import { makeQueryClient } from '@/lib/queries/query-client';
import { makeStore } from '@/store';
import { cartHydrated } from '@/store/cart-slice';
import { loadCart } from '@/store/middleware';

export default function Providers({ children }: { children: ReactNode }) {
  // Lazy initial state: the factory runs once per mounted app, so the store
  // and the query client survive re-renders but are never shared between
  // requests on the server.
  const [store] = useState(() => makeStore());
  const [queryClient] = useState(makeQueryClient);

  // localStorage only exists in the browser, and reading it during render
  // would make the server HTML differ from the first client render. An effect
  // runs after hydration, so it is the safe place to restore the cart.
  useEffect(() => {
    store.dispatch(cartHydrated(loadCart()));
  }, [store]);

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ReduxProvider>
  );
}
