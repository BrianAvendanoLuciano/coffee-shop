export type Order = {
  id: string;
  orderNumber: string;
  employeeId: string;
  status: string;
  tax: string;
  discount: string;
  total: number;
  customer: string;
  createdAt: string;
  updatedAt: string;
};

export type Variant = {
  id: string;
  name: string;
  price: number;
};

export type OrderItems = {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  createdAt: string;
  variant: Variant | null;
};

export type ProductSize = 'SMALL' | 'MEDIUM' | 'LARGE';

export type ProductVariant = {
  id: string;
  productId: string;
  size: ProductSize;
  price: number;
  isActive: boolean;
};

export type Product = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  variants: ProductVariant[];
};
