'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import Button from '@/components/button/button';

type Props = {
  children: ReactNode;
  // Called when the user clicks "Try again", before the children re-mount.
  onReset?: () => void;
  title?: string;
};

type State = {
  error: Error | null;
};

// Error boundaries are the one thing that still needs a class component:
// there is no hook equivalent of getDerivedStateFromError. A boundary catches
// errors thrown while rendering its children and shows a fallback instead of
// unmounting the whole page. It does not catch errors in event handlers or
// in async code.
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  // Arrow function property so `this` is bound when passed as onClick.
  private handleReset = () => {
    this.props.onReset?.();
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div
        role="alert"
        className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-red-200"
      >
        <p className="font-semibold text-red-700">
          {this.props.title ?? 'This section failed to load.'}
        </p>
        <p className="mt-1 mb-4 text-sm text-slate-600">{error.message}</p>
        <div className="w-40">
          <Button type="button" onClick={this.handleReset}>
            Try again
          </Button>
        </div>
      </div>
    );
  }
}
