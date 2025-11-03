import React, { useState, useMemo, useEffect } from 'react';
import { LibraryItemCard } from '@/src/components/library/LibraryItemCard';
import { LibraryItemModal } from '@/src/components/library/LibraryItemModal';
import { LibraryItem, LibraryItemType } from '@/src/data/library';
import { libraryDataService, LibraryData } from '@/src/services/LibraryDataService';
import { logger } from '@/src/utils/Logger';
import '@/src/styles/library-responsive.css';

type ViewMode = 'list' | 'small' | 'large';
type SortBy = 'date' | 'title' | 'author';

const categories: { key: LibraryItemType; label: string }[] = [
  { key: 'ebook', label: 'Ebooks' },
  { key: 'document', label: 'Documentos' },
  { key: 'article', label: 'Artigos' },
  { key: 'magazine', label: 'Revistas' },
];

const Library: React.FC = () => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('todos');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortBy, setSortBy] = useState<'title' | 'author' | 'date' | 'downloads' | 'views'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  
  // Estados para dados carregados
  const [libraryData, setLibraryData] = useState<LibraryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados da biblioteca
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        logger.info('Carregando dados da biblioteca...', undefined, 'library', 'Library');
        
        const data = await libraryDataService.loadLibraryData();
        setLibraryData(data);
        
        logger.info(`Dados carregados: ${data.items.length} itens`, undefined, 'library', 'Library');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        logger.error('Erro ao carregar dados', err, 'library', 'Library');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const filtered = useMemo(() => {
    if (!libraryData) return [];
    
    let items = [...libraryData.items];
    
    // Filtrar por categoria
    if (activeCategory !== 'all') {
      items = items.filter(i => (i.category || i.type) === activeCategory);
    }
    
    // Filtrar por tag
    if (selectedTag !== 'todos') {
      items = items.filter(i => i.tags?.includes(selectedTag));
    }
    
    // Filtrar por busca
    const q = query.trim().toLowerCase();
    if (q) {
      items = items.filter(i => (
        i.title.toLowerCase().includes(q) ||
        i.author.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        (i.tags && i.tags.some(tag => tag.toLowerCase().includes(q)))
      ));
    }
    
    // Ordenar
    items.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'author':
          aValue = a.author.toLowerCase();
          bValue = b.author.toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.publishedDate || a.date);
          bValue = new Date(b.publishedDate || b.date);
          break;
        case 'downloads':
          aValue = a.downloads || 0;
          bValue = b.downloads || 0;
          break;
        case 'views':
          aValue = a.views || 0;
          bValue = b.views || 0;
          break;
        default:
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return items;
  }, [libraryData, activeCategory, query, selectedTag, sortBy, sortOrder]);

  const handleOpen = (item: LibraryItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="library-page bg-light-background dark:bg-dark-background">
        <div className="library-container">
          <div className="library-loading">
            <div className="library-loading-spinner"></div>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              Carregando biblioteca...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="library-page bg-light-background dark:bg-dark-background">
        <div className="library-container">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Erro ao carregar biblioteca
            </h2>
            <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors min-h-[44px] min-w-[44px]"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="library-page bg-light-background dark:bg-dark-background">
      <div className="library-container">
        {/* Header */}
        <div className="library-header">
          <h1 className="library-title text-light-text dark:text-dark-text">
            Biblioteca Virtual
          </h1>
          <p className="library-subtitle text-light-text-secondary dark:text-dark-text-secondary">
            Acesse nossa crescente coleção de documentos. Contribua com a nossa biblioteca indicando links, artigos, ou livros relacionados aos nossos temas.{' '}
            <button
              onClick={() => setIsContributeModalOpen(true)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline font-medium transition-colors"
            >
              Contribua
            </button>
          </p>
        </div>

      {/* Filtros e controles */}
      <div className="library-filters bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border">
        {/* Abas de categorias */}
        <div className="library-categories">
          <button
            onClick={() => setActiveCategory('all')}
            className={`library-category-button ${
              activeCategory === 'all' ? 'active' : ''
            }`}
          >
            Todos
          </button>
          {libraryData?.categories?.map(category => (
            <button
              key={category.key}
              onClick={() => setActiveCategory(category.key)}
              className={`library-category-button ${
                activeCategory === category.key ? 'active' : ''
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>



        {/* Controles de busca e visualização */}
        <div className="library-controls">
          <div className="library-search">
            <input
              type="text"
              placeholder="Buscar por título, autor ou descrição..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-4 py-2 border border-light-border dark:border-dark-border rounded-lg bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex flex-col">
              <select
                id="tag-filter"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-black text-white text-sm min-h-[44px] shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Selecionar filtro por tags"
              >
                <option value="todos">Todas as tags</option>
                {libraryData?.tags?.map(tag => (
                  <option key={tag.id} value={tag.id}>{tag.label}</option>
                ))}
              </select>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-black text-white text-sm min-h-[44px] shadow-sm"
            >
              <option value="title">Título</option>
              <option value="date">Data</option>
              <option value="downloads">Downloads</option>
              <option value="views">Visualizações</option>
              <option value="author">Autor</option>
            </select>
            <div className="library-view-controls">
              <button 
                onClick={() => setViewMode('list')} 
                className={`library-view-button ${viewMode === 'list' ? 'active' : ''}`}
                aria-label="Visualização em lista"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                </svg>
              </button>
              <button 
                onClick={() => setViewMode('small')} 
                className={`library-view-button ${viewMode === 'small' ? 'active' : ''}`}
                aria-label="Ícones pequenos"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                </svg>
              </button>
              <button 
                onClick={() => setViewMode('large')} 
                className={`library-view-button ${viewMode === 'large' ? 'active' : ''}`}
                aria-label="Ícones grandes"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="library-content-container">
        <div className={`library-grid ${viewMode}-mode`}>
          {filtered.map(item => (
            <LibraryItemCard key={item.id} item={item} viewMode={viewMode} onClick={handleOpen} />
          ))}
        </div>
      </div>

      {/* Modal */}
      <LibraryItemModal isOpen={isModalOpen} onClose={handleClose} item={selectedItem} />
      
      {/* Modal de Contribuição */}
      {isContributeModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Contribua com a Biblioteca
                </h2>
                <button
                  onClick={() => setIsContributeModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label="Fechar modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Ajude-nos a expandir nossa biblioteca compartilhando recursos valiosos relacionados aos nossos temas.
              </p>
              
              <form className="space-y-4">
                <div>
                  <label htmlFor="contribute-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Contribuição
                  </label>
                  <select
                    id="contribute-type"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Selecione o tipo</option>
                    <option value="link">Link/Site</option>
                    <option value="article">Artigo</option>
                    <option value="book">Livro</option>
                    <option value="video">Vídeo</option>
                    <option value="document">Documento</option>
                    <option value="other">Outro</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="contribute-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Título
                  </label>
                  <input
                    type="text"
                    id="contribute-title"
                    placeholder="Digite o título do recurso"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                
                <div>
                  <label htmlFor="contribute-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    URL/Link (se aplicável)
                  </label>
                  <input
                    type="url"
                    id="contribute-url"
                    placeholder="https://exemplo.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                
                <div>
                  <label htmlFor="contribute-author" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Autor
                  </label>
                  <input
                    type="text"
                    id="contribute-author"
                    placeholder="Nome do autor"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                
                <div>
                  <label htmlFor="contribute-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descrição
                  </label>
                  <textarea
                    id="contribute-description"
                    rows={4}
                    placeholder="Descreva brevemente o conteúdo e sua relevância para nossa biblioteca"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="contribute-tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags (separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    id="contribute-tags"
                    placeholder="conspiração, política, história"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsContributeModalOpen(false)}
                    className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium"
                  >
                    Enviar Contribuição
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Library;