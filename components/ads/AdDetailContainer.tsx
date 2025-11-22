import React, { useState, useEffect } from 'react';
import { Ad, User } from '../../types';
import AdDetail from '../../pages/AdDetail';
import { useAds } from '../../src/hooks/useAds';
import * as api from '../../src/services/api';
import { useToast } from '../../hooks/useToast';

interface AdDetailContainerProps {
    adId: string;
    user: User;
    activeCommentId?: string | null;
    onNavigateBack: () => void;
    onTrackMetric: (adId: string, eventType: 'impression' | 'click' | 'like' | 'share' | 'save') => void;
    shareableUsers: User[];
    onSendMessage?: (params: { targetUserId: string, text: string }) => void;
    allUsers: User[];
    // Props de interação que vêm do App.tsx
    likedAdIds: string[];
    savedAdIds: string[];
    toggleAdLike: (adId: string, isCurrentlyLiked: boolean) => void;
    toggleAdSave: (adId: string, isCurrentlySaved: boolean) => void;
    hideAd: (adId: string) => void;
    incrementAdShares: (adId: string) => void;
    incrementAdViews: (adId: string) => void;
}

const AdDetailContainer: React.FC<AdDetailContainerProps> = ({
    adId,
    user,
    activeCommentId,
    onNavigateBack,
    onTrackMetric,
    shareableUsers,
    onSendMessage,
    allUsers,
    likedAdIds,
    savedAdIds,
    toggleAdLike,
    toggleAdSave,
    hideAd,
    incrementAdShares,
    incrementAdViews
}) => {
    const { ads: mainAds } = useAds('main');
    const [ad, setAd] = useState<Ad | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        const loadAd = async () => {
            setIsLoading(true);

            // 1. Tentar encontrar nos anúncios já carregados (cache/contexto)
            const foundAd = mainAds.find(a => a.id === adId);

            if (foundAd) {
                setAd(foundAd);
                setIsLoading(false);
                return;
            }

            // 2. Se não encontrar, buscar na API
            try {
                const result = await api.fetchAdById(adId);
                if (result.error) {
                    throw result.error;
                }
                if (result.data) {
                    setAd(result.data);
                } else {
                    throw new Error('Anúncio não encontrado');
                }
            } catch (error) {
                console.error('Erro ao carregar anúncio:', error);
                addToast('Erro ao carregar detalhes do anúncio', 'error');
                onNavigateBack(); // Voltar se falhar
            } finally {
                setIsLoading(false);
            }
        };

        loadAd();
    }, [adId, mainAds, addToast, onNavigateBack]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!ad) {
        return null;
    }

    return (
        <AdDetail
            ad={ad}
            activeCommentId={activeCommentId}
            onNavigateBack={onNavigateBack}
            user={user}
            isLiked={likedAdIds.includes(ad.id)}
            isSaved={savedAdIds.includes(ad.id)}
            onToggleLike={toggleAdLike}
            onToggleSave={toggleAdSave}
            onHideAd={hideAd}
            onIncrementShares={incrementAdShares}
            onIncrementViews={incrementAdViews}
            onTrackMetric={onTrackMetric}
            shareableUsers={shareableUsers}
            onSendMessage={onSendMessage}
            allUsers={allUsers}
        />
    );
};

export default AdDetailContainer;
