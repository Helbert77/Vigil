import { useState, useEffect, useCallback } from 'react';
import { LibraryItem, User } from '@/types';
import { useToast } from '@/hooks/useToast';
import * as api from '@/src/services/api';
import { supabase } from '@/integrations/supabase/client';
import { canAccessLibrary, canAddLibraryItems } from '@/src/utils/libraryAccess';

export const useLibrary = (appUser: User | null) => {
  const { addToast } = useToast();
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    // Verificar se o usuário tem acesso à biblioteca
    if (!appUser || !canAccessLibrary(appUser.plan, appUser.role)) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await api.fetchLibraryItems();
      if (error) throw error;
      
      const mappedItems = (data || []).map((item: any) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        author: item.author,
        description: item.description,
        cover_url: item.cover_url,
        file_url: item.file_url,
        date: item.date,
        published_date: item.published_date,
        tags: item.tags,
        downloads: item.downloads || 0,
        views: item.views || 0,
        created_at: item.created_at,
        created_by: item.created_by
      })) as LibraryItem[];
      
      setItems(mappedItems);
    } catch (error) {
      console.error('Erro ao carregar biblioteca:', error);
      addToast('Erro ao carregar biblioteca.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [appUser, addToast]);

  useEffect(() => {
    fetchItems();

    // Realtime subscription
    const channel = supabase.channel('library-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'library_items' }, () => {
        fetchItems();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchItems]);

  const handleAddItem = useCallback(async (itemData: Omit<LibraryItem, 'id' | 'downloads' | 'views' | 'created_at'>) => {
    if (!appUser) return;
    
    // Verificar se o usuário pode adicionar itens
    if (!canAddLibraryItems(appUser.plan, appUser.role)) {
      addToast('Apenas usuários Premium e Administradores podem adicionar itens à biblioteca', 'error');
      return;
    }
    
    try {
      const { data, error } = await api.addLibraryItem(itemData);
      if (error) throw error;
      
      fetchItems();
      // Toast removido - item aparece na lista
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      addToast('Erro ao adicionar item.', 'error');
    }
  }, [appUser, addToast, fetchItems]);

  const handleUpdateItem = useCallback(async (id: string, updates: Partial<LibraryItem>) => {
    if (!appUser) return;
    
    try {
      const { error } = await api.updateLibraryItem(id, updates);
      
      // Verificar se houve erro na API
      if (error) {
        console.error('Erro ao atualizar item no banco:', error);
        addToast(error.message || 'Erro ao atualizar item.', 'error');
        return; // Não continuar se houver erro
      }
      
      // Só atualiza o estado local se a atualização no banco foi bem-sucedida
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ));
      // Toast removido - mudança visual já indica sucesso
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      addToast('Erro ao atualizar item.', 'error');
    }
  }, [appUser, addToast]);

  const handleDeleteItem = useCallback(async (id: string) => {
    if (!appUser) return;
    
    try {
      // Encontrar o item para obter a URL do arquivo
      const item = items.find(i => i.id === id);
      
      // Excluir o registro do banco de dados
      const { error } = await api.deleteLibraryItem(id);
      
      // Verificar se houve erro na API
      if (error) {
        console.error('Erro ao excluir item do banco:', error);
        addToast(error.message || 'Erro ao excluir item.', 'error');
        return; // Não continuar se houver erro
      }
      
      // Se houver arquivo no storage, tentar excluí-lo
      if (item?.file_url && item.file_url.includes('library-media')) {
        try {
          // Extrair o caminho do arquivo da URL
          const urlParts = item.file_url.split('/library-media/');
          if (urlParts.length > 1) {
            const filePath = urlParts[1].split('?')[0]; // Remove query params
            await supabase.storage.from('library-media').remove([filePath]);
          }
        } catch (storageError) {
          console.error('Erro ao excluir arquivo do storage:', storageError);
          // Não bloquear a exclusão do item se falhar ao excluir o arquivo
        }
      }
      
      // Só remove do estado local se a exclusão no banco foi bem-sucedida
      setItems(prev => prev.filter(item => item.id !== id));
      // Toast removido - item desaparece da lista
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      addToast('Erro ao excluir item.', 'error');
    }
  }, [appUser, addToast, items]);

  const handleIncrementView = useCallback(async (id: string) => {
    try {
      // Atualização otimista
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, views: item.views + 1 } : item
      ));
      
      await api.incrementLibraryItemViews(id);
    } catch (error) {
      console.error('Erro ao incrementar visualizações:', error);
    }
  }, []);

  const handleIncrementDownload = useCallback(async (id: string) => {
    try {
      // Atualização otimista
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, downloads: item.downloads + 1 } : item
      ));
      
      await api.incrementLibraryItemDownloads(id);
    } catch (error) {
      console.error('Erro ao incrementar downloads:', error);
    }
  }, []);

  return {
    items,
    isLoading,
    handleAddItem,
    handleUpdateItem,
    handleDeleteItem,
    handleIncrementView,
    handleIncrementDownload
  };
};

