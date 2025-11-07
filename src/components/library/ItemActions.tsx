import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import { LibraryItem } from '@/src/data/library';
import ConfirmationModal from '@/src/components/common/ConfirmationModal';
import Button from '@/src/components/common/Button';
import { Icon } from '@/components/icons/Icon';

interface ItemActionsProps {
  item: LibraryItem;
  onDelete: (itemId: string) => Promise<{ error: any | null } | void> | void;
}

const MoreHorizontalIcon = () => (
  <Icon>
    <circle cx="12" cy="12" r="1"></circle>
    <circle cx="19" cy="12" r="1"></circle>
    <circle cx="5" cy="12" r="1"></circle>
  </Icon>
);

const TrashIcon = () => (
  <Icon className="h-5 w-5 text-red-500">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </Icon>
);

const ItemActionsComponent: React.FC<ItemActionsProps> = ({ item, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fecha o menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openMenu = useCallback(() => setIsOpen(true), []);
  const closeMenu = useCallback(() => setIsOpen(false), []);

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(prev => !prev);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConfirmOpen(true);
    closeMenu();
  };

  const handleConfirmDelete = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await onDelete(item.id);
      const err = (result as any)?.error ?? null;
      if (err) {
        setError(err.message || 'Falha ao apagar item.');
        return;
      }
      setIsConfirmOpen(false);
    } catch (e: any) {
      setError(e?.message || 'Erro inesperado ao apagar item.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Abrir menu de ações"
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
        onClick={handleTriggerClick}
      >
        <MoreHorizontalIcon />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Menu de ações do item"
          className="absolute right-0 mt-2 w-44 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg shadow-lg z-20 origin-top-right transition ease-out duration-150"
        >
          <button
            role="menuitem"
            onClick={handleDeleteClick}
            className="w-full text-left flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <TrashIcon />
            <span>Apagar item</span>
          </button>
        </div>
      )}

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar exclusão"
        message={`Tem certeza que deseja apagar "${item.title}"? Esta ação não pode ser desfeita.`}
        confirmText="Apagar"
        cancelText="Cancelar"
        isLoading={isLoading}
        error={error || undefined}
      />
    </div>
  );
};

const ItemActions = memo(ItemActionsComponent);
ItemActions.displayName = 'ItemActions';

export default ItemActions;