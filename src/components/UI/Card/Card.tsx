import React from 'react';
import styles from './Card.module.css';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  padding?: 'sm' | 'md' | 'lg' | 'none';
  interactive?: boolean;
  children: React.ReactNode;
}

export const Card = React.memo<CardProps>(({
  variant = 'default',
  size = 'md',
  padding = 'md',
  interactive = false,
  className = '',
  children,
  ...props
}) => {
  const cls = [
    styles.card,
    styles[variant],
    styles[`size${size.charAt(0).toUpperCase() + size.slice(1)}`],
    padding !== 'none' ? styles[`pad${padding.charAt(0).toUpperCase() + padding.slice(1)}`] : '',
    interactive ? styles.interactive : '',
    className,
  ].filter(Boolean).join(' ');

  return <div className={cls} {...props}>{children}</div>;
});

Card.displayName = 'Card';
