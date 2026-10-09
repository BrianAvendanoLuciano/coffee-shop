import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { makeStore } from '@/store';
import { itemAdded } from '@/store/cart-slice';
import { latte, makeOrder } from '@/test/fixtures';
import { mockFetch, renderWithProviders } from '@/test/utils';
import CartPanel from './cart-panel';

function storeWithLatte() {
  const store = makeStore();
  store.dispatch(itemAdded(latte, latte.variants[0]!, [], 2));
  return store;
}

describe('CartPanel', () => {
  it('disables checkout while the cart is empty', () => {
    renderWithProviders(<CartPanel />);

    expect(screen.getByText(/nothing here yet/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Place Order' })).toBeDisabled();
  });

  it('updates the total when a quantity changes', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CartPanel />, { store: storeWithLatte() });

    expect(screen.getByText('Subtotal (2 items)')).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', { name: 'Add one Caffe Latte' }),
    );

    expect(screen.getByText('Subtotal (3 items)')).toBeInTheDocument();
  });

  it('asks for a customer name before placing the order', async () => {
    const user = userEvent.setup();
    const { fetchMock } = mockFetch({});
    renderWithProviders(<CartPanel />, { store: storeWithLatte() });

    await user.click(screen.getByRole('button', { name: 'Place Order' }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Who is this order for?',
    );
    expect(screen.getByLabelText('Customer name')).toHaveFocus();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('places the order, empties the cart and confirms with a toast', async () => {
    const user = userEvent.setup();
    mockFetch({ 'POST /api/orders': { status: 201, body: makeOrder() } });
    renderWithProviders(<CartPanel />, { store: storeWithLatte() });

    await user.type(screen.getByLabelText('Customer name'), 'Brian');
    await user.click(screen.getByRole('button', { name: 'Place Order' }));

    expect(
      await screen.findByText('Order ORD-20261009-001 placed for Brian.'),
    ).toBeInTheDocument();
    expect(screen.getByText(/nothing here yet/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Customer name')).toHaveValue('');
  });
});
