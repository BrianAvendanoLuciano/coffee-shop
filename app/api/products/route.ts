import type { NextRequest } from 'next/server';
import { isCategoryId } from '@/constants/categories';
import { container } from '@/lib/server/container';
import { intParam, requireUser, simulateLatency } from '@/lib/server/http';
import type { CursorPage, Product } from '@/types/common';

// GET /api/products?category=cat-tea&q=latte&cursor=0&limit=8
// Cursor pagination: the response says where the next page starts, which is
// the shape useInfiniteQuery wants.
export async function GET(request: NextRequest) {
  const auth = await requireUser();
  if (!auth.ok) return auth.error;
  await simulateLatency();

  const params = request.nextUrl.searchParams;
  const category = params.get('category');
  const q = params.get('q')?.trim().toLowerCase() ?? '';
  const cursor = intParam(params.get('cursor'), 0);
  const limit = intParam(params.get('limit'), 8, 50) || 8;

  const all = await container.productRepository.findAll();
  const matches = all.filter(
    (product) =>
      product.isActive &&
      (!isCategoryId(category) || product.categoryId === category) &&
      (q === '' ||
        product.name.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q)),
  );

  const next = cursor + limit;
  const page: CursorPage<Product> = {
    items: matches.slice(cursor, next),
    nextCursor: next < matches.length ? next : null,
  };
  return Response.json(page);
}
