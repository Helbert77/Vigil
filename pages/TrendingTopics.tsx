import React, { useState } from 'react';
import { TrendingTopic } from '../types';
import Card from '../components/common/Card';
import { Icon } from '../components/icons/Icon';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation(['common']);
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
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header com botão voltar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
          <div className="flex items-center">
            <button
              onClick={onGoBack}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-200 mr-6 hover:scale-105"
              aria-label={t('common:goBack')}
            >
              <ArrowLeftIcon />
              <span className="text-sm font-medium">{t('common:goBack')}</span>
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {t('common:happeningNow')}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredAndSortedTopics.length} {t('common:topicsTrending')}
              </p>
            </div>
          </div>
        </div>

        {/* Barra de pesquisa e filtros */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder={t('common:searchTopics')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('common:sortBy')}</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setSortBy('posts')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  sortBy === 'posts'
                    ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 shadow-lg'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {t('common:postsSort')}
              </button>
              <button
                onClick={() => setSortBy('alphabetical')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  sortBy === 'alphabetical'
                    ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 shadow-lg'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {t('common:azSort')}
              </button>
            </div>
          </div>
        </div>

        {/* Lista completa de tópicos */}
        <div className="grid gap-2 md:gap-3">
          {filteredAndSortedTopics && filteredAndSortedTopics.length > 0 ? (
            filteredAndSortedTopics.map((topic, index) => {
              const originalIndex = trendingTopics.findIndex(t => t.tag === topic.tag);
              const isTopThree = originalIndex < 3;
              
              return (
                <Card 
                  key={topic.tag}
                  className="transform transition-all duration-300 hover:scale-[1.01] hover:shadow-lg cursor-pointer group"
                  onClick={() => onViewTag(topic.tag)}
                >
                  <div className="flex items-center justify-between p-2 md:p-2">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <div className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full font-bold text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        {originalIndex + 1}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-bold text-sm md:text-base text-gray-900 dark:text-white truncate group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                            #{topic.tag}
                          </h3>
                          {isTopThree && (
                            <div className="flex items-center space-x-1">
                              <div className="text-red-500">
                                <FireIcon />
                              </div>
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
                                {t('common:trendingBadge')}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-medium">
                            {topic.post_count.toLocaleString()} posts
                          </span>
                          <span className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">
                            #{originalIndex + 1} {t('common:trendingRank')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                      <TrendingUpIcon />
                      <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                {t('common:noResults')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('common:tryAgain')}
              </p>
            </Card>
          ) : (
            <Card className="text-center py-12">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FireIcon />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {t('common:noTrendingFound')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('common:beFirstTrending')}
              </p>
            </Card>
          )}
        </div>

        {/* Informações adicionais e estatísticas */}
        <div className="mt-8 space-y-6">
          <Card className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
            <div className="text-center p-4">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('common:trendingRealTime')}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('common:trendingAutoUpdate')}
              </p>
            </div>
          </Card>

          {filteredAndSortedTopics.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="text-center p-3">
                <div className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  {filteredAndSortedTopics.reduce((sum, topic) => sum + topic.post_count, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t('common:totalPosts')}
                </div>
              </Card>
              
              <Card className="text-center p-3">
                <div className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  {filteredAndSortedTopics.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t('common:activeTopics')}
                </div>
              </Card>
              
              <Card className="text-center p-3">
                <div className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  {Math.round(filteredAndSortedTopics.reduce((sum, topic) => sum + topic.post_count, 0) / filteredAndSortedTopics.length).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t('common:avgPerTopic')}
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