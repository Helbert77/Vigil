/**
 * Exemplo de Uso dos Padrões Implementados
 * 
 * Este arquivo demonstra como usar os padrões Factory, Observer,
 * Lazy Loading e Logger de forma integrada no aplicativo.
 */

import React, { useEffect, useState } from 'react';
import { componentFactory, createIcon, createModal, createButton } from '@/src/factories/ComponentFactory';
import { globalEvents, useEventSubscription, emitNotification, emitUserAction } from '@/src/patterns/Observer';
import { lazyLoadingManager, createLazyComponent, recordPageUsage } from '@/src/utils/LazyLoadingManager';
import { logger, uiLogger, performanceLogger } from '@/src/utils/Logger';

/**
 * Componente de exemplo que demonstra todos os padrões
 */
export const PatternUsageExample: React.FC = () => {
  const [notifications, setNotifications] = useState<string[]>([]);
  const [performanceStats, setPerformanceStats] = useState<any>(null);

  // Exemplo de uso do padrão Observer
  useEventSubscription(
    {
      id: 'pattern-example-observer',
      eventTypes: ['notification', 'user_action']
    },
    (event) => {
      uiLogger.info('Evento recebido no exemplo', event);
      
      if (event.type === 'notification') {
        setNotifications(prev => [...prev, event.payload.message]);
      }
    },
    []
  );

  useEffect(() => {
    // Registra uso da página para lazy loading
    recordPageUsage('/pattern-example');
    
    // Log de inicialização
    logger.info('PatternUsageExample inicializado', { component: 'PatternUsageExample' });
    
    // Obtém estatísticas de performance
    const stats = lazyLoadingManager.getPerformanceStats();
    setPerformanceStats(stats);
    
    performanceLogger.info('Estatísticas de lazy loading obtidas', stats);
  }, []);

  // Exemplo de uso do Factory Pattern para ícones
  const EyeIcon = createIcon({
    iconType: 'eye',
    size: 'medium',
    className: 'text-blue-500'
  });

  const CheckIcon = createIcon({
    iconType: 'check',
    size: 'small',
    className: 'text-green-500'
  });

  // Exemplo de uso do Factory Pattern para botões
  const PrimaryButton = createButton({
    buttonType: 'primary',
    label: 'Emitir Notificação',
    onClick: () => {
      emitNotification('Notificação de exemplo emitida!', 'success');
      uiLogger.info('Botão de notificação clicado');
    }
  });

  const SecondaryButton = createButton({
    buttonType: 'secondary',
    label: 'Ação do Usuário',
    onClick: () => {
      emitUserAction('example_action', 'user123', { timestamp: Date.now() });
      uiLogger.info('Ação do usuário emitida');
    }
  });

  // Exemplo de uso do Factory Pattern para modais
  const [showModal, setShowModal] = useState(false);
  const ExampleModal = createModal({
    modalType: 'generic',
    title: 'Modal de Exemplo',
    content: (
      <div className="p-4">
        <p>Este é um modal criado usando o Factory Pattern!</p>
        <p>Demonstra a criação dinâmica de componentes.</p>
      </div>
    ),
    onClose: () => {
      setShowModal(false);
      uiLogger.info('Modal fechado');
    }
  });

  // Função para testar lazy loading
  const testLazyLoading = () => {
    const LazyTestComponent = createLazyComponent({
      componentPath: '@/components/common/Button',
      preload: true,
      priority: 'high',
      cacheKey: 'test-lazy-button'
    });

    performanceLogger.info('Componente lazy criado para teste');
    return LazyTestComponent;
  };

  // Função para demonstrar diferentes níveis de log
  const demonstrateLogging = () => {
    logger.debug('Log de debug - informação detalhada', { detail: 'exemplo' });
    logger.info('Log de informação - operação normal', { operation: 'demo' });
    logger.warn('Log de aviso - algo pode estar errado', { warning: 'exemplo' });
    logger.error('Log de erro - algo deu errado', new Error('Erro de exemplo'));
    
    uiLogger.info('Demonstração de logging concluída');
  };

  // Função para obter estatísticas do logger
  const getLoggerStats = () => {
    const stats = logger.getStats();
    logger.info('Estatísticas do logger obtidas', stats);
    return stats;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Exemplo de Uso dos Padrões Implementados</h1>
      
      {/* Seção Factory Pattern */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <EyeIcon className="mr-2" />
          Factory Pattern - Componentes
        </h2>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <p className="mb-4">Ícones criados dinamicamente:</p>
          <div className="flex items-center space-x-4 mb-4">
            <EyeIcon />
            <CheckIcon />
            <span>Ícones criados usando Factory Pattern</span>
          </div>
          
          <p className="mb-4">Botões criados dinamicamente:</p>
          <div className="flex space-x-4 mb-4">
            <PrimaryButton />
            <SecondaryButton />
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Abrir Modal
            </button>
          </div>
        </div>
      </section>

      {/* Seção Observer Pattern */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Observer Pattern - Eventos</h2>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <p className="mb-4">Notificações recebidas via Observer:</p>
          <div className="bg-white dark:bg-gray-700 p-3 rounded max-h-32 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-gray-500">Nenhuma notificação ainda...</p>
            ) : (
              notifications.map((notification, index) => (
                <div key={index} className="mb-1 p-2 bg-blue-50 dark:bg-blue-900 rounded">
                  {notification}
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Seção Lazy Loading */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Lazy Loading Inteligente</h2>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <p className="mb-4">Estatísticas de Performance:</p>
          {performanceStats && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Tempo médio de carregamento:</strong> {performanceStats.averageLoadTime.toFixed(2)}ms
              </div>
              <div>
                <strong>Taxa de cache hit:</strong> {performanceStats.cacheHitRate.toFixed(1)}%
              </div>
              <div>
                <strong>Efetividade do preload:</strong> {performanceStats.preloadEffectiveness.toFixed(1)}%
              </div>
              <div>
                <strong>Total de componentes:</strong> {performanceStats.totalComponents}
              </div>
            </div>
          )}
          
          <button
            onClick={testLazyLoading}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Testar Lazy Loading
          </button>
        </div>
      </section>

      {/* Seção Sistema de Logging */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Sistema de Logging</h2>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <p className="mb-4">Demonstração dos diferentes níveis de log:</p>
          <div className="flex space-x-4 mb-4">
            <button
              onClick={demonstrateLogging}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Demonstrar Logging
            </button>
            <button
              onClick={getLoggerStats}
              className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
            >
              Ver Estatísticas
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Verifique o console do navegador para ver os logs em ação.
          </p>
        </div>
      </section>

      {/* Modal de exemplo */}
      {showModal && <ExampleModal />}

      {/* Informações adicionais */}
      <section className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Benefícios Implementados:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>Factory Pattern:</strong> Criação centralizada e configurável de componentes</li>
          <li><strong>Observer Pattern:</strong> Comunicação desacoplada entre componentes</li>
          <li><strong>Lazy Loading:</strong> Carregamento otimizado com preloading inteligente</li>
          <li><strong>Sistema de Logging:</strong> Debugging estruturado e configurável</li>
        </ul>
      </section>
    </div>
  );
};

export default PatternUsageExample;