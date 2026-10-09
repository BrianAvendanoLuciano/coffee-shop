import { EXTRAS } from '@/constants/extras';
import { totals, unitPrice } from '@/lib/pricing';
import { type Result, err, ok } from '@/lib/result';
import type {
  CreateOrderInput,
  Order,
  OrderItem,
  OrderStatus,
  Page,
  Product,
  ReportSummary,
} from '@/types/common';
import type { Repository } from './repository';

// Small interfaces for the two things that make code non-deterministic.
// Production passes the real clock; tests pass a fixed one.
export interface Clock {
  now(): Date;
}

export interface IdGenerator {
  next(): string;
}

// Discriminated union: every member carries a literal `type`, and checking it
// narrows to that member's own fields.
export type OrderError =
  | { type: 'UNKNOWN_VARIANT'; variantId: string }
  | { type: 'UNKNOWN_EXTRA'; extraId: string }
  | { type: 'NOT_FOUND'; orderId: string }
  | { type: 'INVALID_TRANSITION'; from: OrderStatus; to: OrderStatus };

// Record of allowed moves: a completed or cancelled order is final.
const TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  PENDING: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

export function buildItems(
  lines: CreateOrderInput['items'],
  products: readonly Product[],
  ids: IdGenerator,
): Result<OrderItem[], OrderError> {
  const items: OrderItem[] = [];

  for (const line of lines) {
    const product = products.find((p) =>
      p.variants.some((v) => v.id === line.variantId),
    );
    const variant = product?.variants.find((v) => v.id === line.variantId);
    if (!product || !variant) {
      return err({ type: 'UNKNOWN_VARIANT', variantId: line.variantId });
    }

    const extras = [];
    for (const extraId of line.extraIds) {
      const extra = EXTRAS.find((e) => e.id === extraId);
      if (!extra) return err({ type: 'UNKNOWN_EXTRA', extraId });
      extras.push({ ...extra });
    }

    const price = unitPrice(variant.price, extras);
    items.push({
      id: ids.next(),
      productId: product.id,
      variantId: variant.id,
      productName: product.name,
      size: variant.size,
      extras,
      quantity: line.quantity,
      unitPrice: price,
      subtotal: price * line.quantity,
    });
  }

  return ok(items);
}

export class OrderService {
  // Dependency injection: the service is handed its collaborators instead of
  // creating them, and only knows them by interface.
  constructor(
    private readonly orders: Repository<Order>,
    private readonly products: Repository<Product>,
    private readonly clock: Clock,
    private readonly ids: IdGenerator,
  ) {}

  async list(options: {
    page: number;
    pageSize: number;
    status?: OrderStatus;
  }): Promise<Page<Order>> {
    const { page, pageSize, status } = options;
    const all = await this.orders.findAll();
    const filtered = status ? all.filter((o) => o.status === status) : all;
    const start = (page - 1) * pageSize;

    return {
      items: filtered.slice(start, start + pageSize),
      page,
      pageSize,
      total: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
    };
  }

  async get(orderId: string): Promise<Result<Order, OrderError>> {
    const order = await this.orders.findById(orderId);
    return order ? ok(order) : err({ type: 'NOT_FOUND', orderId });
  }

  async create(
    input: CreateOrderInput,
    employeeId: string,
  ): Promise<Result<Order, OrderError>> {
    const items = buildItems(
      input.items,
      await this.products.findAll(),
      this.ids,
    );
    if (!items.ok) return items;

    const now = this.clock.now();
    const count = (await this.orders.findAll()).length;
    const stamp = now.toISOString().slice(0, 10).replaceAll('-', '');

    const order: Order = {
      id: this.ids.next(),
      orderNumber: `ORD-${stamp}-${String(count + 1).padStart(3, '0')}`,
      employeeId,
      customer: input.customer,
      status: 'PENDING',
      items: items.value,
      ...totals(items.value),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    return ok(await this.orders.save(order));
  }

  async updateStatus(
    orderId: string,
    status: OrderStatus,
  ): Promise<Result<Order, OrderError>> {
    const order = await this.orders.findById(orderId);
    if (!order) return err({ type: 'NOT_FOUND', orderId });

    if (!TRANSITIONS[order.status].includes(status)) {
      return err({ type: 'INVALID_TRANSITION', from: order.status, to: status });
    }

    return ok(
      await this.orders.save({
        ...order,
        status,
        updatedAt: this.clock.now().toISOString(),
      }),
    );
  }

  async summary(): Promise<ReportSummary> {
    const orders = await this.orders.findAll();
    const byStatus: Record<OrderStatus, number> = {
      PENDING: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };
    const sold = new Map<string, number>();
    let revenue = 0;

    for (const order of orders) {
      byStatus[order.status] += 1;
      if (order.status !== 'COMPLETED') continue;

      revenue += order.total;
      for (const item of order.items) {
        sold.set(
          item.productName,
          (sold.get(item.productName) ?? 0) + item.quantity,
        );
      }
    }

    const topProducts = [...sold]
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return { orderCount: orders.length, revenue, byStatus, topProducts };
  }
}
