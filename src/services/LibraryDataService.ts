import { LibraryItem } from '@/src/data/library';
import { logger } from '@/src/utils/Logger';
import { getLibraryItems } from '@/src/services/api';

export interface LibraryData {
  items: LibraryItem[];
  categories: Array<{ key: string; label: string }>;
  tags: Array<{ id: string; label: string; color: string }>;
}

class LibraryDataService {
  private static instance: LibraryDataService;
  private cache: LibraryData | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
  private readonly DEFAULT_CATEGORIES: Array<{ key: string; label: string }> = [
    { key: 'ebook', label: 'Ebooks' },
    { key: 'document', label: 'Documentos' },
    { key: 'article', label: 'Artigos' },
    { key: 'magazine', label: 'Revistas' }
  ];

  private constructor() {}

  public static getInstance(): LibraryDataService {
    if (!LibraryDataService.instance) {
      LibraryDataService.instance = new LibraryDataService();
    }
    return LibraryDataService.instance;
  }

  /**
   * Carrega dados da biblioteca do arquivo JSON externo
   */
  public async loadLibraryData(): Promise<LibraryData> {
    try {
      // Verifica se o cache ainda é válido
      const now = Date.now();
      if (this.cache && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
        logger.info('Retornando dados do cache', undefined, 'library', 'LibraryDataService');
        return this.cache;
      }

      logger.info('Carregando dados da biblioteca...', undefined, 'library', 'LibraryDataService');

      // 1) Tenta carregar do Supabase (tabela library_items)
      try {
        const { data: dbItems, error } = await getLibraryItems();
        if (!error && dbItems && dbItems.length >= 0) {
          // Constrói tags a partir dos itens do banco
          const uniqueTags = new Set<string>();
          dbItems.forEach(item => (item.tags || []).forEach(t => uniqueTags.add(t)));
          const tags = Array.from(uniqueTags).map(t => ({ id: t, label: t, color: '#6B7280' }));

          const dataFromDb: LibraryData = {
            items: dbItems,
            categories: this.DEFAULT_CATEGORIES,
            tags
          };

          // Atualiza cache
          this.cache = dataFromDb;
          this.cacheTimestamp = now;

          logger.info(`Dados carregados do Supabase: ${dbItems.length} itens`, undefined, 'library', 'LibraryDataService');
          return dataFromDb;
        }
      } catch (dbErr) {
        logger.warn('Falha ao carregar dados do Supabase, tentando JSON', dbErr, 'library', 'LibraryDataService');
      }

      // 2) Fallback: JSON estático
      const response = await fetch('/data/library.json');
      if (!response.ok) {
        throw new Error(`Erro ao carregar dados: ${response.status} ${response.statusText}`);
      }
      const jsonData: any = await response.json();
      this.validateLibraryData(jsonData);

      // Normaliza itens do JSON para o formato LibraryItem esperado
      const typeMap: Record<string, string> = {
        book: 'ebook',
        guide: 'document',
        video: 'document',
        audio: 'document'
      };

      const normalizedItems = (jsonData.items || []).map((raw: any) => {
        const rawType = (raw.type || '').toString().toLowerCase();
        const mappedType = (typeMap[rawType] || rawType);
        const validTypes = ['ebook', 'article', 'magazine', 'document'];
        const finalType = validTypes.includes(mappedType) ? mappedType : 'document';

        const date = raw.date || raw.publishedDate || new Date().toISOString();

        const downloadUrl = raw.downloadUrl || raw.fileUrl || undefined;
        const readUrl = raw.readUrl || raw.readOnlineUrl || downloadUrl || undefined;

        const item = {
          id: String(raw.id ?? crypto.randomUUID()),
          type: finalType,
          title: raw.title ?? '',
          author: raw.author ?? '',
          description: raw.description ?? '',
          coverUrl: raw.coverUrl ?? '',
          date,
          publishedDate: raw.publishedDate ?? undefined,
          category: raw.category ?? undefined,
          tags: Array.isArray(raw.tags) ? raw.tags : [],
          readUrl,
          downloadUrl,
          downloads: Number(raw.downloads ?? 0),
          views: Number(raw.views ?? 0)
        } as LibraryItem;
        return item;
      });

      // Atualiza o cache
      const normalizedData: LibraryData = {
        items: normalizedItems,
        categories: Array.isArray(jsonData.categories) ? jsonData.categories : this.DEFAULT_CATEGORIES,
        tags: Array.isArray(jsonData.tags) ? jsonData.tags : []
      };
      this.cache = normalizedData;
      this.cacheTimestamp = now;
      logger.info(`Dados carregados do JSON: ${normalizedItems.length} itens`, undefined, 'library', 'LibraryDataService');
      return normalizedData;
    } catch (error) {
      logger.error('Erro ao carregar dados da biblioteca', error, 'library', 'LibraryDataService');
      
      // Fallback para dados estáticos em caso de erro
      return this.getFallbackData();
    }
  }

  /**
   * Valida a estrutura dos dados carregados
   */
  private validateLibraryData(data: any): void {
    if (!data || typeof data !== 'object') {
      throw new Error('Dados inválidos: estrutura não é um objeto');
    }

    if (!Array.isArray(data.items)) {
      throw new Error('Dados inválidos: items deve ser um array');
    }

    if (!Array.isArray(data.categories)) {
      throw new Error('Dados inválidos: categories deve ser um array');
    }

    if (!Array.isArray(data.tags)) {
      throw new Error('Dados inválidos: tags deve ser um array');
    }

    // Valida estrutura básica dos itens
    data.items.forEach((item: any, index: number) => {
      if (!item.id || !item.title || !item.author) {
        throw new Error(`Item ${index} inválido: campos obrigatórios ausentes`);
      }
    });
  }

  /**
   * Dados de fallback em caso de erro no carregamento
   */
  private getFallbackData(): LibraryData {
    logger.warn('Usando dados de fallback', undefined, 'library', 'LibraryDataService');
    
    return {
      items: [
        {
          id: '1',
          title: 'A Arte da Guerra',
          author: 'Sun Tzu',
          description: 'Um tratado militar clássico sobre estratégia e táticas de guerra.',
          category: 'estrategia',
          type: 'ebook',
          coverUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop&crop=center',
          date: '2024-01-15',
          readUrl: 'https://example.com/read/arte-da-guerra',
          tags: ['popular', 'estrategia', 'classico'],
          downloads: 1250,
          views: 3420,
          publishedDate: '2024-01-15'
        }
      ],
      categories: [
        { key: 'estrategia', label: 'Estratégia' },
        { key: 'ficcao', label: 'Ficção' },
        { key: 'politica', label: 'Política' }
      ],
      tags: [
        { id: 'novo', label: 'Novo', color: '#10B981' },
        { id: 'popular', label: 'Popular', color: '#F59E0B' },
        { id: 'destaque', label: 'Destaque', color: '#EF4444' }
      ]
    };
  }

  /**
   * Limpa o cache forçando um novo carregamento
   */
  public clearCache(): void {
    this.cache = null;
    this.cacheTimestamp = 0;
    logger.info('Cache limpo', undefined, 'library', 'LibraryDataService');
  }

  /**
   * Recarrega os dados forçando um novo fetch
   */
  public async reloadData(): Promise<LibraryData> {
    this.clearCache();
    return this.loadLibraryData();
  }
}

export const libraryDataService = LibraryDataService.getInstance();