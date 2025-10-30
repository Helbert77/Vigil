import { EmojiData } from '../data/emojis';
import { StickerData } from '../data/stickers';
import { Logger } from '../utils/Logger';

interface UpdateResponse {
  success: boolean;
  newEmojis?: EmojiData[];
  newStickers?: StickerData[];
  version?: string;
  error?: string;
}

interface UpdateConfig {
  apiEndpoint: string;
  checkInterval: number; // em milissegundos
  enableAutoUpdate: boolean;
  enableNotifications: boolean;
}

class EmojiUpdateService {
  private static instance: EmojiUpdateService;
  private logger = Logger.getInstance();
  private config: UpdateConfig;
  private updateInterval: NodeJS.Timeout | null = null;
  private lastUpdateCheck: Date | null = null;
  private currentVersion: string = '1.0.0';

  private constructor() {
    this.config = {
      apiEndpoint: '/api/emoji-updates', // Endpoint para verificar atualizações
      checkInterval: 24 * 60 * 60 * 1000, // 24 horas
      enableAutoUpdate: true,
      enableNotifications: true
    };
  }

  public static getInstance(): EmojiUpdateService {
    if (!EmojiUpdateService.instance) {
      EmojiUpdateService.instance = new EmojiUpdateService();
    }
    return EmojiUpdateService.instance;
  }

  /**
   * Inicia o serviço de verificação automática de atualizações
   */
  public startAutoUpdate(): void {
    if (!this.config.enableAutoUpdate) {
      this.logger.info('Auto-update desabilitado');
      return;
    }

    this.logger.info('Iniciando serviço de auto-update para emojis e figurinhas');
    
    // Verificação inicial
    this.checkForUpdates();

    // Configurar verificação periódica
    this.updateInterval = setInterval(() => {
      this.checkForUpdates();
    }, this.config.checkInterval);
  }

