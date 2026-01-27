import React from 'react';
import Card from '../components/common/Card';
import { Icon } from '../components/icons/Icon';
import { useTranslation } from 'react-i18next';

const FileTextIcon = () => <Icon className="h-16 w-16 text-primary mx-auto mb-4"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></Icon>;

const CookiePolicy: React.FC = () => {
  const { t } = useTranslation('legal');

  return (
    <div>
      <h1 className="text-xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white">{t('cookiePolicy.title')}</h1>
      <Card>
        <div className="text-center p-4">
          <FileTextIcon />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t('cookiePolicy.cardTitle')}</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            {t('cookiePolicy.intro')}
          </p>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">{t('cookiePolicy.whatAreCookies.title')}</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            {t('cookiePolicy.whatAreCookies.content')}
          </p>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">{t('cookiePolicy.howWeUse.title')}</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            {t('cookiePolicy.howWeUse.content1')}
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {t('cookiePolicy.howWeUse.content2')}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default CookiePolicy;