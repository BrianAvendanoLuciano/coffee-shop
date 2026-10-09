import { describe, expect, it } from 'vitest';
import { latte } from '@/test/fixtures';
import { type Clock, type IdGenerator, OrderService } from './order-service';
import { OrderRepository, ProductRepository } from './repository';

// Because OrderService receives its collaborators through the constructor,
// a test can hand it a frozen clock and predictable ids. No mocking library.
function setup() {
  let counter = 0;
  const clock: Clock = { now: () => new Date('2026-10-09T08:00:00.000Z') };
  const ids: IdGenerator = { next: () => `id-${++counter}` };

  return new OrderService(
    new OrderRepository(),
    new ProductRepository([latte]),
    clock,
    ids,
  );
}

describe('OrderService', () => {
  it('prices the order on the server and starts it as pending', async () => {
    const service = setup();

    const result = await service.create(
      {
        customer: 'Brian',
        items: [
          { variantId: 'prod-002-small', extraIds: ['oat-milk'], quantity: 2 },
        ],
      },
      'emp-001',
    );

    // Narrowing a Result: `value` only exists once `ok` has been checked.
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value).toMatchObject({
      orderNumber: 'ORD-20261009-001',
      status: 'PENDING',
      subtotal: 270,
      tax: 32.4,
      total: 302.4,
      createdAt: '2026-10-09T08:00:00.000Z',
    });
  });

  it('rejects a variant that does not exist', async () => {
    const result = await setup().create(
      {
        customer: 'Brian',
        items: [{ variantId: 'nope', extraIds: [], quantity: 1 }],
      },
      'emp-001',
    );

    expect(result).toEqual({
      ok: false,
      error: { type: 'UNKNOWN_VARIANT', variantId: 'nope' },
    });
  });

  it('does not let a finished order change status again', async () => {
    const service = setup();
    const created = await service.create(
      {
        customer: 'Brian',
        items: [{ variantId: 'prod-002-large', extraIds: [], quantity: 1 }],
      },
      'emp-001',
    );
    if (!created.ok) throw new Error('setup failed');

    const completed = await service.updateStatus(created.value.id, 'COMPLETED');
    const cancelled = await service.updateStatus(created.value.id, 'CANCELLED');

    expect(completed.ok).toBe(true);
    expect(cancelled).toEqual({
      ok: false,
      error: { type: 'INVALID_TRANSITION', from: 'COMPLETED', to: 'CANCELLED' },
    });
  });
});
