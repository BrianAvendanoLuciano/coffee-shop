# Learning guide

Every topic on the study list, where it lives in this project, and why it is done that way. The code carries short comments at the same spots, so open the file next to this guide.

## How to run it

```bash
npm run dev          # http://localhost:3000, sign in as barista / coffee123
npm test             # 22 tests
npm run typecheck
npm run lint
```

## The one idea behind the structure

The app has three kinds of state, and each has one home. Most of the "X vs. Y" items on the list are this decision.

| Kind of state | Example here | Where it lives | Why |
| --- | --- | --- | --- |
| Server state: data the server owns, which the browser only holds a copy of | products, orders, the session, report numbers | TanStack Query | A copy goes out of date, so it needs caching, refetching, retries and invalidation. That is what the library is. |
| Global client state: data the browser owns, used by distant components | the cart | Redux Toolkit | Written from the product dialog, read by the cart panel, cleared at logout, restored after a reload. |
| Local state: data one component owns | which size is ticked, is the dialog open, the current page number | `useState` | Nobody else needs it. Making it global only adds ceremony. |

Two more places hold state: the URL (the order screen's category and search, so a reload keeps them) and Context (toasts, a service many components call but which holds almost no data).

The request path is the same for every feature:

```
component -> hook in lib/queries -> lib/api/endpoints.ts -> lib/api/client.ts (fetch + zod check)
          -> app/api/**/route.ts -> lib/server/order-service.ts -> lib/server/repository.ts
```

There is no real database. `lib/server` keeps everything in memory and it resets when the server restarts.

---

## 1. TypeScript

| Topic | Where | Why it is done this way |
| --- | --- | --- |
| Primitive types and inference | everywhere, e.g. `lib/pricing.ts` | Parameters are annotated, results are inferred. `totals()` has no return type written, yet callers see `{ subtotal, tax, total }`. Annotate the boundaries, let the compiler do the middle. |
| `type` vs. `interface` | `lib/server/repository.ts`, `types/common.ts` | `interface` for contracts that classes implement (`Repository`, `Clock`). `type` for everything else, because unions, intersections and mapped types cannot be written as interfaces. |
| `let`, `const`, literal types | `lib/schemas.ts`, `constants/extras.ts` | `as const` keeps `'PENDING'` as the literal `'PENDING'` instead of widening to `string`. That is what lets the status union be derived from the array. `let` appears only where a value is assigned later (`let response` in `lib/api/client.ts`). |
| Arrays, tuples, object types | `constants/products.ts` | `SizePrice = [size, price]` is a tuple: fixed length, each slot its own type. |
| Union and intersection types | `types/common.ts`, `lib/api/errors.ts` | `AppError` is a union (one of three). `CartLine` is an intersection (what the server needs and what the UI shows). |
| Narrowing and type guards | `lib/api/errors.ts`, `constants/categories.ts` | `isCategoryId(value): value is CategoryId` turns a raw URL string into a trusted type. After the check the compiler knows. |
| `any` / `unknown` / `never` / `void` | `lib/api/client.ts`, `lib/result.ts` | Response bodies and caught errors are `unknown`, so they must be checked before use. `never` is the type of "cannot happen" in `assertNever`. `void` marks a deliberately ignored promise (`void fetchNextPage()`). There is no `any` in the project: it switches the compiler off. |
| Optional properties and parameters | `lib/api/client.ts`, `lib/api/endpoints.ts` | `signal?: AbortSignal`, default parameter values, `status?: OrderStatus`. |
| Functions and return types | `lib/server/order-service.ts` | Public methods state their return type (`Promise<Result<Order, OrderError>>`), so a wrong implementation fails at the function and not at some distant caller. |
| Generics and constraints | `lib/api/client.ts`, `lib/server/repository.ts`, `hooks/useDebouncedValue.ts` | `request<S extends z.ZodType>` infers its result from the schema passed in. `Repository<T extends Entity>` accepts any type that has an `id`. |
| `keyof`, `typeof`, indexed access | `types/common.ts` | `(typeof ORDER_STATUSES)[number]` builds the union from the runtime array. `Product['categoryId']` reuses a field's type. One source, no copies to keep in sync. |
| Utility types | `types/common.ts`, `test/fixtures.ts`, status-badge | `Pick`, `Omit`, `Partial`, `Readonly`, `Record`, `Extract`. `Record<OrderStatus, string>` in `components/order-history/status-badge.tsx` forces a style for every status. |
| Mapped and conditional types | `types/common.ts` | `FieldErrors<T>` maps every form field to an optional message. `ItemOf<P>` uses `infer` to pull the item type out of a page. |
| Enums vs. literal unions | `lib/api/errors.ts` vs. `lib/schemas.ts` | `HttpStatus` is an enum because it names magic numbers. Statuses are string unions because they are plain JSON values and need no import to use. Default to unions. |
| Assertions and `satisfies` | `constants/extras.ts`, `constants/categories.ts` | `satisfies` checks a value against a type without widening it. `as` overrides the compiler, so it is used only where the code knows more than the types can express (`Object.keys(...) as CategoryId[]`). |
| Type-safe error handling | `lib/result.ts`, `lib/server/order-service.ts` | A `throw` is invisible in a signature. `Result<T, E>` puts failure in the return type, so callers cannot forget it. |
| Promises and async typing | `lib/api/client.ts`, `lib/result.ts` | `async` functions return `Promise<T>`. `toResult` converts a promise that may reject into one that always resolves to a `Result`. |
| Classes, access modifiers, abstract classes | `lib/server/repository.ts`, `lib/api/errors.ts` | `InMemoryRepository` is `abstract`: shared storage logic, with ordering left to subclasses. `private` hides the map, `protected` limits the constructor to subclasses, `readonly` stops reassignment. |
| Interfaces and dependency injection | `lib/server/order-service.ts`, `lib/server/container.ts` | `OrderService` receives its repositories, clock and id generator through the constructor. `lib/server/order-service.test.ts` passes a frozen clock, with no mocking library. |
| Modules, imports, exports | whole project | Named exports for utilities, default exports for components, `import type` for type-only imports, `import 'server-only'` to stop server code reaching the browser. |
| `tsconfig.json` and strict mode | `tsconfig.json` | `strict` was already on. `noUncheckedIndexedAccess` was added: `array[i]` becomes `T \| undefined`. It immediately found a real bug in `hooks/useCoffeeQuotes.ts`, which could index one past the end of the list. |
| Type-safe API requests and responses | `lib/api/endpoints.ts` | One typed function per endpoint. Components never build URLs or call `fetch`. |
| Runtime validation of external data | `lib/schemas.ts`, `lib/api/client.ts`, `lib/server/http.ts`, `store/middleware.ts` | Types vanish at runtime, so a response typed as `Order` is a promise, not a fact. Zod checks responses, request bodies and `localStorage`, and the TypeScript types are inferred from those schemas so the two cannot disagree. |
| Discriminated unions and exhaustive checks | `lib/server/http.ts`, `components/query-error.tsx`, `store/cart-slice.ts` | `OrderError` and `CheckoutState` carry a literal tag. A `switch` on it narrows each case, and `assertNever` makes the build fail when a new case is added and not handled. |

## 2. React

| Topic | Where | Why it is done this way |
| --- | --- | --- |
| JSX and function components | all of `components/` | A component is a function from props to UI. |
| Props and composition | `components/order-history/order-items.tsx`, `components/modal.tsx` | `OrderItems` is reused by the pending cards, the table and the detail page. `Modal` takes `children`, so it knows nothing about what it shows. |
| State and `useState` | `components/order/customize-dialog.tsx` | Updates are immutable (`[...current, id]`), and updates based on the old value use the function form (`setQuantity(q => q + 1)`). |
| Rendering and reconciliation | `app/(dashboard)/order/page.tsx` | `key={selectedProduct.id}` on the dialog: a new key is a new component instance, which resets its state. The same mechanism makes list keys matter. |
| Conditional rendering | order page, `pending-orders.tsx` | One chain: error, then loading, then empty, then data. Exactly one branch renders. |
| Lists and keys | everywhere `.map` is used | Keys are stable ids. The only index key is the skeleton, whose items never reorder. |
| Event handling | `components/auth/signIn.tsx` | One `handleChange` serves every field through `event.target.name`. `preventDefault()` stops the full-page form post. |
| Controlled vs. uncontrolled | `signIn.tsx` vs. `components/order/cart-panel.tsx` | Sign-in is controlled because it validates as you type. The customer name is uncontrolled (a ref read on submit) because nothing reacts to it while typing. |
| Forms and validation | `signIn.tsx` | Errors appear after a field is touched. The schema is the same one the server validates with, and the server validates again because the client can be bypassed. |
| `useEffect` and dependencies | order page, `app/providers.tsx` | Effects synchronise with things outside React: the URL, `localStorage`, timers. Everything the effect reads is in the array. |
| Cleanup and stale closures | `hooks/useDebouncedValue.ts`, `hooks/useOnVisible.ts`, `context/toast-context.tsx` | Timers and observers are torn down in the cleanup. `useOnVisible` keeps the latest callback in a ref so a long-lived observer never calls an old one. |
| `useRef` | `cart-panel.tsx`, `components/modal.tsx`, `useOnVisible.ts` | Two uses: reaching a DOM node, and holding a value that must not cause a re-render. |
| `useMemo` and `useCallback` | order page, `toast-context.tsx` | Used where identity matters: `filters` is a query key, `handleSelectedProduct` is a prop of a memoized child, the context value would otherwise re-render every consumer. Not sprinkled everywhere. |
| Rules of Hooks | all hooks | Always at the top level, never inside conditions. That is why `useEmployee` takes `enabled` instead of being called inside an `if`. |
| Custom hooks | `hooks/`, `lib/queries/` | A function that starts with `use` and calls other hooks. Components ask for "pending orders", not for a fetch. |
| Lifting state up | `components/dashboard/wrapper.tsx`, `recent-orders.tsx` | State sits in the closest common parent of the components that need it, and no higher. |
| Prop drilling and Context | `context/toast-context.tsx` | `useToast()` works at any depth without passing `notify` through every layer. It throws a clear error when used outside its provider. |
| Lifecycle concepts | effects above | Mount is the effect running, update is it re-running when a dependency changes, unmount is the cleanup. |
| Strict Mode | `next.config.ts` | On in development: components render twice and effects run setup, cleanup, setup. Code with correct cleanups does not notice. |
| Fragments and portals | `app/(dashboard)/report/page.tsx`, `modal.tsx`, `toast-context.tsx` | `<>` groups without a wrapper element. Portals render dialogs and toasts outside their parent so no `overflow` or `z-index` clips them. |
| Error boundaries | `components/error-boundary.tsx`, `app/(dashboard)/error.tsx` | The one remaining class component. The order-history page gives each section its own boundary. The report page combines it with `QueryErrorResetBoundary` and `throwOnError`. |
| Performance and `React.memo` | `components/order/item.tsx` | Typing in the search box re-renders the page but not the product cards, because their props keep the same identity. Memo without stable props does nothing. |
| Lazy loading and code splitting | order page | `next/dynamic` (which wraps `React.lazy` and Suspense) loads the customise dialog only on the first tap of "+". |
| Routing and URL parameters | `app/(dashboard)/order-history/[id]/page.tsx`, order page | A dynamic segment read with `use(params)`. Query-string filters read with `useSearchParams`. |
| TypeScript with props, hooks, events | all components | `ButtonHTMLAttributes<HTMLButtonElement>`, `useRef<HTMLInputElement>(null)`, `ChangeEvent<HTMLInputElement>`, `useState<Product \| null>(null)`. |
| React Testing Library | `components/auth/signIn.test.tsx`, `components/order/cart-panel.test.tsx` | Tests find things the way a user does (by label and role) and assert on the screen, so they survive refactors. |
| Accessibility and responsive design | throughout | Labelled inputs, `aria-invalid` with `aria-describedby`, `role="alert"`, `aria-label` on icon buttons, native `<dialog>`, a table caption. Layout is Tailwind breakpoints. |
| Authentication and protected routes | `proxy.ts`, `app/api/auth/`, `lib/server/http.ts` | An httpOnly cookie that scripts cannot read. `proxy.ts` redirects signed-out visitors before the page loads, and every API route checks again with `requireUser()`. The first is convenience, the second is the security. |
| Component architecture | `app/(dashboard)/order-history/page.tsx` | Pages compose, components show, hooks fetch, `lib/` knows the network. The history page needs no hooks, so it stays a Server Component. |

## 3. Redux / Redux Toolkit

| Topic | Where | Why it is done this way |
| --- | --- | --- |
| What Redux is and when to use it | `store/` | One store, changed only by dispatched actions run through pure reducers. Use it for client state shared across distant components. Here that is only the cart. |
| Local vs. global state | dialog vs. cart | The size picked in the dialog is local. Pressing "Add to Order" is the moment it becomes global. |
| Store | `store/index.ts` | A `makeStore()` factory instead of a singleton, so each server request and each test gets its own. |
| Actions and action creators | `store/cart-slice.ts` | `createSlice` generates them. `itemAdded` uses `prepare` to compute the line id and price before the reducer runs, because reducers must be pure. |
| Reducers | `store/cart-slice.ts` | `(state, action) => new state`, with no side effects. |
| Dispatching | `customize-dialog.tsx`, `order-cart-item.tsx` | `dispatch(itemAdded(product, variant, extras, qty))`. |
| Selectors and `useSelector` | `cart-panel.tsx` | Components subscribe to the smallest piece they need and re-render only when it changes. |
| `useDispatch` and typed hooks | `store/hooks.ts` | `useAppDispatch` and `useAppSelector` are typed once with `.withTypes`. Use them everywhere. |
| Redux Toolkit, `configureStore`, `createSlice` | `store/index.ts`, `store/cart-slice.ts` | RTK is the standard way to write Redux: sensible defaults and no hand-written action constants. |
| Immer and immutable updates | `store/cart-slice.ts` | `existing.quantity += n` looks like mutation, but Immer records the change on a draft and produces a new state. This is only valid inside `createSlice` reducers. |
| Middleware | `store/middleware.ts` | A hand-written logger shows the `store => next => action` shape. A listener middleware saves the cart to `localStorage`, keeping that side effect out of the reducers. |
| `createAsyncThunk` | `placeOrder` in `store/cart-slice.ts` | Dispatches `pending`, then `fulfilled` or `rejected`. `condition` blocks a double submit. `rejectWithValue` gives the error a type. |
| Loading, success, error states | `CheckoutState` | A discriminated union, so "pending with an error message" cannot exist. |
| Normalized state | `createEntityAdapter` | Stored as `{ ids, entities }`: lookups by id, no duplicates. The id is the variant plus its extras, so adding the same drink twice merges into one line. |
| Reselect | `selectCartTotals` | Recomputes only when the lines change, and otherwise returns the same object, so subscribers do not re-render. |
| Redux DevTools | `store/index.ts` | On outside production. Install the browser extension to watch actions and time-travel. |
| Redux testing | `store/cart-slice.test.ts` | Real store, dispatch, assert on selectors. `fetch` is the only thing mocked. |
| Redux vs. Context | cart vs. toasts | Context is a transport: every consumer re-renders when the value changes, and it has no selectors or devtools. Fine for a toast function, wrong for a cart. |
| Redux vs. React Query | cart vs. orders | See the table at the top. The two meet in `cart-panel.tsx`: after the thunk succeeds it invalidates the order queries. |
| Architecture and best practices | `store/` | State kept minimal (totals are derived, not stored), one slice per feature, logic in reducers and thunks rather than in components. |

## 4. TanStack Query

| Topic | Where | Why it is done this way |
| --- | --- | --- |
| What it is, server vs. client state | `lib/queries/` | A cache for server state. It replaces the hand-written `useEffect` + `useState` + loading flag + error flag, and adds caching and refetching. |
| `QueryClient` and provider | `lib/queries/query-client.ts`, `app/providers.tsx` | Created once per mounted app with `useState`, with project-wide defaults in one place. |
| `useQuery` and query functions | `lib/queries/orders.ts` | The query function only has to return data or throw. `queryOptions()` bundles key and function so hooks, prefetching and cache writes share them. |
| Query keys | `lib/queries/keys.ts` | A hierarchical factory. Invalidating `['orders', 'list']` hits every page and filter at once. Everything the query function uses is in its key. |
| Loading, error, success | `recent-orders.tsx`, `pending-orders.tsx` | `isPending` means no data yet. `isFetching` means any request in flight, including a background refresh. Mixing them up causes spinner flicker. |
| `useMutation` | `useUpdateOrderStatus`, `useLogin`, `useLogout` | For writes. Nothing runs until `mutate` is called. |
| Invalidation | `useUpdateOrderStatus`, `cart-panel.tsx` | After a write, mark what it affected as stale and let it refetch. Simpler and safer than patching every list by hand. |
| Updating cached data | `onSuccess` in `useUpdateOrderStatus` | The PATCH response is the updated order, so it is written straight into the detail cache. |
| `staleTime` and `gcTime` | `query-client.ts`, `products.ts`, `reports.ts` | `staleTime` is how long data is trusted without refetching: 30 s by default, 5 minutes for the menu, an hour for staff names, 0 for the pending queue. `gcTime` is how long unused data stays in memory. |
| Background refetching | `usePendingOrders` | `refetchInterval` polls the queue every 15 s. Refetch on window focus is on by default. |
| Retry policy and error handling | `shouldRetry` in `query-client.ts` | Retries network failures and 5xx, never 4xx. Mutations never retry, because a repeated POST could create two orders. |
| Dependent queries | `useEmployee` in `lib/queries/reports.ts` | `enabled` keeps the query idle until the order has loaded and its `employeeId` is known. |
| Parallel queries | `useReportData` | `useQueries` fires both report requests together. `combine` merges the results. |
| Pagination | `useOrders`, `recent-orders.tsx` | The page number is in the key. `keepPreviousData` leaves the old page on screen, dimmed, while the next loads. |
| Infinite queries | `useInfiniteProducts`, order page | Cursor-based pages. `getNextPageParam` reads the cursor the server returned. Loads on scroll, with a button as fallback. |
| Optimistic updates and lifecycle callbacks | `useUpdateOrderStatus` | `onMutate` cancels refetches, snapshots, and edits the cache. `onError` restores the snapshot. `onSettled` invalidates either way. To watch a rollback, complete an order in one tab and cancel the same order from a tab that has not refreshed. |
| Query cancellation | `lib/api/client.ts`, `products.ts` | The `signal` goes to `fetch`, so typing quickly in search aborts superseded requests. |
| Prefetching and initial data | `usePrefetchOrder`, `useOrder` | Hovering a row prefetches the detail. The detail page also seeds itself from whichever list already holds that order. |
| Cache management | all of the above | `setQueryData`, `getQueriesData`, `invalidateQueries`, `cancelQueries`, `clear`. |
| Authentication and cache isolation | `lib/queries/auth.ts`, `query-client.ts` | The cache and the cart are cleared on login and logout, so one user's data is never shown to the next. Any 401 redirects to sign-in from one global handler. |
| TypeScript integration | `query-client.ts` | The `Register` augmentation types `error` as `AppError` in every hook. Data types come from the zod schemas. |
| Testing queries and mutations | `lib/queries/orders.test.tsx`, `test/utils.tsx` | `renderHook` with a fresh `QueryClient` per test and retries off. The optimistic test holds the response back to observe the in-flight state. |
| React Query vs. Redux | top of this guide | Different jobs. Putting fetched orders in Redux would mean rebuilding caching and refetching by hand. |
| Error recovery and production practice | `components/query-error.tsx`, report page | A retry button only for errors where retrying can help, error boundaries with reset, validated responses, one global session handler. |

## Things that are deliberately simple

- Sessions are a cookie holding a user id, and passwords are plain text in `lib/server/container.ts`. Fine for a demo. A real app needs hashed passwords and signed or random session tokens.
- API routes sleep for about a third of a second (`simulateLatency`) so loading states are visible.
- There is no end-to-end browser test. The tests cover the store, the order service, the query hooks, the sign-in form and the cart panel.
