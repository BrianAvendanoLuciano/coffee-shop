import { Product } from '@/types/common';

export const products: Product[] = [
  {
    id: 'prod-001',
    categoryId: 'cat-coffee',
    name: 'Cappuccino',
    description: 'Espresso with steamed milk and milk foam.',
    imageUrl: '/images/products/cappuccino.jpg',
    isActive: true,
    variants: [
      {
        id: 'var-001',
        productId: 'prod-001',
        size: 'SMALL',
        price: 100,
        isActive: true,
      },
      {
        id: 'var-002',
        productId: 'prod-001',
        size: 'MEDIUM',
        price: 120,
        isActive: true,
      },
      {
        id: 'var-003',
        productId: 'prod-001',
        size: 'LARGE',
        price: 140,
        isActive: true,
      },
    ],
  },

  {
    id: 'prod-002',
    categoryId: 'cat-coffee',
    name: 'Caffe Latte',
    description: 'Espresso blended with creamy steamed milk.',
    imageUrl: '/images/products/latte.jpg',
    isActive: true,
    variants: [
      {
        id: 'var-004',
        productId: 'prod-002',
        size: 'SMALL',
        price: 110,
        isActive: true,
      },
      {
        id: 'var-005',
        productId: 'prod-002',
        size: 'MEDIUM',
        price: 130,
        isActive: true,
      },
      {
        id: 'var-006',
        productId: 'prod-002',
        size: 'LARGE',
        price: 150,
        isActive: true,
      },
    ],
  },

  {
    id: 'prod-003',
    categoryId: 'cat-coffee',
    name: 'Americano',
    description: 'Espresso combined with hot water.',
    imageUrl: '/images/products/americano.jpg',
    isActive: true,
    variants: [
      {
        id: 'var-007',
        productId: 'prod-003',
        size: 'SMALL',
        price: 80,
        isActive: true,
      },
      {
        id: 'var-008',
        productId: 'prod-003',
        size: 'MEDIUM',
        price: 95,
        isActive: true,
      },
      {
        id: 'var-009',
        productId: 'prod-003',
        size: 'LARGE',
        price: 110,
        isActive: true,
      },
    ],
  },

  {
    id: 'prod-004',
    categoryId: 'cat-coffee',
    name: 'Caramel Macchiato',
    description: 'Espresso, steamed milk, vanilla, and caramel drizzle.',
    imageUrl: '/images/products/caramel-macchiato.jpg',
    isActive: true,
    variants: [
      {
        id: 'var-010',
        productId: 'prod-004',
        size: 'SMALL',
        price: 130,
        isActive: true,
      },
      {
        id: 'var-011',
        productId: 'prod-004',
        size: 'MEDIUM',
        price: 150,
        isActive: true,
      },
      {
        id: 'var-012',
        productId: 'prod-004',
        size: 'LARGE',
        price: 170,
        isActive: true,
      },
    ],
  },

  {
    id: 'prod-005',
    categoryId: 'cat-coffee',
    name: 'Mocha',
    description: 'Espresso, chocolate, and steamed milk.',
    imageUrl: '/images/products/mocha.jpg',
    isActive: true,
    variants: [
      {
        id: 'var-013',
        productId: 'prod-005',
        size: 'SMALL',
        price: 120,
        isActive: true,
      },
      {
        id: 'var-014',
        productId: 'prod-005',
        size: 'MEDIUM',
        price: 140,
        isActive: true,
      },
      {
        id: 'var-015',
        productId: 'prod-005',
        size: 'LARGE',
        price: 160,
        isActive: true,
      },
    ],
  },

  {
    id: 'prod-006',
    categoryId: 'cat-tea',
    name: 'Matcha Latte',
    description: 'Japanese matcha blended with creamy milk.',
    imageUrl: '/images/products/matcha-latte.jpg',
    isActive: true,
    variants: [
      {
        id: 'var-016',
        productId: 'prod-006',
        size: 'SMALL',
        price: 120,
        isActive: true,
      },
      {
        id: 'var-017',
        productId: 'prod-006',
        size: 'MEDIUM',
        price: 140,
        isActive: true,
      },
      {
        id: 'var-018',
        productId: 'prod-006',
        size: 'LARGE',
        price: 160,
        isActive: true,
      },
    ],
  },

  {
    id: 'prod-007',
    categoryId: 'cat-tea',
    name: 'Earl Grey Tea',
    description: 'Classic black tea with bergamot flavor.',
    imageUrl: '/images/products/earl-grey.jpg',
    isActive: true,
    variants: [
      {
        id: 'var-019',
        productId: 'prod-007',
        size: 'SMALL',
        price: 80,
        isActive: true,
      },
      {
        id: 'var-020',
        productId: 'prod-007',
        size: 'MEDIUM',
        price: 95,
        isActive: true,
      },
      {
        id: 'var-021',
        productId: 'prod-007',
        size: 'LARGE',
        price: 110,
        isActive: true,
      },
    ],
  },

  {
    id: 'prod-008',
    categoryId: 'cat-tea',
    name: 'Iced Lemon Tea',
    description: 'Refreshing black tea with lemon and ice.',
    imageUrl: '/images/products/lemon-tea.jpg',
    isActive: true,
    variants: [
      {
        id: 'var-022',
        productId: 'prod-008',
        size: 'SMALL',
        price: 85,
        isActive: true,
      },
      {
        id: 'var-023',
        productId: 'prod-008',
        size: 'MEDIUM',
        price: 100,
        isActive: true,
      },
      {
        id: 'var-024',
        productId: 'prod-008',
        size: 'LARGE',
        price: 115,
        isActive: true,
      },
    ],
  },

  {
    id: 'prod-009',
    categoryId: 'cat-pastries',
    name: 'Chocolate Croissant',
    description: 'Buttery croissant filled with rich chocolate.',
    imageUrl: '/images/products/chocolate-croissant.jpg',
    isActive: true,
    variants: [],
  },

  {
    id: 'prod-010',
    categoryId: 'cat-pastries',
    name: 'Blueberry Muffin',
    description: 'Soft muffin packed with blueberries.',
    imageUrl: '/images/products/blueberry-muffin.jpg',
    isActive: true,
    variants: [],
  },

  {
    id: 'prod-011',
    categoryId: 'cat-pastries',
    name: 'Cinnamon Roll',
    description: 'Soft cinnamon roll topped with cream cheese glaze.',
    imageUrl: '/images/products/cinnamon-roll.jpg',
    isActive: true,
    variants: [],
  },

  {
    id: 'prod-012',
    categoryId: 'cat-desserts',
    name: 'Chocolate Cake',
    description: 'Rich chocolate cake with chocolate frosting.',
    imageUrl: '/images/products/chocolate-cake.jpg',
    isActive: true,
    variants: [],
  },

  {
    id: 'prod-013',
    categoryId: 'cat-desserts',
    name: 'Cheesecake',
    description: 'Creamy cheesecake with a buttery biscuit crust.',
    imageUrl: '/images/products/cheesecake.jpg',
    isActive: true,
    variants: [],
  },

  {
    id: 'prod-014',
    categoryId: 'cat-desserts',
    name: 'Tiramisu',
    description: 'Coffee-soaked ladyfingers layered with mascarpone cream.',
    imageUrl: '/images/products/tiramisu.jpg',
    isActive: true,
    variants: [],
  },
];
