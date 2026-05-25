"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { logger } from "@/lib/logger";
import { useTranslations } from "@/lib/intlStub";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

// Hook-based wrapper to provide translations to class component
function withTranslations<T extends React.ComponentType<Props & { t: ReturnType<typeof useTranslations> }>>(WrappedComponent: T) {
  return function WithTranslationsWrapper(props: Props) {
    const t = useTranslations('error');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <WrappedComponent {...(props as any)} t={t} />;
  };
}

class ErrorBoundaryInner extends Component<Props & { t: ReturnType<typeof useTranslations> }, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null, showDetails: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error(`Uncaught error: ${error.toString()}`);
    logger.error(`Component stack: ${errorInfo.componentStack}`);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleErrorDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { t } = this.props;

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertCircle className="w-8 h-8" />
              <h1 className="text-xl font-bold">{t('title')}</h1>
            </div>

            <p className="text-gray-600 dark:text-gray-300">
              {t('description')}
            </p>

            {this.state.error && process.env.NODE_ENV === 'development' && (
              <div className="bg-gray-100 dark:bg-gray-700 rounded p-3 text-sm">
                <button
                  type="button"
                  onClick={this.handleErrorDetails}
                  className="cursor-pointer font-medium text-gray-700 dark:text-gray-200 text-left w-full"
                >
                  {this.state.showDetails ? t('hideDetails') : t('showDetails')}
                </button>
                {this.state.showDetails && (
                  <>
                    <pre className="mt-2 overflow-x-auto text-xs text-gray-800 dark:text-gray-100">
                      {this.state.error.toString()}
                    </pre>
                    {this.state.errorInfo && (
                      <pre className="mt-2 overflow-x-auto text-xs text-gray-600 dark:text-gray-300">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={this.handleReload} className="flex-1">
                {t('reload')}
              </Button>
              <Button
                onClick={() => window.location.href = "/"}
                variant="outline"
                className="flex-1"
              >
                {t('home')}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const ErrorBoundary = withTranslations(ErrorBoundaryInner);
export { ErrorBoundary };
export default ErrorBoundary;
