'use client';

import { useQueryClient } from '@tanstack/react-query';
import { type SubmitEvent, useRef, useState } from 'react';
import { useToast } from '@/context/toast-context';
import { formatMoney } from '@/lib/pricing';
import { queryKeys } from '@/lib/queries/keys';
import {
  placeOrder,
  selectCartLines,
  selectCartTotals,
  selectCheckout,
} from '@/store/cart-slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import OrderCartItem from './order-cart-item';

export default function CartPanel() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { notify } = useToast();

  // Each useAppSelector subscribes this component to one piece of the store;
  // it re-renders only when that selector's result changes.
  const lines = useAppSelector(selectCartLines);
  const { subtotal, tax, total, itemCount } = useAppSelector(selectCartTotals);
  const checkout = useAppSelector(selectCheckout);

  // Uncontrolled input: the DOM holds the value and we read it through a ref
  // on submit. Nothing on screen depends on the name while it is being typed,
  // so there is no reason to re-render on every keystroke.
  const customerRef = useRef<HTMLInputElement>(null);
  const [customerError, setCustomerError] = useState<string | null>(null);

  const isPlacing = checkout.status === 'pending';

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const customer = customerRef.current?.value.trim() ?? '';
    if (customer === '') {
      setCustomerError('Who is this order for?');
      customerRef.current?.focus();
      return;
    }
    setCustomerError(null);

    // dispatch(thunk) resolves to an action either way; unwrap() turns it
    // back into "returns the order or throws", which reads naturally here.
    try {
      const order = await dispatch(placeOrder({ customer })).unwrap();
      notify('success', `Order ${order.orderNumber} placed for ${customer}.`);
      if (customerRef.current) customerRef.current.value = '';

      // The cart lives in Redux, the order lists live in the query cache.
      // A new order makes those lists out of date, so mark them stale.
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.reports.summary,
      });
    } catch {
      // The slice already stored the message in checkout.error.
    }
  };

  return (
    <aside
      aria-label="Order summary"
      className="sticky top-6 h-fit mt-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
    >
      <h2 className="text-2xl font-semibold">Order Summary</h2>

      {lines.length === 0 ? (
        <p className="my-6 text-sm text-slate-500">
          Nothing here yet. Tap + on a product to add it.
        </p>
      ) : (
        <ul>
          {lines.map((line) => (
            <OrderCartItem key={line.id} line={line} />
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <dl className="my-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal ({itemCount} items)</dt>
            <dd>{formatMoney(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Tax</dt>
            <dd>{formatMoney(tax)}</dd>
          </div>
          <div className="flex justify-between text-xl font-semibold">
            <dt>Total</dt>
            <dd>{formatMoney(total)}</dd>
          </div>
        </dl>

        <label htmlFor="customer" className="text-sm font-medium">
          Customer name
        </label>
        <input
          ref={customerRef}
          id="customer"
          name="customer"
          maxLength={40}
          autoComplete="off"
          aria-invalid={customerError ? true : undefined}
          aria-describedby={customerError ? 'customer-error' : undefined}
          className="mt-1 mb-1 w-full rounded-md border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
        />
        {customerError && (
          <p id="customer-error" role="alert" className="text-xs text-red-600">
            {customerError}
          </p>
        )}

        {checkout.status === 'failed' && (
          <p role="alert" className="mt-2 text-sm text-red-600">
            {checkout.error}
          </p>
        )}

        <button
          type="submit"
          disabled={lines.length === 0 || isPlacing}
          className="mt-3 bg-amber-500 w-full rounded-2xl p-2 text-white cursor-pointer hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPlacing ? 'Placing order…' : 'Place Order'}
        </button>
      </form>
    </aside>
  );
}
