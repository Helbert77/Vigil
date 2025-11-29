import React from 'react';
import AnalyticsPerformanceTest from '@/src/components/test/AnalyticsPerformanceTest';
import ErrorBoundary from '@/src/components/common/ErrorBoundary';

const TestAnalytics: React.FC = () => {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
        <div className="container mx-auto py-8">
          <div className="mb-8">
            <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Teste de Analytics em Tempo Real
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Teste de performance, compatibilidade cross-browser e funcionalidades do sistema de analytics.
            </p>
          </div>
          
          <AnalyticsPerformanceTest />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default TestAnalytics;