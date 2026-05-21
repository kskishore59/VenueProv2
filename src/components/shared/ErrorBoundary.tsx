import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call custom error reporting hook if provided
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (err) {
        console.error('Error reporting callback crashed:', err);
      }
    }
  }

  public reset = () => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({
      hasError: false,
      error: null,
    });
  };

  public render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return (this.props.fallback as Function)(this.state.error, this.reset);
        }
        return this.props.fallback;
      }
      // We will render our default fallback below if none provided,
      // but to avoid circular import we import it dynamically or assume the parent passes it.
      // Alternatively, we can render a clean simple error fallback here,
      // and import/use the premium ErrorFallback component directly.
      // Let's import ErrorFallback directly in App.tsx or AppLayout.tsx instead of hardcoding here,
      // making this ErrorBoundary highly reusable!
    }

    return this.props.children;
  }
}
