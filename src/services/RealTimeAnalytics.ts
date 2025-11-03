import { logger } from '../utils/Logger';

export interface RealTimeStats {
  downloads: number;
  views: number;
  lastAccessed: string;
  publishedDate: string;
  isUpdating: boolean;
}

export interface ActivityLevel {
  level: 'normal' | 'peak';
  updateInterval: number;
}

export interface AnalyticsSubscription {
  itemId: string;
  callback: (stats: RealTimeStats) => void;
  unsubscribe: () => void;
}

class RealTimeAnalyticsService {
  private readonly STORAGE_KEY = 'vigil_realtime_analytics';
  private analytics: { [itemId: string]: RealTimeStats } = {};
  private subscriptions: Map<string, Set<(stats: RealTimeStats) => void>> = new Map();
  private updateIntervals: Map<string, NodeJS.Timeout> = new Map();
  private activityLevel: ActivityLevel = { level: 'normal', updateInterval: 30000 };
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      await this.loadFromStorage();
      this.detectActivityLevel();
      this.isInitialized = true;
      logger.info('RealTimeAnalytics inicializado', undefined, 'library', 'RealTimeAnalytics');
    } catch (error) {
      logger.error('Erro ao inicializar RealTimeAnalytics', error, 'library', 'RealTimeAnalytics');
    }
  }

  private async loadFromStorage(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.analytics = JSON.parse(stored);
        logger.info('Analytics em tempo real carregados', { count: Object.keys(this.analytics).length }, 'library', 'RealTimeAnalytics');
      }
    } catch (error) {
      logger.error('Erro ao carregar analytics do localStorage', error, 'library', 'RealTimeAnalytics');
      this.analytics = {};
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.analytics));
    } catch (error) {
      logger.error('Erro ao salvar analytics', error, 'library', 'RealTimeAnalytics');
    }
  }

  private detectActivityLevel(): void {
    // Simula detecção de picos de atividade baseado no número de assinantes ativos
    const totalSubscriptions = Array.from(this.subscriptions.values())
      .reduce((sum, callbacks) => sum + callbacks.size, 0);

    const newLevel: ActivityLevel = totalSubscriptions > 5 
      ? { level: 'peak', updateInterval: 10000 }
      : { level: 'normal', updateInterval: 30000 };

    if (newLevel.level !== this.activityLevel.level) {
      this.activityLevel = newLevel;
      logger.info(`Nível de atividade alterado para ${newLevel.level}`, { 
        interval: newLevel.updateInterval,
        subscriptions: totalSubscriptions 
      }, 'library', 'RealTimeAnalytics');
      
      // Reinicia todos os intervalos com o novo tempo
      this.restartAllIntervals();
    }
  }

  private restartAllIntervals(): void {
    // Para todos os intervalos existentes
    this.updateIntervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.updateIntervals.clear();

    // Reinicia com o novo intervalo
    this.subscriptions.forEach((callbacks, itemId) => {
      if (callbacks.size > 0) {
        this.startUpdateInterval(itemId);
      }
    });
  }

  private startUpdateInterval(itemId: string): void {
    if (this.updateIntervals.has(itemId)) {
      clearInterval(this.updateIntervals.get(itemId)!);
    }

    const interval = setInterval(async () => {
      try {
        await this.fetchAndUpdateStats(itemId);
      } catch (error) {
        logger.error(`Erro ao atualizar stats para ${itemId}`, error, 'library', 'RealTimeAnalytics');
      }
    }, this.activityLevel.updateInterval);

    this.updateIntervals.set(itemId, interval);
  }

  private async fetchAndUpdateStats(itemId: string): Promise<void> {
    // Simula chamada à API real com dados realistas
    const currentStats = this.analytics[itemId] || this.createInitialStats(itemId);
    
    // Marca como atualizando
    currentStats.isUpdating = true;
    this.notifySubscribers(itemId, currentStats);

    try {
      // Simula latência da API
      await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100));

      // Simula incrementos realistas baseados em atividade
      const viewIncrement = Math.floor(Math.random() * 5); // 0-4 visualizações
      const downloadIncrement = Math.floor(Math.random() * 2); // 0-1 downloads

      const updatedStats: RealTimeStats = {
        ...currentStats,
        views: currentStats.views + viewIncrement,
        downloads: currentStats.downloads + downloadIncrement,
        lastAccessed: new Date().toISOString(),
        isUpdating: false
      };

      this.analytics[itemId] = updatedStats;
      this.saveToStorage();
      this.notifySubscribers(itemId, updatedStats);

      logger.debug(`Stats atualizados para ${itemId}`, {
        views: updatedStats.views,
        downloads: updatedStats.downloads,
        viewIncrement,
        downloadIncrement
      }, 'library', 'RealTimeAnalytics');

    } catch (error) {
      currentStats.isUpdating = false;
      this.notifySubscribers(itemId, currentStats);
      throw error;
    }
  }

  private createInitialStats(itemId: string): RealTimeStats {
    // Cria stats iniciais com dados simulados realistas
    const baseViews = Math.floor(Math.random() * 1000) + 100;
    const baseDownloads = Math.floor(baseViews * 0.1); // ~10% conversion rate
    
    return {
      views: baseViews,
      downloads: baseDownloads,
      lastAccessed: new Date().toISOString(),
      publishedDate: this.generateRealisticPublishDate(),
      isUpdating: false
    };
  }

  private generateRealisticPublishDate(): string {
    // Gera uma data de publicação realística (últimos 2 anos)
    const now = new Date();
    const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
    const randomTime = twoYearsAgo.getTime() + Math.random() * (now.getTime() - twoYearsAgo.getTime());
    return new Date(randomTime).toISOString();
  }

  private notifySubscribers(itemId: string, stats: RealTimeStats): void {
    const callbacks = this.subscriptions.get(itemId);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(stats);
        } catch (error) {
          logger.error(`Erro ao notificar subscriber para ${itemId}`, error, 'library', 'RealTimeAnalytics');
        }
      });
    }
  }

  public async subscribe(itemId: string, callback: (stats: RealTimeStats) => void): Promise<AnalyticsSubscription> {
    await this.initialize();

    if (!this.subscriptions.has(itemId)) {
      this.subscriptions.set(itemId, new Set());
    }

    const callbacks = this.subscriptions.get(itemId)!;
    callbacks.add(callback);

    // Inicia o intervalo de atualização se for o primeiro subscriber
    if (callbacks.size === 1) {
      this.startUpdateInterval(itemId);
    }

    // Detecta mudanças no nível de atividade
    this.detectActivityLevel();

    // Busca dados iniciais se não existirem
    if (!this.analytics[itemId]) {
      this.analytics[itemId] = this.createInitialStats(itemId);
      this.saveToStorage();
    }

    // Notifica imediatamente com os dados atuais
    callback(this.analytics[itemId]);

    // Retorna objeto de subscription
    return {
      itemId,
      callback,
      unsubscribe: () => this.unsubscribe(itemId, callback)
    };
  }

  public unsubscribe(itemId: string, callback: (stats: RealTimeStats) => void): void {
    const callbacks = this.subscriptions.get(itemId);
    if (callbacks) {
      callbacks.delete(callback);

      // Para o intervalo se não há mais subscribers
      if (callbacks.size === 0) {
        const interval = this.updateIntervals.get(itemId);
        if (interval) {
          clearInterval(interval);
          this.updateIntervals.delete(itemId);
        }
        this.subscriptions.delete(itemId);
      }

      // Detecta mudanças no nível de atividade
      this.detectActivityLevel();
    }
  }

  public async getStats(itemId: string): Promise<RealTimeStats> {
    await this.initialize();
    
    if (!this.analytics[itemId]) {
      this.analytics[itemId] = this.createInitialStats(itemId);
      this.saveToStorage();
    }

    return { ...this.analytics[itemId] };
  }

  public async incrementView(itemId: string): Promise<void> {
    await this.initialize();
    
    if (!this.analytics[itemId]) {
      this.analytics[itemId] = this.createInitialStats(itemId);
    }

    this.analytics[itemId].views += 1;
    this.analytics[itemId].lastAccessed = new Date().toISOString();
    this.saveToStorage();
    this.notifySubscribers(itemId, this.analytics[itemId]);

    logger.info('Visualização incrementada em tempo real', { 
      itemId, 
      totalViews: this.analytics[itemId].views 
    }, 'library', 'RealTimeAnalytics');
  }

  public async incrementDownload(itemId: string): Promise<void> {
    await this.initialize();
    
    if (!this.analytics[itemId]) {
      this.analytics[itemId] = this.createInitialStats(itemId);
    }

    this.analytics[itemId].downloads += 1;
    this.analytics[itemId].lastAccessed = new Date().toISOString();
    this.saveToStorage();
    this.notifySubscribers(itemId, this.analytics[itemId]);

    logger.info('Download incrementado em tempo real', { 
      itemId, 
      totalDownloads: this.analytics[itemId].downloads 
    }, 'library', 'RealTimeAnalytics');
  }

  public getActivityLevel(): ActivityLevel {
    return { ...this.activityLevel };
  }

  public cleanup(): void {
    // Limpa todos os intervalos
    this.updateIntervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.updateIntervals.clear();
    this.subscriptions.clear();
    this.isInitialized = false;
  }
}

export const realTimeAnalytics = new RealTimeAnalyticsService();