import type { NextRequest } from 'next/server';
import { createOrderInputSchema, orderStatusSchema } from '@/lib/schemas';
import { container } from '@/lib/server/container';
import {
  intParam,
  orderErrorResponse,
  parseBody,
  requireUser,
  simulateLatency,
} from '@/lib/server/http';

// GET /api/orders?page=1&pageSize=5&status=PENDING
export async function GET(request: NextRequest) {
  const auth = await requireUser();
  if (!auth.ok) return auth.error;
  await simulateLatency();

  const params = request.nextUrl.searchParams;
  const status = orderStatusSchema.safeParse(params.get('status'));

  const page = await container.orderService.list({
    page: intParam(params.get('page'), 1) || 1,
    pageSize: intParam(params.get('pageSize'), 5, 50) || 5,
    status: status.success ? status.data : undefined,
  });
  return Response.json(page);
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (!auth.ok) return auth.error;
  await simulateLatency(600);

  const body = await parseBody(request, createOrderInputSchema);
  if (!body.ok) return body.error;

  const created = await container.orderService.create(
    body.value,
    auth.value.id,
  );
  if (!created.ok) return orderErrorResponse(created.error);

  return Response.json(created.value, { status: 201 });
}
