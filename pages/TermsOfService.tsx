import React from 'react';
import Card from '../components/common/Card';
import { Icon } from '../components/icons/Icon';
import { useTranslation, Trans } from 'react-i18next';

const FileTextIcon = () => <Icon className="h-16 w-16 text-primary mx-auto mb-4"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></Icon>;

const TermsOfService: React.FC = () => {
  const { t } = useTranslation('legal');

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white">{t('termsOfService.title')}</h1>
      <Card>
        <div className="p-6">
          <div className="text-center mb-8">
            <FileTextIcon />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t('termsOfService.cardTitle')}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('termsOfService.lastUpdate')}
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              {t('termsOfService.intro')}
            </p>
          </div>

          <div className="text-left space-y-6">
            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('termsOfService.sections.definitions.title')}</h3>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p><Trans i18nKey="termsOfService.sections.definitions.vigil" t={t} /></p>
                <p><Trans i18nKey="termsOfService.sections.definitions.user" t={t} /></p>
                <p><Trans i18nKey="termsOfService.sections.definitions.content" t={t} /></p>
                <p><Trans i18nKey="termsOfService.sections.definitions.premiumServices" t={t} /></p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('termsOfService.sections.acceptance.title')}</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {t('termsOfService.sections.acceptance.content')}
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('termsOfService.sections.servicesDescription.title')}</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p><Trans i18nKey="termsOfService.sections.servicesDescription.posts" t={t} /></p>
                <p><Trans i18nKey="termsOfService.sections.servicesDescription.communities" t={t} /></p>
                <p><Trans i18nKey="termsOfService.sections.servicesDescription.library" t={t} /></p>
                <p><Trans i18nKey="termsOfService.sections.servicesDescription.chatRooms" t={t} /></p>
                <p><Trans i18nKey="termsOfService.sections.servicesDescription.timeline" t={t} /></p>
                <p><Trans i18nKey="termsOfService.sections.servicesDescription.messages" t={t} /></p>
                <p><Trans i18nKey="termsOfService.sections.servicesDescription.notifications" t={t} /></p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('termsOfService.sections.plans.title')}</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p><Trans i18nKey="termsOfService.sections.plans.free" t={t} /></p>
                <p><Trans i18nKey="termsOfService.sections.plans.basic" t={t} /></p>
                <p><Trans i18nKey="termsOfService.sections.plans.pro" t={t} /></p>
                <p><Trans i18nKey="termsOfService.sections.plans.premium" t={t} /></p>
                <p>{t('termsOfService.sections.plans.paymentInfo')}</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('termsOfService.sections.conductRules.title')}</h3>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p>{t('termsOfService.sections.conductRules.intro')}</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  {(t('termsOfService.sections.conductRules.rules', { returnObjects: true }) as string[]).map((rule, index) => (
                    <li key={index}>{rule}</li>
                  ))}
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('termsOfService.sections.intellectualProperty.title')}</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>{t('termsOfService.sections.intellectualProperty.content1')}</p>
                <p>{t('termsOfService.sections.intellectualProperty.content2')}</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('termsOfService.sections.moderation.title')}</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>{t('termsOfService.sections.moderation.intro')}</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  {(t('termsOfService.sections.moderation.items', { returnObjects: true }) as string[]).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('termsOfService.sections.termination.title')}</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>{t('termsOfService.sections.termination.intro')}</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  {(t('termsOfService.sections.termination.items', { returnObjects: true }) as string[]).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
                <p>{t('termsOfService.sections.termination.closing')}</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('termsOfService.sections.liability.title')}</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>{t('termsOfService.sections.liability.intro')}</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  {(t('termsOfService.sections.liability.items', { returnObjects: true }) as string[]).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('termsOfService.sections.indemnification.title')}</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {t('termsOfService.sections.indemnification.content')}
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('termsOfService.sections.disputeResolution.title')}</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>{t('termsOfService.sections.disputeResolution.intro')}</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  {(t('termsOfService.sections.disputeResolution.items', { returnObjects: true }) as string[]).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('termsOfService.sections.changes.title')}</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {t('termsOfService.sections.changes.content')}
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('termsOfService.sections.governingLaw.title')}</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {t('termsOfService.sections.governingLaw.content')}
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('termsOfService.sections.contact.title')}</h3>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p>{t('termsOfService.sections.contact.intro')}</p>
                <p><Trans i18nKey="termsOfService.sections.contact.email" t={t} /></p>
                <p><Trans i18nKey="termsOfService.sections.contact.company" t={t} /></p>
                <p><Trans i18nKey="termsOfService.sections.contact.address" t={t} /></p>
              </div>
            </section>

            <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                {t('termsOfService.footer')}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TermsOfService;