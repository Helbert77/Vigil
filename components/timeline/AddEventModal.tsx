import React, { useState } from 'react';
import { Icon } from '@/components/icons/Icon';
import { createTimelineEvent } from '@/src/services/api';
import { useToast } from '@/hooks/useToast';

const XIcon = () => <Icon><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></Icon>;

interface AddEventModalProps {
  onClose: () => void;
  onEventAdded: () => void;
}

const AddEventModal: React.FC<AddEventModalProps> = ({ onClose, onEventAdded }) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    year: new Date().getFullYear(),
    category: 'politics' as 'politics' | 'science' | 'health' | 'religion' | 'technology' | 'society',
    description: '',
    impact: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    status: 'disputed' as 'confirmed' | 'disputed' | 'debunked',
    country: '',
    source_1: '',
    source_2: '',
    evidence_level: 'medio' as 'baixo' | 'medio' | 'alto' | 'confirmado',
    social_damage: 'medio' as 'baixo' | 'medio' | 'alto' | 'critico',
    verification_priority: 'media' as 'baixa' | 'media' | 'alta' | 'urgente',
    event_date: '',
    image_url: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      addToast('Por favor, insira um título para o evento', 'error');
      return;
    }

    setLoading(true);
    try {
      const { error } = await createTimelineEvent({
        ...formData,
        x_position: 0,
        y_position: 0
      });

      if (error) throw error;

      // Toast removido - evento aparece na timeline
      onEventAdded();
      onClose();
    } catch (err) {
      console.error('Erro ao adicionar evento:', err);
      addToast('Erro ao adicionar evento. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-6 animate-scale-in">
      <div className="bg-light-card dark:bg-dark-card rounded-lg md:rounded-2xl max-w-3xl w-full max-h-[95vh] md:max-h-[90vh] flex flex-col border border-light-border dark:border-dark-border shadow-2xl">
        <div className="sticky top-0 bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-enhanced border-b border-light-border dark:border-dark-border p-3 md:p-6 flex items-center justify-between z-10">
          <h2 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white truncate pr-2">Adicionar Novo Evento</h2>
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
                Impacto *
              </label>
              <select
                name="impact"
                value={formData.impact}
                onChange={handleChange}
                required
                className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg py-3 md:py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800 dark:text-gray-200 text-base"
              >
                <option value="low">Baixo</option>
                <option value="medium">Médio</option>
                <option value="high">Alto</option>
                <option value="critical">Crítico</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg py-3 md:py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800 dark:text-gray-200 text-base"
              >
                <option value="confirmed">Confirmado</option>
                <option value="disputed">Disputado</option>
                <option value="debunked">Desmentido</option>
              </select>
            </div>
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
                Nível de Evidência
              </label>
              <select
                name="evidence_level"
                value={formData.evidence_level}
                onChange={handleChange}
                className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg py-3 md:py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800 dark:text-gray-200 text-base"
              >
                <option value="baixo">Baixo</option>
                <option value="medio">Médio</option>
                <option value="alto">Alto</option>
                <option value="confirmado">Confirmado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dano Social
              </label>
              <select
                name="social_damage"
                value={formData.social_damage}
                onChange={handleChange}
                className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg py-3 md:py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800 dark:text-gray-200 text-base"
              >
                <option value="baixo">Baixo</option>
                <option value="medio">Médio</option>
                <option value="alto">Alto</option>
                <option value="critico">Crítico</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prioridade de Verificação
              </label>
              <select
                name="verification_priority"
                value={formData.verification_priority}
                onChange={handleChange}
                className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg py-3 md:py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800 dark:text-gray-200 text-base"
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL da Imagem
            </label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg py-3 md:py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800 dark:text-gray-200 text-base"
              placeholder="https://exemplo.com/imagem.jpg"
            />
          </div>

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
              {loading ? 'Criando...' : 'Criar Evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEventModal;