import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Icon } from '@/components/icons/Icon';
import { TimelineEvent } from '@/types';
import { useTimelineEvents } from '@/src/hooks/useTimelineEvents';
import { useSession } from '@/contexts/SessionContext';
import { voteOnEvent, deleteTimelineEvent } from '@/src/services/api';
import { useToast } from '@/hooks/useToast';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import AddEventModal from '../components/timeline/AddEventModal';
import AddEventImageModal from '@/src/components/timeline/AddEventImageModal';
import EventActionsMenu from '../components/timeline/EventActionsMenu';
import { useTranslation } from 'react-i18next';

// Icons
const SearchIcon = () => <Icon><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></Icon>;
const GlobeIcon = () => <Icon><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></Icon>;
const InfoIcon = () => <Icon><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></Icon>;
const ImageIcon = () => <Icon className="h-8 w-8"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></Icon>;
const XIcon = () => <Icon><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></Icon>;
const LinkIcon = () => <Icon><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path></Icon>;
const ChevronUpIcon = () => <Icon><path d="m18 15-6-6-6 6"></path></Icon>;
const ChevronDownIcon = () => <Icon><path d="m6 9 6 6 6-6"></path></Icon>;

const CATEGORY_COLORS = {
  politics: 'from-red-500 to-red-700',
  science: 'from-blue-500 to-blue-700',
  health: 'from-green-500 to-green-700',
  religion: 'from-yellow-500 to-yellow-700',
  technology: 'from-purple-500 to-purple-700',
  society: 'from-pink-500 to-pink-700'
};

