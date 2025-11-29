import React, { useState, useMemo } from 'react';
import { LibraryItem, User } from '../types';
import Card from '../components/common/Card';
import { Icon } from '../components/icons/Icon';
import LibraryItemCard from '../components/library/LibraryItemCard';
import LibraryItemModal from '../components/library/LibraryItemModal';
import AddLibraryItemModal from '../components/library/AddLibraryItemModal';
import Dropdown from '../components/common/Dropdown';
import { canAddLibraryItems } from '@/src/utils/libraryAccess';

const SearchIcon = () => <Icon className="h-5 w-5"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></Icon>;
const GridIcon = () => <Icon><rect width="7" height="7" x="3" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="14" rx="1"></rect><rect width="7" height="7" x="3" y="14" rx="1"></rect></Icon>;
const ListIcon = () => <Icon><line x1="8" x2="21" y1="6" y2="6"></line><line x1="8" x2="21" y1="12" y2="12"></line><line x1="8" x2="21" y1="18" y2="18"></line><line x1="3" x2="3.01" y1="6" y2="6"></line><line x1="3" x2="3.01" y1="12" y2="12"></line><line x1="3" x2="3.01" y1="18" y2="18"></line></Icon>;
const GridSmallIcon = () => <Icon><rect width="5" height="5" x="3" y="3" rx="1"></rect><rect width="5" height="5" x="12" y="3" rx="1"></rect><rect width="5" height="5" x="3" y="12" rx="1"></rect><rect width="5" height="5" x="12" y="12" rx="1"></rect></Icon>;

const PlusIcon = () => (
  <Icon className="h-5 w-5">
    <line x1="12" x2="12" y1="5" y2="19"></line>
    <line x1="5" x2="19" y1="12" y2="12"></line>
  </Icon>
);

type ViewMode = 'list' | 'grid-small' | 'grid-large';
type SortBy = 'date' | 'title' | 'author' | 'views' | 'downloads';
type CategoryFilter = 'all' | 'ebook' | 'article' | 'magazine' | 'document' | 'link';

interface LibraryProps {
  items: LibraryItem[];
  user: User;
  onAddItem: (item: Omit<LibraryItem, 'id' | 'downloads' | 'views' | 'created_at'>) => void;
  onUpdateItem: (id: string, updates: Partial<LibraryItem>) => void;
  onDeleteItem: (id: string) => void;
  onIncrementView: (id: string) => void;
  onIncrementDownload: (id: string) => void;
}

