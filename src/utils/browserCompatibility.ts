/**
 * Utilitário para compatibilidade cross-browser
 * Detecta navegadores e implementa fallbacks específicos
 */

export interface BrowserInfo {
  name: string;
  version: string;
  isChrome: boolean;
  isBrave: boolean;
  isTrae: boolean;
  isFirefox: boolean;
  isSafari: boolean;
  isEdge: boolean;
  supportsBackdropFilter: boolean;
  supportsScrollbarStyling: boolean;
  supportsCustomProperties: boolean;
}

/**
 * Detecta informações do navegador
 */
export function detectBrowser(): BrowserInfo {
  const userAgent = navigator.userAgent;
  const vendor = navigator.vendor || '';
  
  // Detecta Brave
  const isBrave = !!(navigator as any).brave && typeof (navigator as any).brave.isBrave === 'function';
  
  // Detecta Trae (assumindo que é baseado em Chromium)
  const isTrae = userAgent.includes('Trae') || vendor.includes('Trae');
  
  // Detecta Chrome (excluindo Brave e Trae)
  const isChrome = userAgent.includes('Chrome') && !isBrave && !isTrae && !userAgent.includes('Edg');
  
  // Outros navegadores
  const isFirefox = userAgent.includes('Firefox');
  const isSafari = userAgent.includes('Safari') && !userAgent.includes('Chrome');
  const isEdge = userAgent.includes('Edg');
  
  // Extrai versão
  let version = 'unknown';
  if (isChrome || isBrave || isTrae) {
    const match = userAgent.match(/Chrome\/(\d+)/);
    version = match ? match[1] : 'unknown';
  } else if (isFirefox) {
    const match = userAgent.match(/Firefox\/(\d+)/);
    version = match ? match[1] : 'unknown';
  } else if (isSafari) {
    const match = userAgent.match(/Version\/(\d+)/);
    version = match ? match[1] : 'unknown';
  }
  
  // Detecta suporte a recursos
  const supportsBackdropFilter = CSS.supports('backdrop-filter', 'blur(10px)') || 
                                 CSS.supports('-webkit-backdrop-filter', 'blur(10px)');
  
  const supportsScrollbarStyling = 'WebkitAppearance' in document.documentElement.style;
  
  const supportsCustomProperties = CSS.supports('color', 'var(--test)');
  
  return {
    name: isBrave ? 'Brave' : isTrae ? 'Trae' : isChrome ? 'Chrome' : 
          isFirefox ? 'Firefox' : isSafari ? 'Safari' : isEdge ? 'Edge' : 'Unknown',
    version,
    isChrome,
    isBrave,
    isTrae,
    isFirefox,
    isSafari,
    isEdge,
    supportsBackdropFilter,
    supportsScrollbarStyling,
    supportsCustomProperties
  };
}

/**
 * Aplica classes CSS específicas do navegador ao body
 */
export function applyBrowserClasses(): void {
  const browser = detectBrowser();
  const body = document.body;
  
  // Remove classes anteriores
  body.classList.remove('browser-chrome', 'browser-brave', 'browser-trae', 
                       'browser-firefox', 'browser-safari', 'browser-edge');
  
  // Adiciona classe específica do navegador
  if (browser.isChrome) body.classList.add('browser-chrome');
  if (browser.isBrave) body.classList.add('browser-brave');
  if (browser.isTrae) body.classList.add('browser-trae');
  if (browser.isFirefox) body.classList.add('browser-firefox');
  if (browser.isSafari) body.classList.add('browser-safari');
  if (browser.isEdge) body.classList.add('browser-edge');
  
  // Adiciona classes de suporte a recursos
  if (!browser.supportsBackdropFilter) body.classList.add('no-backdrop-filter');
  if (!browser.supportsScrollbarStyling) body.classList.add('no-scrollbar-styling');
  if (!browser.supportsCustomProperties) body.classList.add('no-custom-properties');
}

/**
 * Cria event listeners compatíveis cross-browser
 */
export function addCompatibleEventListener(
  element: Element,
  event: string,
  handler: EventListener,
  options?: AddEventListenerOptions
): () => void {
  const browser = detectBrowser();
  
  // Log de depuração para Chrome
  if (browser.isChrome) {
    console.debug(`[Chrome Debug] Adding event listener: ${event}`, {
      element: element.tagName,
      handler: handler.name || 'anonymous',
      options
    });
  }
  
  try {
    // Tenta usar addEventListener moderno
    element.addEventListener(event, handler, options);
    
    return () => {
      element.removeEventListener(event, handler, options);
      if (browser.isChrome) {
        console.debug(`[Chrome Debug] Removed event listener: ${event}`);
      }
    };
  } catch (error) {
    console.error(`[Browser Compatibility] Failed to add event listener: ${event}`, error);
    
    // Fallback para navegadores mais antigos
    const legacyHandler = (e: Event) => {
      try {
        handler(e);
      } catch (handlerError) {
        console.error(`[Browser Compatibility] Event handler error:`, handlerError);
      }
    };
    
    (element as any).attachEvent?.(`on${event}`, legacyHandler) || 
    ((element as any)[`on${event}`] = legacyHandler);
    
    return () => {
      (element as any).detachEvent?.(`on${event}`, legacyHandler) || 
      ((element as any)[`on${event}`] = null);
    };
  }
}

