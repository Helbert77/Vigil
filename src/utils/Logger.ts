/**
 * Sistema de Logging Configurável
 * 
 * Este sistema fornece logging estruturado com diferentes níveis,
 * formatação personalizada e capacidades de filtragem para debugging.
 */

// Níveis de log disponíveis
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

// Interface para entrada de log
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  category?: string;
  data?: any;
  stack?: string;
  userId?: string;
  sessionId?: string;
  component?: string;
}

// Interface para configuração do logger
export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableStorage: boolean;
  maxStorageEntries: number;
  categories?: string[];
  formatters?: {
    console?: (entry: LogEntry) => string;
    storage?: (entry: LogEntry) => string;
  };
  filters?: Array<(entry: LogEntry) => boolean>;
}

// Interface para estatísticas de log
export interface LogStats {
  totalEntries: number;
  entriesByLevel: Record<LogLevel, number>;
  entriesByCategory: Record<string, number>;
  oldestEntry?: number;
  newestEntry?: number;
}

/**
 * Classe principal do Logger
 */
export class Logger {
  private static instance: Logger;
  private config: LoggerConfig;
  private entries: LogEntry[] = [];
  private sessionId: string;

  private constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enableStorage: true,
      maxStorageEntries: 1000,
      categories: [],
      ...config
    };

    this.sessionId = this.generateSessionId();
    this.loadStoredEntries();
  }

  /**
   * Singleton pattern
   */
  public static getInstance(config?: Partial<LoggerConfig>): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(config);
    }
    return Logger.instance;
  }

  /**
   * Atualiza configuração do logger
   */
  public configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Log de debug
   */
  public debug(message: string, data?: any, category?: string, component?: string): void {
    this.log(LogLevel.DEBUG, message, data, category, component);
  }

  /**
   * Log de informação
   */
  public info(message: string, data?: any, category?: string, component?: string): void {
    this.log(LogLevel.INFO, message, data, category, component);
  }

  /**
   * Log de aviso
   */
  public warn(message: string, data?: any, category?: string, component?: string): void {
    this.log(LogLevel.WARN, message, data, category, component);
  }

  /**
   * Log de erro
   */
  public error(message: string, error?: Error | any, category?: string, component?: string): void {
    const stack = error instanceof Error ? error.stack : undefined;
    this.log(LogLevel.ERROR, message, error, category, component, stack);
  }

  /**
   * Log fatal
   */
  public fatal(message: string, error?: Error | any, category?: string, component?: string): void {
    const stack = error instanceof Error ? error.stack : undefined;
    this.log(LogLevel.FATAL, message, error, category, component, stack);
  }

  /**
   * Método principal de logging
   */
  private log(
    level: LogLevel,
    message: string,
    data?: any,
    category?: string,
    component?: string,
    stack?: string
  ): void {
    // Verifica se o nível está habilitado
    if (level < this.config.level) {
      return;
    }

    // Verifica filtros de categoria
    if (this.config.categories && this.config.categories.length > 0) {
      if (!category || !this.config.categories.includes(category)) {
        return;
      }
    }

    // Cria entrada de log
    const entry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      category,
      data,
      stack,
      sessionId: this.sessionId,
      component
    };

    // Aplica filtros personalizados
    if (this.config.filters) {
      const shouldLog = this.config.filters.every(filter => filter(entry));
      if (!shouldLog) {
        return;
      }
    }

    // Adiciona à lista de entradas
    if (this.config.enableStorage) {
      this.addToStorage(entry);
    }

    // Log no console
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }
  }

  /**
   * Adiciona entrada ao armazenamento
   */
  private addToStorage(entry: LogEntry): void {
    this.entries.push(entry);

    // Mantém apenas o número máximo de entradas
    if (this.entries.length > this.config.maxStorageEntries) {
      this.entries.shift();
    }

    // Salva no localStorage periodicamente
    this.saveToLocalStorage();
  }

  /**
   * Log no console com formatação
   */
  private logToConsole(entry: LogEntry): void {
    const formatter = this.config.formatters?.console || this.defaultConsoleFormatter;
    const formattedMessage = formatter(entry);

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage, entry.data);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, entry.data);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, entry.data);
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage, entry.data, entry.stack);
        break;
      case LogLevel.FATAL:
        console.error(`🔥 FATAL: ${formattedMessage}`, entry.data, entry.stack);
        break;
    }
  }

  /**
   * Formatador padrão para console
   */
  private defaultConsoleFormatter = (entry: LogEntry): string => {
    const timestamp = new Date(entry.timestamp).toISOString();
    const levelName = LogLevel[entry.level];
    const category = entry.category ? `[${entry.category}]` : '';
    const component = entry.component ? `{${entry.component}}` : '';
    
    return `[${timestamp}] ${levelName} ${category}${component} ${entry.message}`;
  };

  /**
   * Obtém entradas de log com filtros
   */
  public getEntries(filter?: {
    level?: LogLevel;
    category?: string;
    component?: string;
    since?: number;
    limit?: number;
  }): LogEntry[] {
    let filtered = [...this.entries];

    if (filter) {
      if (filter.level !== undefined) {
        filtered = filtered.filter(entry => entry.level >= filter.level!);
      }

      if (filter.category) {
        filtered = filtered.filter(entry => entry.category === filter.category);
      }

      if (filter.component) {
        filtered = filtered.filter(entry => entry.component === filter.component);
      }

      if (filter.since) {
        filtered = filtered.filter(entry => entry.timestamp >= filter.since!);
      }

      if (filter.limit) {
        filtered = filtered.slice(-filter.limit);
      }
    }

    return filtered;
  }

  /**
   * Obtém estatísticas de log
   */
  public getStats(): LogStats {
    const stats: LogStats = {
      totalEntries: this.entries.length,
      entriesByLevel: {
        [LogLevel.DEBUG]: 0,
        [LogLevel.INFO]: 0,
        [LogLevel.WARN]: 0,
        [LogLevel.ERROR]: 0,
        [LogLevel.FATAL]: 0
      },
      entriesByCategory: {}
    };

    this.entries.forEach(entry => {
      stats.entriesByLevel[entry.level]++;
      
      if (entry.category) {
        stats.entriesByCategory[entry.category] = 
          (stats.entriesByCategory[entry.category] || 0) + 1;
      }
    });

    if (this.entries.length > 0) {
      stats.oldestEntry = this.entries[0].timestamp;
      stats.newestEntry = this.entries[this.entries.length - 1].timestamp;
    }

    return stats;
  }

  /**
   * Exporta logs como JSON
   */
  public exportLogs(filter?: Parameters<typeof this.getEntries>[0]): string {
    const entries = this.getEntries(filter);
    return JSON.stringify(entries, null, 2);
  }

  /**
   * Limpa todos os logs
   */
  public clear(): void {
    this.entries = [];
    this.clearLocalStorage();
  }

  /**
   * Cria logger específico para categoria
   */
  public createCategoryLogger(category: string): CategoryLogger {
    return new CategoryLogger(this, category);
  }

  /**
   * Gera ID de sessão único
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Salva logs no localStorage
   */
  private saveToLocalStorage(): void {
    try {
      const recentEntries = this.entries.slice(-100); // Apenas os 100 mais recentes
      localStorage.setItem('vigil_logs', JSON.stringify(recentEntries));
    } catch (error) {
      console.warn('Erro ao salvar logs no localStorage:', error);
    }
  }

  /**
   * Carrega logs do localStorage
   */
  private loadStoredEntries(): void {
    try {
      const stored = localStorage.getItem('vigil_logs');
      if (stored) {
        const entries = JSON.parse(stored);
        this.entries = Array.isArray(entries) ? entries : [];
      }
    } catch (error) {
      console.warn('Erro ao carregar logs do localStorage:', error);
    }
  }

  /**
   * Limpa localStorage
   */
  private clearLocalStorage(): void {
    try {
      localStorage.removeItem('vigil_logs');
    } catch (error) {
      console.warn('Erro ao limpar logs do localStorage:', error);
    }
  }
}

