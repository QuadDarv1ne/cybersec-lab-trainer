"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary компонент для перехвата ошибок в React-дереве
 * Отображает пользовательскую страницу ошибки вместо "белого экрана"
 * 
 * @see https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Отправка ошибки в лог (в production можно отправить в Sentry)
    process.stderr.write(`[ErrorBoundary] Uncaught error: ${error.toString()}\n`);
    process.stderr.write(`[ErrorBoundary] Component stack: ${errorInfo.componentStack}\n`);
    
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleErrorDetails = () => {
    this.setState((prev) => ({
      error: prev.error ? null : prev.error,
    }));
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertCircle className="w-8 h-8" />
              <h1 className="text-xl font-bold">Ошибка приложения</h1>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300">
              Произошла непредвиденная ошибка. Попробуйте обновить страницу.
            </p>

            {this.state.error && (
              <details className="bg-gray-100 dark:bg-gray-700 rounded p-3 text-sm">
                <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-200">
                  Показать детали ошибки
                </summary>
                <pre className="mt-2 overflow-x-auto text-xs text-gray-800 dark:text-gray-100">
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo && (
                  <pre className="mt-2 overflow-x-auto text-xs text-gray-600 dark:text-gray-300">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}

            <div className="flex gap-2">
              <Button onClick={this.handleReload} className="flex-1">
                Обновить страницу
              </Button>
              <Button
                onClick={() => window.location.href = "/"}
                variant="outline"
                className="flex-1"
              >
                На главную
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
