import React, { useState } from 'react';
import { Icon } from '@/components/icons/Icon';
import { TimelineEvent } from '@/types';
import { useTimelineEvents } from '@/src/hooks/useTimelineEvents';
import AddEventModal from '../components/timeline/AddEventModal';
import AddEventImageModal from '@/src/components/timeline/AddEventImageModal';

// Icons
const SearchIcon = () => <Icon><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></Icon>;
const GlobeIcon = () => <Icon><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></Icon>;
const InfoIcon = () => <Icon><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></Icon>;
const PlusIcon = () => <Icon><path d="M5 12h14"></path><path d="M12 5v14"></path></Icon>;
const ImageIcon = () => <Icon className="h-8 w-8"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></Icon>;
const XIcon = () => <Icon><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></Icon>;
const LinkIcon = () => <Icon><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path></Icon>;

const CATEGORY_COLORS = {
  politics: 'from-red-500 to-red-700',
  science: 'from-blue-500 to-blue-700',
  health: 'from-green-500 to-green-700',
  religion: 'from-yellow-500 to-yellow-700',
  technology: 'from-purple-500 to-purple-700',
  society: 'from-pink-500 to-pink-700'
};

const CATEGORY_LABELS = {
  politics: 'Política',
  science: 'Ciência',
  health: 'Saúde',
  religion: 'Religião',
  technology: 'Tecnologia',
  society: 'Sociedade'
};