/**
 * Logger específico para categoria
 */
export class CategoryLogger {
  constructor(private logger: Logger, private category: string) {}

  public debug(message: string, data?: any, component?: string): void {
    this.logger.debug(message, data, this.category, component);
  }

  public info(message: string, data?: any, component?: string): void {
    this.logger.info(message, data, this.category, component);
  }

  public warn(message: string, data?: any, component?: string): void {
    this.logger.warn(message, data, this.category, component);
  }

  public error(message: string, error?: Error | any, component?: string): void {
    this.logger.error(message, error, this.category, component);
  }

  public fatal(message: string, error?: Error | any, component?: string): void {
    this.logger.fatal(message, error, this.category, component);
  }
}

// Instância global do logger
export const logger = Logger.getInstance({
  level: process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.INFO,
  enableConsole: true,
  enableStorage: true,
  maxStorageEntries: 500
});

// Loggers específicos para diferentes partes da aplicação
export const authLogger = logger.createCategoryLogger('auth');
export const apiLogger = logger.createCategoryLogger('api');
export const uiLogger = logger.createCategoryLogger('ui');
export const performanceLogger = logger.createCategoryLogger('performance');
export const errorLogger = logger.createCategoryLogger('error');

// Funções de conveniência
export const logDebug = (message: string, data?: any, component?: string) => 
  logger.debug(message, data, undefined, component);

export const logInfo = (message: string, data?: any, component?: string) => 
  logger.info(message, data, undefined, component);

export const logWarn = (message: string, data?: any, component?: string) => 
  logger.warn(message, data, undefined, component);

export const logError = (message: string, error?: Error | any, component?: string) => 
  logger.error(message, error, undefined, component);

export const logFatal = (message: string, error?: Error | any, component?: string) => 
  logger.fatal(message, error, undefined, component);