import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/UI';
import { useTranslation } from '../../i18n';

export function UnauthorizedPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="error-page">
      <h1 className="error-page-code">403</h1>
      <p className="error-page-message">{t('errors.unauthorized')}</p>
      <Button onClick={() => navigate(-1)}>{t('common.back')}</Button>
    </div>
  );
}