const Timeline: React.FC = () => {
  const { events, loading, error, refetch } = useTimelineEvents();
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [eventForImage, setEventForImage] = useState<TimelineEvent | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [fullScreenImageUrl, setFullScreenImageUrl] = useState<string | null>(null);

  const sortedEvents = [...events].sort((a, b) => a.year - b.year);

  const filteredEvents = sortedEvents.filter((event: TimelineEvent) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || event.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatYear = (year: number) => {
    if (year < 0) {
      return `${Math.abs(year)} AC`;
    }
    return `${year} DC`;
  };

  const handleEventAdded = () => {
    refetch();
  };

  const handleOpenImageModal = (event: TimelineEvent) => {
    setEventForImage(event);
    setShowImageModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-gray-800 dark:text-gray-200 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="loading-spinner h-16 w-16 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400 text-lg">Carregando eventos da timeline...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-gray-800 dark:text-gray-200 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <p className="text-red-400 mb-4 text-lg">Erro ao carregar eventos: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-cyan-600 hover:bg-cyan-700 px-6 py-3 rounded-lg transition-colors font-medium text-white"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-gray-800 dark:text-gray-200 overflow-x-hidden transition-colors duration-300">
      {/* Header Section */}
      <div className="relative pt-20 pb-16 flex flex-col items-center">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight animated-gradient">
            VIGIL UNVEILED
          </h1>
          <h2 className="text-2xl md:text-3xl font-light text-gray-600 dark:text-slate-300 mb-8 italic">
            Uma Jornada Através das Teorias da Conspiração
          </h2>
          <p className="text-gray-500 dark:text-slate-400 text-lg max-w-2xl mx-auto mb-8">
            Explore a cronologia das teorias conspiratórias mais influentes da história moderna
          </p>

          {/* Centered Controls */}
          <div className="max-w-4xl mx-auto w-full px-4 z-10">
            <div className="bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-enhanced rounded-xl p-4 border border-light-border dark:border-dark-border shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar eventos..."
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
                  <option value="all">Todas as Categorias</option>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-white/70 dark:bg-gray-700/70 border border-light-border dark:border-dark-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800 dark:text-gray-200 w-full"
                >
                  <option value="all">Todos os Status</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="disputed">Disputado</option>
                  <option value="debunked">Desmentido</option>
                </select>
              </div>
            </div>

            {/* Add Event Button */}
            <div className="mt-6">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto shadow-lg"
              >
                <PlusIcon />
                Adicionar Evento
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Timeline Section */}
      <div className="container mx-auto px-4 sm:px-6 py-16">
        <div className="relative">
          {/* Vertical Timeline Line */}
          <div className="absolute left-6 md:left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-gray-300 dark:bg-gray-600 timeline-line"></div>

          {filteredEvents.length > 0 ? (
            filteredEvents.map((event, index) => {
              const isEven = index % 2 === 0;
              
              return (
                <div key={event.id} className="relative mb-24">
                  {/* Dot on the timeline */}
                  <div className={`absolute left-6 md:left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-gradient-to-br ${CATEGORY_COLORS[event.category as keyof typeof CATEGORY_COLORS]} ring-4 ring-light-bg dark:ring-dark-bg z-10`}></div>
                  
                  {/* Mobile Layout */}
                  <div className="md:hidden pl-14">
                    <div
                      className="timeline-event floating-element bg-light-card dark:bg-dark-card p-1 rounded-full shadow-lg border border-light-border dark:border-dark-border cursor-pointer transition-all duration-300 flex items-center justify-center w-36 h-36 hover:animate-pulse-glow"
                      onClick={() => setSelectedEvent(event)}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="w-full h-full rounded-full bg-light-bg dark:bg-dark-bg flex flex-col items-center justify-center text-center p-2 overflow-hidden">
                        <span className="text-3xl font-bold text-cyan-400">{formatYear(event.year)}</span>
                        <h3 className="text-xs font-bold text-gray-800 dark:text-white mt-2 line-clamp-3">{event.title}</h3>
                      </div>
                    </div>
                    {event.image_url ? (
                      <div className="mt-4">
                        <div className="w-full h-48 rounded-lg overflow-hidden shadow-lg border border-light-border dark:border-dark-border cursor-pointer hover:animate-pulse-glow transition-all duration-300" onClick={() => setSelectedEvent(event)}>
                          <img 
                            src={event.image_url} 
                            alt={event.title} 
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4">
                        <button onClick={() => handleOpenImageModal(event)} className="w-full h-48 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 hover:border-cyan-500 hover:text-cyan-500 transition-colors">
                          <ImageIcon />
                          <span className="text-sm font-medium mt-2">Adicionar Imagem</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Desktop Layout - Alternating */}
                  <div className="hidden md:block">
                    {isEven ? (
                      // Even index: Circle on LEFT, Image on RIGHT
                      <div className="grid grid-cols-2 gap-8 items-center">
                        <div className="flex justify-end pr-12">
                          <div
                            className="timeline-event floating-element bg-light-card dark:bg-dark-card p-1 rounded-full shadow-lg border border-light-border dark:border-dark-border cursor-pointer transition-all duration-300 flex items-center justify-center w-48 h-48 hover:scale-110 hover:animate-pulse-glow"
                            onClick={() => setSelectedEvent(event)}
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            <div className="w-full h-full rounded-full bg-light-bg dark:bg-dark-bg flex flex-col items-center justify-center text-center p-2 overflow-hidden">
                              <span className="text-3xl font-bold text-cyan-400">{formatYear(event.year)}</span>
                              <h3 className="text-xs font-bold text-gray-800 dark:text-white mt-2 line-clamp-3">{event.title}</h3>
                            </div>
                          </div>
                        </div>
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
                            <button onClick={() => handleOpenImageModal(event)} className="w-full h-64 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 hover:border-cyan-500 hover:text-cyan-500 transition-colors">
                              <ImageIcon />
                              <span className="text-sm font-medium mt-2">Adicionar Imagem</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Odd index: Image on LEFT, Circle on RIGHT
                      <div className="grid grid-cols-2 gap-8 items-center">
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
                            <button onClick={() => handleOpenImageModal(event)} className="w-full h-64 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 hover:border-cyan-500 hover:text-cyan-500 transition-colors">
                              <ImageIcon />
                              <span className="text-sm font-medium mt-2">Adicionar Imagem</span>
                            </button>
                          </div>
                        )}
                        <div className="pl-12">
                          <div
                            className="timeline-event floating-element bg-light-card dark:bg-dark-card p-1 rounded-full shadow-lg border border-light-border dark:border-dark-border cursor-pointer transition-all duration-300 flex items-center justify-center w-48 h-48 hover:scale-110 hover:animate-pulse-glow"
                            onClick={() => setSelectedEvent(event)}
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            <div className="w-full h-full rounded-full bg-light-bg dark:bg-dark-bg flex flex-col items-center justify-center text-center p-2 overflow-hidden">
                              <span className="text-3xl font-bold text-cyan-400">{formatYear(event.year)}</span>
                              <h3 className="text-xs font-bold text-gray-800 dark:text-white mt-2 line-clamp-3">{event.title}</h3>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 dark:text-slate-400 text-lg">Nenhum evento encontrado com os filtros selecionados.</p>
            </div>
          )}
        </div>

        {filteredEvents.length > 0 && (
          <div className="text-center mt-12">
            <p className="text-gray-500 dark:text-slate-400">
              Mostrando {filteredEvents.length} eventos
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
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    selectedEvent.status === 'confirmed' ? 'bg-green-600 text-white' :
                    selectedEvent.status === 'disputed' ? 'bg-yellow-600 text-black' :
                    'bg-red-600 text-white'
                  }`}>
                    {selectedEvent.status.toUpperCase()}
                  </span>
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
                    Descrição
                  </h3>
                  <p className="text-gray-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {selectedEvent.description}
                  </p>
                </div>
              )}
              <div>
                <h3 className="font-semibold mb-3 text-gray-800 dark:text-white">Impacto Social</h3>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-1000 ${
                        selectedEvent.impact === 'critical' ? 'bg-gradient-to-r from-red-500 to-red-600 w-full' :
                        selectedEvent.impact === 'high' ? 'bg-gradient-to-r from-orange-500 to-red-500 w-4/5' :
                        selectedEvent.impact === 'medium' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 w-3/5' :
                        'bg-gradient-to-r from-green-500 to-yellow-500 w-2/5'
                      }`}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-slate-300 capitalize min-w-[80px]">
                    {selectedEvent.impact}
                  </span>
                </div>
              </div>
              {selectedEvent.evidence_level && (
                <div>
                  <h3 className="font-semibold mb-3 text-gray-800 dark:text-white">Nível de Evidência</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-1000 ${
                          selectedEvent.evidence_level === 'confirmado' ? 'bg-gradient-to-r from-green-500 to-green-600 w-full' :
                          selectedEvent.evidence_level === 'alto' ? 'bg-gradient-to-r from-blue-500 to-green-500 w-4/5' :
                          selectedEvent.evidence_level === 'medio' ? 'bg-gradient-to-r from-yellow-500 to-blue-500 w-3/5' :
                          'bg-gradient-to-r from-red-500 to-yellow-500 w-2/5'
                        }`}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300 capitalize min-w-[80px]">
                      {selectedEvent.evidence_level}
                    </span>
                  </div>
                </div>
              )}
              {selectedEvent.verification_priority && (
                <div>
                  <h3 className="font-semibold mb-3 text-gray-800 dark:text-white">Prioridade de Verificação</h3>
                  <span className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    selectedEvent.verification_priority === 'urgente' ? 'bg-red-600 text-white' :
                    selectedEvent.verification_priority === 'alta' ? 'bg-orange-600 text-white' :
                    selectedEvent.verification_priority === 'media' ? 'bg-yellow-600 text-black' :
                    'bg-green-600 text-white'
                  }`}>
                    {selectedEvent.verification_priority.toUpperCase()}
                  </span>
                </div>
              )}
              {(selectedEvent.source_1 || selectedEvent.source_2) && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-800 dark:text-white">
                    <LinkIcon />
                    Fontes e Referências
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
      {showAddModal && (
        <AddEventModal
          onClose={() => setShowAddModal(false)}
          onEventAdded={handleEventAdded}
        />
      )}

      {/* Add Image Modal */}
      {showImageModal && eventForImage && (
        <AddEventImageModal
          event={eventForImage}
          onClose={() => setShowImageModal(false)}
          onImageAdded={() => {
            refetch();
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

export default Timeline;