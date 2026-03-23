import React, { Component, ErrorInfo } from 'react';
import { reportError } from '@/utils/errorReporting';
import { Button } from '@/components/UI';
import styles from './ErrorBoundary.module.css';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}
interface State { hasError: boolean; error?: Error; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportError(error, info);
    this.props.onError?.(error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className={styles.boundary}>
          <h2>Algo deu errado</h2>
          <p>{this.state.error?.message}</p>
          <Button variant="primary" onClick={() => this.setState({ hasError: false })}>Tentar novamente</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
