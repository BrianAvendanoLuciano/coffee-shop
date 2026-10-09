import { useEffect, useRef } from 'react';

// Calls `onVisible` when the element the returned ref is attached to scrolls
// into view. Used as the "load more" trigger at the bottom of a list.
export function useOnVisible<T extends Element>(
  onVisible: () => void,
  enabled = true,
) {
  const elementRef = useRef<T>(null);

  // Stale closure guard. The observer below is created once and would keep
  // calling the `onVisible` from that first render forever. Storing the
  // latest callback in a ref lets the long-lived observer always reach the
  // current one, without tearing the observer down on every render.
  const callbackRef = useRef(onVisible);
  useEffect(() => {
    callbackRef.current = onVisible;
  });

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) callbackRef.current();
      },
      { rootMargin: '200px' },
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, [enabled]);

  return elementRef;
}
