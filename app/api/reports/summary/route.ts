import { container } from '@/lib/server/container';
import { requireUser, simulateLatency } from '@/lib/server/http';

export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.error;
  await simulateLatency();

  return Response.json(await container.orderService.summary());
}
