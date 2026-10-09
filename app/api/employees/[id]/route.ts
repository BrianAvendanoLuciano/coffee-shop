import { HttpStatus } from '@/lib/api/errors';
import { container } from '@/lib/server/container';
import {
  errorResponse,
  requireUser,
  simulateLatency,
} from '@/lib/server/http';

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  const auth = await requireUser();
  if (!auth.ok) return auth.error;
  await simulateLatency();

  const { id } = await params;
  const employee = await container.employeeRepository.findById(id);
  return employee
    ? Response.json(employee)
    : errorResponse(
        HttpStatus.NotFound,
        'NOT_FOUND',
        `Employee ${id} was not found.`,
      );
}
