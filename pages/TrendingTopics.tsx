import React, { useState } from 'react';
import { TrendingTopic } from '../types';
import Card from '../components/common/Card';
import { Icon } from '../components/icons/Icon';

const ArrowLeftIcon = () => (
  <Icon>
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </Icon>
);

const TrendingUpIcon = () => (
  <Icon>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </Icon>
);

const FireIcon = () => (
  <Icon>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </Icon>
);

const SearchIcon = () => (
  <Icon>
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
  </Icon>
);

interface TrendingTopicsPageProps {
  trendingTopics: TrendingTopic[];
  onViewTag: (tag: string) => void;
  onGoBack: () => void;
}

const TrendingTopicsPage: React.FC<TrendingTopicsPageProps> = ({
  trendingTopics,
  onViewTag,
  onGoBack
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'posts' | 'alphabetical'>('posts');

  // Filtrar e ordenar tópicos
  const filteredAndSortedTopics = React.useMemo(() => {
    let filtered = trendingTopics.filter(topic =>
      topic.tag.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortBy === 'posts') {
      filtered = filtered.sort((a, b) => b.post_count - a.post_count);
    } else {
      filtered = filtered.sort((a, b) => a.tag.localeCompare(b.tag));
    }

    return filtered;
  }, [trendingTopics, searchTerm, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-bg via-gray-50 to-light-bg dark:from-dark-bg dark:via-gray-900 dark:to-dark-bg">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header com botão voltar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
          <div className="flex items-center">
            <button
              onClick={onGoBack}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-200 mr-6 hover:scale-105"
              aria-label="Voltar"
            >
              <ArrowLeftIcon />
              <span className="text-sm font-medium">Voltar</span>
            </button>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full">
                <FireIcon />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  Acontecendo Agora
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredAndSortedTopics.length} tópicos em alta
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de pesquisa e filtros */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <SearchIcon />
            <input
              type="text"
              placeholder="Buscar tópicos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ordenar por:</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setSortBy('posts')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  sortBy === 'posts'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Posts
              </button>
              <button
                onClick={() => setSortBy('alphabetical')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  sortBy === 'alphabetical'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                A-Z
              </button>
            </div>
          </div>
        </div>

        {/* Lista completa de tópicos */}
        <div className="grid gap-4 md:gap-6">
          {filteredAndSortedTopics && filteredAndSortedTopics.length > 0 ? (
            filteredAndSortedTopics.map((topic, index) => {
              const originalIndex = trendingTopics.findIndex(t => t.tag === topic.tag);
              const isTopThree = originalIndex < 3;
              
              return (
                <Card 
                  key={topic.tag}
                  className={`transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer group ${
                    isTopThree ? 'ring-2 ring-yellow-400 dark:ring-yellow-500 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20' : ''
                  }`}
                  onClick={() => onViewTag(topic.tag)}
                >
                  <div className="flex items-center justify-between p-4 md:p-6">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full font-bold text-lg ${
                        isTopThree 
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg' 
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}>
                        {originalIndex + 1}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-bold text-lg md:text-xl text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            #{topic.tag}
                          </h3>
                          {isTopThree && (
                            <div className="flex items-center space-x-1">
                              <FireIcon />
                              <span className="text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-full">
                                Em Alta
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">
                            {topic.post_count.toLocaleString()} posts
                          </span>
                          <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                            #{originalIndex + 1} trending
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-gray-400 group-hover:text-blue-500 transition-colors">
                      <TrendingUpIcon />
                      <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Card>
              );
            })
          ) : searchTerm ? (
            <Card className="text-center py-12">
              <SearchIcon />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4 mb-2">
                Nenhum resultado encontrado
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Tente buscar por outros termos ou verifique a ortografia
              </p>
            </Card>
          ) : (
            <Card className="text-center py-12">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FireIcon />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhum tópico em alta no momento
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Seja o primeiro a usar hashtags e criar tendências!
              </p>
            </Card>
          )}
        </div>

        {/* Informações adicionais e estatísticas */}
        <div className="mt-8 space-y-6">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
            <div className="text-center p-6">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Atualização em tempo real
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tópicos atualizados automaticamente baseados na atividade dos usuários
              </p>
            </div>
          </Card>

          {filteredAndSortedTopics.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {filteredAndSortedTopics.reduce((sum, topic) => sum + topic.post_count, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Total de Posts
                </div>
              </Card>
              
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {filteredAndSortedTopics.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Tópicos Ativos
                </div>
              </Card>
              
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {Math.round(filteredAndSortedTopics.reduce((sum, topic) => sum + topic.post_count, 0) / filteredAndSortedTopics.length).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Média por Tópico
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrendingTopicsPage;