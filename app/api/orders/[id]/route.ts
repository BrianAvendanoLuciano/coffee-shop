import { updateOrderStatusInputSchema } from '@/lib/schemas';
import { container } from '@/lib/server/container';
import {
  orderErrorResponse,
  parseBody,
  requireUser,
  simulateLatency,
} from '@/lib/server/http';

// In this Next.js version `params` is a Promise and must be awaited.
type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  const auth = await requireUser();
  if (!auth.ok) return auth.error;
  await simulateLatency();

  const order = await container.orderService.get((await params).id);
  return order.ok ? Response.json(order.value) : orderErrorResponse(order.error);
}

export async function PATCH(request: Request, { params }: Context) {
  const auth = await requireUser();
  if (!auth.ok) return auth.error;
  await simulateLatency(600);

  const body = await parseBody(request, updateOrderStatusInputSchema);
  if (!body.ok) return body.error;

  const updated = await container.orderService.updateStatus(
    (await params).id,
    body.value.status,
  );
  return updated.ok
    ? Response.json(updated.value)
    : orderErrorResponse(updated.error);
}
