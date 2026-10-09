import { z } from 'zod';

// Runtime validation of external data.
// TypeScript types are erased at build time, so a `fetch` response is really
// `unknown` no matter what we annotate it as. Each schema below is checked at
// runtime AND is the single source of the static type (see types/common.ts),
// so the two can never drift apart.

export const CATEGORY_IDS = [
  'cat-coffee',
  'cat-tea',
  'cat-pastries',
  'cat-desserts',
] as const;
export const PRODUCT_SIZES = ['REGULAR', 'SMALL', 'MEDIUM', 'LARGE'] as const;
export const ORDER_STATUSES = ['PENDING', 'COMPLETED', 'CANCELLED'] as const;

export const categoryIdSchema = z.enum(CATEGORY_IDS);
export const productSizeSchema = z.enum(PRODUCT_SIZES);
export const orderStatusSchema = z.enum(ORDER_STATUSES);

export const productVariantSchema = z.object({
  id: z.string(),
  size: productSizeSchema,
  price: z.number().nonnegative(),
});

export const productSchema = z.object({
  id: z.string(),
  categoryId: categoryIdSchema,
  name: z.string(),
  description: z.string(),
  imageUrl: z.string(),
  isActive: z.boolean(),
  variants: z.array(productVariantSchema).min(1),
});

export const extraSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().nonnegative(),
});

export const orderItemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  variantId: z.string(),
  productName: z.string(),
  size: productSizeSchema,
  extras: z.array(extraSchema),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  subtotal: z.number().nonnegative(),
});

export const orderSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  employeeId: z.string(),
  customer: z.string(),
  status: orderStatusSchema,
  items: z.array(orderItemSchema),
  subtotal: z.number(),
  tax: z.number(),
  total: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const employeeSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.enum(['BARISTA', 'MANAGER']),
});

export const sessionSchema = z.object({
  // `null` rather than a 401: "nobody is signed in" is a normal answer.
  user: employeeSchema.nullable(),
});

export const reportSummarySchema = z.object({
  orderCount: z.number(),
  revenue: z.number(),
  byStatus: z.record(orderStatusSchema, z.number()),
  topProducts: z.array(z.object({ name: z.string(), quantity: z.number() })),
});

// Generic schema factories: a function from a schema to a schema, the runtime
// twin of a generic type like Page<T>.
export const pageSchema = <T extends z.ZodType>(item: T) =>
  z.object({
    items: z.array(item),
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    totalPages: z.number(),
  });

export const cursorPageSchema = <T extends z.ZodType>(item: T) =>
  z.object({
    items: z.array(item),
    nextCursor: z.number().nullable(),
  });

// --- request bodies (validated on the server, reused by the client forms) ---

export const loginInputSchema = z.object({
  username: z.string().trim().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const createOrderInputSchema = z.object({
  customer: z.string().trim().min(1, 'Customer name is required').max(40),
  items: z
    .array(
      z.object({
        variantId: z.string(),
        extraIds: z.array(z.string()),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1, 'The cart is empty'),
});

export const updateOrderStatusInputSchema = z.object({
  status: orderStatusSchema,
});

export const apiErrorBodySchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    fieldErrors: z.record(z.string(), z.string()).optional(),
  }),
});
