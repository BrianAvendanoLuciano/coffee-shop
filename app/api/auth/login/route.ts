import { cookies } from 'next/headers';
import { HttpStatus } from '@/lib/api/errors';
import { loginInputSchema } from '@/lib/schemas';
import { USERS } from '@/lib/server/container';
import {
  SESSION_COOKIE,
  errorResponse,
  parseBody,
  simulateLatency,
} from '@/lib/server/http';

export async function POST(request: Request) {
  await simulateLatency();

  const body = await parseBody(request, loginInputSchema);
  if (!body.ok) return body.error;

  const user = USERS.find(
    (u) =>
      u.username === body.value.username && u.password === body.value.password,
  );
  if (!user) {
    return errorResponse(
      HttpStatus.Unauthorized,
      'INVALID_CREDENTIALS',
      'Wrong username or password.',
    );
  }

  // httpOnly: page JavaScript cannot read the cookie, so an XSS bug cannot
  // steal the session. The value is a bare user id only because this is a
  // demo; a real session cookie is a signed or random token.
  (await cookies()).set(SESSION_COOKIE, user.id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8,
  });

  return Response.json({
    user: { id: user.id, name: user.name, role: user.role },
  });
}
