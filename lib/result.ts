// Type-safe error handling.
// A thrown error is invisible in a function's signature. Returning a Result
// puts the failure in the return type, so the compiler forces callers to
// check `ok` before touching `value`.

export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

export async function toResult<T, E>(
  promise: Promise<T>,
  mapError: (cause: unknown) => E,
): Promise<Result<T, E>> {
  try {
    return ok(await promise);
  } catch (cause) {
    return err(mapError(cause));
  }
}

// Exhaustive check. If every member of a union has been handled, the value
// left over has type `never`. Add a member later and every switch that
// forgot it stops compiling here.
export function assertNever(value: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(value)}`);
}
