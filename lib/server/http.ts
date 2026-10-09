import 'server-only';

import { cookies } from 'next/headers';
import type { z } from 'zod';
import { HttpStatus } from '@/lib/api/errors';
import { type Result, assertNever, err, ok } from '@/lib/result';
import type { Employee } from '@/types/common';
import { USERS } from './container';
import type { OrderError } from './order-service';

export const SESSION_COOKIE = 'pos_session';

export function errorResponse(
  status: HttpStatus,
  code: string,
  message: string,
  fieldErrors?: Record<string, string>,
): Response {
  return Response.json({ error: { code, message, fieldErrors } }, { status });
}

export async function getSessionUser(): Promise<Employee | null> {
  const userId = (await cookies()).get(SESSION_COOKIE)?.value;
  const user = USERS.find((u) => u.id === userId);
  // Destructure to drop the credentials before anything leaves the server.
  return user ? { id: user.id, name: user.name, role: user.role } : null;
}

// Handlers get either a user or a ready-made 401 to return.
export async function requireUser(): Promise<Result<Employee, Response>> {
  const user = await getSessionUser();
  return user
    ? ok(user)
    : err(
        errorResponse(
          HttpStatus.Unauthorized,
          'UNAUTHORIZED',
          'Please sign in again.',
        ),
      );
}

export async function parseBody<S extends z.ZodType>(
  request: Request,
  schema: S,
): Promise<Result<z.infer<S>, Response>> {
  const body: unknown = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (parsed.success) return ok(parsed.data);

  const fieldErrors: Record<string, string> = {};
  for (const issue of parsed.error.issues) {
    const field = String(issue.path[0] ?? 'form');
    fieldErrors[field] ??= issue.message;
  }
  return err(
    errorResponse(
      HttpStatus.UnprocessableEntity,
      'VALIDATION',
      'Some fields are invalid.',
      fieldErrors,
    ),
  );
}

// Exhaustive switch over the discriminated union. There is no `default` that
// silently swallows new cases: add a member to OrderError and assertNever
// turns this function into a compile error until it is handled.
export function orderErrorResponse(error: OrderError): Response {
  switch (error.type) {
    case 'NOT_FOUND':
      return errorResponse(
        HttpStatus.NotFound,
        error.type,
        `Order ${error.orderId} was not found.`,
      );
    case 'UNKNOWN_VARIANT':
      return errorResponse(
        HttpStatus.BadRequest,
        error.type,
        `Product variant ${error.variantId} does not exist.`,
      );
    case 'UNKNOWN_EXTRA':
      return errorResponse(
        HttpStatus.BadRequest,
        error.type,
        `Extra ${error.extraId} does not exist.`,
      );
    case 'INVALID_TRANSITION':
      return errorResponse(
        HttpStatus.Conflict,
        error.type,
        `A ${error.from.toLowerCase()} order cannot become ${error.to.toLowerCase()}.`,
      );
    default:
      return assertNever(error);
  }
}

// Fake network latency so loading states are visible while learning.
export function simulateLatency(ms = 350): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function intParam(
  value: string | null,
  fallback: number,
  max = Number.MAX_SAFE_INTEGER,
): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed >= 0
    ? Math.min(parsed, max)
    : fallback;
}
