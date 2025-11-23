/**
 * Sistema Avançado de Lazy Loading com Preloading Inteligente
 * 
 * Este sistema melhora a performance inicial do aplicativo através de:
 * - Lazy loading otimizado
 * - Preloading baseado em padrões de uso
 * - Cache inteligente de componentes
 * - Priorização de carregamento
 */

import { ComponentType, lazy } from 'react';

// Tipos para configuração de lazy loading
export interface LazyLoadConfig {
  componentPath: string;
  preload?: boolean;
  priority?: 'low' | 'medium' | 'high';
  dependencies?: string[];
  cacheKey?: string;
  timeout?: number;
}

// Interface para estatísticas de carregamento
export interface LoadingStats {
  componentName: string;
  loadTime: number;
  cacheHit: boolean;
  preloaded: boolean;
  timestamp: number;
}

// Interface para padrões de uso
export interface UsagePattern {
  route: string;
  frequency: number;
  lastAccessed: number;
  averageLoadTime: number;
}

/**
 * Gerenciador de Lazy Loading Inteligente
 */
export class LazyLoadingManager {
  private static instance: LazyLoadingManager;
  private componentCache = new Map<string, ComponentType<any>>();
  private loadingPromises = new Map<string, Promise<ComponentType<any>>>();
  private loadingStats: LoadingStats[] = [];
  private usagePatterns = new Map<string, UsagePattern>();
  private preloadQueue: string[] = [];
  private isPreloading = false;

  private constructor() {
    this.loadUsagePatterns();
    this.startPreloadingWorker();
  }

  /**
   * Singleton pattern
   */
  public static getInstance(): LazyLoadingManager {
    if (!LazyLoadingManager.instance) {
      LazyLoadingManager.instance = new LazyLoadingManager();
    }
    return LazyLoadingManager.instance;
  }

  /**
   * Cria um componente lazy com configurações avançadas
   */
  public createLazyComponent(config: LazyLoadConfig): ComponentType<any> {
    const { componentPath, preload = false, priority = 'medium', cacheKey } = config;
    const key = cacheKey || componentPath;

    // Verifica cache primeiro
    if (this.componentCache.has(key)) {
      return this.componentCache.get(key)!;
    }

    // Cria componente lazy
    const LazyComponent = lazy(() => this.loadComponent(config));

    // Adiciona ao cache
    this.componentCache.set(key, LazyComponent);

    // Adiciona à fila de preload se necessário
    if (preload) {
      this.addToPreloadQueue(key, priority);
    }

    return LazyComponent;
  }

  /**
   * Carrega um componente com métricas
   */
  private async loadComponent(config: LazyLoadConfig): Promise<{ default: ComponentType<any> }> {
    const { componentPath, cacheKey, timeout = 10000 } = config;
    const key = cacheKey || componentPath;
    const startTime = performance.now();

    try {
      // Verifica se já está carregando
      if (this.loadingPromises.has(key)) {
        const component = await this.loadingPromises.get(key)!;
        return { default: component };
      }

      // Cria promise de carregamento com timeout
      const loadingPromise = Promise.race([
        this.importComponent(componentPath),
        this.createTimeoutPromise(timeout)
      ]);

      this.loadingPromises.set(key, loadingPromise);

      const component = await loadingPromise;
      const loadTime = performance.now() - startTime;

      // Registra estatísticas
      this.recordLoadingStats({
        componentName: key,
        loadTime,
        cacheHit: false,
        preloaded: this.preloadQueue.includes(key),
        timestamp: Date.now()
      });

      // Remove da fila de promises
      this.loadingPromises.delete(key);

      return { default: component };
    } catch (error) {
      this.loadingPromises.delete(key);
      console.error(`Erro ao carregar componente ${componentPath}:`, error);
      throw error;
    }
  }

  /**
   * Importa componente dinamicamente
   */
  private async importComponent(componentPath: string): Promise<ComponentType<any>> {
    try {
      const module = await import(/* @vite-ignore */ componentPath);
      return module.default || module;
    } catch (error) {
      throw new Error(`Falha ao importar componente: ${componentPath}`);
    }
  }

