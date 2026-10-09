# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev        # dev server on http://localhost:3000
npm run build      # production build (also type-checks)
npm run lint       # eslint (flat config, eslint-config-next core-web-vitals + typescript)
npm run typecheck  # tsc --noEmit
npm test           # vitest run (jsdom + React Testing Library)
npm run test:watch

npx vitest run store/cart-slice.test.ts   # one file
npx vitest run -t "merges the same drink" # one test by name
npx eslint <path>                         # lint one file
```

Type-check and tests pass; lint has warnings only (`<img>` usage and the unused `types/date.ts`). Keep it that way.

Demo sign-in: `barista` or `manager`, password `coffee123` (defined in `lib/server/container.ts`).

## What this is

A coffee-shop point-of-sale app (package name `pos`): Next.js 16 App Router, React 19, Tailwind CSS v4, TypeScript. It doubles as a learning project; `docs/LEARNING.md` maps TypeScript / React / Redux / TanStack Query topics to the files that demonstrate them, and the code has short teaching comments at those spots. Preserve them when editing.

## Architecture

**Where state lives.** This is the rule that decides where new code goes:

- Server state (products, orders, session, reports) is TanStack Query, in `lib/queries/`.
- Global client state is Redux Toolkit, in `store/`. Currently only the cart.
- Everything else is local `useState`, the URL (order-screen filters), or the toast Context.

Do not put fetched data in Redux or the cart in the query cache.

**Request path.** `component -> lib/queries/* hook -> lib/api/endpoints.ts -> lib/api/client.ts -> app/api/**/route.ts -> lib/server/order-service.ts -> lib/server/repository.ts`. Components never call `fetch` or build URLs.

**Schemas are the source of truth.** `lib/schemas.ts` holds zod schemas; `types/common.ts` infers the domain types from them. `request()` in `lib/api/client.ts` validates every response against a schema and throws one of the `AppError` classes in `lib/api/errors.ts`. Route handlers validate bodies with `parseBody()`. To change a shape, change the schema.

**Mock backend.** `lib/server/` is an in-memory backend behind real route handlers; data resets on server restart. `container.ts` is the composition root (seeds 23 orders from `constants/products.ts`, parks the instance on `globalThis` to survive HMR). `OrderService` gets repositories, a clock and an id generator by constructor injection and returns `Result<T, OrderError>` (`lib/result.ts`) instead of throwing; `orderErrorResponse()` in `lib/server/http.ts` maps those to HTTP statuses with an exhaustive switch. The server recomputes all prices via `lib/pricing.ts`; the client only sends variant ids, extra ids and quantities.

**Auth.** httpOnly cookie `pos_session`. `proxy.ts` (Next 16's name for middleware) redirects signed-out page requests to `/auth?from=…`; this is only an optimistic check. Every API route must start with `requireUser()`. A 401 from any query triggers a redirect in `lib/queries/query-client.ts`. Login and logout clear the query cache and the cart.

**Queries.** Keys come only from the factory in `lib/queries/keys.ts`. Defaults (staleTime 30s, retry only network/5xx, mutations never retry) are in `query-client.ts`. `useUpdateOrderStatus` is the reference optimistic mutation; it patches every cached order list, and reads the status filter from the third key segment, so keep `orders.list(params)` shaped that way.

**Redux.** `makeStore()` is a factory (per-request on the server, per-test). Cart lines are normalized with `createEntityAdapter`; a line's id is `variantId|sortedExtraIds`, which is what merges identical drinks. Checkout is the `placeOrder` thunk; after it resolves, `components/order/cart-panel.tsx` invalidates the order queries. A listener middleware persists the cart to `localStorage` (`pos.cart`), restored in `app/providers.tsx` after hydration.

**Routing.** `app/(dashboard)/` is a route group whose layout wraps POS screens in the sidebar shell; `app/auth` sits outside it. Real screens: `/order`, `/order-history`, `/order-history/[id]`, `/report`. `/products`, `/products/categories`, `/products/inventory`, `/employee` and `/transaction` are placeholder pages. Sidebar links are the `navLinks` array in `components/navigation/index.tsx`; icons are inline SVGs in `components/navigation/icons.tsx` (no icon library).

**Modals.** `components/modal.tsx` portals a native `<dialog>` into `<div id="modal-element">` in the root layout, controlled by `open` / `onClose`. `onClose` also fires on Esc.

## Conventions

- Import through the `@/*` alias, which maps to the repo root (there is no `src/`).
- `noUncheckedIndexedAccess` is on: `array[i]` is `T | undefined`.
- Pages or components that call `useSearchParams` must sit under a `<Suspense>` boundary or the build fails.
- Styling is inline Tailwind utilities; `app/globals.css` contains only `@import "tailwindcss"`. Palette: `amber-500/600` for primary actions, `slate`/`stone` neutrals.
- `components/button/button.tsx` and `button/circle-button.tsx` spread native props but hard-code `className`, so a caller's `className` is ignored. `ButtonCircle` takes colours through its `color` prop.
- Money is Philippine pesos; format with `formatMoney()` from `lib/pricing.ts`. Dates use `moment`.
- Tests sit next to the code as `*.test.ts(x)`. Use `renderWithProviders` and `mockFetch` from `test/utils.tsx`, and fixtures from `test/fixtures.ts`.
- `constants/coffee-qoutes.ts` / `COFFEE_QOUTES` is misspelled; keep the spelling unless renaming everywhere.
- `types/ui.ts` and `types/date.ts` are unused leftovers.
