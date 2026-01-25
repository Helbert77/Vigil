import React, { useState } from 'react';
import Card from '../components/common/Card';
import { Icon } from '../components/icons/Icon';
import HelpModal from '../components/help/HelpModal';
import { getPRDContent } from '../src/services/prdService';
import { useTranslation } from 'react-i18next';

// Icons
const BookOpenIcon = () => <Icon className="h-8 w-8"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></Icon>;
const EditIcon = () => <Icon className="h-8 w-8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></Icon>;
const MessageSquareIcon = () => <Icon className="h-8 w-8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></Icon>;
const SearchIcon = () => <Icon className="h-8 w-8"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></Icon>;
const CrownIcon = () => <Icon className="h-8 w-8"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path></Icon>;
const ShieldIcon = () => <Icon className="h-8 w-8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></Icon>;
const HeadphonesIcon = () => <Icon className="h-8 w-8"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></Icon>;
const ArrowLeftIcon = () => <Icon className="h-5 w-5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></Icon>;

interface HelpProps {
  onNavigateBack: () => void;
  searchQuery?: string;
}

interface HelpTopic {
  id: string;
  title: string;
  description: string;
  prdNumber?: string;
}

interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  topics: HelpTopic[];
  color: string;
}

const Help: React.FC<HelpProps> = ({ onNavigateBack, searchQuery = '' }) => {
  const { t } = useTranslation(['help', 'common']);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<HelpTopic | null>(null);
  const [selectedTopicCategory, setSelectedTopicCategory] = useState<HelpCategory | null>(null);
  const [prdContent, setPrdContent] = useState<string | undefined>(undefined);

  const categories: HelpCategory[] = [
    {
      id: 'getting-started',
      title: t('help:categories.gettingStarted.title'),
      description: t('help:categories.gettingStarted.description'),
      icon: <BookOpenIcon />,
      color: 'from-blue-500 to-blue-600',
      topics: [
        {
          id: 'overview',
          title: t('help:categories.gettingStarted.topics.overview.title'),
          description: t('help:categories.gettingStarted.topics.overview.description'),
          prdNumber: '01'
        },
        {
          id: 'authentication',
          title: t('help:categories.gettingStarted.topics.authentication.title'),
          description: t('help:categories.gettingStarted.topics.authentication.description'),
          prdNumber: '02'
        },
        {
          id: 'layout',
          title: t('help:categories.gettingStarted.topics.layout.title'),
          description: t('help:categories.gettingStarted.topics.layout.description'),
          prdNumber: '03'
        }
      ]
    },
    {
      id: 'creating-content',
      title: t('help:categories.creatingContent.title'),
      description: t('help:categories.creatingContent.description'),
      icon: <EditIcon />,
      color: 'from-green-500 to-green-600',
      topics: [
        {
          id: 'posts',
          title: t('help:categories.creatingContent.topics.posts.title'),
          description: t('help:categories.creatingContent.topics.posts.description'),
          prdNumber: '04'
        },
        {
          id: 'communities',
          title: t('help:categories.creatingContent.topics.communities.title'),
          description: t('help:categories.creatingContent.topics.communities.description'),
          prdNumber: '05'
        },
        {
          id: 'timeline',
          title: t('help:categories.creatingContent.topics.timeline.title'),
          description: t('help:categories.creatingContent.topics.timeline.description'),
          prdNumber: '12'
        }
      ]
    },
    {
      id: 'communication',
      title: t('help:categories.communication.title'),
      description: t('help:categories.communication.description'),
      icon: <MessageSquareIcon />,
      color: 'from-purple-500 to-purple-600',
      topics: [
        {
          id: 'messages',
          title: t('help:categories.communication.topics.messages.title'),
          description: t('help:categories.communication.topics.messages.description'),
          prdNumber: '06'
        },
        {
          id: 'chat-rooms',
          title: t('help:categories.communication.topics.chatRooms.title'),
          description: t('help:categories.communication.topics.chatRooms.description'),
          prdNumber: '07'
        },
        {
          id: 'notifications',
          title: t('help:categories.communication.topics.notifications.title'),
          description: t('help:categories.communication.topics.notifications.description'),
          prdNumber: '08'
        }
      ]
    },
    {
      id: 'discovery',
      title: t('help:categories.discovery.title'),
      description: t('help:categories.discovery.description'),
      icon: <SearchIcon />,
      color: 'from-orange-500 to-orange-600',
      topics: [
        {
          id: 'search',
          title: t('help:categories.discovery.topics.search.title'),
          description: t('help:categories.discovery.topics.search.description'),
          prdNumber: '10'
        },
        {
          id: 'profile',
          title: t('help:categories.discovery.topics.profile.title'),
          description: t('help:categories.discovery.topics.profile.description'),
          prdNumber: '09'
        },
        {
          id: 'trending',
          title: t('help:categories.discovery.topics.trending.title'),
          description: t('help:categories.discovery.topics.trending.description'),
          prdNumber: '22'
        }
      ]
    },
    {
      id: 'premium',
      title: t('help:categories.premium.title'),
      description: t('help:categories.premium.description'),
      icon: <CrownIcon />,
      color: 'from-yellow-500 to-yellow-600',
      topics: [
        {
          id: 'plans',
          title: t('help:categories.premium.topics.plans.title'),
          description: t('help:categories.premium.topics.plans.description'),
          prdNumber: '17'
        },
        {
          id: 'library',
          title: t('help:categories.premium.topics.library.title'),
          description: t('help:categories.premium.topics.library.description'),
          prdNumber: '11'
        },
        {
          id: 'advertising',
          title: t('help:categories.premium.topics.advertising.title'),
          description: t('help:categories.premium.topics.advertising.description'),
          prdNumber: '14'
        }
      ]
    },
    {
      id: 'security',
      title: t('help:categories.security.title'),
      description: t('help:categories.security.description'),
      icon: <ShieldIcon />,
      color: 'from-red-500 to-red-600',
      topics: [
        {
          id: 'settings',
          title: t('help:categories.security.topics.settings.title'),
          description: t('help:categories.security.topics.settings.description'),
          prdNumber: '18'
        },
        {
          id: 'moderation',
          title: t('help:categories.security.topics.moderation.title'),
          description: t('help:categories.security.topics.moderation.description'),
          prdNumber: '15'
        },
        {
          id: 'policies',
          title: t('help:categories.security.topics.policies.title'),
          description: t('help:categories.security.topics.policies.description'),
          prdNumber: '21'
        }
      ]
    },
    {
      id: 'support',
      title: t('help:categories.support.title'),
      description: t('help:categories.support.description'),
      icon: <HeadphonesIcon />,
      color: 'from-indigo-500 to-indigo-600',
      topics: [
        {
          id: 'support-system',
          title: t('help:categories.support.topics.supportSystem.title'),
          description: t('help:categories.support.topics.supportSystem.description'),
          prdNumber: '20'
        },
        {
          id: 'contact',
          title: t('help:categories.support.topics.contact.title'),
          description: t('help:categories.support.topics.contact.description')
        }
      ]
    }
  ];

  const handleTopicClick = (topic: HelpTopic, category: HelpCategory) => {
    if (topic.id === 'contact') {
      window.location.href = 'mailto:suporte@myvigil.co';
    } else {
      setSelectedTopic(topic);
      setSelectedTopicCategory(category);
      
      // Carregar conteúdo do PRD se disponível
      if (topic.prdNumber) {
        const content = getPRDContent(topic.prdNumber);
        setPrdContent(content?.fullContent);
      } else {
        setPrdContent(undefined);
      }
      
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTopic(null);
    setSelectedTopicCategory(null);
    setPrdContent(undefined);
  };

  // Encontrar categoria selecionada
  const selectedCategoryData = selectedCategory 
    ? categories.find(cat => cat.id === selectedCategory)
    : null;

  // Filtrar categorias e tópicos baseado na busca
  const filteredCategories = searchQuery.trim() 
    ? categories.map(category => ({
        ...category,
        topics: category.topics.filter(topic => 
          topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          topic.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.topics.length > 0)
    : categories;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={selectedCategoryData ? () => setSelectedCategory(null) : onNavigateBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
        >
          <ArrowLeftIcon />
          <span>{selectedCategoryData ? t('help:backToCategories') : t('help:back')}</span>
        </button>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {selectedCategoryData ? selectedCategoryData.title : t('help:title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          {selectedCategoryData 
            ? selectedCategoryData.description 
            : searchQuery.trim() 
              ? `${t('help:resultsFor')} "${searchQuery}"`
              : t('help:findAnswers')
          }
        </p>
      </div>

      {/* Category Expanded View */}
      {selectedCategoryData ? (
        <div className="mb-8">
          <Card>
            <div className="p-6">
              {/* Category Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${selectedCategoryData.color} flex items-center justify-center text-white`}>
                  {selectedCategoryData.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedCategoryData.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedCategoryData.description}
                  </p>
                </div>
              </div>

              {/* All Topics List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedCategoryData.topics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => handleTopicClick(topic, selectedCategoryData)}
                    className="text-left p-4 rounded-lg border border-light-border dark:border-dark-border hover:border-primary dark:hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors mb-2">
                          {topic.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {topic.description}
                        </p>
                      </div>
                      {topic.prdNumber && (
                        <span className="flex-shrink-0 text-xs font-mono bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                          {topic.prdNumber}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>
      ) : filteredCategories.length === 0 ? (
        /* No Results */
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <SearchIcon />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('help:noResultsFound')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('help:noResultsDesc', { query: searchQuery })}
          </p>
          <button
            onClick={() => {
              // Limpar busca - isso será feito através do Header
              window.location.reload();
            }}
            className="text-primary hover:underline font-medium"
          >
            {t('help:viewAllCategories')}
          </button>
        </div>
      ) : (
        /* Categories Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCategories.map((category) => (
          <Card key={category.id} className="hover:shadow-lg transition-shadow duration-200">
            <div className="p-6">
              {/* Icon with gradient background */}
              <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center text-white mb-4`}>
                {category.icon}
              </div>

              {/* Category Title */}
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {category.title}
              </h2>

              {/* Category Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {category.description}
              </p>

              {/* Topics List */}
              <div className="space-y-2">
                {category.topics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => handleTopicClick(topic, category)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                          {topic.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {topic.description}
                        </p>
                      </div>
                      {topic.prdNumber && (
                        <span className="flex-shrink-0 text-xs font-mono bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                          {topic.prdNumber}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* View All Link */}
              <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border">
                <button
                  onClick={() => setSelectedCategory(category.id)}
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  {t('help:viewAllTopics')}
                </button>
              </div>
            </div>
          </Card>
        ))}
        </div>
      )}

      {/* Footer Note */}
      {!selectedCategoryData && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 pb-8">
        <p>{t('help:notFound')}</p>
        <a
          href="mailto:suporte@myvigil.co"
          className="text-primary hover:underline font-medium"
        >
          {t('help:contactSupport')}
        </a>
        </div>
      )}

      {/* Help Modal */}
      {selectedTopic && selectedTopicCategory && (
        <HelpModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={selectedTopic.title}
          prdNumber={selectedTopic.prdNumber}
          content={prdContent}
          categoryIcon={selectedTopicCategory.icon}
          categoryColor={selectedTopicCategory.color}
        />
      )}
    </div>
  );
};

export default Help;
