import React from 'react';
import { Modal } from '../Modal/Modal';
import { Button } from '@/components/UI';
import styles from './SessionTimeoutModal.module.css';

interface SessionTimeoutModalProps {
  show: boolean;
  onContinue: () => void;
  onLogout: () => void;
}

export const SessionTimeoutModal: React.FC<SessionTimeoutModalProps> = ({ show, onContinue, onLogout }) => (
  <Modal
    isOpen={show}
    onClose={onContinue}
    title="Sessão Expirando"
    size="sm"
    showCloseButton={false}
    closeOnOverlayClick={false}
    footer={
      <div className={styles.actions}>
        <Button variant="outline" onClick={onLogout}>Sair</Button>
        <Button variant="primary" onClick={onContinue} autoFocus>Continuar Conectado</Button>
      </div>
    }
  >
    <p className={styles.message}>
      Sua sessão expirará em 2 minutos por inatividade. Deseja continuar conectado?
    </p>
  </Modal>
);
