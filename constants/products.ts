import type { CategoryId, Product, ProductSize } from '@/types/common';

// Seed catalogue for the mock API (lib/server). Client code never imports
// this; it asks /api/products like it would ask a real backend.

// A tuple type: fixed length, each position has its own type.
type SizePrice = [size: ProductSize, price: number];

function product(
  n: number,
  categoryId: CategoryId,
  name: string,
  description: string,
  ...sizes: SizePrice[]
): Product {
  const id = `prod-${String(n).padStart(3, '0')}`;
  return {
    id,
    categoryId,
    name,
    description,
    imageUrl: '/expresso.jpg',
    isActive: true,
    variants: sizes.map(([size, price]) => ({
      id: `${id}-${size.toLowerCase()}`,
      size,
      price,
    })),
  };
}

const sml = (small: number, medium: number, large: number): SizePrice[] => [
  ['SMALL', small],
  ['MEDIUM', medium],
  ['LARGE', large],
];

export const products: Product[] = [
  product(1, 'cat-coffee', 'Cappuccino', 'Espresso with steamed milk and milk foam.', ...sml(100, 120, 140)),
  product(2, 'cat-coffee', 'Caffe Latte', 'Espresso blended with creamy steamed milk.', ...sml(110, 130, 150)),
  product(3, 'cat-coffee', 'Americano', 'Espresso combined with hot water.', ...sml(80, 95, 110)),
  product(4, 'cat-coffee', 'Caramel Macchiato', 'Espresso, steamed milk, vanilla, and caramel drizzle.', ...sml(130, 150, 170)),
  product(5, 'cat-coffee', 'Mocha', 'Espresso, chocolate, and steamed milk.', ...sml(120, 140, 160)),
  product(6, 'cat-tea', 'Matcha Latte', 'Stone-ground green tea with steamed milk.', ...sml(120, 140, 160)),
  product(7, 'cat-tea', 'Chai Latte', 'Spiced black tea with steamed milk.', ...sml(105, 120, 135)),
  product(8, 'cat-tea', 'Earl Grey', 'Black tea scented with bergamot.', ...sml(85, 100, 115)),
  product(9, 'cat-pastries', 'Chocolate Croissant', 'Buttery croissant filled with rich chocolate.', ['REGULAR', 95]),
  product(10, 'cat-pastries', 'Blueberry Muffin', 'Soft muffin packed with blueberries.', ['REGULAR', 85]),
  product(11, 'cat-pastries', 'Cinnamon Roll', 'Soft cinnamon roll topped with cream cheese glaze.', ['REGULAR', 110]),
  product(12, 'cat-desserts', 'Chocolate Cake', 'Rich chocolate cake with chocolate frosting.', ['REGULAR', 150]),
  product(13, 'cat-desserts', 'Cheesecake', 'Creamy cheesecake with a buttery biscuit crust.', ['REGULAR', 160]),
  product(14, 'cat-desserts', 'Tiramisu', 'Coffee-soaked ladyfingers layered with mascarpone cream.', ['REGULAR', 170]),
];
