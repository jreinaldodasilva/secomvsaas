import type { CSSProperties, ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import styles from './Layout.module.css';

type GridProps<T extends ElementType = 'div'> = {
  as?: T;
  children: ReactNode;
  className?: string;
  columns?: string;
  gap?: string;
};

export function Grid<T extends ElementType = 'div'>({
  as,
  children,
  className = '',
  columns,
  gap,
  ...rest
}: GridProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof GridProps<T>>) {
  const Comp = (as || 'div') as ElementType;
  const style = {
    ...(columns ? ({ '--grid-columns': columns } as CSSProperties) : {}),
    ...(gap ? ({ '--grid-gap': gap } as CSSProperties) : {}),
  };

  return (
    <Comp className={`${styles.grid} ${className}`.trim()} style={style} {...rest}>
      {children}
    </Comp>
  );
}
