import React from 'react';
import Card from '../components/common/Card';
import { Icon } from '../components/icons/Icon';
import { useTranslation, Trans } from 'react-i18next';

const AlertTriangleIcon = () => <Icon className="h-16 w-16 text-red-500 mx-auto mb-4"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" x2="12" y1="9" y2="13"></line><line x1="12" x2="12.01" y1="17" y2="17"></line></Icon>;

const Disclaimer: React.FC = () => {
  const { t } = useTranslation('legal');

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white">{t('disclaimer.title')}</h1>
      <Card>
        <div className="p-6">
          <div className="text-center mb-8">
            <AlertTriangleIcon />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t('disclaimer.cardTitle')}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('disclaimer.lastUpdate')}
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              {t('disclaimer.intro')}
            </p>
          </div>

          <div className="text-left space-y-6">
            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('disclaimer.sections.nature.title')}</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>{t('disclaimer.sections.nature.content')}</p>
                <p><Trans i18nKey="disclaimer.sections.nature.important" t={t} /></p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('disclaimer.sections.speculative.title')}</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>{t('disclaimer.sections.speculative.intro')}</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  {(t('disclaimer.sections.speculative.items', { returnObjects: true }) as string[]).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('disclaimer.sections.userContent.title')}</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>{t('disclaimer.sections.userContent.content')}</p>
                <p><Trans i18nKey="disclaimer.sections.userContent.notEndorsed" t={t} /></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  {(t('disclaimer.sections.userContent.items', { returnObjects: true }) as string[]).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('disclaimer.sections.library.title')}</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>{t('disclaimer.sections.library.intro')}</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  {(t('disclaimer.sections.library.items', { returnObjects: true }) as string[]).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('disclaimer.sections.professionalAdvice.title')}</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p><Trans i18nKey="disclaimer.sections.professionalAdvice.intro" t={t} /></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  {(t('disclaimer.sections.professionalAdvice.items', { returnObjects: true }) as string[]).map((item, index) => (
                    <li key={index}><Trans defaults={item} /></li>
                  ))}
                </ul>
                <p><Trans i18nKey="disclaimer.sections.professionalAdvice.conclusion" t={t} /></p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('disclaimer.sections.externalLinks.title')}</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>{t('disclaimer.sections.externalLinks.intro')}</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  {(t('disclaimer.sections.externalLinks.items', { returnObjects: true }) as string[]).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('disclaimer.sections.availability.title')}</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>{t('disclaimer.sections.availability.intro')}</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  {(t('disclaimer.sections.availability.items', { returnObjects: true }) as string[]).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('disclaimer.sections.limitations.title')}</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>{t('disclaimer.sections.limitations.intro')}</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  {(t('disclaimer.sections.limitations.items', { returnObjects: true }) as string[]).map((item, index) => (
                    <li key={index}><Trans defaults={item} /></li>
                  ))}
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('disclaimer.sections.indemnification.title')}</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>{t('disclaimer.sections.indemnification.intro')}</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  {(t('disclaimer.sections.indemnification.items', { returnObjects: true }) as string[]).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('disclaimer.sections.forceMajeure.title')}</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>{t('disclaimer.sections.forceMajeure.intro')}</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  {(t('disclaimer.sections.forceMajeure.items', { returnObjects: true }) as string[]).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('disclaimer.sections.modifications.title')}</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>{t('disclaimer.sections.modifications.intro')}</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  {(t('disclaimer.sections.modifications.items', { returnObjects: true }) as string[]).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
                <p>{t('disclaimer.sections.modifications.conclusion')}</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('disclaimer.sections.jurisdiction.title')}</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>{t('disclaimer.sections.jurisdiction.content1')}</p>
                <p>{t('disclaimer.sections.jurisdiction.content2')}</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('disclaimer.sections.contact.title')}</h3>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p>{t('disclaimer.sections.contact.intro')}</p>
                <p><Trans i18nKey="disclaimer.sections.contact.email" t={t} /></p>
                <p><Trans i18nKey="disclaimer.sections.contact.company" t={t} /></p>
                <p><Trans i18nKey="disclaimer.sections.contact.address" t={t} /></p>
              </div>
            </section>

            <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Icon className="h-5 w-5 text-red-500">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                    <line x1="12" x2="12" y1="9" y2="13"></line>
                    <line x1="12" x2="12.01" y1="17" y2="17"></line>
                  </Icon>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-red-800 dark:text-red-200">{t('disclaimer.alert.title')}</h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    {t('disclaimer.alert.content')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Disclaimer;