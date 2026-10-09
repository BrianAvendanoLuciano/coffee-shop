import { describe, expect, it } from 'vitest';
import { latte, makeOrder } from '@/test/fixtures';
import { mockFetch } from '@/test/utils';
import { makeStore } from './index';
import {
  itemAdded,
  placeOrder,
  quantityChanged,
  selectCartLines,
  selectCartTotals,
  selectCheckout,
} from './cart-slice';

const small = latte.variants[0]!;
const large = latte.variants[1]!;

// Redux logic is tested through a real store: dispatch actions, then assert
// on what the selectors return. No React and no mocks of Redux itself.
describe('cart slice', () => {
  it('adds a line with the price of the variant plus its extras', () => {
    const store = makeStore();

    store.dispatch(itemAdded(latte, small, ['oat-milk'], 2));

    expect(selectCartLines(store.getState())).toEqual([
      expect.objectContaining({
        productName: 'Caffe Latte',
        size: 'SMALL',
        extraIds: ['oat-milk'],
        quantity: 2,
        unitPrice: 135,
      }),
    ]);
  });

  it('merges the same drink into one line and keeps different ones apart', () => {
    const store = makeStore();

    store.dispatch(itemAdded(latte, small, ['oat-milk', 'extra-shot'], 1));
    // Same extras in a different order is still the same drink.
    store.dispatch(itemAdded(latte, small, ['extra-shot', 'oat-milk'], 2));
    store.dispatch(itemAdded(latte, large, [], 1));

    const lines = selectCartLines(store.getState());
    expect(lines.map((line) => line.quantity)).toEqual([3, 1]);
  });

  it('removes a line when its quantity drops to zero', () => {
    const store = makeStore();
    store.dispatch(itemAdded(latte, small, [], 1));
    const [line] = selectCartLines(store.getState());

    store.dispatch(quantityChanged({ id: line!.id, quantity: 0 }));

    expect(selectCartLines(store.getState())).toEqual([]);
  });

  it('computes totals and memoizes them', () => {
    const store = makeStore();
    store.dispatch(itemAdded(latte, small, [], 2));
    store.dispatch(itemAdded(latte, large, [], 1));

    const totals = selectCartTotals(store.getState());
    expect(totals).toEqual({
      subtotal: 370,
      tax: 44.4,
      total: 414.4,
      itemCount: 3,
    });
    // Same input, same object back: this is what stops needless re-renders.
    expect(selectCartTotals(store.getState())).toBe(totals);
  });

  it('persists the cart to localStorage through the listener middleware', () => {
    const store = makeStore();

    store.dispatch(itemAdded(latte, small, [], 1));

    const saved = JSON.parse(localStorage.getItem('pos.cart') ?? '[]');
    expect(saved).toHaveLength(1);
    expect(saved[0].variantId).toBe(small.id);
  });
});

describe('placeOrder thunk', () => {
  it('sends only ids and quantities, then empties the cart', async () => {
    const { calls } = mockFetch({
      'POST /api/orders': { status: 201, body: makeOrder() },
    });
    const store = makeStore();
    store.dispatch(itemAdded(latte, small, ['oat-milk'], 2));

    const pending = store.dispatch(placeOrder({ customer: 'Brian' }));
    expect(selectCheckout(store.getState())).toEqual({ status: 'pending' });
    await pending;

    // Prices are not sent: the server works them out itself.
    expect(calls[0]?.body).toEqual({
      customer: 'Brian',
      items: [
        { variantId: small.id, extraIds: ['oat-milk'], quantity: 2 },
      ],
    });
    expect(selectCartLines(store.getState())).toEqual([]);
    expect(selectCheckout(store.getState())).toEqual({
      status: 'succeeded',
      orderNumber: 'ORD-20261009-001',
    });
  });

  it('keeps the cart and records the message when the server refuses', async () => {
    mockFetch({
      'POST /api/orders': {
        status: 400,
        body: { error: { code: 'UNKNOWN_VARIANT', message: 'No such product.' } },
      },
    });
    const store = makeStore();
    store.dispatch(itemAdded(latte, small, [], 1));

    await store.dispatch(placeOrder({ customer: 'Brian' }));

    expect(selectCartLines(store.getState())).toHaveLength(1);
    expect(selectCheckout(store.getState())).toEqual({
      status: 'failed',
      error: 'No such product.',
    });
  });
});
