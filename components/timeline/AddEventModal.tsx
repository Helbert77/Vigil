import React, { useState, useEffect } from 'react';
import { Icon } from '@/components/icons/Icon';
import { TimelineEvent } from '@/types';
import { createTimelineEvent, updateTimelineEvent } from '@/src/services/api';
import { useToast } from '@/hooks/useToast';
import { useSession } from '@/contexts/SessionContext';
import * as api from '../../src/services/api';

const XIcon = () => <Icon><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></Icon>;

interface AddEventModalProps {
  onClose: () => void;
  onEventAdded: () => void;
  editingEvent?: TimelineEvent | null;
  isModerationEdit?: boolean; // NOVO
  queueItemId?: string; // NOVO
}

const AddEventModal: React.FC<AddEventModalProps> = ({ onClose, onEventAdded, editingEvent, isModerationEdit, queueItemId }) => {
  const { addToast } = useToast();
  const { user } = useSession(); // NOVO
  const [loading, setLoading] = useState(false);
  const isEditing = !!editingEvent;
  const isAdminOrModerator = user?.role === 'admin' || user?.role === 'moderator'; // NOVO

  const [formData, setFormData] = useState({
    title: '',
    year: new Date().getFullYear(),
    category: 'politics' as 'politics' | 'science' | 'health' | 'religion' | 'technology' | 'society',
    description: '',
    country: '',
    source_1: '',
    source_2: '',
    event_date: '',
    media: null as File | null
  });

  // Initialize form data when editing
  useEffect(() => {
    if (editingEvent) {
      setFormData({
        title: editingEvent.title,
        year: editingEvent.year,
        category: editingEvent.category,
        description: editingEvent.description || '',
        country: editingEvent.country || '',
        source_1: editingEvent.source_1 || '',
        source_2: editingEvent.source_2 || '',
        event_date: editingEvent.event_date || '',
        media: null as File | null
      });
    }
  }, [editingEvent]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' ? (value === '' ? '' : parseInt(value) || '') : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      addToast('Por favor, insira um título para o evento', 'error');
      return;
    }

    if (isNaN(formData.year as any)) {
      addToast('Por favor, insira um ano válido', 'error');
      return;
    }

    setLoading(true);
    try {
      const { media, event_date, ...submitData } = formData;

      // NOVO: Se está editando item da fila de moderação
      if (isModerationEdit && queueItemId) {
        const { error } = await api.updateTimelineQueueItem(queueItemId, {
          ...submitData,
          ...(event_date && { event_date })
        });
        if (error) throw error;
        addToast('Evento atualizado na fila!', 'success');
        onEventAdded();
        onClose();
        return;
      }

      // Se está editando evento existente na timeline
      if (isEditing && editingEvent) {
        const { error } = await updateTimelineEvent(editingEvent.id, {
          ...submitData,
          ...(event_date && { event_date })
        });
        if (error) throw error;
        addToast('Evento atualizado com sucesso!', 'success');
      } 
      // NOVO: Se é admin/moderador, criar direto na timeline
      else if (isAdminOrModerator) {
        const { error } = await createTimelineEvent({
          ...submitData,
          ...(event_date && { event_date }),
          x_position: 0,
          y_position: 0,
          ...(media && { media_file: media })
        });
        if (error) throw error;
        addToast('Evento criado com sucesso!', 'success');
      } 
      // NOVO: Se é usuário comum, submeter para moderação
      else {
        const { error } = await api.submitTimelineEventForModeration({
          ...submitData,
          ...(event_date && { event_date })
        });
        if (error) throw error;
        addToast('Evento submetido para moderação! Aguarde aprovação.', 'info');
      }

      onEventAdded();
      onClose();
    } catch (err) {
      console.error('Erro ao processar evento:', err);
      addToast('Erro ao processar evento. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-6 animate-scale-in">
      <div className="bg-light-card dark:bg-dark-card rounded-lg md:rounded-2xl max-w-3xl w-full max-h-[95vh] md:max-h-[90vh] flex flex-col border border-light-border dark:border-dark-border shadow-2xl">
        <div className="sticky top-0 bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-enhanced border-b border-light-border dark:border-dark-border p-3 md:p-6 flex items-center justify-between z-10">
          <h2 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white truncate pr-2">
            {isEditing ? 'Editar Evento' : 'Adicionar Novo Evento'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white transition-colors flex-shrink-0 p-1"
          >
            <XIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3 md:p-6 space-y-3 md:space-y-4 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Título *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg py-3 md:py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800 dark:text-gray-200 text-base"
              placeholder="Ex: A Conspiração da Área 51"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ano * (use números negativos para AC)
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg py-3 md:py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800 dark:text-gray-200 text-base"
                placeholder="Ex: 1947 ou -3300 para AC"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categoria *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg py-3 md:py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800 dark:text-gray-200 text-base"
              >
                <option value="politics">Política</option>
                <option value="science">Ciência</option>
                <option value="health">Saúde</option>
                <option value="religion">Religião</option>
                <option value="technology">Tecnologia</option>
                <option value="society">Sociedade</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descrição
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg py-3 md:py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800 dark:text-gray-200 text-base"
              placeholder="Descreva o evento..."
            />
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                País
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg py-3 md:py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800 dark:text-gray-200 text-base"
                placeholder="Ex: Brasil"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Adicionar Mídia
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setFormData(prev => ({ ...prev, media: file }));
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div
                  tabIndex={0}
                  className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg py-3 md:py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800 dark:text-gray-200 text-base cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      const fileInput = e.currentTarget.previousElementSibling as HTMLInputElement;
                      fileInput?.click();
                    }
                  }}
                >
                  {formData.media ? (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="truncate">{formData.media.name}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span>Clique para adicionar mídia</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fonte 1
              </label>
              <input
                type="url"
                name="source_1"
                value={formData.source_1}
                onChange={handleChange}
                className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg py-3 md:py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800 dark:text-gray-200 text-base"
                placeholder="https://fonte1.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fonte 2
              </label>
              <input
                type="url"
                name="source_2"
                value={formData.source_2}
                onChange={handleChange}
                className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg py-3 md:py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800 dark:text-gray-200 text-base"
                placeholder="https://fonte2.com"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 md:py-2 rounded-lg border border-light-border dark:border-dark-border hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 text-base font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 md:py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base"
            >
              {loading ? (isEditing ? 'Salvando...' : 'Criando...') : (isEditing ? 'Salvar Alterações' : 'Criar Evento')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEventModal;