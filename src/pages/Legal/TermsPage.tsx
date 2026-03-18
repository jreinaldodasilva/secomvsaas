import { useTranslation } from '@/i18n';
import { usePageTitle } from '@/hooks';

export function TermsPage() {
  const { t } = useTranslation();
  usePageTitle(t('legal.terms.title'));

  return (
    <div className="legal-page">
      <h1>{t('legal.terms.title')}</h1>
      <p className="legal-updated">{t('legal.terms.updated')}</p>

      <section>
        <h2>{t('legal.terms.acceptance.title')}</h2>
        <p>{t('legal.terms.acceptance.desc')}</p>
      </section>

      <section>
        <h2>{t('legal.terms.usage.title')}</h2>
        <p>{t('legal.terms.usage.desc')}</p>
      </section>

      <section>
        <h2>{t('legal.terms.obligations.title')}</h2>
        <p>{t('legal.terms.obligations.desc')}</p>
      </section>

      <section>
        <h2>{t('legal.terms.liability.title')}</h2>
        <p>{t('legal.terms.liability.desc')}</p>
      </section>

      <section>
        <h2>{t('legal.terms.changes.title')}</h2>
        <p>{t('legal.terms.changes.desc')}</p>
      </section>
    </div>
  );
}
