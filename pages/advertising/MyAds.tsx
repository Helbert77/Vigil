import React, { useState, useEffect } from 'react';
import { User, Ad } from '@/types';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/integrations/supabase/client';
import CreateAdModal from '@/components/advertising/CreateAdModal';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { Icon } from '@/components/icons/Icon';

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const EyeIcon = () => <Icon className="h-5 w-5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></Icon>;
const HeartIcon = () => <Icon className="h-5 w-5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></Icon>;
const ShareIcon = () => <Icon className="h-5 w-5"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" x2="12" y1="2" y2="15"></line></Icon>;

interface MyAdsProps {
  user: User;
}

const MyAds: React.FC<MyAdsProps> = ({ user }) => {
  const { addToast } = useToast();
  const [ads, setAds] = useState<any[]>([]);
  const [allAdsCount, setAllAdsCount] = useState(0); // Contador total de anúncios
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'ended'>('all');
  const [adToDelete, setAdToDelete] = useState<string | null>(null);
  const [adToPause, setAdToPause] = useState<{ id: string; status: string } | null>(null);

  const fetchMyAds = async () => {
    setIsLoading(true);
    try {
      // Buscar contagem total primeiro
      const { count: totalCount, error: countError } = await supabase
        .from('anuncios')
        .select('*', { count: 'exact', head: true })
        .eq('advertiser_id', user.id);

      if (!countError && totalCount !== null) {
        setAllAdsCount(totalCount);
      }

      // Buscar anúncios filtrados
      let query = supabase
        .from('anuncios')
        .select('*')
        .eq('advertiser_id', user.id)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setAds(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar anúncios:', error);
      addToast('Erro ao carregar anúncios', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAds();
  }, [user.id, filter]);

  const handleDeleteAd = async () => {
    if (!adToDelete) return;

    try {
      const { data, error } = await supabase
        .from('anuncios')
        .delete()
        .eq('id', adToDelete)
        .eq('advertiser_id', user.id)
        .select();

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('Não foi possível excluir o anúncio. Verifique se você é o proprietário.');
      }

      setAdToDelete(null);
      fetchMyAds();
    } catch (error: any) {
      addToast(error.message || 'Erro ao excluir anúncio', 'error');
    }
  };

  const handleToggleStatus = async () => {
    if (!adToPause) return;

    const newStatus = adToPause.status === 'active' ? 'paused' : 'active';

    try {
      const { error } = await supabase
        .from('anuncios')
        .update({ status: newStatus })
        .eq('id', adToPause.id)
        .eq('advertiser_id', user.id);

      if (error) throw error;

      setAdToPause(null);
      fetchMyAds();
    } catch (error: any) {
      addToast('Erro ao atualizar status do anúncio', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      ended: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };

    const labels = {
      active: 'Ativo',
      paused: 'Pausado',
      ended: 'Encerrado'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Meus Anúncios
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie todos os seus anúncios
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-primary hover:bg-gray-600 text-white font-medium px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <PlusIcon />
          Criar Anúncio
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary text-white'
              : 'bg-light-card dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          Todos ({allAdsCount})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'active'
              ? 'bg-primary text-white'
              : 'bg-light-card dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          Ativos
        </button>
        <button
          onClick={() => setFilter('paused')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'paused'
              ? 'bg-primary text-white'
              : 'bg-light-card dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          Pausados
        </button>
        <button
          onClick={() => setFilter('ended')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'ended'
              ? 'bg-primary text-white'
              : 'bg-light-card dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          Encerrados
        </button>
      </div>

      {/* Modal de Criar Anúncio */}
      <CreateAdModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        user={user}
        onAdCreated={fetchMyAds}
      />

      {/* Lista de Anúncios */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : ads.length === 0 ? (
        <div className="bg-light-card dark:bg-dark-card p-12 rounded-lg shadow-sm border border-light-border dark:border-dark-border text-center">
          <div className="text-6xl mb-4">📢</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Nenhum anúncio encontrado
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {filter === 'all' 
              ? 'Você ainda não criou nenhum anúncio.'
              : `Você não tem anúncios ${filter === 'active' ? 'ativos' : filter === 'paused' ? 'pausados' : 'encerrados'}.`
            }
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-primary hover:bg-gray-600 text-white font-medium px-6 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <PlusIcon />
            Criar Primeiro Anúncio
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {ads.map((ad) => (
            <div
              key={ad.id}
              className="bg-light-card dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border overflow-hidden"
            >
              {/* Imagem/Vídeo */}
              {ad.image_url && (
                <img
                  src={ad.image_url}
                  alt={ad.title}
                  className="w-full h-48 object-cover"
                />
              )}
              {ad.video_url && !ad.image_url && (
                <video
                  src={ad.video_url}
                  className="w-full h-48 object-cover"
                  controls
                />
              )}

              {/* Conteúdo */}
              <div className="p-4 space-y-3">
                {/* Título e Status */}
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex-1">
                    {ad.title}
                  </h3>
                  {getStatusBadge(ad.status)}
                </div>

                {/* Descrição */}
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {ad.description}
                </p>

                {/* Métricas */}
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <EyeIcon />
                    <span>{ad.views_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <HeartIcon />
                    <span>{ad.likes_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ShareIcon />
                    <span>{ad.shares_count || 0}</span>
                  </div>
                </div>

                {/* Datas e Budget */}
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                  {ad.start_date && (
                    <span>Início: {new Date(ad.start_date).toLocaleDateString('pt-BR')}</span>
                  )}
                  {ad.budget && ad.budget > 0 && (
                    <span>Budget: € {ad.budget.toFixed(2)}</span>
                  )}
                </div>

                {/* Ações */}
                <div className="flex gap-2 pt-2 border-t border-light-border dark:border-dark-border">
                  <button
                    onClick={() => setAdToPause({ id: ad.id, status: ad.status })}
                    disabled={ad.status === 'ended'}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      ad.status === 'ended'
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                        : ad.status === 'active'
                        ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800'
                        : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800'
                    }`}
                  >
                    {ad.status === 'active' ? 'Pausar' : ad.status === 'paused' ? 'Ativar' : 'Encerrado'}
                  </button>
                  <button
                    onClick={() => setAdToDelete(ad.id)}
                    className="px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800 font-medium transition-colors flex items-center gap-2"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={!!adToDelete}
        onClose={() => setAdToDelete(null)}
        onConfirm={handleDeleteAd}
        title="Excluir Anúncio?"
        message="Tem certeza que deseja excluir este anúncio? Esta ação não pode ser desfeita e todas as métricas associadas serão perdidas."
        confirmText="Sim, excluir"
        cancelText="Cancelar"
        isDestructive={true}
      />

      {/* Modal de Confirmação de Pausar/Ativar */}
      <ConfirmationModal
        isOpen={!!adToPause}
        onClose={() => setAdToPause(null)}
        onConfirm={handleToggleStatus}
        title={adToPause?.status === 'active' ? 'Pausar Anúncio?' : 'Ativar Anúncio?'}
        message={
          adToPause?.status === 'active'
            ? 'Tem certeza que deseja pausar este anúncio? Ele deixará de ser exibido até que seja reativado.'
            : 'Tem certeza que deseja ativar este anúncio? Ele voltará a ser exibido para os usuários.'
        }
        confirmText={adToPause?.status === 'active' ? 'Sim, pausar' : 'Sim, ativar'}
        cancelText="Cancelar"
        isDestructive={false}
      />
    </div>
  );
};

export default MyAds;

