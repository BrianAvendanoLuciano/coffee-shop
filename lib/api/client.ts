import type { z } from 'zod';
import { apiErrorBodySchema } from '@/lib/schemas';
import { HttpError, NetworkError, ResponseShapeError } from './errors';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  // Lets TanStack Query abort a request whose result is no longer wanted.
  signal?: AbortSignal;
};

// The generic parameter is inferred from the schema argument, so callers get a
// fully typed result without ever writing `as SomeType`.
export async function request<S extends z.ZodType>(
  path: string,
  schema: S,
  { method = 'GET', body, signal }: RequestOptions = {},
): Promise<z.infer<S>> {
  let response: Response;

  try {
    response = await fetch(path, {
      method,
      signal,
      headers:
        body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (cause) {
    // An abort is not a failure; rethrow it untouched so the caller can tell.
    if (cause instanceof DOMException && cause.name === 'AbortError') {
      throw cause;
    }
    throw new NetworkError(cause);
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const parsed = apiErrorBodySchema.safeParse(payload);
    if (parsed.success) {
      const { code, message, fieldErrors } = parsed.data.error;
      throw new HttpError(response.status, code, message, fieldErrors);
    }
    throw new HttpError(
      response.status,
      'UNKNOWN',
      response.statusText || 'Request failed',
    );
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new ResponseShapeError(
      path,
      parsed.error.issues[0]?.message ?? 'invalid shape',
    );
  }
  return parsed.data;
}

type QueryValue = string | number | null | undefined;

export function withQuery(
  path: string,
  params: Record<string, QueryValue>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== '') {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}
