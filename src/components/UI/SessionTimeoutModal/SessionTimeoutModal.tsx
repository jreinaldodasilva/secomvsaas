import React from 'react';
import styles from './SessionTimeoutModal.module.css';

interface SessionTimeoutModalProps {
  show: boolean;
  onContinue: () => void;
  onLogout: () => void;
}

export const SessionTimeoutModal: React.FC<SessionTimeoutModalProps> = ({ show, onContinue, onLogout }) => {
  if (!show) return null;

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-timeout-title"
    >
      <div className={styles.modal}>
        <h2 id="session-timeout-title" className={styles.title}>Sessão Expirando</h2>
        <p className={styles.message}>
          Sua sessão expirará em 2 minutos por inatividade. Deseja continuar conectado?
        </p>
        <div className={styles.actions}>
          <button onClick={onLogout} className="btn btn-secondary">Sair</button>
          <button onClick={onContinue} className="btn btn-primary" autoFocus>
            Continuar Conectado
          </button>
        </div>
      </div>
    </div>
  );
};
