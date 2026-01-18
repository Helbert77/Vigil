import React, { useState, useRef, useEffect, memo } from 'react';
import { Ad, User } from '../../types';
import Card from '../common/Card';
import Avatar from '../common/Avatar';
import { Icon } from '../icons/Icon';
import ShareDmModal from '../post/ShareDmModal';
import { useToast } from '../../hooks/useToast';
import { EyeIcon } from '../icons/EyeIcon';
import Tooltip from '../common/Tooltip';
import { useSimpleTimeAgo } from '../../hooks/useTimeAgoOptimized';
import ResilientVideo from '@/src/components/common/ResilientVideo';
import ReportModal from '@/src/components/post/ReportModal';
import MediaViewer from '@/src/components/common/MediaViewer';
import * as api from '@/src/services/api';

// Ícones
const HeartIcon = ({ filled }: { filled: boolean }) => (
  <Icon className={filled ? 'text-red-500' : ''} fill={filled ? 'currentColor' : 'none'}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </Icon>
);

const MessageCircleIcon = () => <Icon><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></Icon>;

const ShareIcon = () => <Icon><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" x2="12" y1="2" y2="15"></line></Icon>;

const BookmarkIcon = ({ filled }: { filled: boolean }) => (
  <Icon className={filled ? 'text-yellow-500' : ''} fill={filled ? 'currentColor' : 'none'}>
    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path>
  </Icon>
);

const LinkIcon = () => <Icon className="h-5 w-5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path></Icon>;

const WhatsAppIcon = () => <Icon className="h-5 w-5 text-green-500"><path d="M21.5 14.9c-1.3-0.7-2.7-1.3-4-2 -0.3-0.1-0.6-0.2-0.9 0s-0.5 0.5-0.7 0.8l-0.8 1c-0.2 0.3-0.5 0.3-0.8 0.2 -1.6-0.6-3-1.8-4.2-3.1 -1.2-1.3-2.1-2.8-2.6-4.4 -0.1-0.3 0-0.6 0.2-0.8l1-1c0.3-0.2 0.5-0.5 0.7-0.8 0.2-0.3 0.2-0.6 0.1-0.9 -0.6-1.3-1.3-2.7-2-4 -0.2-0.4-0.6-0.6-1-0.6h-1.5c-0.5 0-1 0.5-1.2 1 -0.5 1.1-0.5 2.8 0.3 5 1.4 3.6 4.1 6.8 7.5 8.6 2.1 1.1 4.1 1.4 6 0.9 0.5-0.1 1-0.6 1.2-1.2v-1.5c0-0.4-0.2-0.8-0.6-1z"></path></Icon>;

const TelegramIcon = () => <Icon className="h-5 w-5 text-blue-400"><path d="M22 2L11 13l-2 9 4-7 8-5-11 9-2-5Z"></path><path d="M22 2L2 9l9 4 4 9Z"></path></Icon>;

const FacebookIcon = () => <Icon className="h-5 w-5 text-blue-600"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></Icon>;

const InstagramIcon = () => <Icon className="h-5 w-5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></Icon>;

const SendIcon = () => <Icon className="h-5 w-5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></Icon>;

const ExternalLinkIcon = () => <Icon className="h-4 w-4"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" x2="21" y1="14" y2="3"></line></Icon>;

const MoreHorizontalIcon = () => <Icon><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></Icon>;

const FlagIcon = () => <Icon className="h-5 w-5 text-primary"><path d="M4 4v16"></path><path d="M6 4h10l-2 5 2 5H6z"></path></Icon>;

const EyeOffIcon = () => <Icon className="h-5 w-5 text-red-500"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" y1="2" x2="22" y2="22"></line></Icon>;

// Componente de tempo
const TimeDisplay = memo(({ timestamp, className }: { timestamp: string; className?: string }) => {
  const timeAgo = useSimpleTimeAgo(timestamp);
  return <span className={className}>{timeAgo}</span>;
});

TimeDisplay.displayName = 'TimeDisplay';

interface AdCardProps {
  ad: Ad;
  user: User;
  onTrackMetric: (adId: string, eventType: 'impression' | 'click' | 'like' | 'share' | 'save') => void;
  shareableUsers?: User[];
  onSendMessage?: (params: { targetUserId: string, text: string }) => void;
  isLiked?: boolean;
  isSaved?: boolean;
  onToggleLike: (adId: string, isCurrentlyLiked: boolean) => void;
  onToggleSave: (adId: string, isCurrentlySaved: boolean) => void;
  onHideAd: (adId: string) => void;
  onIncrementShares: (adId: string) => void;
  onIncrementViews: (adId: string) => void;
  onViewAd?: (adId: string) => void; // Igual ao onViewPost do PostCard
}

