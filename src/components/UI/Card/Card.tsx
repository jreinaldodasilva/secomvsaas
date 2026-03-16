import React from 'react';
import styles from './Card.module.css';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'sm' | 'md' | 'lg' | 'none';
  interactive?: boolean;
  children: React.ReactNode;
}

export const Card = React.memo<CardProps>(({
  variant = 'default',
  padding = 'md',
  interactive = false,
  className = '',
  children,
  ...props
}) => {
  const cls = [
    styles.card,
    styles[variant],
    padding !== 'none' ? styles[`pad${padding.charAt(0).toUpperCase() + padding.slice(1)}`] : '',
    interactive ? styles.interactive : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={cls} {...props}>
      {children}
    </div>
  );
});

Card.displayName = 'Card';
