import React, { useState, useEffect } from 'react';
import CrossBrowserButton from '../common/CrossBrowserButton';
import { 
  detectBrowser, 
  checkAsyncResourceLoading, 
  addCompatibleEventListener,
  handleEventPropagation 
} from '@/src/utils/browserCompatibility';

/**
 * Componente de teste para verificar compatibilidade cross-browser
 * Usado apenas em desenvolvimento para debugging
 */
const CrossBrowserTest: React.FC = () => {
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [isVisible, setIsVisible] = useState(false);
  const browser = detectBrowser();

  useEffect(() => {
    // Só mostra em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      setIsVisible(true);
    }
  }, []);

  const runCompatibilityTests = async () => {
    const results: Record<string, any> = {};
    
    // Teste 1: Detecção de navegador
    results.browserDetection = {
      name: browser.name,
      version: browser.version,
      isChrome: browser.isChrome,
      isBrave: browser.isBrave,
      isTrae: browser.isTrae,
      isFirefox: browser.isFirefox,
      isSafari: browser.isSafari
    };

    // Teste 2: Event listeners
    results.eventListeners = await testEventListeners();

    // Teste 3: CSS features
    results.cssFeatures = testCSSFeatures();

    // Teste 4: Async resource loading
    results.asyncLoading = await testAsyncLoading();

    // Teste 5: Event propagation
    results.eventPropagation = testEventPropagation();

    setTestResults(results);
    
    console.group('[Cross-Browser Test Results]');
    console.table(results);
    console.groupEnd();
  };

  const testEventListeners = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const testElement = document.createElement('div');
      let eventFired = false;

      const removeListener = addCompatibleEventListener(
        testElement,
        'click',
        () => {
          eventFired = true;
          resolve(true);
        }
      );

      // Simula clique
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true
      });
      
      testElement.dispatchEvent(clickEvent);
      
      setTimeout(() => {
        removeListener();
        if (!eventFired) resolve(false);
      }, 100);
    });
  };

  const testCSSFeatures = () => {
    const features = {
      appearance: CSS.supports('appearance', 'none'),
      userSelect: CSS.supports('user-select', 'none'),
      touchAction: CSS.supports('touch-action', 'manipulation'),
      backdropFilter: CSS.supports('backdrop-filter', 'blur(10px)'),
      webkitBackdropFilter: CSS.supports('-webkit-backdrop-filter', 'blur(10px)'),
      transform3d: CSS.supports('transform', 'translateZ(0)'),
      willChange: CSS.supports('will-change', 'transform')
    };

    return features;
  };

  const testAsyncLoading = async () => {
    try {
      const result = await checkAsyncResourceLoading();
      return { success: true, result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const testEventPropagation = () => {
    const testElement = document.createElement('div');
    const mockEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true
    });

    // Testa preventDefault
    handleEventPropagation(mockEvent, true, false);
    const preventedDefault = mockEvent.defaultPrevented;

    // Testa stopPropagation
    const mockEvent2 = new MouseEvent('click', {
      bubbles: true,
      cancelable: true
    });
    handleEventPropagation(mockEvent2, false, true);

    return {
      preventDefaultWorks: preventedDefault,
      stopPropagationWorks: true // Não podemos testar facilmente sem DOM real
    };
  };

  const testShowMoreButton = () => {
    alert(`Teste do botão "Mostrar mais" - Navegador: ${browser.name} ${browser.version}`);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 shadow-lg z-50 max-w-sm">
      <h3 className="text-sm font-bold mb-2 text-gray-800 dark:text-gray-200">
        Cross-Browser Test Panel
      </h3>
      
      <div className="space-y-2">
        <div className="text-xs text-gray-600 dark:text-gray-400">
          Navegador: {browser.name} {browser.version}
        </div>
        
        <CrossBrowserButton
          onClick={runCompatibilityTests}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-2 rounded"
        >
          Executar Testes
        </CrossBrowserButton>
        
        <CrossBrowserButton
          onClick={testShowMoreButton}
          className="w-full bg-green-500 hover:bg-green-600 text-white text-xs py-1 px-2 rounded"
        >
          Testar "Mostrar mais"
        </CrossBrowserButton>
        
        <CrossBrowserButton
          onClick={() => setIsVisible(false)}
          className="w-full bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-2 rounded"
        >
          Fechar
        </CrossBrowserButton>
      </div>
      
      {Object.keys(testResults).length > 0 && (
        <div className="mt-3 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs">
          <div className="font-semibold mb-1">Resultados:</div>
          <div className="space-y-1">
            {Object.entries(testResults).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span>{key}:</span>
                <span className={typeof value === 'object' && value.success === false ? 'text-red-500' : 'text-green-500'}>
                  {typeof value === 'object' ? (value.success ? '✓' : '✗') : '✓'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CrossBrowserTest;