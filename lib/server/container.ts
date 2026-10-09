import 'server-only';

import { products } from '@/constants/products';
import { totals } from '@/lib/pricing';
import type { Employee, Order, OrderStatus } from '@/types/common';
import {
  type Clock,
  type IdGenerator,
  OrderService,
  buildItems,
} from './order-service';
import {
  EmployeeRepository,
  OrderRepository,
  ProductRepository,
} from './repository';

// The composition root: the one place that knows which concrete classes
// exist and wires them together.

export type User = Employee & { username: string; password: string };

// Demo accounts. A real app stores password hashes in a database.
export const USERS: readonly User[] = [
  { id: 'emp-001', name: 'Bea Santos', role: 'BARISTA', username: 'barista', password: 'coffee123' },
  { id: 'emp-002', name: 'Marco Reyes', role: 'MANAGER', username: 'manager', password: 'coffee123' },
];

const systemClock: Clock = { now: () => new Date() };
const uuid: IdGenerator = { next: () => crypto.randomUUID() };

const CUSTOMERS = ['Brian', 'Crystal', 'Jun', 'Aira', 'Paolo', 'Mika'];

function seedOrders(count: number): Order[] {
  const variants = products.flatMap((p) => p.variants);
  const orders: Order[] = [];

  for (let i = 0; i < count; i++) {
    const first = variants[(i * 5) % variants.length];
    const second = variants[(i * 7 + 3) % variants.length];
    if (!first || !second) continue;

    const items = buildItems(
      [
        { variantId: first.id, extraIds: i % 3 === 0 ? ['oat-milk'] : [], quantity: 1 + (i % 2) },
        { variantId: second.id, extraIds: [], quantity: 1 },
      ],
      products,
      uuid,
    );
    if (!items.ok) continue;

    const status: OrderStatus =
      i < 3 ? 'PENDING' : i % 6 === 0 ? 'CANCELLED' : 'COMPLETED';
    const at = new Date(Date.now() - i * 37 * 60_000).toISOString();

    orders.push({
      id: `ord-${String(count - i).padStart(3, '0')}`,
      orderNumber: `ORD-${at.slice(0, 10).replaceAll('-', '')}-${String(count - i).padStart(3, '0')}`,
      employeeId: USERS[i % USERS.length]?.id ?? 'emp-001',
      customer: CUSTOMERS[i % CUSTOMERS.length] ?? 'Guest',
      status,
      items: items.value,
      ...totals(items.value),
      createdAt: at,
      updatedAt: at,
    });
  }

  return orders;
}

function createContainer() {
  const productRepository = new ProductRepository(products);
  const orderRepository = new OrderRepository(seedOrders(23));
  const employeeRepository = new EmployeeRepository(
    USERS.map(({ id, name, role }) => ({ id, name, role })),
  );

  return {
    productRepository,
    employeeRepository,
    orderService: new OrderService(
      orderRepository,
      productRepository,
      systemClock,
      uuid,
    ),
  };
}

type Container = ReturnType<typeof createContainer>;

// `next dev` re-evaluates modules on every edit. Parking the instance on
// globalThis keeps the in-memory "database" alive across hot reloads.
const globalForContainer = globalThis as typeof globalThis & {
  __posContainer?: Container;
};

export const container: Container = (globalForContainer.__posContainer ??=
  createContainer());
