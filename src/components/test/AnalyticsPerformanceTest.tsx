import React, { useState, useEffect, useRef } from 'react';
import { useRealTimeAnalytics, UseRealTimeAnalyticsOptions } from '@/src/hooks/useRealTimeAnalytics';
import { formatNumber, formatDateTime } from '@/src/utils/formatters';
import Card from '@/components/common/Card';
import Button from '@/src/components/common/Button';
import { logger } from '@/src/utils/Logger';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  updateLatency: number;
  errorCount: number;
  successfulUpdates: number;
}

interface BrowserInfo {
  userAgent: string;
  vendor: string;
  language: string;
  cookieEnabled: boolean;
  onLine: boolean;
  platform: string;
  supportsLocalStorage: boolean;
  supportsWebWorkers: boolean;
  supportsIntersectionObserver: boolean;
}

const AnalyticsPerformanceTest: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    updateLatency: 0,
    errorCount: 0,
    successfulUpdates: 0
  });
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null);
  const [testResults, setTestResults] = useState<string[]>([]);
  
  const renderStartTime = useRef<number>(0);
  const updateStartTime = useRef<number>(0);
  
  const analyticsOptions: UseRealTimeAnalyticsOptions = {
    itemId: 'test-item-performance',
    autoStart: false
  };
  
  const {
    stats,
    isLoading,
    error,
    lastUpdate,
    activityLevel,
    isUpdating,
    isActive,
    start,
    stop,
    retry,
    incrementView,
    incrementDownload
  } = useRealTimeAnalytics(analyticsOptions);

  // Detectar informações do navegador
  useEffect(() => {
    const detectBrowserCapabilities = (): BrowserInfo => {
      const nav = navigator as any;
      
      return {
        userAgent: nav.userAgent,
        vendor: nav.vendor || 'Unknown',
        language: nav.language || nav.userLanguage || 'Unknown',
        cookieEnabled: nav.cookieEnabled,
        onLine: nav.onLine,
        platform: nav.platform || 'Unknown',
        supportsLocalStorage: (() => {
          try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
          } catch {
            return false;
          }
        })(),
        supportsWebWorkers: typeof Worker !== 'undefined',
        supportsIntersectionObserver: 'IntersectionObserver' in window
      };
    };

    setBrowserInfo(detectBrowserCapabilities());
  }, []);

  // Medir tempo de renderização
  useEffect(() => {
    renderStartTime.current = performance.now();
  });

  useEffect(() => {
    if (renderStartTime.current > 0) {
      const renderTime = performance.now() - renderStartTime.current;
      setMetrics(prev => ({ ...prev, renderTime }));
    }
  });

  // Monitorar atualizações e latência
  useEffect(() => {
    if (isUpdating) {
      updateStartTime.current = performance.now();
    } else if (updateStartTime.current > 0) {
      const updateLatency = performance.now() - updateStartTime.current;
      setMetrics(prev => ({ 
        ...prev, 
        updateLatency,
        successfulUpdates: prev.successfulUpdates + 1
      }));
      updateStartTime.current = 0;
    }
  }, [isUpdating]);

  // Monitorar erros
  useEffect(() => {
    if (error) {
      setMetrics(prev => ({ ...prev, errorCount: prev.errorCount + 1 }));
    }
  }, [error]);

  // Medir uso de memória (se disponível)
  useEffect(() => {
    const measureMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMetrics(prev => ({ 
          ...prev, 
          memoryUsage: memory.usedJSHeapSize / 1024 / 1024 // MB
        }));
      }
    };

    const interval = setInterval(measureMemory, 5000);
    return () => clearInterval(interval);
  }, []);

  const runStressTest = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    const results: string[] = [];
    
    try {
      // Teste 1: Múltiplas atualizações rápidas
      results.push('🔄 Iniciando teste de múltiplas atualizações...');
      for (let i = 0; i < 50; i++) {
        await incrementView();
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      results.push('✅ Teste de múltiplas atualizações concluído');

      // Teste 2: Atualizações simultâneas
      results.push('🔄 Iniciando teste de atualizações simultâneas...');
      const promises = Array.from({ length: 20 }, () => incrementDownload());
      await Promise.all(promises);
      results.push('✅ Teste de atualizações simultâneas concluído');

      // Teste 3: Teste de recuperação de erro
      results.push('🔄 Testando recuperação de erros...');
      if (error) {
        retry();
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      results.push('✅ Teste de recuperação concluído');

      // Teste 4: Teste de formatação com números grandes
      results.push('🔄 Testando formatação de números grandes...');
      const largeNumbers = [1000, 10000, 100000, 1000000, 10000000];
      largeNumbers.forEach(num => {
        const formatted = formatNumber(num);
        results.push(`  ${num} → ${formatted}`);
      });
      results.push('✅ Teste de formatação concluído');

      results.push('🎉 Todos os testes concluídos com sucesso!');
      
    } catch (testError) {
      results.push(`❌ Erro durante os testes: ${testError}`);
      logger.error('Erro no teste de performance', { error: testError }, 'error', 'PerformanceTest');
    } finally {
      setIsRunning(false);
    }
    
    setTestResults(results);
  };

  const getBrowserCompatibilityScore = (): number => {
    if (!browserInfo) return 0;
    
    let score = 0;
    if (browserInfo.supportsLocalStorage) score += 25;
    if (browserInfo.supportsWebWorkers) score += 25;
    if (browserInfo.supportsIntersectionObserver) score += 25;
    if (browserInfo.cookieEnabled) score += 25;
    
    return score;
  };

  const getPerformanceRating = (): string => {
    const { renderTime, updateLatency, errorCount, successfulUpdates } = metrics;
    
    if (errorCount > successfulUpdates * 0.1) return '❌ Ruim';
    if (renderTime > 100 || updateLatency > 1000) return '⚠️ Médio';
    if (renderTime < 50 && updateLatency < 500) return '✅ Excelente';
    return '🟡 Bom';
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <h2 className="text-2xl font-bold mb-4">Teste de Performance - Analytics em Tempo Real</h2>
        
        {/* Status atual */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200">Visualizações</h3>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatNumber(stats?.views || 0)}
            </p>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 dark:text-green-200">Downloads</h3>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatNumber(stats?.downloads || 0)}
            </p>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 dark:text-purple-200">Status</h3>
            <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
              {isActive ? '🟢 Ativo' : '🔴 Inativo'}
              {isUpdating && ' (Atualizando...)'}
            </p>
          </div>
          
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
            <h3 className="font-semibold text-orange-800 dark:text-orange-200">Atividade</h3>
            <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
              {activityLevel === 'peak' ? '🔥 Pico' : '📊 Normal'}
            </p>
          </div>
        </div>

        {/* Métricas de Performance */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-3">📊 Métricas de Performance</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Render:</span>
              <p className="font-mono">{metrics.renderTime.toFixed(2)}ms</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Latência:</span>
              <p className="font-mono">{metrics.updateLatency.toFixed(2)}ms</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Memória:</span>
              <p className="font-mono">{metrics.memoryUsage.toFixed(2)}MB</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Erros:</span>
              <p className="font-mono text-red-600">{metrics.errorCount}</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Sucessos:</span>
              <p className="font-mono text-green-600">{metrics.successfulUpdates}</p>
            </div>
          </div>
          <div className="mt-3">
            <span className="text-gray-600 dark:text-gray-400">Avaliação: </span>
            <span className="font-semibold">{getPerformanceRating()}</span>
          </div>
        </div>

        {/* Informações do Navegador */}
        {browserInfo && (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-3">🌐 Compatibilidade do Navegador</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Plataforma:</strong> {browserInfo.platform}</p>
                <p><strong>Idioma:</strong> {browserInfo.language}</p>
                <p><strong>Online:</strong> {browserInfo.onLine ? '✅' : '❌'}</p>
              </div>
              <div>
                <p><strong>LocalStorage:</strong> {browserInfo.supportsLocalStorage ? '✅' : '❌'}</p>
                <p><strong>Web Workers:</strong> {browserInfo.supportsWebWorkers ? '✅' : '❌'}</p>
                <p><strong>Intersection Observer:</strong> {browserInfo.supportsIntersectionObserver ? '✅' : '❌'}</p>
              </div>
            </div>
            <div className="mt-3">
              <span className="text-gray-600 dark:text-gray-400">Score de Compatibilidade: </span>
              <span className="font-semibold">{getBrowserCompatibilityScore()}%</span>
            </div>
          </div>
        )}

        {/* Controles de Teste */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button 
            onClick={start} 
            disabled={isActive || isRunning}
            variant="primary"
          >
            Iniciar Analytics
          </Button>
          
          <Button 
            onClick={stop} 
            disabled={!isActive || isRunning}
            variant="secondary"
          >
            Parar Analytics
          </Button>
          
          <Button 
            onClick={runStressTest} 
            disabled={isRunning || !isActive}
            variant="secondary"
          >
            {isRunning ? 'Executando Testes...' : 'Executar Teste de Stress'}
          </Button>
          
          <Button 
            onClick={incrementView} 
            disabled={!isActive || isRunning}
            variant="outline"
          >
            +1 Visualização
          </Button>
          
          <Button 
            onClick={incrementDownload} 
            disabled={!isActive || isRunning}
            variant="outline"
          >
            +1 Download
          </Button>
        </div>

        {/* Resultados dos Testes */}
        {testResults.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">📋 Resultados dos Testes</h3>
            <div className="space-y-1 text-sm font-mono max-h-60 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="text-gray-700 dark:text-gray-300">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Informações de Debug */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
            <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">❌ Erro Detectado</h3>
            <p className="text-red-700 dark:text-red-300 text-sm">{error.message}</p>
            <Button onClick={retry} variant="outline" className="mt-2">
              Tentar Novamente
            </Button>
          </div>
        )}

        {lastUpdate && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            Última atualização: {formatDateTime(lastUpdate)}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AnalyticsPerformanceTest;