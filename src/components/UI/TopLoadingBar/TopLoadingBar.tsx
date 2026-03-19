import { useEffect, useState, Component, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useIsFetching } from '@tanstack/react-query';
import styles from './TopLoadingBar.module.css';

class QueryBoundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  render() { return this.state.error ? null : this.props.children; }
}

function LoadingBarInner({ navigating }: { navigating: boolean }) {
  const isFetching = useIsFetching();
  const reduced = useReducedMotion();
  const visible = !reduced && (navigating || isFetching > 0);
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={styles.bar}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        />
      )}
    </AnimatePresence>
  );
}

export function TopLoadingBar() {
  const location = useLocation();
  const [navigating, setNavigating] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    setNavigating(true);
    const t = setTimeout(() => setNavigating(false), 150);
    return () => clearTimeout(t);
  }, [location.pathname, reduced]);

  return (
    <QueryBoundary>
      <LoadingBarInner navigating={navigating} />
    </QueryBoundary>
  );
}
