import { Modal } from '@/components/UI/Modal/Modal';
import { Button } from '@/components/UI/Button/Button';
import { useTranslation } from '@/i18n';
import styles from './ConfirmDialog.module.css';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  isLoading?: boolean;
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel, isLoading }: ConfirmDialogProps) {
  const { t } = useTranslation();
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || t('common.confirm')} size="sm">
      <div className={styles.body}>
        <p>{message || t('common.deleteConfirm')}</p>
        <div className={styles.actions}>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isLoading}>{t('common.cancel')}</Button>
          <Button variant="danger" size="sm" onClick={onConfirm} isLoading={isLoading}>{confirmLabel ?? t('common.delete')}</Button>
        </div>
      </div>
    </Modal>
  );
}