/**
 * Verifica se um recurso assíncrono está carregando
 */
export function checkAsyncResourceLoading(): Promise<boolean> {
  return new Promise((resolve) => {
    const browser = detectBrowser();
    
    // Verifica se há recursos pendentes
    const checkResources = () => {
      const images = Array.from(document.images);
      const scripts = Array.from(document.scripts);
      const stylesheets = Array.from(document.styleSheets);
      
      const pendingImages = images.filter(img => !img.complete);
      const pendingScripts = scripts.filter(script => !script.src || (script as any).readyState !== 'complete');
      
      if (browser.isChrome) {
        console.debug('[Chrome Debug] Resource loading check:', {
          pendingImages: pendingImages.length,
          pendingScripts: pendingScripts.length,
          totalImages: images.length,
          totalScripts: scripts.length
        });
      }
      
      resolve(pendingImages.length === 0 && pendingScripts.length === 0);
    };
    
    // Verifica imediatamente e após um pequeno delay
    checkResources();
    setTimeout(checkResources, 100);
  });
}

/**
 * Implementa event bubbling/capturing compatível
 */
export function handleEventPropagation(
  event: Event,
  stopPropagation: boolean = false,
  preventDefault: boolean = false
): void {
  const browser = detectBrowser();
  
  try {
    if (preventDefault) {
      event.preventDefault();
    }
    
    if (stopPropagation) {
      event.stopPropagation();
      // Fallback para navegadores mais antigos
      if ((event as any).cancelBubble !== undefined) {
        (event as any).cancelBubble = true;
      }
    }
    
    if (browser.isChrome) {
      console.debug('[Chrome Debug] Event propagation handled:', {
        type: event.type,
        target: (event.target as Element)?.tagName,
        stopPropagation,
        preventDefault
      });
    }
  } catch (error) {
    console.error('[Browser Compatibility] Event propagation error:', error);
  }
}

/**
 * Aplica estilos CSS compatíveis cross-browser
 */
export function applyCompatibleStyles(element: HTMLElement, styles: Record<string, string>): void {
  const browser = detectBrowser();
  
  Object.entries(styles).forEach(([property, value]) => {
    try {
      // Aplica propriedade principal
      element.style.setProperty(property, value);
      
      // Adiciona prefixos específicos do navegador se necessário
      if (property.includes('backdrop-filter') && !browser.supportsBackdropFilter) {
        element.style.setProperty('-webkit-backdrop-filter', value);
      }
      
      if (property.includes('user-select')) {
        element.style.setProperty('-webkit-user-select', value);
        element.style.setProperty('-moz-user-select', value);
        element.style.setProperty('-ms-user-select', value);
      }
      
      if (property.includes('transform')) {
        element.style.setProperty('-webkit-transform', value);
        element.style.setProperty('-moz-transform', value);
        element.style.setProperty('-ms-transform', value);
      }
      
    } catch (error) {
      console.warn(`[Browser Compatibility] Failed to apply style ${property}: ${value}`, error);
    }
  });
  
  if (browser.isChrome) {
    console.debug('[Chrome Debug] Applied compatible styles:', styles);
  }
}

/**
 * Inicializa compatibilidade cross-browser
 */
export function initializeBrowserCompatibility(): void {
  const browser = detectBrowser();
  
  console.log('[Browser Compatibility] Detected browser:', browser);
  
  // Aplica classes CSS específicas do navegador
  applyBrowserClasses();
  
  // Configura políticas de segurança específicas do Chrome
  if (browser.isChrome) {
    // Verifica se há políticas de segurança restritivas
    const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (csp) {
      console.debug('[Chrome Debug] CSP detected:', csp.getAttribute('content'));
    }
    
    // Monitora erros específicos do Chrome
    window.addEventListener('error', (event) => {
      console.error('[Chrome Debug] Runtime error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      console.error('[Chrome Debug] Unhandled promise rejection:', event.reason);
    });
  }
  
  // Verifica recursos assíncronos
  checkAsyncResourceLoading().then((allLoaded) => {
    if (!allLoaded && browser.isChrome) {
      console.warn('[Chrome Debug] Some resources are still loading');
    }
  });
}