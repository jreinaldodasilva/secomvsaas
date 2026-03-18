import { useTranslation } from '@/i18n';
import { usePageTitle } from '@/hooks/usePageTitle';

export function PrivacyPage() {
  const { t } = useTranslation();
  usePageTitle(t('legal.privacy.title'));

  return (
    <div className="legal-page">
      <h1>{t('legal.privacy.title')}</h1>
      <p className="legal-updated">{t('legal.privacy.updated')}</p>

      <section>
        <h2>{t('legal.privacy.collection.title')}</h2>
        <p>{t('legal.privacy.collection.desc')}</p>
      </section>

      <section>
        <h2>{t('legal.privacy.usage.title')}</h2>
        <p>{t('legal.privacy.usage.desc')}</p>
      </section>

      <section>
        <h2>{t('legal.privacy.storage.title')}</h2>
        <p>{t('legal.privacy.storage.desc')}</p>
      </section>

      <section>
        <h2>{t('legal.privacy.rights.title')}</h2>
        <p>{t('legal.privacy.rights.desc')}</p>
      </section>

      <section>
        <h2>{t('legal.privacy.contact.title')}</h2>
        <p>{t('legal.privacy.contact.desc')}</p>
      </section>
    </div>
  );
}
