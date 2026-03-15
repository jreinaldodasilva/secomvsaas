import { Modal } from '../Modal/Modal';
import { Button } from '../Button/Button';
import { useTranslation } from '../../../i18n';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  isLoading?: boolean;
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, isLoading }: ConfirmDialogProps) {
  const { t } = useTranslation();
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || t('common.confirm')} size="sm">
      <div className="confirm-dialog">
        <p>{message || t('common.deleteConfirm')}</p>
        <div className="confirm-dialog-actions">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isLoading}>{t('common.cancel')}</Button>
          <Button variant="danger" size="sm" onClick={onConfirm} isLoading={isLoading}>{t('common.delete')}</Button>
        </div>
      </div>
    </Modal>
  );
}
