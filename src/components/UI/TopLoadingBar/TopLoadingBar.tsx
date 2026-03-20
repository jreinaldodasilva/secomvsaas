import { useEffect, useState, Component, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useIsFetching } from '@tanstack/react-query';
import styles from './TopLoadingBar.module.css';

class QueryBoundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  render() { return this.state.error ? null : this.props.children; }
}

function LoadingBarInner({ navigating }: { navigating: boolean }) {
  const isFetching = useIsFetching();
  const visible = navigating || isFetching > 0;
  return visible ? <div className={styles.bar} /> : null;
}

export function TopLoadingBar() {
  const location = useLocation();
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    setNavigating(true);
    const t = setTimeout(() => setNavigating(false), 150);
    return () => clearTimeout(t);
  }, [location.pathname]);

  return (
    <QueryBoundary>
      <LoadingBarInner navigating={navigating} />
    </QueryBoundary>
  );
}
