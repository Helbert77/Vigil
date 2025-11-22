import React, { useState, useRef, useEffect } from 'react';
import { User, Ad } from '@/types';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/integrations/supabase/client';

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

interface EditAdModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    ad: Ad;
    onAdUpdated?: () => void;
}

const EditAdModal: React.FC<EditAdModalProps> = ({ isOpen, onClose, user, ad, onAdUpdated }) => {
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
    });

    useEffect(() => {
        if (ad) {
            setFormData({
                title: ad.title || '',
                description: ad.description || '',
                link_url: ad.link_url || '',
                image_url: ad.image_url || '',
                video_url: ad.video_url || '',
                type: (ad.type as 'native' | 'adsense') || 'native',
            });
        }
    }, [ad]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            addToast('Por favor, selecione uma imagem válida', 'error');
            return;
        }

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

        if (!file.type.startsWith('video/')) {
            addToast('Por favor, selecione um vídeo válido', 'error');
            return;
        }

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
        e.preventDefault();

        if (!formData.title.trim()) {
            addToast('Por favor, insira um título para o anúncio', 'error');
            return;
        }

        if (!formData.description.trim()) {
            addToast('Por favor, insira uma descrição para o anúncio', 'error');
            return;
        }

        if (formData.link_url.trim()) {
            try {
                new URL(formData.link_url);
            } catch {
                addToast('Por favor, insira uma URL válida', 'error');
                return;
            }
        }

        if (!formData.image_url && !formData.video_url) {
            addToast('Por favor, adicione uma imagem ou vídeo ao anúncio', 'error');
            return;
        }

        setIsLoading(true);

        try {
            const linkUrl = formData.link_url.trim() || null;

            const updates = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                link_url: linkUrl,
                image_url: formData.image_url || null,
                video_url: formData.video_url || null,
                type: formData.type,
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase
                .from('anuncios')
                .update(updates)
                .eq('id', ad.id)
                .eq('advertiser_id', user.id);

            if (error) throw error;

            addToast('Anúncio atualizado com sucesso!', 'success');

            if (onAdUpdated) {
                onAdUpdated();
            }
            onClose();

        } catch (error: any) {
            console.error('Erro ao atualizar anúncio:', error);
            addToast(error.message || 'Erro ao atualizar anúncio', 'error');
        } finally {
            setIsLoading(false);
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
                <div className="p-4 border-b border-light-border dark:border-dark-border flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Editar Anúncio</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                        disabled={isLoading}
                    >
                        <XIcon />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="flex-1 flex flex-col overflow-hidden"
                    noValidate
                >
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
                        </div>

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
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        if (!isUploadingImage) imageInputRef.current?.click();
                                    }
                                }}
                                tabIndex={0}
                                role="button"
                                aria-label="Upload de imagem"
                                className="w-full h-48 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:border-primary dark:hover:border-primary transition-colors bg-light-bg dark:bg-dark-bg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary"
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
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        if (!isUploadingVideo) videoInputRef.current?.click();
                                    }
                                }}
                                tabIndex={0}
                                role="button"
                                aria-label="Upload de vídeo"
                                className="w-full h-32 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:border-primary dark:hover:border-primary transition-colors bg-light-bg dark:bg-dark-bg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary"
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

                        <div className="space-y-4">
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
                        </div>
                    </div>

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
                            className="px-6 py-2 rounded-lg bg-primary hover:bg-gray-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isLoading && (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            )}
                            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditAdModal;
