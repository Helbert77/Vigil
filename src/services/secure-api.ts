/**
 * Serviço Seguro de API
 * 
 * Este serviço gerencia chamadas para APIs externas de forma segura,
 * sem expor chaves API no frontend. Todas as chamadas são feitas
 * através de Edge Functions do Supabase.
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Interface para resposta de moderação de conteúdo
 */
interface ModerationResponse {
  isAppropriate: boolean;
  confidence: number;
  categories?: {
    toxicity?: number;
    severe_toxicity?: number;
    identity_attack?: number;
    insult?: number;
    profanity?: number;
    threat?: number;
  };
  error?: string;
}

/**
 * Interface para resposta de geração de conteúdo
 */
interface ContentGenerationResponse {
  content: string;
  success: boolean;
  error?: string;
}

/**
 * Interface para configuração de chamada segura
 */
interface SecureApiCallConfig {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  timeout?: number;
  retries?: number;
}

/**
 * Classe para gerenciar chamadas seguras de API
 */
export class SecureApiService {
  private static instance: SecureApiService;
  private readonly defaultTimeout = 30000; // 30 segundos
  private readonly defaultRetries = 3;

  private constructor() { }

  /**
   * Singleton pattern para garantir uma única instância
   */
  public static getInstance(): SecureApiService {
    if (!SecureApiService.instance) {
      SecureApiService.instance = new SecureApiService();
    }
    return SecureApiService.instance;
  }

  /**
   * Realiza uma chamada segura para Edge Function
   */
  private async makeSecureCall<T>(config: SecureApiCallConfig): Promise<T> {
    const { endpoint, method = 'POST', data, timeout = this.defaultTimeout, retries = this.defaultRetries } = config;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const { data: result, error } = await supabase.functions.invoke(endpoint, {
          body: data,
          method,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (error) {
          throw new Error(`Edge Function error: ${error.message}`);
        }

        return result as T;
      } catch (error) {
        lastError = error as Error;

        if (attempt < retries) {
          // Backoff exponencial: 1s, 2s, 4s
          const delay = Math.pow(2, attempt - 1) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
    }

    throw lastError || new Error('Unknown error in secure API call');
  }

  /**
   * Modera conteúdo usando Perspective API de forma segura
   */
  public async moderateContent(content: string): Promise<ModerationResponse> {
    try {
      if (!content || content.trim().length === 0) {
        return {
          isAppropriate: true,
          confidence: 1.0,
          error: 'Empty content provided'
        };
      }

      // Validação básica de entrada
      if (content.length > 10000) {
        return {
          isAppropriate: false,
          confidence: 1.0,
          error: 'Content too long for moderation'
        };
      }

      const response = await this.makeSecureCall<ModerationResponse>({
        endpoint: 'moderar-conteudo',
        data: { content: content.trim() },
        timeout: 15000 // Timeout menor para moderação
      });

      return response;
    } catch (error) {
      console.error('[SecureApiService] Content moderation failed:', error);

      // Fallback: rejeitar conteúdo em caso de erro
      return {
        isAppropriate: false,
        confidence: 0.0,
        error: error instanceof Error ? error.message : 'Unknown moderation error'
      };
    }
  }

  /**
   * Gera conteúdo usando Gemini API de forma segura
   */
  public async generateContent(prompt: string, options?: {
    maxTokens?: number;
    temperature?: number;
    context?: string;
  }): Promise<ContentGenerationResponse> {
    try {
      if (!prompt || prompt.trim().length === 0) {
        return {
          content: '',
          success: false,
          error: 'Empty prompt provided'
        };
      }

      // Validação de entrada
      if (prompt.length > 5000) {
        return {
          content: '',
          success: false,
          error: 'Prompt too long'
        };
      }

      const response = await this.makeSecureCall<ContentGenerationResponse>({
        endpoint: 'generate-content',
        data: {
          prompt: prompt.trim(),
          maxTokens: options?.maxTokens || 1000,
          temperature: options?.temperature || 0.7,
          context: options?.context || ''
        },
        timeout: 45000 // Timeout maior para geração
      });

      return response;
    } catch (error) {
      console.error('[SecureApiService] Content generation failed:', error);

      return {
        content: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown generation error'
      };
    }
  }

  /**
   * Valida se o serviço está funcionando corretamente
   */
  public async healthCheck(): Promise<{ healthy: boolean; services: Record<string, boolean> }> {
    const services = {
      moderation: false,
      generation: false
    };

    try {
      // Teste de moderação com conteúdo simples
      const moderationTest = await this.moderateContent('Hello world');
      services.moderation = !moderationTest.error;
    } catch {
      services.moderation = false;
    }

    try {
      // Teste de geração com prompt simples
      const generationTest = await this.generateContent('Say hello', { maxTokens: 10 });
      services.generation = generationTest.success;
    } catch {
      services.generation = false;
    }

    return {
      healthy: Object.values(services).some(status => status),
      services
    };
  }

  /**
   * Limpa cache e reinicia conexões (se necessário)
   */
  public reset(): void {
    // Implementar limpeza de cache se necessário
    // console.log('[SecureApiService] Service reset completed');
  }
}

// Exportar instância singleton
export const secureApiService = SecureApiService.getInstance();

// Exportar funções de conveniência
export const moderateContent = (content: string) => secureApiService.moderateContent(content);
export const generateContent = (prompt: string, options?: Parameters<typeof secureApiService.generateContent>[1]) =>
  secureApiService.generateContent(prompt, options);
export const apiHealthCheck = () => secureApiService.healthCheck();

/**
 * Hook para usar o serviço seguro de API em componentes React
 */
export const useSecureApi = () => {
  return {
    moderateContent,
    generateContent,
    healthCheck: apiHealthCheck,
    reset: () => secureApiService.reset()
  };
};