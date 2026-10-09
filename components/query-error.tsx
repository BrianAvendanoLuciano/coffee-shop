import type { AppError } from '@/lib/api/errors';
import { assertNever } from '@/lib/result';

type Props = {
  error: AppError;
  onRetry?: () => void;
};

// Narrowing a discriminated union: inside each case TypeScript knows exactly
// which error class it is holding.
function describe(error: AppError): string {
  switch (error.kind) {
    case 'network':
      return 'You appear to be offline.';
    case 'http':
      return error.status >= 500
        ? 'The server had a problem. Please try again.'
        : error.message;
    case 'shape':
      return 'The server sent something this app does not understand.';
    default:
      return assertNever(error);
  }
}

export default function QueryError({ error, onRetry }: Props) {
  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-200"
    >
      <span>{describe(error)}</span>
      {onRetry && error.retryable && (
        <button
          type="button"
          onClick={onRetry}
          className="cursor-pointer rounded-md px-3 py-1 font-medium underline"
        >
          Retry
        </button>
      )}
    </div>
  );
}
