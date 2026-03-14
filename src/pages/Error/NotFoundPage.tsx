import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/UI';
import { useTranslation } from '../../i18n';

export function NotFoundPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="error-page">
      <h1 className="error-page-code">404</h1>
      <p className="error-page-message">{t('errors.notFound')}</p>
      <Button onClick={() => navigate('/admin/dashboard')}>{t('common.backToHome')}</Button>
    </div>
  );
}
