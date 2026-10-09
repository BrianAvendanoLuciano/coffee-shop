import { getSessionUser } from '@/lib/server/http';

export async function GET() {
  return Response.json({ user: await getSessionUser() });
}
