import {
  type Middleware,
  createListenerMiddleware,
  isAction,
} from '@reduxjs/toolkit';
import { z } from 'zod';
import { productSizeSchema } from '@/lib/schemas';
import type { CartLine } from '@/types/common';
import type { AppDispatch, RootState } from './index';

// A middleware sits between dispatch() and the reducers. Its shape is three
// nested functions: store API -> next middleware -> the action.
export const logger: Middleware = (storeApi) => (next) => (action) => {
  const result = next(action);
  if (process.env.NODE_ENV === 'development' && isAction(action)) {
    console.debug(`[redux] ${action.type}`, storeApi.getState());
  }
  return result;
};

// --- cart persistence --------------------------------------------------------

const STORAGE_KEY = 'pos.cart';

const savedCartSchema = z.array(
  z.object({
    id: z.string(),
    productId: z.string(),
    productName: z.string(),
    variantId: z.string(),
    size: productSizeSchema,
    extraIds: z.array(z.string()),
    quantity: z.number().int().positive(),
    unitPrice: z.number().nonnegative(),
  }),
);

// localStorage is external data too: it may be empty, hand-edited, or written
// by an older version of the app. Validate, and fall back to an empty cart.
export function loadCart(): CartLine[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    const parsed = savedCartSchema.safeParse(raw);
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

// Reducers must stay pure, so side effects that react to state changes live
// in a listener instead.
export const listenerMiddleware = createListenerMiddleware();

const startAppListening = listenerMiddleware.startListening.withTypes<
  RootState,
  AppDispatch
>();

startAppListening({
  predicate: (_action, current, previous) =>
    current.cart.entities !== previous.cart.entities,
  effect: (_action, listenerApi) => {
    const { ids, entities } = listenerApi.getState().cart;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(ids.map((id) => entities[id])),
      );
    } catch {
      // Storage full or disabled: the cart still works for this session.
    }
  },
});
