import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';

const CONSENT_KEY = 'secom_cookie_consent';

export function CookieConsent() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="alert">
      <p>
        {t('lgpd.message')}{' '}
        <Link to="/privacy">{t('lgpd.learnMore')}</Link>
      </p>
      <button className="btn btn-primary btn-sm" onClick={accept}>{t('lgpd.accept')}</button>
    </div>
  );
}
