import type { z } from 'zod';
import type {
  ORDER_STATUSES,
  createOrderInputSchema,
  employeeSchema,
  extraSchema,
  loginInputSchema,
  orderItemSchema,
  orderSchema,
  productSchema,
  productVariantSchema,
  reportSummarySchema,
} from '@/lib/schemas';

// Domain types are inferred from the zod schemas instead of written twice.
export type Product = z.infer<typeof productSchema>;
export type ProductVariant = z.infer<typeof productVariantSchema>;
export type Extra = z.infer<typeof extraSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
export type Order = z.infer<typeof orderSchema>;
export type Employee = z.infer<typeof employeeSchema>;
export type ReportSummary = z.infer<typeof reportSummarySchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;
export type CreateOrderInput = z.infer<typeof createOrderInputSchema>;

// Indexed access types: pull a member's type out of another type.
export type CategoryId = Product['categoryId'];
export type ProductSize = ProductVariant['size'];
// `typeof` lifts a value into the type world, `[number]` indexes the tuple:
// 'PENDING' | 'COMPLETED' | 'CANCELLED'.
export type OrderStatus = (typeof ORDER_STATUSES)[number];

// Generic types.
export type Page<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type CursorPage<T> = {
  items: T[];
  nextCursor: number | null;
};

// Utility types derive new shapes from existing ones, so a change to Order
// flows through automatically.
export type OrderSummary = Pick<
  Order,
  'id' | 'orderNumber' | 'customer' | 'status' | 'total'
>;
export type OrderDraft = Omit<
  Order,
  'id' | 'orderNumber' | 'createdAt' | 'updatedAt'
>;
export type OrderPatch = Partial<Pick<Order, 'status' | 'customer'>>;
export type FrozenOrder = Readonly<Order>;

// Mapped type: walk the keys of T and transform each property.
export type FieldErrors<T> = { [K in keyof T]?: string };

// Conditional type with `infer`: unwrap the item type of a page.
export type ItemOf<P> = P extends { items: Array<infer I> } ? I : never;

// Intersection type: a cart line is what the server needs plus what the UI
// shows without another lookup.
export type CartLine = CreateOrderInput['items'][number] & {
  id: string;
  productId: string;
  productName: string;
  size: ProductSize;
  unitPrice: number;
};
