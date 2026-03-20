import { useEffect, useRef, useState } from 'react';
import styles from './Landing.module.css';

// ── useInView ─────────────────────────────────────────────────────────────────
// Fires once when the element enters the viewport (mirrors framer-motion's
// whileInView + viewport={{ once: true }} behaviour).

function useInView(margin = '-80px') {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { rootMargin: margin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [margin]);

  return { ref, visible };
}

export { useInView };

// ── SectionHeader ─────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title: string;
  desc: string;
  align?: 'center' | 'left';
}

export function SectionHeader({ title, desc, align = 'center' }: SectionHeaderProps) {
  return (
    <div className={`${styles.sectionHeader} ${align === 'left' ? styles.sectionHeaderLeft : ''}`}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <p className={styles.sectionDesc}>{desc}</p>
    </div>
  );
}

// ── AnimatedGrid ──────────────────────────────────────────────────────────────

interface AnimatedGridProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedGrid({ children, className }: AnimatedGridProps) {
  const { ref, visible } = useInView('-80px');
  return (
    <div ref={ref} className={className} data-visible={visible || undefined}>
      {children}
    </div>
  );
}

// ── AnimatedItem ──────────────────────────────────────────────────────────────

interface AnimatedItemProps {
  children: React.ReactNode;
  className?: string;
  index?: number;
}

export function AnimatedItem({ children, className, index = 0 }: AnimatedItemProps) {
  const { ref, visible } = useInView('-80px');
  return (
    <div
      ref={ref}
      className={`${className ?? ''} ${visible ? styles.animItem : ''}`}
      style={visible ? { '--anim-i': index } as React.CSSProperties : undefined}
    >
      {children}
    </div>
  );
}
