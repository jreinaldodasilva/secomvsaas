import { createPortal } from 'react-dom';
import Toast from './Toast';
import { useToastStore } from './toastStore';
import styles from './ToastContainer.module.css';

export function ToastContainer() {
  const { toasts, remove } = useToastStore();

  return createPortal(
    <div className={styles.container} aria-label="Notificações">
      {toasts.map(t => (
        <Toast key={t.id} {...t} onClose={remove} />
      ))}
    </div>,
    document.body
  );
}
