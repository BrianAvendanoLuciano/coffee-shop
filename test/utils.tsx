import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type RenderOptions, render } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { vi } from 'vitest';
import { ToastProvider } from '@/context/toast-context';
import { type AppStore, type RootState, makeStore } from '@/store';

// A fresh client per test, with retries off so a failing query fails at once
// instead of making the test wait through the backoff.
export function makeTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
}

type Options = Omit<RenderOptions, 'wrapper'> & {
  preloadedState?: Partial<RootState>;
  store?: AppStore;
  queryClient?: QueryClient;
};

// Renders a component inside the same providers the real app uses, and hands
// back the store and query client so a test can inspect them.
export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState,
    store = makeStore(preloadedState),
    queryClient = makeTestQueryClient(),
    ...options
  }: Options = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ReduxProvider store={store}>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>{children}</ToastProvider>
        </QueryClientProvider>
      </ReduxProvider>
    );
  }

  return { store, queryClient, ...render(ui, { wrapper: Wrapper, ...options }) };
}

type MockRoute = {
  status?: number;
  body: unknown;
  // Hold the response back until this resolves, to observe in-flight state.
  wait?: Promise<void>;
};

// Replaces global fetch. Each key is "METHOD /path" (query string ignored).
export function mockFetch(routes: Record<string, MockRoute>) {
  const calls: { key: string; body: unknown }[] = [];

  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input), 'http://localhost');
    const key = `${init?.method ?? 'GET'} ${url.pathname}`;
    calls.push({
      key,
      body: typeof init?.body === 'string' ? JSON.parse(init.body) : undefined,
    });

    const route = routes[key];
    if (!route) throw new TypeError(`No mock for ${key}`);
    await route.wait;
    return Response.json(route.body, { status: route.status ?? 200 });
  });

  vi.stubGlobal('fetch', fetchMock);
  return { fetchMock, calls };
}