  /**
   * Para o serviço de verificação automática
   */
  public stopAutoUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      this.logger.info('Serviço de auto-update parado');
    }
  }

  /**
   * Verifica se há atualizações disponíveis
   */
  public async checkForUpdates(): Promise<UpdateResponse> {
    try {
      this.logger.info('Verificando atualizações de emojis e figurinhas...');
      this.lastUpdateCheck = new Date();

      // Simular verificação de API (em produção, seria uma chamada real)
      const response = await this.simulateApiCall();
      
      if (response.success && (response.newEmojis?.length || response.newStickers?.length)) {
        this.logger.info(`Atualizações encontradas: ${response.newEmojis?.length || 0} emojis, ${response.newStickers?.length || 0} stickers`);
        
        if (this.config.enableNotifications) {
          this.notifyUser(response);
        }

        // Aplicar atualizações automaticamente se configurado
        if (this.config.enableAutoUpdate) {
          await this.applyUpdates(response);
        }
      } else {
        this.logger.info('Nenhuma atualização disponível');
      }

      return response;
    } catch (error) {
      this.logger.error('Erro ao verificar atualizações:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Aplica as atualizações encontradas
   */
  public async applyUpdates(updateData: UpdateResponse): Promise<boolean> {
    try {
      this.logger.info('Aplicando atualizações...');

      // Atualizar emojis
      if (updateData.newEmojis?.length) {
        await this.updateEmojis(updateData.newEmojis);
      }

      // Atualizar stickers
      if (updateData.newStickers?.length) {
        await this.updateStickers(updateData.newStickers);
      }

      // Atualizar versão
      if (updateData.version) {
        this.currentVersion = updateData.version;
        localStorage.setItem('emoji-system-version', updateData.version);
      }

      this.logger.info('Atualizações aplicadas com sucesso');
      return true;
    } catch (error) {
      this.logger.error('Erro ao aplicar atualizações:', error);
      return false;
    }
  }

  /**
   * Atualiza a base de dados de emojis
   */
  private async updateEmojis(newEmojis: EmojiData[]): Promise<void> {
    try {
      // Obter emojis existentes do localStorage
      const existingEmojis = JSON.parse(localStorage.getItem('custom-emojis') || '[]');
      
      // Filtrar emojis que ainda não existem
      const uniqueNewEmojis = newEmojis.filter(newEmoji => 
        !existingEmojis.some((existing: EmojiData) => existing.unicode === newEmoji.unicode)
      );

      if (uniqueNewEmojis.length > 0) {
        const updatedEmojis = [...existingEmojis, ...uniqueNewEmojis];
        localStorage.setItem('custom-emojis', JSON.stringify(updatedEmojis));
        
        // Disparar evento para atualizar componentes
        window.dispatchEvent(new CustomEvent('emojis-updated', {
          detail: { newEmojis: uniqueNewEmojis }
        }));

        this.logger.info(`${uniqueNewEmojis.length} novos emojis adicionados`);
      }
    } catch (error) {
      this.logger.error('Erro ao atualizar emojis:', error);
      throw error;
    }
  }

  /**
   * Atualiza a base de dados de stickers
   */
  private async updateStickers(newStickers: StickerData[]): Promise<void> {
    try {
      // Obter stickers existentes do localStorage
      const existingStickers = JSON.parse(localStorage.getItem('custom-stickers') || '[]');
      
      // Filtrar stickers que ainda não existem
      const uniqueNewStickers = newStickers.filter(newSticker => 
        !existingStickers.some((existing: StickerData) => existing.id === newSticker.id)
      );

      if (uniqueNewStickers.length > 0) {
        const updatedStickers = [...existingStickers, ...uniqueNewStickers];
        localStorage.setItem('custom-stickers', JSON.stringify(updatedStickers));
        
        // Disparar evento para atualizar componentes
        window.dispatchEvent(new CustomEvent('stickers-updated', {
          detail: { newStickers: uniqueNewStickers }
        }));

        this.logger.info(`${uniqueNewStickers.length} novos stickers adicionados`);
      }
    } catch (error) {
      this.logger.error('Erro ao atualizar stickers:', error);
      throw error;
    }
  }

  /**
   * Simula uma chamada de API para verificar atualizações
   */
  private async simulateApiCall(): Promise<UpdateResponse> {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simular resposta da API
    const hasUpdates = Math.random() > 0.7; // 30% de chance de ter atualizações

    if (!hasUpdates) {
      return { success: true };
    }

    // Simular novos emojis e stickers
    const newEmojis: EmojiData[] = [
      {
        emoji: '🆕',
        name: 'New',
        shortcode: ':new:',
        category: 'symbols',
        keywords: ['new', 'fresh', 'recent'],
        unicode: 'U+1F195'
      },
      {
        emoji: '🔥',
        name: 'Fire',
        shortcode: ':fire:',
        category: 'objects',
        keywords: ['fire', 'hot', 'trending'],
        unicode: 'U+1F525'
      }
    ];

    const newStickers: StickerData[] = [
      {
        id: 'new-sticker-1',
        name: 'Celebration',
        url: '/stickers/celebration.webp',
        packId: 'new-pack',
        keywords: ['celebration', 'party', 'happy'],
        animated: false,
        format: 'webp'
      }
    ];

    return {
      success: true,
      newEmojis,
      newStickers,
      version: '1.1.0'
    };
  }

  /**
   * Notifica o usuário sobre atualizações disponíveis
   */
  private notifyUser(updateData: UpdateResponse): void {
    if (!this.config.enableNotifications) return;

    const emojiCount = updateData.newEmojis?.length || 0;
    const stickerCount = updateData.newStickers?.length || 0;
    
    let message = 'Novas atualizações disponíveis: ';
    if (emojiCount > 0) message += `${emojiCount} emojis`;
    if (emojiCount > 0 && stickerCount > 0) message += ' e ';
    if (stickerCount > 0) message += `${stickerCount} stickers`;

    // Criar notificação visual
    this.showNotification(message);
  }

  /**
   * Exibe uma notificação visual para o usuário
   */
  private showNotification(message: string): void {
    // Disparar evento customizado para mostrar notificação
    window.dispatchEvent(new CustomEvent('emoji-update-notification', {
      detail: { message }
    }));
  }

  /**
   * Configura as opções do serviço
   */
  public configure(config: Partial<UpdateConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger.info('Configuração do EmojiUpdateService atualizada:', this.config);
  }

  /**
   * Obtém informações sobre o status do serviço
   */
  public getStatus() {
    return {
      isRunning: this.updateInterval !== null,
      lastCheck: this.lastUpdateCheck,
      currentVersion: this.currentVersion,
      config: this.config
    };
  }

  /**
   * Força uma verificação manual de atualizações
   */
  public async forceUpdate(): Promise<UpdateResponse> {
    this.logger.info('Forçando verificação de atualizações...');
    return await this.checkForUpdates();
  }
}

export default EmojiUpdateService;
export type { UpdateResponse, UpdateConfig };