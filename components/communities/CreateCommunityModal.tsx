import React, { useState, useRef } from 'react';
import { Icon } from '@/components/icons/Icon';
import { useSession } from '@/contexts/SessionContext';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';

const XIcon = () => <Icon className="h-6 w-6"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></Icon>;
const UploadIcon = () => <Icon className="h-8 w-8 text-gray-500"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></Icon>;

export interface NewCommunityData {
  name: string;
  description: string;
  rules: string[];
  bannerUrl?: string;
  requiredPlan?: 'all' | 'basic+' | 'pro+' | 'premium';
}

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (communityData: NewCommunityData) => void;
  isCreating: boolean;
}

const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({ isOpen, onClose, onCreate, isCreating }) => {
  const { t } = useTranslation(['communities', 'common']);
  const { user } = useSession();
  const { addToast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState<string[]>(['']);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [requiredPlan, setRequiredPlan] = useState<'all' | 'basic+' | 'pro+' | 'premium'>('all');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleRuleChange = (index: number, value: string) => {
    const newRules = [...rules];
    newRules[index] = value;
    setRules(newRules);
  };

  const addRuleInput = () => {
    setRules([...rules, '']);
  };

  const removeRuleInput = (index: number) => {
    if (rules.length > 1) {
      const newRules = rules.filter((_, i) => i !== index);
      setRules(newRules);
    } else {
      setRules(['']);
    }
  };

  const handleBannerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `community-banners/${user.id}/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage.from('posts-media').upload(filePath, file);

    if (error) {
      addToast(t('communities:bannerUploadFailed'), 'error');
      console.error(error);
    } else {
      const { data } = supabase.storage.from('posts-media').getPublicUrl(filePath);
      setBannerUrl(data.publicUrl);
      // Toast removido - banner aparece visualmente
    }
    setIsUploading(false);
  };

  const handleSubmit = () => {
    if (name.trim() && description.trim()) {
      const filteredRules = rules.map(r => r.trim()).filter(r => r);
      onCreate({ name, description, rules: filteredRules, bannerUrl: bannerUrl || undefined, requiredPlan });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-light-border dark:border-dark-border flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold">{t('communities:createCommunity')}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
            <XIcon />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('communities:communityBanner')}</label>
            <input type="file" ref={fileInputRef} onChange={handleBannerUpload} className="hidden" accept="image/*" />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="mt-1 flex justify-center items-center w-full h-32 rounded-md border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:border-primary dark:hover:border-primary transition-colors bg-light-bg dark:bg-dark-bg"
            >
              {isUploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              ) : bannerUrl ? (
                <img src={bannerUrl} alt="Preview do banner" className="h-full w-full object-cover rounded-md" />
              ) : (
                <div className="text-center text-gray-500">
                  <UploadIcon />
                  <p className="text-sm">{t('common:clickToUpload')}</p>
                </div>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="comm-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('communities:communityName')}</label>
            <input
              id="comm-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('communities:namePlaceholder')}
              className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="comm-desc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('communities:description')}</label>
            <textarea
              id="comm-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder={t('communities:descriptionPlaceholder')}
              className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="required-plan" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('communities:requiredPlan')}
            </label>
            <select
              id="required-plan"
              value={requiredPlan}
              onChange={(e) => setRequiredPlan(e.target.value as any)}
              className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">{t('communities:allPlans')}</option>
              <option value="basic+">{t('communities:basicPlus')}</option>
              <option value="pro+">{t('communities:proPlus')}</option>
              <option value="premium">{t('communities:premiumOnly')}</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              A comunidade será visível para todos, mas apenas usuários com o plano selecionado poderão entrar.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('communities:rules')}</label>
            <div className="space-y-2">
              {rules.map((rule, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={rule}
                    onChange={(e) => handleRuleChange(index, e.target.value)}
                    placeholder={t('communities:rulePlaceholder', { number: index + 1 })}
                    className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md py-2 px-3"
                  />
                  <button onClick={() => removeRuleInput(index)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full">
                    <XIcon />
                  </button>
                </div>
              ))}
              <button onClick={addRuleInput} className="text-sm font-semibold text-primary hover:underline">
                + {t('communities:addRule')}
              </button>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-light-border dark:border-dark-border flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || !description.trim() || isCreating || isUploading}
            className="bg-primary hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-full transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isCreating ? t('common:creating') : t('communities:createCommunity')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCommunityModal;