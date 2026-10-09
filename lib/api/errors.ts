// A numeric enum: one of the few places an enum reads better than a union,
// because the members are named constants for otherwise magic numbers.
export enum HttpStatus {
  BadRequest = 400,
  Unauthorized = 401,
  NotFound = 404,
  Conflict = 409,
  UnprocessableEntity = 422,
  InternalServerError = 500,
}

// Abstract base class: cannot be instantiated, only extended. Each subclass
// must supply `kind`, which doubles as the discriminant of the AppError union.
export abstract class BaseAppError extends Error {
  abstract readonly kind: string;
  // Whether trying again could plausibly succeed (drives the retry policy).
  abstract readonly retryable: boolean;

  protected constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = new.target.name;
  }
}

export class HttpError extends BaseAppError {
  readonly kind = 'http';

  // Parameter properties: `public readonly` declares and assigns the field.
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fieldErrors: Readonly<Record<string, string>> = {},
  ) {
    super(message);
  }

  get retryable(): boolean {
    return this.status >= 500;
  }
}

export class NetworkError extends BaseAppError {
  readonly kind = 'network';
  readonly retryable = true;

  constructor(cause: unknown) {
    super('Could not reach the server. Check your connection.', { cause });
  }
}

export class ResponseShapeError extends BaseAppError {
  readonly kind = 'shape';
  readonly retryable = false;

  constructor(
    public readonly path: string,
    details: string,
  ) {
    super(`Unexpected response from ${path}: ${details}`);
  }
}

export type AppError = HttpError | NetworkError | ResponseShapeError;

// Type guard: a function whose return type narrows its argument.
export function isAppError(value: unknown): value is AppError {
  return value instanceof BaseAppError;
}

export function isUnauthorized(error: unknown): error is HttpError {
  return error instanceof HttpError && error.status === HttpStatus.Unauthorized;
}

// `catch` gives us `unknown`: anything can be thrown. Narrow before use.
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Something went wrong.';
}
