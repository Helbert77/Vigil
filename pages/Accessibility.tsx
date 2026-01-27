import React from 'react';
import Card from '../components/common/Card';
import { Icon } from '../components/icons/Icon';
import { useTranslation, Trans } from 'react-i18next';

const AccessibilityIcon = () => <Icon className="h-16 w-16 text-primary mx-auto mb-4"><path d="M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path><path d="M12 14v7"></path><path d="M5 11v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1"></path><path d="M18.5 18.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path><path d="M5.5 18.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path></Icon>;

const Accessibility: React.FC = () => {
  const { t } = useTranslation('legal');

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white">{t('accessibility.title')}</h1>
      <Card>
        <div className="p-6">
          <div className="text-center mb-8">
            <AccessibilityIcon />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t('accessibility.cardTitle')}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('accessibility.lastUpdate')}
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              {t('accessibility.intro')}
            </p>
          </div>

          <div className="text-left space-y-6">
            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('accessibility.sections.commitment.title')}</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>{t('accessibility.sections.commitment.content1')}</p>
                <p>{t('accessibility.sections.commitment.content2')}</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('accessibility.sections.compliance.title')}</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>{t('accessibility.sections.compliance.intro')}</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  {(t('accessibility.sections.compliance.items', { returnObjects: true }) as string[]).map((item, index) => (
                    <li key={index}><Trans defaults={item} /></li>
                  ))}
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('accessibility.sections.features.title')}</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">{t('accessibility.sections.features.keyboard.title')}</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                    {(t('accessibility.sections.features.keyboard.items', { returnObjects: true }) as string[]).map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">{t('accessibility.sections.features.screenReaders.title')}</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                    {(t('accessibility.sections.features.screenReaders.items', { returnObjects: true }) as string[]).map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">{t('accessibility.sections.features.visualDesign.title')}</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                    {(t('accessibility.sections.features.visualDesign.items', { returnObjects: true }) as string[]).map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">{t('accessibility.sections.features.multimedia.title')}</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                    {(t('accessibility.sections.features.multimedia.items', { returnObjects: true }) as string[]).map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('accessibility.sections.assistiveTech.title')}</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>{t('accessibility.sections.assistiveTech.intro')}</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  {(t('accessibility.sections.assistiveTech.items', { returnObjects: true }) as string[]).map((item, index) => (
                    <li key={index}><Trans defaults={item} /></li>
                  ))}
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('accessibility.sections.specificFeatures.title')}</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">{t('accessibility.sections.specificFeatures.posts.title')}</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                    {(t('accessibility.sections.specificFeatures.posts.items', { returnObjects: true }) as string[]).map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">{t('accessibility.sections.specificFeatures.communities.title')}</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                    {(t('accessibility.sections.specificFeatures.communities.items', { returnObjects: true }) as string[]).map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">{t('accessibility.sections.specificFeatures.chat.title')}</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                    {(t('accessibility.sections.specificFeatures.chat.items', { returnObjects: true }) as string[]).map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('accessibility.sections.improvement.title')}</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>{t('accessibility.sections.improvement.intro')}</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  {(t('accessibility.sections.improvement.items', { returnObjects: true }) as string[]).map((item, index) => (
                    <li key={index}><Trans defaults={item} /></li>
                  ))}
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('accessibility.sections.schedule.title')}</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p><strong>{t('accessibility.sections.schedule.shortTerm.title')}</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1 mb-3">
                  {(t('accessibility.sections.schedule.shortTerm.items', { returnObjects: true }) as string[]).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
                
                <p><strong>{t('accessibility.sections.schedule.mediumTerm.title')}</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1 mb-3">
                  {(t('accessibility.sections.schedule.mediumTerm.items', { returnObjects: true }) as string[]).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>

                <p><strong>{t('accessibility.sections.schedule.longTerm.title')}</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  {(t('accessibility.sections.schedule.longTerm.items', { returnObjects: true }) as string[]).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('accessibility.sections.alternatives.title')}</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>{t('accessibility.sections.alternatives.intro')}</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  {(t('accessibility.sections.alternatives.items', { returnObjects: true }) as string[]).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('accessibility.sections.feedback.title')}</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>{t('accessibility.sections.feedback.intro')}</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  {(t('accessibility.sections.feedback.items', { returnObjects: true }) as string[]).map((item, index) => (
                    <li key={index}><Trans defaults={item} /></li>
                  ))}
                </ul>
                <p>{t('accessibility.sections.feedback.response')}</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('accessibility.sections.compliance_legal.title')}</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>{t('accessibility.sections.compliance_legal.intro')}</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  {(t('accessibility.sections.compliance_legal.items', { returnObjects: true }) as string[]).map((item, index) => (
                    <li key={index}><Trans defaults={item} /></li>
                  ))}
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('accessibility.sections.resources.title')}</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>{t('accessibility.sections.resources.intro')}</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  {(t('accessibility.sections.resources.items', { returnObjects: true }) as string[]).map((item, index) => (
                    <li key={index}><Trans defaults={item} /></li>
                  ))}
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('accessibility.sections.contact.title')}</h3>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p><Trans i18nKey="accessibility.sections.contact.coordinator" t={t} /></p>
                <p><Trans i18nKey="accessibility.sections.contact.company" t={t} /></p>
                <p><Trans i18nKey="accessibility.sections.contact.address" t={t} /></p>
                <p><Trans i18nKey="accessibility.sections.contact.phone" t={t} /></p>
              </div>
            </section>

            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <AccessibilityIcon />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">{t('accessibility.alert.title')}</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    {t('accessibility.alert.content')}
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

export default Accessibility;