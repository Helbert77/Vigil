import React, { useState } from 'react';
import { User } from '@/types';
import { useToast } from '@/hooks/useToast';
import Card from '../common/Card';
import { useTranslation } from 'react-i18next';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSubmitTicket: (ticket: SupportTicket) => Promise<void>;
}

export interface SupportTicket {
  category: 'technical' | 'billing' | 'feature' | 'other';
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  attachments?: File[];
}

const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose, user, onSubmitTicket }) => {
  const { t } = useTranslation(['support', 'common']);
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<SupportTicket>({
    category: 'technical',
    subject: '',
    description: '',
    priority: user.plan === 'pro' || user.plan === 'premium' ? 'high' : 'medium',
    attachments: []
  });

  const categories = [
    { value: 'technical', label: t('support:categories.technical'), description: t('support:categories.technicalDesc') },
    { value: 'billing', label: t('support:categories.billing'), description: t('support:categories.billingDesc') },
    { value: 'feature', label: t('support:categories.feature'), description: t('support:categories.featureDesc') },
    { value: 'other', label: t('support:categories.other'), description: t('support:categories.otherDesc') }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.description.trim()) {
      addToast(t('support:messages.required'), 'error');
      return;
    }

    if (formData.description.length < 20) {
      addToast(t('support:messages.minDetails'), 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitTicket(formData);
      addToast(t('support:messages.success'), 'success');
      setFormData({
        category: 'technical',
        subject: '',
        description: '',
        priority: user.plan === 'pro' || user.plan === 'premium' ? 'high' : 'medium',
        attachments: []
      });
      onClose();
    } catch (error) {
      addToast(t('support:messages.error'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(f => f.size <= 5 * 1024 * 1024); // Max 5MB
    
    if (validFiles.length < files.length) {
      addToast(t('support:messages.fileSize'), 'error');
    }
    
    setFormData(prev => ({ ...prev, attachments: validFiles }));
  };

  if (!isOpen) return null;

  const isPremiumUser = user.plan === 'pro' || user.plan === 'premium' || user.plan === 'basic';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('support:title')}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {isPremiumUser ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    {t('support:prioritySupport')}
                  </span>
                ) : (
                  t('support:standardSupport')
                )}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={t('common:close')}
            >
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t('support:categories.label')}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, category: cat.value as any }))}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      formData.category === cat.value
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="font-semibold text-gray-900 dark:text-white mb-1">
                      {cat.label}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {cat.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Assunto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('support:fields.subject')}
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder={t('support:fields.subjectPlaceholder')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                maxLength={100}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formData.subject.length}/100 {t('support:fields.chars')}
              </p>
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('support:fields.description')}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t('support:fields.descriptionPlaceholder')}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                maxLength={2000}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formData.description.length}/2000 {t('support:fields.charsMin')}
              </p>
            </div>

            {/* Anexos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('support:fields.attachments')}
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center hover:border-primary transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept="image/*,.pdf,.txt,.log"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {t('support:fields.uploadText')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {t('support:fields.uploadFormats')}
                  </p>
                </label>
              </div>
              {formData.attachments && formData.attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {formData.attachments.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded">
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                        📎 {file.name} ({(file.size / 1024).toFixed(1)}KB)
                      </span>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          attachments: prev.attachments?.filter((_, i) => i !== idx)
                        }))}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        {t('support:fields.remove')}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Informações do Sistema (auto-incluídas) */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                {t('support:autoInfo.title')}
              </p>
              <ul className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
                <li>• {t('support:autoInfo.plan')} <span className="font-semibold uppercase">{user.plan}</span></li>
                <li>• {t('support:autoInfo.user')} @{user.username}</li>
                <li>• {t('support:autoInfo.browser')} {navigator.userAgent.split(' ').slice(-2).join(' ')}</li>
                <li>• {t('support:autoInfo.date')} {new Date().toLocaleString('pt-BR')}</li>
              </ul>
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {t('support:buttons.cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-primary hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('support:buttons.sending')}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    {t('support:buttons.send')}
                  </>
                )}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default SupportModal;
