import React from 'react';
import styles from './Skeleton.module.css';

export interface SkeletonProps {
  variant?: 'text' | 'rectangular' | 'circular' | 'card' | 'avatar';
  width?: string | number;
  height?: string | number;
  className?: string;
  animation?: 'wave' | 'pulse' | 'none';
  lines?: number;
}

const Skeleton = React.memo<SkeletonProps>(({
  variant = 'rectangular',
  width, height,
  className = '',
  animation = 'wave',
  lines = 1,
}) => {
  const cls = [
    styles.skeleton,
    styles[variant],
    animation !== 'none' ? styles[animation] : '',
    className,
  ].filter(Boolean).join(' ');

  const style: React.CSSProperties = {};
  if (width)  style.width  = typeof width  === 'number' ? `${width}px`  : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  if (variant === 'text' && lines > 1) {
    return (
      <div className={styles.group} role="status" aria-live="polite">
        <span className="sr-only">Carregando...</span>
        {Array.from({ length: lines }, (_, i) => (
          <div key={i} className={cls}
            style={i === lines - 1 ? { ...style, width: '60%' } : style}
            aria-hidden="true" />
        ))}
      </div>
    );
  }

  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Carregando...</span>
      <div className={cls} style={style} aria-hidden="true" />
    </div>
  );
});

Skeleton.displayName = 'Skeleton';
export default Skeleton;
