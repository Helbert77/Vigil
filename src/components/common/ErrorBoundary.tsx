import React, { Component, ErrorInfo, ReactNode } from 'react';
import Card from '@/components/common/Card';
import Button from '@/src/components/common/Button';
import { Icon } from '@/components/icons/Icon';

const AlertTriangleIcon = () => <Icon className="h-16 w-16 text-red-500 mx-auto mb-4"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" x2="12" y1="9" y2="13"></line><line x1="12" x2="12.01" y1="17" y2="17"></line></Icon>;

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    // Atualiza o estado para que a próxima renderização mostre a UI de fallback.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Você também pode registrar o erro em um serviço de relatórios de erros
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center p-4">
            <Card className="text-center max-w-lg w-full">
                <AlertTriangleIcon />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    Oops! Algo deu errado.
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Nossa equipe de vigilância já foi notificada. Tente recarregar a página.
                </p>
                <Button 
                    onClick={() => window.location.reload()}
                    variant="primary"
                >
                    Recarregar Página
                </Button>
            </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;