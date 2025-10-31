import { logger } from '../utils/Logger';

export interface LibraryStats {
  downloads: number;
  views: number;
  lastAccessed: string;
}

export interface LibraryAnalytics {
  [itemId: string]: LibraryStats;
}

class LibraryAnalyticsService {
  private readonly STORAGE_KEY = 'vigil_library_analytics';
  private analytics: LibraryAnalytics = {};

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.analytics = JSON.parse(stored);
        logger.info('Analytics carregados do localStorage', { count: Object.keys(this.analytics).length }, 'library', 'LibraryAnalytics');
      }
    } catch (error) {
      logger.error('Erro ao carregar analytics do localStorage', error, 'library', 'LibraryAnalytics');
      this.analytics = {};
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.analytics));
      logger.debug('Analytics salvos no localStorage', undefined, 'library', 'LibraryAnalytics');
    } catch (error) {
      logger.error('Erro ao salvar analytics no localStorage', error, 'library', 'LibraryAnalytics');
    }
  }

  private getOrCreateStats(itemId: string): LibraryStats {
    if (!this.analytics[itemId]) {
      this.analytics[itemId] = {
        downloads: 0,
        views: 0,
        lastAccessed: new Date().toISOString()
      };
    }
    return this.analytics[itemId];
  }

  public incrementView(itemId: string): void {
    const stats = this.getOrCreateStats(itemId);
    stats.views += 1;
    stats.lastAccessed = new Date().toISOString();
    this.saveToStorage();
    
    logger.info('Visualização incrementada', { 
      itemId, 
      totalViews: stats.views 
    }, 'library', 'LibraryAnalytics');
  }

  public incrementDownload(itemId: string): void {
    const stats = this.getOrCreateStats(itemId);
    stats.downloads += 1;
    stats.lastAccessed = new Date().toISOString();
    this.saveToStorage();
    
    logger.info('Download incrementado', { 
      itemId, 
      totalDownloads: stats.downloads 
    }, 'library', 'LibraryAnalytics');
  }

  public getStats(itemId: string): LibraryStats {
    return this.getOrCreateStats(itemId);
  }

  public getAllStats(): LibraryAnalytics {
    return { ...this.analytics };
  }

  public getTotalStats(): { totalViews: number; totalDownloads: number } {
    const stats = Object.values(this.analytics);
    return {
      totalViews: stats.reduce((sum, stat) => sum + stat.views, 0),
      totalDownloads: stats.reduce((sum, stat) => sum + stat.downloads, 0)
    };
  }

  public getMostPopular(limit: number = 5): Array<{ itemId: string; stats: LibraryStats }> {
    return Object.entries(this.analytics)
      .map(([itemId, stats]) => ({ itemId, stats }))
      .sort((a, b) => (b.stats.views + b.stats.downloads) - (a.stats.views + a.stats.downloads))
      .slice(0, limit);
  }

  public clearStats(): void {
    this.analytics = {};
    localStorage.removeItem(this.STORAGE_KEY);
    logger.info('Analytics limpos', undefined, 'library', 'LibraryAnalytics');
  }

  public exportStats(): string {
    return JSON.stringify(this.analytics, null, 2);
  }

  public importStats(data: string): boolean {
    try {
      const imported = JSON.parse(data);
      this.analytics = imported;
      this.saveToStorage();
      logger.info('Analytics importados com sucesso', undefined, 'library', 'LibraryAnalytics');
      return true;
    } catch (error) {
      logger.error('Erro ao importar analytics', error, 'library', 'LibraryAnalytics');
      return false;
    }
  }
}

export const libraryAnalytics = new LibraryAnalyticsService();