import type { CSSProperties, ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import styles from './Layout.module.css';

type ContainerProps<T extends ElementType = 'div'> = {
  as?: T;
  children: ReactNode;
  className?: string;
  maxWidth?: string;
  paddingX?: string;
  paddingSm?: string;
  paddingLg?: string;
};

export function Container<T extends ElementType = 'div'>({
  as,
  children,
  className = '',
  maxWidth,
  paddingX,
  paddingSm,
  paddingLg,
  ...rest
}: ContainerProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof ContainerProps<T>>) {
  const Comp = (as || 'div') as ElementType;
  const style = {
    ...(maxWidth ? ({ '--layout-container-max-width': maxWidth } as CSSProperties) : {}),
    ...(paddingX ? ({ '--container-padding-x': paddingX } as CSSProperties) : {}),
    ...(paddingSm ? ({ '--container-padding-sm': paddingSm } as CSSProperties) : {}),
    ...(paddingLg ? ({ '--container-padding-lg': paddingLg } as CSSProperties) : {}),
  };

  return (
    <Comp className={`${styles.container} ${className}`.trim()} style={style} {...rest}>
      {children}
    </Comp>
  );
}
