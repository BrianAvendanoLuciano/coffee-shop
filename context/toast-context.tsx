'use client';

import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

type ToastKind = 'success' | 'error';

type Toast = {
  id: number;
  kind: ToastKind;
  message: string;
};

type ToastContextValue = {
  notify: (kind: ToastKind, message: string) => void;
};

// Context solves prop drilling: any component, however deep, can raise a
// toast without every parent in between passing a `notify` prop down.
// `null` as the default lets useToast detect a missing provider.
const ToastContext = createContext<ToastContextValue | null>(null);

const KIND_STYLES: Record<ToastKind, string> = {
  success: 'bg-emerald-600',
  error: 'bg-red-600',
};

const DISMISS_AFTER_MS = 4000;

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: number) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), DISMISS_AFTER_MS);
    // Cleanup: if the toast is closed by hand first, cancel the timer so it
    // does not fire for a component that no longer exists.
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <li
      className={`flex items-start gap-3 rounded-lg px-4 py-3 text-sm text-white shadow-lg ${KIND_STYLES[toast.kind]}`}
    >
      <span className="flex-1">{toast.message}</span>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="cursor-pointer font-bold leading-none"
      >
        ×
      </button>
    </li>
  );
}

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Functional updates read the latest state, so these callbacks need no
  // dependencies and keep the same identity for the life of the provider.
  const notify = useCallback((kind: ToastKind, message: string) => {
    setToasts((current) => [...current, { id: nextId++, kind, message }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  // Every consumer re-renders when the context value changes identity.
  // Memoizing it means showing a toast does not re-render every component
  // that merely calls useToast().
  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.length > 0 &&
        // Portal: rendered into <body> so no parent's overflow or z-index can
        // clip it, while staying inside this provider in the React tree.
        createPortal(
          <ul
            role="status"
            aria-live="polite"
            className="fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2"
          >
            {toasts.map((toast) => (
              <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
            ))}
          </ul>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}

// Custom hook wrapping useContext: one import for consumers, and a clear
// error instead of a null crash when the provider is missing.
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside <ToastProvider>.');
  }
  return context;
}
