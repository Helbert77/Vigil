import React from 'react';
import Card from '../components/common/Card';
import { Icon } from '../components/icons/Icon';
import { useTranslation, Trans } from 'react-i18next';

const ShieldCheckIcon = () => <Icon className="h-16 w-16 text-primary mx-auto mb-4"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></Icon>;

const PrivacyPolicy: React.FC = () => {
  const { t } = useTranslation('legal');

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white">{t('privacyPolicy.title')}</h1>
      <Card>
        <div className="p-6">
          <div className="text-center mb-8">
            <ShieldCheckIcon />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t('privacyPolicy.cardTitle')}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('privacyPolicy.lastUpdate')}
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              {t('privacyPolicy.intro')}
            </p>
          </div>

          <div className="text-left space-y-6">
            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('privacyPolicy.sections.collectedInfo.title')}</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">{t('privacyPolicy.sections.collectedInfo.direct.title')}</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                    {(t('privacyPolicy.sections.collectedInfo.direct.items', { returnObjects: true }) as string[]).map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">{t('privacyPolicy.sections.collectedInfo.automatic.title')}</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                    {(t('privacyPolicy.sections.collectedInfo.automatic.items', { returnObjects: true }) as string[]).map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">{t('privacyPolicy.sections.collectedInfo.thirdParty.title')}</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                    {(t('privacyPolicy.sections.collectedInfo.thirdParty.items', { returnObjects: true }) as string[]).map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('privacyPolicy.sections.legalBasis.title')}</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p><Trans i18nKey="privacyPolicy.sections.legalBasis.consent" t={t} /></p>
                <p><Trans i18nKey="privacyPolicy.sections.legalBasis.contract" t={t} /></p>
                <p><Trans i18nKey="privacyPolicy.sections.legalBasis.legitimateInterest" t={t} /></p>
                <p><Trans i18nKey="privacyPolicy.sections.legalBasis.legalObligation" t={t} /></p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('privacyPolicy.sections.usage.title')}</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p><Trans i18nKey="privacyPolicy.sections.usage.operation" t={t} /></p>
                <p><Trans i18nKey="privacyPolicy.sections.usage.personalization" t={t} /></p>
                <p><Trans i18nKey="privacyPolicy.sections.usage.communication" t={t} /></p>
                <p><Trans i18nKey="privacyPolicy.sections.usage.security" t={t} /></p>
                <p><Trans i18nKey="privacyPolicy.sections.usage.analytics" t={t} /></p>
                <p><Trans i18nKey="privacyPolicy.sections.usage.marketing" t={t} /></p>
                <p><Trans i18nKey="privacyPolicy.sections.usage.compliance" t={t} /></p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('privacyPolicy.sections.sharing.title')}</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">{t('privacyPolicy.sections.sharing.noSale.title')}</h4>
                  <p className="text-gray-700 dark:text-gray-300">{t('privacyPolicy.sections.sharing.noSale.content')}</p>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">{t('privacyPolicy.sections.sharing.authorized.title')}</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                    {(t('privacyPolicy.sections.sharing.authorized.items', { returnObjects: true }) as string[]).map((item, index) => (
                      <li key={index}><Trans defaults={item} /></li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('privacyPolicy.sections.internationalTransfer.title')}</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>{t('privacyPolicy.sections.internationalTransfer.intro')}</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  {(t('privacyPolicy.sections.internationalTransfer.items', { returnObjects: true }) as string[]).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('privacyPolicy.sections.retention.title')}</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p><Trans i18nKey="privacyPolicy.sections.retention.account" t={t} /></p>
                <p><Trans i18nKey="privacyPolicy.sections.retention.content" t={t} /></p>
                <p><Trans i18nKey="privacyPolicy.sections.retention.payment" t={t} /></p>
                <p><Trans i18nKey="privacyPolicy.sections.retention.security" t={t} /></p>
                <p><Trans i18nKey="privacyPolicy.sections.retention.marketing" t={t} /></p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('privacyPolicy.sections.rights.title')}</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">{t('privacyPolicy.sections.rights.universal.title')}</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                    {(t('privacyPolicy.sections.rights.universal.items', { returnObjects: true }) as string[]).map((item, index) => (
                      <li key={index}><Trans defaults={item} /></li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">{t('privacyPolicy.sections.rights.specific.title')}</h4>
                  <div className="space-y-2 text-gray-700 dark:text-gray-300">
                    <p><Trans i18nKey="privacyPolicy.sections.rights.specific.gdpr" t={t} /></p>
                    <p><Trans i18nKey="privacyPolicy.sections.rights.specific.ccpa" t={t} /></p>
                    <p><Trans i18nKey="privacyPolicy.sections.rights.specific.lgpd" t={t} /></p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('privacyPolicy.sections.exerciseRights.title')}</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p><Trans i18nKey="privacyPolicy.sections.exerciseRights.account" t={t} /></p>
                <p><Trans i18nKey="privacyPolicy.sections.exerciseRights.email" t={t} /></p>
                <p><Trans i18nKey="privacyPolicy.sections.exerciseRights.form" t={t} /></p>
                <p><Trans i18nKey="privacyPolicy.sections.exerciseRights.response" t={t} /></p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('privacyPolicy.sections.cookies.title')}</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">{t('privacyPolicy.sections.cookies.types.title')}</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                    {(t('privacyPolicy.sections.cookies.types.items', { returnObjects: true }) as string[]).map((item, index) => (
                      <li key={index}><Trans defaults={item} /></li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">{t('privacyPolicy.sections.cookies.management.title')}</h4>
                  <p className="text-gray-700 dark:text-gray-300">{t('privacyPolicy.sections.cookies.management.content')}</p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('privacyPolicy.sections.security.title')}</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>{t('privacyPolicy.sections.security.intro')}</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  {(t('privacyPolicy.sections.security.items', { returnObjects: true }) as string[]).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('privacyPolicy.sections.dataBreach.title')}</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>{t('privacyPolicy.sections.dataBreach.intro')}</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  {(t('privacyPolicy.sections.dataBreach.items', { returnObjects: true }) as string[]).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('privacyPolicy.sections.minors.title')}</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>{t('privacyPolicy.sections.minors.content1')}</p>
                <p>{t('privacyPolicy.sections.minors.content2')}</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('privacyPolicy.sections.changes.title')}</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>{t('privacyPolicy.sections.changes.intro')}</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  {(t('privacyPolicy.sections.changes.items', { returnObjects: true }) as string[]).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('privacyPolicy.sections.contact.title')}</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p><Trans i18nKey="privacyPolicy.sections.contact.dpo" t={t} /></p>
                <p><Trans i18nKey="privacyPolicy.sections.contact.privacy" t={t} /></p>
                <p><Trans i18nKey="privacyPolicy.sections.contact.company" t={t} /></p>
                <p><Trans i18nKey="privacyPolicy.sections.contact.address" t={t} /></p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('privacyPolicy.sections.authorities.title')}</h3>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p>{t('privacyPolicy.sections.authorities.intro')}</p>
                <p><Trans i18nKey="privacyPolicy.sections.authorities.brazil" t={t} /></p>
                <p><Trans i18nKey="privacyPolicy.sections.authorities.eu" t={t} /></p>
                <p><Trans i18nKey="privacyPolicy.sections.authorities.california" t={t} /></p>
              </div>
            </section>

            <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                {t('privacyPolicy.footer')}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PrivacyPolicy;