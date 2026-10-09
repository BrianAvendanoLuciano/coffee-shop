import {
  type PayloadAction,
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';
import { EXTRAS } from '@/constants/extras';
import { api } from '@/lib/api/endpoints';
import { getErrorMessage } from '@/lib/api/errors';
import { totals, unitPrice } from '@/lib/pricing';
import type { CartLine, Order, Product, ProductVariant } from '@/types/common';
import type { RootState } from './index';

// Normalized state. Instead of an array we store
//   { ids: ['a', 'b'], entities: { a: {...}, b: {...} } }
// so finding or updating one line is a key lookup, not an array scan, and no
// line can exist twice. The adapter generates the reducers and selectors.
const cartAdapter = createEntityAdapter<CartLine>();

// Loading / success / error as a discriminated union, so impossible
// combinations ("pending" with an error message) cannot be represented.
export type CheckoutState =
  | { status: 'idle' }
  | { status: 'pending' }
  | { status: 'succeeded'; orderNumber: string }
  | { status: 'failed'; error: string };

const initialState = cartAdapter.getInitialState({
  checkout: { status: 'idle' } as CheckoutState,
});

// Async logic. The thunk dispatches cart/placeOrder/pending, then /fulfilled
// or /rejected; the slice reacts to those in extraReducers below.
export const placeOrder = createAsyncThunk<
  Order,
  { customer: string },
  { state: RootState; rejectValue: string }
>(
  'cart/placeOrder',
  async ({ customer }, { getState, rejectWithValue, signal }) => {
    const items = selectCartLines(getState()).map(
      ({ variantId, extraIds, quantity }) => ({ variantId, extraIds, quantity }),
    );
    try {
      return await api.createOrder({ customer, items }, signal);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    // Ignore a second click while the first request is still in flight.
    condition: (_arg, { getState }) =>
      getState().cart.checkout.status !== 'pending',
  },
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    itemAdded: {
      // Reducers must be pure, so anything derived (the id, the price) is
      // computed in `prepare`, which builds the action before it is dispatched.
      prepare(
        product: Product,
        variant: ProductVariant,
        extraIds: string[],
        quantity: number,
      ) {
        const sortedExtras = [...extraIds].sort();
        const extras = EXTRAS.filter((e) => sortedExtras.includes(e.id));
        const line: CartLine = {
          // Same drink with the same extras is the same line.
          id: [variant.id, ...sortedExtras].join('|'),
          productId: product.id,
          productName: product.name,
          variantId: variant.id,
          size: variant.size,
          extraIds: sortedExtras,
          quantity,
          unitPrice: unitPrice(variant.price, extras),
        };
        return { payload: line };
      },
      reducer(state, action: PayloadAction<CartLine>) {
        const existing = state.entities[action.payload.id];
        if (existing) {
          // Looks like a mutation, but Immer hands us a draft and produces a
          // new immutable state from the changes we make to it.
          existing.quantity += action.payload.quantity;
        } else {
          cartAdapter.addOne(state, action.payload);
        }
        state.checkout = { status: 'idle' };
      },
    },
    quantityChanged(
      state,
      action: PayloadAction<{ id: string; quantity: number }>,
    ) {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        cartAdapter.removeOne(state, id);
      } else {
        cartAdapter.updateOne(state, { id, changes: { quantity } });
      }
    },
    itemRemoved: cartAdapter.removeOne,
    cartCleared: cartAdapter.removeAll,
    // Dispatched once on startup with the lines saved in localStorage.
    cartHydrated: cartAdapter.setAll,
    checkoutReset(state) {
      state.checkout = { status: 'idle' };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeOrder.pending, (state) => {
        state.checkout = { status: 'pending' };
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        cartAdapter.removeAll(state);
        state.checkout = {
          status: 'succeeded',
          orderNumber: action.payload.orderNumber,
        };
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.checkout = {
          status: 'failed',
          // payload is our rejectWithValue string; error.message covers
          // anything that threw outside the try block.
          error: action.payload ?? action.error.message ?? 'Checkout failed.',
        };
      });
  },
});

export const {
  itemAdded,
  quantityChanged,
  itemRemoved,
  cartCleared,
  cartHydrated,
  checkoutReset,
} = cartSlice.actions;

export const cartReducer = cartSlice.reducer;

// --- selectors ---------------------------------------------------------------

const adapterSelectors = cartAdapter.getSelectors(
  (state: RootState) => state.cart,
);

export const selectCartLines = adapterSelectors.selectAll;
export const selectCheckout = (state: RootState) => state.cart.checkout;

// Memoized with Reselect: recomputed only when the lines array changes, and
// it returns the same object otherwise, so components subscribed to it do not
// re-render when unrelated state (like checkout status) changes.
export const selectCartTotals = createSelector([selectCartLines], (lines) => ({
  ...totals(lines),
  itemCount: lines.reduce((count, line) => count + line.quantity, 0),
}));
