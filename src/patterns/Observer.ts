/**
 * Padrão Observer para sistema de notificações e eventos
 * 
 * Este sistema permite comunicação desacoplada entre componentes,
 * especialmente útil para notificações em tempo real e eventos globais.
 */

// Tipos de eventos suportados
export type EventType = 
  | 'notification'
  | 'user_action'
  | 'post_update'
  | 'message_received'
  | 'session_change'
  | 'ui_state_change'
  | 'error'
  | 'success';

// Interface para dados do evento
export interface EventData {
  type: EventType;
  payload: any;
  timestamp: number;
  source?: string;
  metadata?: Record<string, any>;
}

// Interface para observadores
export interface Observer {
  id: string;
  update: (event: EventData) => void;
  filter?: (event: EventData) => boolean;
}

// Interface para configuração de observador
export interface ObserverConfig {
  id: string;
  eventTypes?: EventType[];
  filter?: (event: EventData) => boolean;
  priority?: number;
}

/**
 * Classe Subject (Observable) - gerencia observadores e notificações
 */
export class EventSubject {
  private observers: Map<string, Observer> = new Map();
  private eventHistory: EventData[] = [];
  private maxHistorySize: number = 100;

  /**
   * Adiciona um observador
   */
  public subscribe(observer: Observer): void {
    this.observers.set(observer.id, observer);
  }

  /**
   * Remove um observador
   */
  public unsubscribe(observerId: string): void {
    this.observers.delete(observerId);
  }

  /**
   * Notifica todos os observadores sobre um evento
   */
  public notify(eventData: EventData): void {
    // Adiciona timestamp se não fornecido
    if (!eventData.timestamp) {
      eventData.timestamp = Date.now();
    }

    // Adiciona ao histórico
    this.addToHistory(eventData);

    // Notifica observadores
    this.observers.forEach(observer => {
      try {
        // Aplica filtro se definido
        if (observer.filter && !observer.filter(eventData)) {
          return;
        }

        observer.update(eventData);
      } catch (error) {
        console.error(`Erro ao notificar observador ${observer.id}:`, error);
      }
    });
  }

  /**
   * Emite um evento
   */
  public emit(type: EventType, payload: any, metadata?: Record<string, any>): void {
    const eventData: EventData = {
      type,
      payload,
      timestamp: Date.now(),
      metadata
    };

    this.notify(eventData);
  }

  /**
   * Obtém o histórico de eventos
   */
  public getHistory(filter?: (event: EventData) => boolean): EventData[] {
    if (filter) {
      return this.eventHistory.filter(filter);
    }
    return [...this.eventHistory];
  }

  /**
   * Limpa o histórico de eventos
   */
  public clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Obtém lista de observadores
   */
  public getObservers(): string[] {
    return Array.from(this.observers.keys());
  }

  /**
   * Adiciona evento ao histórico
   */
  private addToHistory(eventData: EventData): void {
    this.eventHistory.push(eventData);
    
    // Mantém apenas os últimos eventos
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }
}

/**
 * Classe para criar observadores facilmente
 */
export class EventObserver implements Observer {
  public readonly id: string;
  private callback: (event: EventData) => void;
  public filter?: (event: EventData) => boolean;

  constructor(
    id: string,
    callback: (event: EventData) => void,
    config?: Partial<ObserverConfig>
  ) {
    this.id = id;
    this.callback = callback;
    
    if (config?.filter) {
      this.filter = config.filter;
    } else if (config?.eventTypes) {
      this.filter = (event) => config.eventTypes!.includes(event.type);
    }
  }

  public update(event: EventData): void {
    this.callback(event);
  }
}

/**
 * Sistema global de eventos (Singleton)
 */
export class GlobalEventSystem {
  private static instance: GlobalEventSystem;
  private subject: EventSubject;

  private constructor() {
    this.subject = new EventSubject();
  }

  /**
   * Singleton pattern
   */
  public static getInstance(): GlobalEventSystem {
    if (!GlobalEventSystem.instance) {
      GlobalEventSystem.instance = new GlobalEventSystem();
    }
    return GlobalEventSystem.instance;
  }

  /**
   * Subscreve a eventos
   */
  public subscribe(config: ObserverConfig, callback: (event: EventData) => void): () => void {
    const observer = new EventObserver(config.id, callback, config);
    this.subject.subscribe(observer);

    // Retorna função para cancelar subscrição
    return () => this.subject.unsubscribe(config.id);
  }

  /**
   * Emite um evento global
   */
  public emit(type: EventType, payload: any, metadata?: Record<string, any>): void {
    this.subject.emit(type, payload, metadata);
  }

  /**
   * Obtém histórico de eventos
   */
  public getHistory(filter?: (event: EventData) => boolean): EventData[] {
    return this.subject.getHistory(filter);
  }

  /**
   * Remove um observador
   */
  public unsubscribe(observerId: string): void {
    this.subject.unsubscribe(observerId);
  }

  /**
   * Lista observadores ativos
   */
  public getActiveObservers(): string[] {
    return this.subject.getObservers();
  }

  /**
   * Limpa histórico
   */
  public clearHistory(): void {
    this.subject.clearHistory();
  }
}

// Instância global exportada
export const globalEvents = GlobalEventSystem.getInstance();

// Hooks para React (funções de conveniência)
export const useEventSubscription = (
  config: ObserverConfig,
  callback: (event: EventData) => void,
  dependencies: any[] = []
) => {
  const React = require('react');
  
  React.useEffect(() => {
    const unsubscribe = globalEvents.subscribe(config, callback);
    return unsubscribe;
  }, dependencies);
};

// Funções de conveniência para eventos específicos
export const emitNotification = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
  globalEvents.emit('notification', { message, type });
};

export const emitUserAction = (action: string, userId: string, data?: any) => {
  globalEvents.emit('user_action', { action, userId, data });
};

export const emitPostUpdate = (postId: string, updateType: string, data?: any) => {
  globalEvents.emit('post_update', { postId, updateType, data });
};

export const emitMessageReceived = (conversationId: string, message: any) => {
  globalEvents.emit('message_received', { conversationId, message });
};

export const emitSessionChange = (sessionData: any) => {
  globalEvents.emit('session_change', sessionData);
};

export const emitUIStateChange = (component: string, state: any) => {
  globalEvents.emit('ui_state_change', { component, state });
};

export const emitError = (error: Error | string, context?: string) => {
  globalEvents.emit('error', { error: error.toString(), context });
};

export const emitSuccess = (message: string, data?: any) => {
  globalEvents.emit('success', { message, data });
};