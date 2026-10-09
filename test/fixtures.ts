import type { Order, Product } from '@/types/common';

export const latte: Product = {
  id: 'prod-002',
  categoryId: 'cat-coffee',
  name: 'Caffe Latte',
  description: 'Espresso blended with creamy steamed milk.',
  imageUrl: '/expresso.jpg',
  isActive: true,
  variants: [
    { id: 'prod-002-small', size: 'SMALL', price: 110 },
    { id: 'prod-002-large', size: 'LARGE', price: 150 },
  ],
};

// Partial<Order> overrides: each test states only what it cares about.
export function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'ord-001',
    orderNumber: 'ORD-20261009-001',
    employeeId: 'emp-001',
    customer: 'Brian',
    status: 'PENDING',
    items: [
      {
        id: 'item-001',
        productId: latte.id,
        variantId: 'prod-002-small',
        productName: latte.name,
        size: 'SMALL',
        extras: [],
        quantity: 1,
        unitPrice: 110,
        subtotal: 110,
      },
    ],
    subtotal: 110,
    tax: 13.2,
    total: 123.2,
    createdAt: '2026-10-09T09:00:00.000Z',
    updatedAt: '2026-10-09T09:00:00.000Z',
    ...overrides,
  };
}
