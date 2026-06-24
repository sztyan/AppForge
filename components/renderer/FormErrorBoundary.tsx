"use client";

import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

interface FormErrorBoundaryProps {
  children: React.ReactNode;
  /** Optional fallback UI override */
  fallback?: React.ReactNode;
}

/**
 * FormErrorBoundary — catches runtime render errors inside the form renderer.
 * This prevents a broken JSON schema from crashing the whole app.
 */
export class FormErrorBoundary extends React.Component<
  FormErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: FormErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // In production, log to an error reporting service
    console.error("[FormErrorBoundary] Caught error:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: "" });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-destructive/30 bg-destructive/10 p-8 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/20">
            <AlertCircle className="h-5 w-5 text-destructive" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              Renderer crashed
            </p>
            <p className="text-xs text-muted-foreground max-w-xs">
              {this.state.errorMessage || "An unexpected error occurred while rendering the form."}
            </p>
          </div>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
