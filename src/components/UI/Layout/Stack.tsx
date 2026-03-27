import type { CSSProperties, ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import styles from './Layout.module.css';

type StackProps<T extends ElementType = 'div'> = {
  as?: T;
  children: ReactNode;
  className?: string;
  direction?: 'column' | 'row';
  gap?: string;
  align?: CSSProperties['alignItems'];
  justify?: CSSProperties['justifyContent'];
};

export function Stack<T extends ElementType = 'div'>({
  as,
  children,
  className = '',
  direction = 'column',
  gap,
  align,
  justify,
  ...rest
}: StackProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof StackProps<T>>) {
  const Comp = (as || 'div') as ElementType;
  const cls = [
    styles.stack,
    direction === 'row' ? styles.stackRow : '',
    className,
  ].filter(Boolean).join(' ');

  const style = {
    ...(gap ? ({ '--stack-gap': gap } as CSSProperties) : {}),
    ...(align ? ({ '--stack-align': align } as CSSProperties) : {}),
    ...(justify ? ({ '--stack-justify': justify } as CSSProperties) : {}),
  };

  return (
    <Comp className={cls} style={style} {...rest}>
      {children}
    </Comp>
  );
}