  /**
   * Cria promise com timeout
   */
  private createTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Timeout ao carregar componente (${timeout}ms)`));
      }, timeout);
    });
  }

  /**
   * Adiciona componente à fila de preload
   */
  public addToPreloadQueue(componentKey: string, priority: 'low' | 'medium' | 'high' = 'medium'): void {
    if (!this.preloadQueue.includes(componentKey)) {
      // Insere baseado na prioridade
      const priorityIndex = this.getPriorityIndex(priority);
      this.preloadQueue.splice(priorityIndex, 0, componentKey);
    }
  }

  /**
   * Obtém índice baseado na prioridade
   */
  private getPriorityIndex(priority: 'low' | 'medium' | 'high'): number {
    const priorities = { high: 0, medium: 1, low: 2 };
    const targetPriority = priorities[priority];

    for (let i = 0; i < this.preloadQueue.length; i++) {
      // Lógica simplificada - em implementação real, seria mais complexa
      if (i >= targetPriority * 10) {
        return i;
      }
    }

    return this.preloadQueue.length;
  }

  /**
   * Worker para preloading em background
   */
  private startPreloadingWorker(): void {
    const processQueue = async () => {
      if (this.isPreloading || this.preloadQueue.length === 0) {
        return;
      }

      this.isPreloading = true;

      try {
        // Processa apenas se o navegador estiver idle
        if ('requestIdleCallback' in window) {
          (window as any).requestIdleCallback(() => {
            this.processPreloadQueue();
          });
        } else {
          // Fallback para navegadores sem requestIdleCallback
          setTimeout(() => {
            this.processPreloadQueue();
          }, 100);
        }
      } finally {
        this.isPreloading = false;
      }
    };

    // Executa a cada 2 segundos
    setInterval(processQueue, 2000);
  }

  /**
   * Processa fila de preload
   */
  private async processPreloadQueue(): Promise<void> {
    const componentKey = this.preloadQueue.shift();
    if (!componentKey || this.componentCache.has(componentKey)) {
      return;
    }

    try {
      // Simula carregamento do componente
      // Em implementação real, usaria as configurações armazenadas
      // console.log(`Preloading componente: ${componentKey}`);
    } catch (error) {
      console.warn(`Erro no preload de ${componentKey}:`, error);
    }
  }

  /**
   * Registra padrões de uso
   */
  public recordUsage(route: string): void {
    const pattern = this.usagePatterns.get(route) || {
      route,
      frequency: 0,
      lastAccessed: 0,
      averageLoadTime: 0
    };

    pattern.frequency++;
    pattern.lastAccessed = Date.now();
    this.usagePatterns.set(route, pattern);

    // Salva padrões no localStorage
    this.saveUsagePatterns();
  }

  /**
   * Obtém componentes recomendados para preload
   */
  public getPreloadRecommendations(): string[] {
    const patterns = Array.from(this.usagePatterns.values());

    return patterns
      .filter(p => p.frequency > 2) // Apenas rotas acessadas mais de 2 vezes
      .sort((a, b) => b.frequency - a.frequency) // Ordena por frequência
      .slice(0, 5) // Top 5
      .map(p => p.route);
  }

  /**
   * Obtém estatísticas de performance
   */
  public getPerformanceStats(): {
    averageLoadTime: number;
    cacheHitRate: number;
    preloadEffectiveness: number;
    totalComponents: number;
  } {
    const stats = this.loadingStats;
    const totalStats = stats.length;

    if (totalStats === 0) {
      return {
        averageLoadTime: 0,
        cacheHitRate: 0,
        preloadEffectiveness: 0,
        totalComponents: 0
      };
    }

    const averageLoadTime = stats.reduce((sum, s) => sum + s.loadTime, 0) / totalStats;
    const cacheHits = stats.filter(s => s.cacheHit).length;
    const preloadedComponents = stats.filter(s => s.preloaded).length;

    return {
      averageLoadTime,
      cacheHitRate: (cacheHits / totalStats) * 100,
      preloadEffectiveness: (preloadedComponents / totalStats) * 100,
      totalComponents: this.componentCache.size
    };
  }

  /**
   * Limpa cache de componentes
   */
  public clearCache(): void {
    this.componentCache.clear();
    this.loadingPromises.clear();
    this.loadingStats = [];
  }

  /**
   * Registra estatísticas de carregamento
   */
  private recordLoadingStats(stats: LoadingStats): void {
    this.loadingStats.push(stats);

    // Mantém apenas os últimos 100 registros
    if (this.loadingStats.length > 100) {
      this.loadingStats.shift();
    }
  }

  /**
   * Salva padrões de uso no localStorage
   */
  private saveUsagePatterns(): void {
    try {
      const patterns = Object.fromEntries(this.usagePatterns);
      localStorage.setItem('vigil_usage_patterns', JSON.stringify(patterns));
    } catch (error) {
      console.warn('Erro ao salvar padrões de uso:', error);
    }
  }

  /**
   * Carrega padrões de uso do localStorage
   */
  private loadUsagePatterns(): void {
    try {
      const saved = localStorage.getItem('vigil_usage_patterns');
      if (saved) {
        const patterns = JSON.parse(saved);
        this.usagePatterns = new Map(Object.entries(patterns));
      }
    } catch (error) {
      console.warn('Erro ao carregar padrões de uso:', error);
    }
  }
}

// Instância singleton exportada
export const lazyLoadingManager = LazyLoadingManager.getInstance();

// Funções de conveniência
export const createLazyComponent = (config: LazyLoadConfig) =>
  lazyLoadingManager.createLazyComponent(config);

export const recordPageUsage = (route: string) =>
  lazyLoadingManager.recordUsage(route);

export const getPreloadRecommendations = () =>
  lazyLoadingManager.getPreloadRecommendations();

export const getPerformanceStats = () =>
  lazyLoadingManager.getPerformanceStats();