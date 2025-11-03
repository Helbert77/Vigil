import React, { Component, ErrorInfo, ReactNode } from 'react';
import Card from '@/components/common/Card';
import Button from '@/src/components/common/Button';
import { Icon } from '@/components/icons/Icon';
import { logger } from '@/src/utils/Logger';

const AlertTriangleIcon = () => <Icon className="h-16 w-16 text-red-500 mx-auto mb-4"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" x2="12" y1="9" y2="13"></line><line x1="12" x2="12.01" y1="17" y2="17"></line></Icon>;

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true,
      error,
      errorInfo: null
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log detalhado do erro
    logger.error('Error Boundary capturou um erro', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    }, 'error', 'ErrorBoundary');

    // Callback personalizado se fornecido
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log no console para desenvolvimento
    console.error("Error Boundary - Uncaught error:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  public render() {
    if (this.state.hasError) {
      // Fallback personalizado se fornecido
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center p-4">
            <Card className="text-center max-w-lg w-full">
                <AlertTriangleIcon />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    Oops! Algo deu errado.
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Nossa equipe de vigilância já foi notificada. Tente recarregar a página ou usar o botão abaixo para tentar novamente.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                      onClick={this.handleRetry}
                      variant="primary"
                  >
                      Tentar Novamente
                  </Button>
                  <Button 
                      onClick={() => window.location.reload()}
                      variant="secondary"
                  >
                      Recarregar Página
                  </Button>
                </div>

                {/* Detalhes do erro em desenvolvimento */}
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-6 text-left">
                    <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
                      Detalhes do erro (desenvolvimento)
                    </summary>
                    <div className="mt-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border text-xs font-mono text-gray-800 dark:text-gray-200 overflow-auto max-h-60">
                      <div className="mb-3">
                        <strong className="text-red-600 dark:text-red-400">Erro:</strong> {this.state.error.message}
                      </div>
                      {this.state.error.stack && (
                        <div className="mb-3">
                          <strong className="text-red-600 dark:text-red-400">Stack Trace:</strong>
                          <pre className="whitespace-pre-wrap mt-1 text-xs">{this.state.error.stack}</pre>
                        </div>
                      )}
                      {this.state.errorInfo?.componentStack && (
                        <div>
                          <strong className="text-red-600 dark:text-red-400">Component Stack:</strong>
                          <pre className="whitespace-pre-wrap mt-1 text-xs">{this.state.errorInfo.componentStack}</pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}
            </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;