const AdCard: React.FC<AdCardProps> = ({ ad, user, onTrackMetric, shareableUsers = [], onSendMessage, isLiked = false, isSaved = false, onToggleLike, onToggleSave, onHideAd, onIncrementShares, onIncrementViews, onViewAd }) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showDmModal, setShowDmModal] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [isMediaViewerOpen, setIsMediaViewerOpen] = useState(false);
  const { addToast } = useToast();
  const hasTrackedImpression = useRef(false);
  const shareContainerRef = useRef<HTMLDivElement>(null);
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  // Rastrear impressão e incrementar visualizações automaticamente
  useEffect(() => {
    if (!hasTrackedImpression.current) {
      onTrackMetric(ad.id, 'impression');
      onIncrementViews(ad.id);
      hasTrackedImpression.current = true;
    }
  }, [ad.id, onTrackMetric, onIncrementViews]);

  // Fechar menus ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareContainerRef.current && !shareContainerRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setShowActionsMenu(false);
      }
    };

    if (showShareMenu || showActionsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showShareMenu, showActionsMenu]);

  const handleAdClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTrackMetric(ad.id, 'click');
    window.open(ad.link_url, '_blank', 'noopener,noreferrer');
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleLike(ad.id, isLiked);
    onTrackMetric(ad.id, 'like');
  };

  // EXATAMENTE IGUAL AO POSTCARD - apenas redireciona para página de detalhes
  const handleComment = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onViewAd) {
      onViewAd(ad.id);
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleSave(ad.id, isSaved);
    onTrackMetric(ad.id, 'save');
    
    const toastMessage = !isSaved ? 'Anúncio salvo!' : 'Anúncio removido dos salvos';
    // Toast removido - ação visual já indica sucesso
  };

  const copyToClipboard = (text: string): Promise<void> => {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        textArea.remove();
        resolve();
      } catch (err) {
        textArea.remove();
        reject(err);
      }
    });
  };

  const handleShare = async (e: React.MouseEvent, platform: string) => {
    e.preventDefault();
    e.stopPropagation();
    setShowShareMenu(false);
    onIncrementShares(ad.id);
    onTrackMetric(ad.id, 'share');

    const shareUrl = ad.link_url;
    const shareText = `${ad.title} - ${ad.description}`;

    switch (platform) {
      case 'copy':
        try {
          await copyToClipboard(shareUrl);
          // Toast removido - ação de copiar é instantânea
        } catch (error) {
          addToast('Erro ao copiar link', 'error');
        }
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'instagram':
        try {
          await copyToClipboard(shareUrl);
          // Toast removido - ação de copiar é instantânea
        } catch (error) {
          addToast('Erro ao copiar link', 'error');
        }
        break;
    }
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  const handleHideAd = () => {
    onHideAd(ad.id);
    setShowActionsMenu(false);
    // Toast removido - anúncio desaparece visualmente
  };

  const handleOpenReport = () => {
    console.log('🚩 [AdCard] BOTÃO DENUNCIAR CLICADO', {
      adId: ad.id,
      timestamp: new Date().toISOString()
    });
    
    setIsReportModalOpen(true);
    setShowActionsMenu(false);
    console.log('🚩 [AdCard] DENUNCIAR - Modal de denúncia aberto');
  };

  const handleSubmitReport = async (reason: string, notes: string) => {
    console.log('🚩 [AdCard] ENVIANDO DENÚNCIA', {
      adId: ad.id,
      userId: user.id,
      reason,
      notes,
      timestamp: new Date().toISOString()
    });
    
    try {
      setIsSubmittingReport(true);
      console.log('🚩 [AdCard] DENUNCIAR - Chamando API createReport...');
      
      const result = await api.createReport({
        reporter_id: user.id,
        content_id: ad.id,
        content_type: 'ad',
        reason,
        notes: notes || undefined,
      });
      
      console.log('🚩 [AdCard] DENUNCIAR - Resposta da API:', result);
      
      if (result.error) {
        if (result.error.code === 'DUPLICATE_REPORT') {
          console.warn('🚩 [AdCard] DENUNCIAR - Denúncia duplicada detectada');
          addToast(result.error.message || 'Você já denunciou este anúncio.', 'info');
          setIsReportModalOpen(false);
          return;
        }
        console.error('🚩 [AdCard] DENUNCIAR - Erro na API:', result.error);
        throw result.error;
      }
      
      console.log('🚩 [AdCard] DENUNCIAR - Denúncia enviada com sucesso!');
      console.log('🚩 [AdCard] DENUNCIAR - Dados salvos em: reports table (Supabase)');
      // Toast removido - modal fecha indicando sucesso
      setIsReportModalOpen(false);
    } catch (err: any) {
      console.error('🚩 [AdCard] DENUNCIAR - Erro ao enviar:', err);
      const errorMessage = err?.message || 'Erro ao enviar denúncia. Tente novamente.';
      addToast(errorMessage, 'error');
    } finally {
      setIsSubmittingReport(false);
      console.log('🚩 [AdCard] DENUNCIAR - Processo finalizado');
    }
  };


  const handleCardClick = (e: React.MouseEvent) => {
    // Não fazer nada se clicar em elementos interativos
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('a') ||
      target.closest('video') ||
      target.closest('.share-menu')
    ) {
      return;
    }

    // Navegar para página de detalhes do anúncio
    if (onViewAd) {
      onViewAd(ad.id);
    }
  };

  return (
    <>
      <Card 
        className="mb-3 md:mb-4 relative cursor-pointer"
        onClick={handleCardClick}
        role="link"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (onViewAd) {
              onViewAd(ad.id);
            }
          }
        }}
      >
        {/* Cabeçalho do anúncio - Seguindo estrutura do PostCard */}
        <div className="flex items-start space-x-3 md:space-x-4">
          <div className="flex-shrink-0">
            <Avatar 
              src={ad.advertiser_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(ad.advertiser_name)}&background=667eea&color=fff`} 
              alt={ad.advertiser_name} 
              size="md" 
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-gray-900 dark:text-white text-sm md:text-base">{ad.advertiser_name}</p>
                  <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">·</span>
                  <TimeDisplay timestamp={ad.timestamp || ad.start_date} className="text-xs md:text-sm text-gray-500 dark:text-gray-400" />
                  {/* Badge de Patrocinado - Reposicionado */}
                  <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">·</span>
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ExternalLinkIcon />
                    <span>Patrocinado</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Anunciante</p>
              </div>
              
              {/* Menu de Ações */}
              <div className="pl-2 md:pl-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <div className="relative" ref={actionsMenuRef}>
                  <Tooltip text="Mais ações" position="bottom">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowActionsMenu(!showActionsMenu);
                      }}
                      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                      aria-haspopup="menu"
                      aria-expanded={showActionsMenu}
                      aria-label="Abrir menu de ações do anúncio"
                    >
                      <MoreHorizontalIcon />
                    </button>
                  </Tooltip>
                  {showActionsMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg shadow-lg z-20">
                      <Tooltip text="Denunciar este anúncio">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleOpenReport();
                          }}
                          className="w-full text-left flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
                          aria-label="Denunciar anúncio"
                          role="menuitem"
                        >
                          <FlagIcon />
                          <span>Denunciar Anúncio</span>
                        </button>
                      </Tooltip>
                      <Tooltip text="Ocultar este anúncio">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleHideAd();
                          }}
                          className="w-full text-left flex items-center space-x-3 px-4 py-2 text-sm text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700"
                          aria-label="Ocultar anúncio"
                          role="menuitem"
                        >
                          <EyeOffIcon />
                          <span>Ocultar Anúncio</span>
                        </button>
                      </Tooltip>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo do anúncio */}
        <div className="mt-3 md:mt-4">
          <div className="mb-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {ad.title}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words text-sm md:text-base">
              {ad.description}
            </p>
          </div>

          {/* Mídia do anúncio */}
          {(ad.image_url || ad.video_url) && (
            <div className="mb-3 rounded-lg overflow-hidden">
              {ad.image_url && (
                <img 
                  src={ad.image_url} 
                  alt={ad.title} 
                  className="w-full h-auto object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ maxHeight: window.innerWidth < 768 ? '256px' : '384px' }}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    // Só abre em tela cheia se não tiver onViewAd (não está no feed)
                    if (!onViewAd) {
                      setIsMediaViewerOpen(true);
                    } else {
                      onViewAd(ad.id);
                    }
                  }}
                />
              )}
              {ad.video_url && (
                <div 
                  className="cursor-pointer"
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    // Só abre em tela cheia se não tiver onViewAd (não está no feed)
                    if (!onViewAd) {
                      setIsMediaViewerOpen(true);
                    } else {
                      onViewAd(ad.id);
                    }
                  }}
                >
                  <ResilientVideo
                    src={ad.video_url}
                    controls
                    className="rounded-lg w-full bg-dark-bg"
                    style={{ maxHeight: window.innerWidth < 768 ? '256px' : '384px' }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Botão CTA */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleAdClick(e);
          }}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
        >
          <span>Saiba Mais</span>
          <ExternalLinkIcon />
        </button>

        {/* Botões de ação (igual ao PostCard) */}
        <div className="flex justify-around mt-3 md:mt-4 pt-2 border-t border-light-border dark:border-dark-border" onClick={(e) => e.stopPropagation()}>
            <Tooltip text="Curtir">
              <button onClick={handleLike} className="flex items-center space-x-1 md:space-x-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-500 transition-colors duration-200 transform active:scale-110">
                <HeartIcon filled={isLiked} />
                <span className="text-xs md:text-sm">{ad.likes || 0}</span>
              </button>
            </Tooltip>

            <Tooltip text="Comentar">
              <button onClick={handleComment} className="flex items-center space-x-1 md:space-x-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-500 transition-colors duration-200 transform active:scale-110">
                <MessageCircleIcon />
                <span className="text-xs md:text-sm">{ad.comments || 0}</span>
              </button>
            </Tooltip>

            <div className="relative" ref={shareContainerRef} onClick={(e) => e.stopPropagation()}>
              <Tooltip text="Compartilhar">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowShareMenu(!showShareMenu);
                  }} 
                  className="flex items-center space-x-1 md:space-x-2 text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-500 transition-colors duration-200 transform active:scale-110"
                >
                  <ShareIcon />
                  <span className="text-xs md:text-sm">{ad.shares || 0}</span>
                </button>
              </Tooltip>
              {showShareMenu && (
                <div className="share-menu absolute bottom-full right-1/2 translate-x-1/2 mb-2 w-48 md:w-56 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg shadow-lg z-10 overflow-hidden">
                  <button onClick={(e) => handleActionClick(e, () => { setShowDmModal(true); setShowShareMenu(false); })} className="w-full text-left flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2 text-xs md:text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">
                    <SendIcon />
                    <span className="truncate">Direct Message</span>
                  </button>
                  <button onClick={(e) => handleShare(e, 'copy')} className="w-full text-left flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2 text-xs md:text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">
                    <LinkIcon />
                    <span className="truncate">Copy Link</span>
                  </button>
                  <button onClick={(e) => handleShare(e, 'whatsapp')} className="w-full text-left flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2 text-xs md:text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">
                    <WhatsAppIcon />
                    <span className="truncate">WhatsApp</span>
                  </button>
                  <button onClick={(e) => handleShare(e, 'telegram')} className="w-full text-left flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2 text-xs md:text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">
                    <TelegramIcon />
                    <span className="truncate">Telegram</span>
                  </button>
                  <button onClick={(e) => handleShare(e, 'facebook')} className="w-full text-left flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2 text-xs md:text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">
                    <FacebookIcon />
                    <span className="truncate">Facebook</span>
                  </button>
                  <button onClick={(e) => handleShare(e, 'instagram')} className="w-full text-left flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2 text-xs md:text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">
                    <InstagramIcon />
                    <span className="truncate">Instagram</span>
                  </button>
                </div>
              )}
            </div>

            <Tooltip text="Salvar">
              <button onClick={handleSave} className="flex items-center space-x-1 md:space-x-2 text-gray-500 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-500 transition-colors duration-200 transform active:scale-110">
                <BookmarkIcon filled={isSaved} />
              </button>
            </Tooltip>

            <Tooltip text="Visualizações">
              <div className="flex items-center space-x-1 md:space-x-2 text-gray-500 dark:text-gray-400">
                <EyeIcon />
                <span className="text-xs md:text-sm">{ad.views || 0}</span>
              </div>
            </Tooltip>
        </div>
      </Card>

      {showDmModal && onSendMessage && (
        <ShareDmModal
          isOpen={showDmModal}
          onClose={() => setShowDmModal(false)}
          users={shareableUsers}
          onSend={(userId, message) => {
            onSendMessage({ targetUserId: userId, text: `${message}\n\n${ad.title}\n${ad.link_url}` });
            setShowDmModal(false);
          }}
        />
      )}

      {/* Modal de denúncia */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleSubmitReport}
        isSubmitting={isSubmittingReport}
      />

      {/* Visualizador de mídia */}
      {(ad.image_url || ad.video_url) && (
        <MediaViewer
          isOpen={isMediaViewerOpen}
          onClose={() => setIsMediaViewerOpen(false)}
          mediaUrl={ad.image_url || ad.video_url || ''}
          mediaType={ad.image_url ? 'image' : 'video'}
          alt={ad.title}
        />
      )}
    </>
  );
};

export default memo(AdCard);

