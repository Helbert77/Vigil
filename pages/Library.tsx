import React, { useState, useMemo, useEffect } from 'react';
import { LibraryItemCard } from '@/src/components/library/LibraryItemCard';
import { LibraryItemModal } from '@/src/components/library/LibraryItemModal';
import { LibraryItem, LibraryItemType } from '@/src/data/library';
import { libraryDataService, LibraryData } from '@/src/services/LibraryDataService';
import { logger } from '@/src/utils/Logger';

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
      <div className="min-h-screen bg-light-background dark:bg-dark-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-light-text-secondary dark:text-dark-text-secondary">
                Carregando biblioteca...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-light-background dark:bg-dark-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Erro ao carregar biblioteca
            </h2>
            <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-light-text dark:text-dark-text mb-2">
            Biblioteca Virtual
          </h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            Acesse nossa coleção de livros, documentários e recursos educacionais
          </p>
        </div>

      {/* Filtros e controles */}
      <div className="bg-light-card dark:bg-dark-card rounded-lg p-6 mb-6 border border-light-border dark:border-dark-border">
        {/* Abas de categorias */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeCategory === 'all'
                ? 'bg-primary text-white'
                : 'bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text hover:bg-primary/10'
            }`}
          >
            Todos
          </button>
          {libraryData?.categories.map(category => (
             <button
               key={category.key}
               onClick={() => setActiveCategory(category.key)}
               className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                 activeCategory === category.key
                   ? 'bg-primary text-white'
                   : 'bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text hover:bg-primary/10'
               }`}
             >
               {category.label}
             </button>
           ))}
        </div>

        {/* Filtros por tags */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">Filtrar por Tags:</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'todos', label: 'Todas' },
              { id: 'novo', label: 'Novo' },
              { id: 'popular', label: 'Popular' },
              { id: 'destaque', label: 'Destaque' }
            ].map(tag => (
              <button
                key={tag.id}
                onClick={() => setSelectedTag(tag.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedTag === tag.id
                    ? 'bg-primary/20 text-primary border-2 border-primary'
                    : 'bg-light-background dark:bg-dark-background text-light-text-secondary dark:text-dark-text-secondary hover:bg-primary/10 border border-light-border dark:border-dark-border'
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3 items-center justify-between">

          {/* Search */}
          <div className="flex-1 min-w-[220px] sm:min-w-[280px]">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquisar por título, autor ou descrição..."
              className="w-full px-3 py-2 rounded border border-light-border dark:border-dark-border bg-white dark:bg-gray-800 text-sm"
            />
          </div>

          {/* Sort & View Mode */}
          <div className="flex items-center gap-2">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)} className="px-3 py-2 rounded border border-light-border dark:border-dark-border bg-white dark:bg-gray-800 text-sm">
              <option value="date">Data</option>
              <option value="title">Título</option>
              <option value="author">Autor</option>
            </select>
            <div className="flex items-center gap-1">
              <button onClick={() => setViewMode('list')} className={`px-3 py-2 rounded text-sm ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>Lista</button>
              <button onClick={() => setViewMode('small')} className={`px-3 py-2 rounded text-sm ${viewMode === 'small' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>Ícones Pequenos</button>
              <button onClick={() => setViewMode('large')} className={`px-3 py-2 rounded text-sm ${viewMode === 'large' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>Ícones Grandes</button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'list' ? (
        <div className="space-y-2">
          {filtered.map(item => (
            <LibraryItemCard key={item.id} item={item} viewMode={viewMode} onClick={handleOpen} />
          ))}
        </div>
      ) : (
        <div className={`grid gap-3 sm:gap-4 ${viewMode === 'small' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
          {filtered.map(item => (
            <LibraryItemCard key={item.id} item={item} viewMode={viewMode} onClick={handleOpen} />
          ))}
        </div>
      )}

      {/* Modal */}
      <LibraryItemModal isOpen={isModalOpen} onClose={handleClose} item={selectedItem} />
      </div>
    </div>
  );
};

export default Library;