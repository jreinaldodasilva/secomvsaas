import React from 'react';
import { Modal } from '../Modal/Modal';
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
        <button onClick={onLogout} className="btn btn-secondary">Sair</button>
        <button onClick={onContinue} className="btn btn-primary" autoFocus>Continuar Conectado</button>
      </div>
    }
  >
    <p className={styles.message}>
      Sua sessão expirará em 2 minutos por inatividade. Deseja continuar conectado?
    </p>
  </Modal>
);