const Library: React.FC<LibraryProps> = ({
  items,
  user,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onIncrementView,
  onIncrementDownload
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.role === 'moderator';

  // Buscar o item selecionado atualizado do array
  const selectedItem = useMemo(() => {
    if (!selectedItemId) return null;
    return items.find(item => item.id === selectedItemId) || null;
  }, [selectedItemId, items]);

  const filteredAndSortedItems = useMemo(() => {
    let filtered = items;

    // Filtrar por categoria
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.type === categoryFilter);
    }

    // Filtrar por busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.author.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Ordenar
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.author.localeCompare(b.author);
        case 'views':
          return b.views - a.views;
        case 'downloads':
          return b.downloads - a.downloads;
        case 'date':
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

    return sorted;
  }, [items, categoryFilter, searchQuery, sortBy]);

  const handleItemClick = (item: LibraryItem) => {
    setSelectedItemId(item.id);
    onIncrementView(item.id);
  };

  const categoryLabels = {
    all: 'Todos',
    ebook: 'Ebooks',
    article: 'Artigos',
    magazine: 'Revistas',
    document: 'Documentos',
    link: 'Links'
  };

  const sortLabels = {
    date: 'Data',
    title: 'Título',
    author: 'Autor',
    views: 'Visualizações',
    downloads: 'Downloads'
  };

  const getCategoryCount = (category: CategoryFilter) => {
    if (category === 'all') return items.length;
    return items.filter(item => item.type === category).length;
  };

  // Verificação de segurança para garantir que o componente renderize
  if (!user) {
    return <div className="p-4">Carregando...</div>;
  }

  // Verificar se o usuário pode adicionar itens
  const userCanAddItems = canAddLibraryItems(user.plan, user.role);

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div 
        className="flex items-center justify-between flex-wrap gap-4 w-full"
        style={{ 
          maxWidth: 'none',
          minHeight: '60px'
        }}
      >
        <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">Biblioteca</h1>
        
        {/* Botão Adicionar Item - Visível apenas para Premium e Admin */}
        {userCanAddItems && (
          <button
            id="library-add-button"
            data-testid="add-library-item-button"
            onClick={() => setIsAddModalOpen(true)}
            className="library-add-button flex items-center justify-center bg-secondary hover:bg-blue-700 text-white font-bold rounded-full transition-colors md:py-2 md:px-4 py-1.5 px-3 text-sm md:text-base shadow-md"
            aria-label="Adicionar Item"
            type="button"
            style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              visibility: 'visible',
              opacity: 1,
              zIndex: 10,
              position: 'relative',
              minWidth: '150px',
              minHeight: '40px',
              maxWidth: 'none',
              flexShrink: 0
            }}
          >
            <span>Adicionar Item</span>
          </button>
        )}
      </div>

      {/* Filters and Controls */}
      <Card className="p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Buscar por título, autor, descrição ou tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
          />
        </div>

        {/* Category, Sort Dropdowns and View Controls */}
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filtrar por categoria:
            </label>
            <Dropdown
              options={(['all', 'ebook', 'article', 'magazine', 'document', 'link'] as CategoryFilter[]).map((category) => ({
                value: category,
                label: categoryLabels[category],
                count: getCategoryCount(category)
              }))}
              value={categoryFilter}
              onChange={(value) => setCategoryFilter(value as CategoryFilter)}
              aria-label="Filtrar itens da biblioteca por categoria"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Ordenar por:
            </label>
            <Dropdown
              options={(['date', 'title', 'author', 'views', 'downloads'] as SortBy[]).map((sort) => ({
                value: sort,
                label: sortLabels[sort]
              }))}
              value={sortBy}
              onChange={(value) => setSortBy(value as SortBy)}
              aria-label="Ordenar itens da biblioteca"
            />
          </div>

          {/* View Controls */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Modo de exibição:
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-primary text-white'
                    : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                title="Lista"
                aria-label="Modo de exibição: Lista"
              >
                <ListIcon />
              </button>
              <button
                onClick={() => setViewMode('grid-small')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'grid-small'
                    ? 'bg-primary text-white'
                    : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                title="Grade Pequena"
                aria-label="Modo de exibição: Grade Pequena"
              >
                <GridSmallIcon />
              </button>
              <button
                onClick={() => setViewMode('grid-large')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'grid-large'
                    ? 'bg-primary text-white'
                    : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                title="Grade Grande"
                aria-label="Modo de exibição: Grade Grande"
              >
                <GridIcon />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Items Grid/List */}
      {filteredAndSortedItems.length > 0 ? (
        <div className={
          viewMode === 'list'
            ? 'space-y-4'
            : viewMode === 'grid-small'
            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'
            : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
        }>
          {filteredAndSortedItems.map((item) => (
            <LibraryItemCard
              key={item.id}
              item={item}
              viewMode={viewMode}
              onClick={() => handleItemClick(item)}
            />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {searchQuery || categoryFilter !== 'all'
              ? 'Nenhum item encontrado com os filtros aplicados.'
              : 'Nenhum item na biblioteca ainda.'}
          </p>
        </Card>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <LibraryItemModal
          item={selectedItem}
          user={user}
          onClose={() => setSelectedItemId(null)}
          onUpdate={onUpdateItem}
          onDelete={onDeleteItem}
          onDownload={onIncrementDownload}
        />
      )}

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <AddLibraryItemModal
          onClose={() => setIsAddModalOpen(false)}
          onAdd={onAddItem}
        />
      )}
    </div>
  );
};

export default Library;