const Timeline: React.FC = () => {
  const { t } = useTranslation(['timeline', 'common']);
  const { events, loading, error, refetch } = useTimelineEvents();
  const { user: appUser } = useSession();
  const { addToast } = useToast();
  
  const CATEGORY_LABELS = {
    politics: t('timeline:categories.politics'),
    science: t('timeline:categories.science'),
    health: t('timeline:categories.health'),
    religion: t('timeline:categories.religion'),
    technology: t('timeline:categories.technology'),
    society: t('timeline:categories.society')
  };
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [eventForImage, setEventForImage] = useState<TimelineEvent | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [fullScreenImageUrl, setFullScreenImageUrl] = useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [eventToEdit, setEventToEdit] = useState<TimelineEvent | null>(null);

  // Memoized calculations for selectedEvent
  const selectedEventStats = useMemo(() => {
    if (!selectedEvent) return { 
      percentageTrue: 50, 
      veracidadeLevel: 'média',
      upvotes: 0,
      downvotes: 0
    };

    const upvotes = selectedEvent.upvotes || 0;
    const downvotes = selectedEvent.downvotes || 0;
    const totalVotes = upvotes + downvotes;
    const percentageTrue = totalVotes > 0 ? Math.round((upvotes / totalVotes) * 100) : 50;

    let veracidadeLevel = t('timeline:veracityMedium');
    if (percentageTrue <= 35) {
      veracidadeLevel = t('timeline:veracityLow');
    } else if (percentageTrue >= 66) {
      veracidadeLevel = t('timeline:veracityHigh');
    }

    return { percentageTrue, veracidadeLevel, upvotes, downvotes };
  }, [selectedEvent?.upvotes, selectedEvent?.downvotes]);

  const filteredEvents = useMemo(() => {
    // Primeiro filtra por categoria e busca
    let filtered = [...events];

    // Filtrar por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    // Filtrar por busca
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(lowerQuery) ||
        (event.description?.toLowerCase().includes(lowerQuery) || false)
      );
    }

    // Ordenar por ano (year field é sempre confiável)
    const sorted = [...filtered].sort((a, b) => {
      if (sortOrder === 'newest') {
        // Mais recente primeiro: valores maiores primeiro
        // 2023 > 1 > -100 > -1000 (1000 AC)
        return b.year - a.year;
      } else {
        // Mais antigo primeiro: valores menores primeiro
        // -1000 (1000 AC) < -100 < 1 < 2023
        return a.year - b.year;
      }
    });

    return sorted;
  }, [events, searchQuery, selectedCategory, sortOrder]);

  const formatYear = (year: number) => {
    if (year < 0) {
      return `${Math.abs(year)} ${t('timeline:bc')}`;
    }
    return `${year} ${t('timeline:ad')}`;
  };

  const handleEventAdded = () => {
    // Realtime will handle the update automatically
    // refetch(); // Commented out to avoid double updates with realtime
  };

  const handleOpenImageModal = (event: TimelineEvent) => {
    setEventForImage(event);
    setShowImageModal(true);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) clearTimeout(hoverTimeout);
    };
  }, [hoverTimeout]);

  // selectedEvent is kept in sync via optimistic updates
  // No need for additional realtime sync as it causes double updates

  // Buscar voto do usuário ao abrir modal
  useEffect(() => {
    if (selectedEvent && appUser) {
      const vote = selectedEvent.user_votes?.[appUser.id] || null;
      setUserVote(vote);
    } else {
      setUserVote(null);
    }
  }, [selectedEvent, appUser]);

  // Verificar se usuário tem permissões de admin/moderator
  const hasAdminPermissions = appUser?.role === 'admin' || appUser?.role === 'moderator';

  const handleDeleteEventConfirm = async (event: TimelineEvent) => {
    setDeletingEventId(event.id);
    try {
      const { error } = await deleteTimelineEvent(event.id);
      if (error) throw error;

      addToast('Evento removido com sucesso', 'success');
      // Realtime will handle the update automatically
    } catch (err) {
      console.error('Erro ao remover evento:', err);
      addToast('Erro ao remover evento. Tente novamente.', 'error');
    } finally {
      setDeletingEventId(null);
    }
  };

  const handleEditEvent = (event: TimelineEvent) => {
    setEventToEdit(event);
  };

  const handleVote = useCallback((voteType: 'up' | 'down') => {
    if (!appUser || !selectedEvent || isVoting) return;

    setIsVoting(true);

    // Cache values
    const eventId = selectedEvent.id;
    const userId = appUser.id;
    const prevVote = userVote;
    const prevUp = selectedEvent.upvotes || 0;
    const prevDown = selectedEvent.downvotes || 0;

    // Calculate new values
    const isSameVote = prevVote === voteType;
    let newUp = prevUp;
    let newDown = prevDown;
    let newVote: 'up' | 'down' | null = voteType;

    if (isSameVote) {
      // Remove vote
      newVote = null;
      if (voteType === 'up') newUp--;
      else newDown--;
    } else {
      // Change vote
      if (prevVote === 'up') newUp--;
      if (prevVote === 'down') newDown--;
      if (voteType === 'up') newUp++;
      else newDown++;
    }

    // Single batched state update
    setUserVote(newVote);
    setSelectedEvent(prev => prev ? {
      ...prev,
      upvotes: newUp,
      downvotes: newDown,
      user_votes: {
        ...prev.user_votes,
        ...(newVote ? { [userId]: newVote } : { [userId]: undefined })
      }
    } : null);

    // Async API call (non-blocking)
    Promise.resolve().then(() => 
      voteOnEvent(eventId, voteType, userId)
    ).catch(() => {
      // Revert on error
      setUserVote(prevVote);
      setSelectedEvent(prev => prev ? {
        ...prev,
        upvotes: prevUp,
        downvotes: prevDown
      } : null);
      addToast('Erro ao votar', 'error');
    }).finally(() => {
      setIsVoting(false);
    });
  }, [appUser, selectedEvent, isVoting, userVote, addToast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-gray-800 dark:text-gray-200 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="loading-spinner h-16 w-16 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400 text-lg">{t('common:loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-gray-800 dark:text-gray-200 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <p className="text-red-400 mb-4 text-lg">{t('timeline:errorProcess')}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-cyan-600 hover:bg-cyan-700 px-6 py-3 rounded-lg transition-colors font-medium text-white"
          >
            {t('common:tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-gray-800 dark:text-gray-200 overflow-x-hidden transition-colors duration-300">
      {/* Header Section */}
      <div className="relative pt-6 pb-16 flex flex-col items-center">
        {/* Centered Controls */}
        <div className="max-w-6xl mx-auto w-full px-4 z-10">
          <div className="container mx-auto text-left">
          <h2 className="text-2xl md:text-3xl font-light text-black dark:text-slate-300 mb-4 italic">
            {t('timeline:description')}
          </h2>
            <p className="text-gray-500 dark:text-slate-400 text-lg mb-6">
              {t('timeline:descriptionText')}{' '}
              <button
                onClick={() => setShowAddModal(true)}
                className="text-[#007BFF] hover:text-[#0056b3] transition-colors duration-200 hover:underline focus:outline-none rounded px-1 focus-subtle font-medium"
              >
                {t('timeline:contribute')}
              </button>
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              {/* Filters Container */}
              <div className="bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-enhanced rounded-xl p-4 border border-light-border dark:border-dark-border shadow-lg w-full">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={t('timeline:searchEvents')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-white/70 dark:bg-gray-700/70 border border-light-border dark:border-dark-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent w-full text-gray-800 dark:text-gray-200"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                      <SearchIcon />
                    </div>
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-white/70 dark:bg-gray-700/70 border border-light-border dark:border-dark-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800 dark:text-gray-200 w-full"
                  >
                    <option value="all">{t('timeline:allCategories')}</option>
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                    className="bg-white/70 dark:bg-gray-700/70 border border-light-border dark:border-dark-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800 dark:text-gray-200 w-full"
                  >
                    <option value="newest">{t('timeline:newest')}</option>
                    <option value="oldest">{t('timeline:oldest')}</option>
                  </select>
                </div>
              </div>

            </div>
          </div>
        </div>

      {/* Main Timeline Section */}
      <div className="container mx-auto px-4 sm:px-6 py-16">
        <div className="relative">
          {/* Vertical Timeline Line */}
          <div className="absolute left-1/2 top-0 h-full w-0.5 md:w-0.5 -translate-x-1/2 bg-gray-300 dark:bg-gray-600 timeline-line"></div>

          {filteredEvents.length > 0 ? (
            filteredEvents.map((event, index) => {
              const isEven = index % 2 === 0;
              
              return (
                <div key={event.id} className="relative mb-24">
                  {/* Dot on the timeline */}
                  <div
                    className="absolute left-1/2 md:left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
                    onMouseEnter={() => {
                      if (hoverTimeout) clearTimeout(hoverTimeout);
                      setHoveredEventId(event.id);
                    }}
                    onMouseLeave={() => {
                      const timeout = setTimeout(() => {
                        setHoveredEventId(null);
                      }, 300); // 300ms delay before hiding
                      setHoverTimeout(timeout);
                    }}
                  >
                    <div className={`w-3 h-3 md:w-5 md:h-5 rounded-full bg-gradient-to-br ${CATEGORY_COLORS[event.category as keyof typeof CATEGORY_COLORS]} ring-2 md:ring-4 ring-light-bg dark:ring-dark-bg`}></div>
                  </div>

                  
                  {/* Mobile Layout */}
                  <div className="md:hidden relative">
                    {isEven ? (
                      // Evento par: Balão à esquerda, imagem à direita
                      <div className="grid grid-cols-2 gap-6 items-start">
                        {/* Balão à esquerda */}
                        <div className="flex justify-center pt-8">
                          <div
                            className="timeline-event floating-element bg-light-card dark:bg-dark-card p-1 rounded-full shadow-lg border border-light-border dark:border-dark-border cursor-pointer transition-all duration-300 flex items-center justify-center w-28 h-28 hover:animate-pulse-glow"
                            onClick={() => setSelectedEvent(event)}
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            <div className="w-full h-full rounded-full bg-cyan-50 dark:bg-dark-bg flex flex-col items-center justify-center text-center p-2 overflow-hidden">
                              <span className="text-lg font-bold text-cyan-400">{formatYear(event.year)}</span>
                              <h3 className="text-xs font-bold text-gray-800 dark:text-white mt-1 line-clamp-2">{event.title}</h3>
                            </div>
                          </div>
                        </div>

                        {/* Imagem à direita */}
                        {event.image_url ? (
                          <div className="flex justify-center pt-4">
                            <div className="w-32 h-32 rounded-lg overflow-hidden shadow-lg border border-light-border dark:border-dark-border cursor-pointer hover:animate-pulse-glow transition-all duration-300" onClick={() => setSelectedEvent(event)}>
                              <img
                                src={event.image_url}
                                alt={event.title}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-center pt-4">
                            {hasAdminPermissions ? (
                              <button onClick={() => handleOpenImageModal(event)} className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 hover:border-cyan-500 hover:text-cyan-500 transition-colors">
                                <ImageIcon />
                                <span className="text-xs font-medium mt-1">{t('timeline:addImage')}</span>
                              </button>
                            ) : (
                              <div className="w-32 h-32"></div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      // Evento ímpar: Imagem à esquerda, balão à direita
                      <div className="grid grid-cols-2 gap-6 items-start">
                        {/* Imagem à esquerda */}
                        {event.image_url ? (
                          <div className="flex justify-center pt-4">
                            <div className="w-32 h-32 rounded-lg overflow-hidden shadow-lg border border-light-border dark:border-dark-border cursor-pointer hover:animate-pulse-glow transition-all duration-300" onClick={() => setSelectedEvent(event)}>
                              <img
                                src={event.image_url}
                                alt={event.title}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-center pt-4">
                            {hasAdminPermissions ? (
                              <button onClick={() => handleOpenImageModal(event)} className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 hover:border-cyan-500 hover:text-cyan-500 transition-colors">
                                <ImageIcon />
                                <span className="text-xs font-medium mt-1">{t('timeline:addImage')}</span>
                              </button>
                            ) : (
                              <div className="w-32 h-32"></div>
                            )}
                          </div>
                        )}

                        {/* Balão à direita */}
                        <div className="flex justify-center pt-8">
                          <div
                            className="timeline-event floating-element bg-light-card dark:bg-dark-card p-1 rounded-full shadow-lg border border-light-border dark:border-dark-border cursor-pointer transition-all duration-300 flex items-center justify-center w-28 h-28 hover:animate-pulse-glow"
                            onClick={() => setSelectedEvent(event)}
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            <div className="w-full h-full rounded-full bg-cyan-50 dark:bg-dark-bg flex flex-col items-center justify-center text-center p-2 overflow-hidden">
                              <span className="text-lg font-bold text-cyan-400">{formatYear(event.year)}</span>
                              <h3 className="text-xs font-bold text-gray-800 dark:text-white mt-1 line-clamp-2">{event.title}</h3>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Menu de ações para admin/moderator */}
                    {appUser?.role === 'admin' || appUser?.role === 'moderator' ? (
                      <div className="absolute -top-2 right-0 z-10">
                        <EventActionsMenu
                          event={event}
                          currentUser={appUser}
                          onDelete={handleDeleteEventConfirm}
                          onEdit={handleEditEvent}
                        />
                      </div>
                    ) : null}
                  </div>

                  {/* Desktop Layout - Alternating */}
                  <div className="hidden md:block">
                    {isEven ? (
                      // Even index: Circle on LEFT, Image on RIGHT
                      <div className="grid grid-cols-2 gap-8 items-center relative">
                        <div className="flex justify-end pr-12">
                          <div
                            className="timeline-event floating-element bg-light-card dark:bg-dark-card p-1 rounded-full shadow-lg border border-light-border dark:border-dark-border cursor-pointer transition-all duration-300 flex items-center justify-center w-48 h-48 hover:scale-110 hover:animate-pulse-glow"
                            onClick={() => setSelectedEvent(event)}
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            <div className="w-full h-full rounded-full bg-cyan-50 dark:bg-dark-bg flex flex-col items-center justify-center text-center p-2 overflow-hidden">
                              <span className="text-3xl font-bold text-cyan-400">{formatYear(event.year)}</span>
                              <h3 className="text-xs font-bold text-gray-800 dark:text-white mt-2 line-clamp-3">{event.title}</h3>
                            </div>
                          </div>
                        </div>
                        {appUser?.role === 'admin' || appUser?.role === 'moderator' ? (
                          <div className="absolute -top-2 right-0 z-10">
                        <EventActionsMenu
                          event={event}
                          currentUser={appUser}
                          onDelete={handleDeleteEventConfirm}
                          onEdit={handleEditEvent}
                        />
                          </div>
                        ) : null}
                        {event.image_url ? (
                          <div className="pl-12 timeline-event" style={{ animationDelay: `${index * 0.1 + 0.05}s` }}>
                            <div className="relative group cursor-pointer" onClick={() => setSelectedEvent(event)}>
                              <div className="absolute -inset-1 bg-gradient-to-br from-cyan-400/50 to-purple-600/50 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
                              <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-2xl border-2 border-light-border dark:border-dark-border">
                                <img 
                                  src={event.image_url} 
                                  alt={event.title} 
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <div className="absolute bottom-0 left-0 right-0 p-4">
                                    <p className="text-white font-bold text-sm line-clamp-2">{event.title}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="pl-12">
                            {hasAdminPermissions ? (
                              <button onClick={() => handleOpenImageModal(event)} className="w-full h-64 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 hover:border-cyan-500 hover:text-cyan-500 transition-colors">
                                <ImageIcon />
                                <span className="text-sm font-medium mt-2">{t('timeline:addImage')}</span>
                              </button>
                            ) : (
                              <div className="w-full h-64"></div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      // Odd index: Image on LEFT, Circle on RIGHT
                      <div className="grid grid-cols-2 gap-8 items-center relative">
                        {event.image_url ? (
                          <div className="flex justify-end pr-12 timeline-event" style={{ animationDelay: `${index * 0.1 + 0.05}s` }}>
                            <div className="relative group cursor-pointer" onClick={() => setSelectedEvent(event)}>
                              <div className="absolute -inset-1 bg-gradient-to-br from-purple-600/50 to-cyan-400/50 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
                              <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-2xl border-2 border-light-border dark:border-dark-border">
                                <img
                                  src={event.image_url}
                                  alt={event.title}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <div className="absolute bottom-0 left-0 right-0 p-4">
                                    <p className="text-white font-bold text-sm line-clamp-2">{event.title}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-end pr-12">
                            {hasAdminPermissions ? (
                              <button onClick={() => handleOpenImageModal(event)} className="w-full h-64 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 hover:border-cyan-500 hover:text-cyan-500 transition-colors">
                                <ImageIcon />
                                <span className="text-sm font-medium mt-2">{t('timeline:addImage')}</span>
                              </button>
                            ) : (
                              <div className="w-full h-64"></div>
                            )}
                          </div>
                        )}
                        <div className="pl-12">
                          <div
                            className="timeline-event floating-element bg-light-card dark:bg-dark-card p-1 rounded-full shadow-lg border border-light-border dark:border-dark-border cursor-pointer transition-all duration-300 flex items-center justify-center w-48 h-48 hover:scale-110 hover:animate-pulse-glow"
                            onClick={() => setSelectedEvent(event)}
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            <div className="w-full h-full rounded-full bg-cyan-50 dark:bg-dark-bg flex flex-col items-center justify-center text-center p-2 overflow-hidden">
                              <span className="text-3xl font-bold text-cyan-400">{formatYear(event.year)}</span>
                              <h3 className="text-xs font-bold text-gray-800 dark:text-white mt-2 line-clamp-3">{event.title}</h3>
                            </div>
                          </div>
                        </div>
                        {appUser?.role === 'admin' || appUser?.role === 'moderator' ? (
                          <div className="absolute -top-2 right-0 z-10">
                        <EventActionsMenu
                          event={event}
                          currentUser={appUser}
                          onDelete={handleDeleteEventConfirm}
                          onEdit={handleEditEvent}
                        />
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 dark:text-slate-400 text-lg">{t('timeline:noEventsFound')}</p>
            </div>
          )}
        </div>

        {filteredEvents.length > 0 && (
          <div className="text-center mt-12">
            <p className="text-gray-500 dark:text-slate-400">
              {t('timeline:showingEvents', { count: filteredEvents.length })}
            </p>
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-scale-in">
          <div className="bg-light-card dark:bg-dark-card rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-light-border dark:border-dark-border shadow-2xl">
            <div className="sticky top-0 bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-enhanced border-b border-light-border dark:border-dark-border p-6 flex items-start justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{selectedEvent.title}</h2>
                <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm">
                  <span className="text-cyan-400 font-semibold">{formatYear(selectedEvent.year)}</span>
                  <span className="text-gray-500 dark:text-slate-400">
                    {CATEGORY_LABELS[selectedEvent.category as keyof typeof CATEGORY_LABELS]}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white text-3xl font-light transition-transform duration-200 hover:rotate-90"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto modal-content">
              {selectedEvent.image_url && (
                <div className="w-full h-64 rounded-lg overflow-hidden mb-4 border border-light-border dark:border-dark-border shadow-lg cursor-pointer" onClick={() => { setFullScreenImageUrl(selectedEvent.image_url!); setIsImageModalOpen(true); }}>
                  <img src={selectedEvent.image_url} alt={selectedEvent.title} className="w-full h-full object-cover" />
                </div>
              )}
              {selectedEvent.country && (
                <div className="flex items-center gap-3">
                  <GlobeIcon />
                  <span className="text-gray-700 dark:text-slate-300">{selectedEvent.country}</span>
                </div>
              )}
              {selectedEvent.description && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-800 dark:text-white">
                    <InfoIcon />
                    {t('timeline:descriptionLabel')}
                  </h3>
                  <p className="text-gray-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {selectedEvent.description}
                  </p>
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    {t('timeline:veracity')}
                  </h3>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleVote('up');
                    }}
                    className={`p-1 rounded transition-colors ${
                      userVote === 'up' 
                        ? 'bg-green-500 text-white' 
                        : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                    disabled={!appUser}
                    title={t('timeline:true')}
                  >
                    <ChevronUpIcon />
                  </button>
                  <span className="text-sm text-gray-700 dark:text-slate-300">
                    {selectedEventStats.upvotes}
                  </span>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleVote('down');
                    }}
                    className={`p-1 rounded transition-colors ${
                      userVote === 'down' 
                        ? 'bg-red-500 text-white' 
                        : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                    disabled={!appUser}
                    title={t('timeline:false')}
                  >
                    <ChevronDownIcon />
                  </button>
                  <span className="text-sm text-gray-700 dark:text-slate-300">
                    {selectedEventStats.downvotes}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-green-500 to-red-500 transition-all duration-1000"
                      style={{ width: `${selectedEventStats.percentageTrue}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-slate-300 capitalize min-w-[120px]">
                    {selectedEventStats.veracidadeLevel}
                  </span>
                </div>
              </div>
              {(selectedEvent.source_1 || selectedEvent.source_2) && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-800 dark:text-white">
                    <LinkIcon />
                    {t('timeline:sourcesAndRefs')}
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-slate-300 list-disc list-inside pl-2">
                    {selectedEvent.source_1 && <li><a href={selectedEvent.source_1} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 break-all">{selectedEvent.source_1}</a></li>}
                    {selectedEvent.source_2 && <li><a href={selectedEvent.source_2} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 break-all">{selectedEvent.source_2}</a></li>}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Image Modal */}
      {isImageModalOpen && fullScreenImageUrl && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-scale-in"
          onClick={() => setIsImageModalOpen(false)}
        >
          <button 
            className="absolute top-4 right-4 text-white text-4xl z-50"
            onClick={() => setIsImageModalOpen(false)}
          >
            <XIcon />
          </button>
          <img 
            src={fullScreenImageUrl} 
            alt="Full screen event" 
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Add Event Modal */}
      {(showAddModal || eventToEdit) && (
        <AddEventModal
          onClose={() => {
            setShowAddModal(false);
            setEventToEdit(null);
          }}
          onEventAdded={handleEventAdded}
          editingEvent={eventToEdit}
        />
      )}

      {/* Add Image Modal */}
      {showImageModal && eventForImage && (
        <AddEventImageModal
          event={eventForImage}
          onClose={() => setShowImageModal(false)}
          onImageAdded={() => {
            // Realtime will handle the update automatically
            setShowImageModal(false);
          }}
        />
      )}


      {/* Decorative Elements */}
      <div className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-cyan-400/20 to-purple-600/20 rounded-full blur-xl floating-element"></div>
      <div className="fixed top-1/4 left-8 w-8 h-8 bg-gradient-to-br from-blue-400/30 to-cyan-600/30 rounded-full blur-lg floating-element animation-delay-3000"></div>
    </div>
  );
};

export default memo(Timeline);