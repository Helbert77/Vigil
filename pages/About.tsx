import React from 'react';
import Card from '../components/common/Card';
import { LogoIcon } from '../components/icons/LogoIcon';
import { useTranslation } from 'react-i18next';

const About: React.FC = () => {
  const { t } = useTranslation(['common', 'about']);
  
  return (
    <div>
      <h1 className="text-xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white">{t('about:title')}</h1>
      <Card>
        <div className="text-center p-4">
          <LogoIcon className="h-24 w-24 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t('about:welcome')}</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            {t('about:description1')}
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            {t('about:description2')}
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {t('about:description3')}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default About;