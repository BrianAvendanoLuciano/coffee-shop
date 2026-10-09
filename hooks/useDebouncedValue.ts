import { useEffect, useState } from 'react';

// Returns `value`, but only after it has stopped changing for `delayMs`.
// Generic, so it works for any type and returns that same type.
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    // Each keystroke re-runs the effect; the cleanup cancels the previous
    // timer first, so only the last one ever fires.
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
