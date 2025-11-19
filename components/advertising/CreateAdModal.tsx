import React, { useState, useRef } from 'react';
import { User } from '@/types';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/integrations/supabase/client';
import { pushHistoryState, parseLocationToSnapshot, type NavigationSnapshot } from '@/src/utils/history';

const XIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const UploadIcon = () => (
  <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

interface CreateAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onAdCreated?: () => void;
}

const CreateAdModal: React.FC<CreateAdModalProps> = ({ isOpen, onClose, user, onAdCreated }) => {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link_url: '',
    image_url: '',
    video_url: '',
    type: 'native' as 'native' | 'adsense',
    status: 'active' as 'active' | 'paused' | 'ended',
    start_date: new Date().toISOString().split('T')[0], // Data de hoje no formato YYYY-MM-DD
    end_date: '',
    budget: 0,
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'budget' ? (parseFloat(value) || 0) : value
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      addToast('Por favor, selecione uma imagem válida', 'error');
      return;
    }

    // Validar tamanho (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      addToast('A imagem deve ter no máximo 5MB', 'error');
      return;
    }

    setIsUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `ads/${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('posts-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('posts-media').getPublicUrl(filePath);
      
      setFormData(prev => ({ ...prev, image_url: data.publicUrl }));
      addToast('Imagem carregada com sucesso', 'success');
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      addToast('Erro ao fazer upload da imagem', 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('video/')) {
      addToast('Por favor, selecione um vídeo válido', 'error');
      return;
    }

    // Validar tamanho (máx 50MB)
    if (file.size > 50 * 1024 * 1024) {
      addToast('O vídeo deve ter no máximo 50MB', 'error');
      return;
    }

    setIsUploadingVideo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `ads/${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('posts-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('posts-media').getPublicUrl(filePath);
      
      setFormData(prev => ({ ...prev, video_url: data.publicUrl }));
      addToast('Vídeo carregado com sucesso', 'success');
    } catch (error) {
      console.error('Erro ao fazer upload do vídeo:', error);
      addToast('Erro ao fazer upload do vídeo', 'error');
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🚀 ========== HANDLE SUBMIT INICIADO ==========');
    console.log('🚀 Event:', e);
    console.log('🚀 Timestamp:', new Date().toISOString());
    
    e.preventDefault();
    console.log('🚀 preventDefault() executado');

    // Validações
    console.log('🔍 Iniciando validações...');
    console.log('🔍 formData.title:', formData.title);
    console.log('🔍 formData.description:', formData.description);
    console.log('🔍 formData.image_url:', formData.image_url);
    console.log('🔍 formData.video_url:', formData.video_url);
    
    if (!formData.title.trim()) {
      console.log('❌ Validação falhou: título vazio');
      addToast('Por favor, insira um título para o anúncio', 'error');
      return;
    }
    console.log('✅ Validação 1 passou: título OK');

    if (!formData.description.trim()) {
      console.log('❌ Validação falhou: descrição vazia');
      addToast('Por favor, insira uma descrição para o anúncio', 'error');
      return;
    }
    console.log('✅ Validação 2 passou: descrição OK');

    // Validar URL apenas se foi preenchida
    if (formData.link_url.trim()) {
      try {
        new URL(formData.link_url);
        console.log('✅ Validação 3 passou: URL válida');
      } catch {
        console.log('❌ Validação falhou: URL inválida');
        addToast('Por favor, insira uma URL válida', 'error');
        return;
      }
    } else {
      console.log('✅ Validação 3 passou: URL vazia (opcional)');
    }

    if (!formData.image_url && !formData.video_url) {
      console.log('❌ Validação falhou: sem imagem nem vídeo');
      addToast('Por favor, adicione uma imagem ou vídeo ao anúncio', 'error');
      return;
    }
    console.log('✅ Validação 4 passou: mídia OK');

    // LOG CRÍTICO: Verificar se chegou aqui
    console.log('🔍 PASSO 3 CONCLUÍDO - Validações passaram');
    console.log('🔍 FormData atual:', formData);
    console.log('🔍 User:', { id: user?.id, username: user?.username });

    setIsLoading(true);
    console.log('🔍 setIsLoading(true) executado');
    
    try {
      console.log('🔍 Entrou no try block');
      
      // Verificar se user existe
      if (!user || !user.id) {
        console.error('❌ ERRO CRÍTICO: user ou user.id não existe!', user);
        addToast('Erro: Usuário não encontrado. Faça login novamente.', 'error');
        setIsLoading(false);
        return;
      }
      
      console.log('🔍 User verificado:', { id: user.id, username: user.username });
      
      // Preparar dados do anúncio
      // link_url é opcional - pode ser null se vazio
      const linkUrl = formData.link_url.trim() || null;
      console.log('🔍 linkUrl preparado:', linkUrl || '(vazio - será null)');
      
      const startDate = formData.start_date || new Date().toISOString().split('T')[0];
      console.log('🔍 start_date preparado:', startDate);
      
      const adData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        link_url: linkUrl,
        image_url: formData.image_url || null,
        video_url: formData.video_url || null,
        type: formData.type,
        status: 'paused', // Anúncio deve ficar pausado até ser aprovado
        payment_status: 'pending',
        payment_type: 'free',
        approval_status: 'pending_approval',
        start_date: startDate,
        end_date: formData.end_date || null,
        budget: formData.budget || 0,
        advertiser_id: user.id,
        advertiser_name: user.username,
        advertiser_avatar: user.avatarUrl || null,
        likes_count: 0,
        shares_count: 0,
        views_count: 0,
        comments_count: 0
      };
      
      console.log('📤 PASSO 4 CONCLUÍDO - Dados preparados');
      console.log('📤 Tentando criar anúncio com dados:', JSON.stringify(adData, null, 2));

      console.log('🔍 ANTES do insert no Supabase');
      console.log('🔍 Tabela: anuncios');
      console.log('🔍 Supabase client:', supabase ? 'existe' : 'NÃO EXISTE');
      
      if (!supabase) {
        console.error('❌ ERRO CRÍTICO: Supabase client não existe!');
        addToast('Erro: Cliente do banco de dados não disponível.', 'error');
        setIsLoading(false);
        return;
      }
      
      // Verificar se está autenticado
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error('❌ ERRO CRÍTICO: Usuário não autenticado!', sessionError);
        addToast('Erro: Você precisa estar autenticado. Faça login novamente.', 'error');
        setIsLoading(false);
        return;
      }
      console.log('🔍 Sessão verificada:', { userId: session.user.id });
      
      const insertStartTime = Date.now();
      console.log('🔍 Iniciando insert às:', new Date().toISOString());
      
      let insertResult;
      try {
        insertResult = await supabase
          .from('anuncios')
          .insert([adData])
          .select()
          .single();
        
        const insertDuration = Date.now() - insertStartTime;
        console.log(`🔍 Insert completado em ${insertDuration}ms`);
      } catch (insertError) {
        console.error('❌ ERRO DURANTE INSERT (catch interno):', insertError);
        throw insertError;
      }
      
      const { data, error } = insertResult || { data: null, error: null };
      
      console.log('🔍 Resultado do insert recebido');
      console.log('🔍 Data:', data);
      console.log('🔍 Error:', error);

      if (error) {
        console.error('❌ Erro do Supabase:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log('✅ Anúncio criado com sucesso:', data);

      addToast('Anúncio criado! Redirecionando para seleção de plano...', 'success');
      
      // Resetar formulário
      setFormData({
        title: '',
        description: '',
        link_url: '',
        image_url: '',
        video_url: '',
        type: 'native' as 'native' | 'adsense',
        status: 'active' as 'active' | 'paused' | 'ended',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        budget: 0,
      });

      // Chamar callback e fechar modal
      if (onAdCreated) {
        onAdCreated();
      }
      onClose();
      
      console.log('🔍 Redirecionando para SelectAdPlan com ad_id:', data.id);
      
      // Usar navegação SPA sem reload - atualizar URL e disparar evento para App.tsx atualizar
      const snapshot: NavigationSnapshot = {
        page: 'SelectAdPlan',
        activeAdId: data.id,
      };
      
      // Atualizar URL sem reload usando pushHistoryState
      pushHistoryState(snapshot);
      
      // Disparar evento customizado para App.tsx atualizar o estado
      // Isso evita reload completo da página e mantém os logs do console
      window.dispatchEvent(new CustomEvent('navigation', { detail: snapshot }));
      
      console.log('✅ Navegação SPA executada - sem reload!');
    } catch (error: any) {
      console.error('❌ ========== ERRO CAPTURADO NO CATCH ==========');
      console.error('❌ Tipo do erro:', typeof error);
      console.error('❌ Erro completo:', error);
      console.error('❌ Stack trace:', error?.stack);
      console.error('❌ Message:', error?.message);
      console.error('❌ Code:', error?.code);
      console.error('❌ Details:', error?.details);
      console.error('❌ Hint:', error?.hint);
      
      // Mensagens de erro mais específicas
      let errorMessage = 'Erro ao criar anúncio. Tente novamente.';
      
      if (error?.message) {
        errorMessage = error.message;
      }
      
      if (error?.code === '23505') {
        errorMessage = 'Já existe um anúncio com estes dados.';
      } else if (error?.code === '23503') {
        errorMessage = 'Erro de referência no banco de dados. Verifique seus dados.';
      } else if (error?.code === '23502') {
        errorMessage = 'Campos obrigatórios faltando. Verifique o formulário.';
      } else if (error?.code === '23514') {
        errorMessage = 'Valor inválido para algum campo. Verifique os dados.';
      }
      
      console.error('❌ Mensagem de erro para usuário:', errorMessage);
      addToast(errorMessage, 'error');
    } finally {
      console.log('🔍 Finally block executado - setIsLoading(false)');
      setIsLoading(false);
      console.log('🔍 ========== HANDLE SUBMIT FINALIZADO ==========');
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-light-card dark:bg-dark-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-light-border dark:border-dark-border flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Criar Novo Anúncio</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            disabled={isLoading}
          >
            <XIcon />
          </button>
        </div>

        {/* Form - ENVOLVE TODO O CONTEÚDO INCLUINDO BOTÕES */}
        <form 
          onSubmit={(e) => {
            console.log('📝 FORM onSubmit DISPARADO!');
            console.log('📝 Event:', e);
            console.log('📝 Form element:', e.currentTarget);
            console.log('📝 Form validity:', e.currentTarget.checkValidity());
            handleSubmit(e);
          }}
          onInvalid={(e) => {
            console.error('❌ FORM INVALID - Validação HTML5 falhou');
            console.error('❌ Invalid element:', e.target);
            const target = e.target as HTMLInputElement | HTMLTextAreaElement;
            console.error('❌ Validation message:', target.validationMessage);
            console.error('❌ Validity:', target.validity);
          }}
          className="flex-1 flex flex-col overflow-hidden"
          noValidate
        >
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Título do Anúncio *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ex: Descubra nosso novo produto"
              className="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              maxLength={100}
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formData.title.length}/100 caracteres
            </p>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descrição *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descreva seu anúncio..."
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              maxLength={500}
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formData.description.length}/500 caracteres
            </p>
          </div>

          {/* Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Link de Destino (opcional)
            </label>
            <input
              type="url"
              name="link_url"
              value={formData.link_url}
              onChange={handleChange}
              placeholder="https://exemplo.com"
              className="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Deixe em branco para testes
            </p>
          </div>

          {/* Upload de Imagem */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Imagem do Anúncio {!formData.video_url && '*'}
            </label>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <div
              onClick={() => !isUploadingImage && imageInputRef.current?.click()}
              className="w-full h-48 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:border-primary dark:hover:border-primary transition-colors bg-light-bg dark:bg-dark-bg flex items-center justify-center"
            >
              {isUploadingImage ? (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              ) : formData.image_url ? (
                <img src={formData.image_url} alt="Preview" className="h-full w-full object-cover rounded-lg" />
              ) : (
                <div className="text-center text-gray-500">
                  <UploadIcon />
                  <p className="text-sm mt-2">Clique para enviar uma imagem</p>
                  <p className="text-xs mt-1">PNG, JPG, GIF até 5MB</p>
                </div>
              )}
            </div>
            {formData.image_url && (
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                className="text-sm text-red-600 hover:text-red-700 mt-2"
              >
                Remover imagem
              </button>
            )}
          </div>

          {/* Upload de Vídeo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Vídeo do Anúncio (opcional)
            </label>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
            />
            <div
              onClick={() => !isUploadingVideo && videoInputRef.current?.click()}
              className="w-full h-32 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:border-primary dark:hover:border-primary transition-colors bg-light-bg dark:bg-dark-bg flex items-center justify-center"
            >
              {isUploadingVideo ? (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              ) : formData.video_url ? (
                <video src={formData.video_url} className="h-full w-full object-cover rounded-lg" controls />
              ) : (
                <div className="text-center text-gray-500">
                  <UploadIcon />
                  <p className="text-sm mt-2">Clique para enviar um vídeo</p>
                  <p className="text-xs mt-1">MP4, WebM até 50MB</p>
                </div>
              )}
            </div>
            {formData.video_url && (
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, video_url: '' }))}
                className="text-sm text-red-600 hover:text-red-700 mt-2"
              >
                Remover vídeo
              </button>
            )}
          </div>

          {/* Configurações Avançadas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Anúncio
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="native">Nativo</option>
                <option value="adsense">AdSense</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="active">Ativo</option>
                <option value="paused">Pausado</option>
                <option value="ended">Encerrado</option>
              </select>
            </div>

            {/* Data de Início */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data de Início
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Data de Término */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data de Término (opcional)
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                min={formData.start_date}
                className="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Budget */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Orçamento (€)
              </label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          </div>

          {/* Footer - AGORA DENTRO DO FORM */}
          <div className="p-4 border-t border-light-border dark:border-dark-border flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2 rounded-lg border border-light-border dark:border-dark-border text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || isUploadingImage || isUploadingVideo}
              onClick={(e) => {
                console.log('🖱️ BOTÃO CLICADO!');
                console.log('🖱️ Event:', e);
                console.log('🖱️ isLoading:', isLoading);
                console.log('🖱️ isUploadingImage:', isUploadingImage);
                console.log('🖱️ isUploadingVideo:', isUploadingVideo);
                console.log('🖱️ disabled:', isLoading || isUploadingImage || isUploadingVideo);
                // Não prevenir default aqui - deixar o form onSubmit funcionar
              }}
              className="px-6 py-2 rounded-lg bg-primary hover:bg-gray-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {isLoading ? 'Criando...' : 'Criar Anúncio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAdModal;

