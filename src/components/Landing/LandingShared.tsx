import { motion, useReducedMotion, type Variants } from 'framer-motion';
import styles from './Landing.module.css';

const fullContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const reducedContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const fullItemVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
};

const reducedItemVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } },
};

// Exported for HeroSection — callers that don't use useReducedMotion directly
export const containerVariants = fullContainerVariants;
export const itemVariants = fullItemVariants;

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

interface AnimatedGridProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedGrid({ children, className }: AnimatedGridProps) {
  const reduced = useReducedMotion();
  const cv = reduced ? reducedContainerVariants : fullContainerVariants;
  return (
    <motion.div
      className={className}
      variants={cv}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedItem({ children, className }: AnimatedGridProps) {
  const reduced = useReducedMotion();
  const iv = reduced ? reducedItemVariants : fullItemVariants;
  return (
    <motion.div
      className={className}
      variants={iv}
      {...(!reduced && { whileHover: { scale: 1.02 }, transition: { type: 'spring', stiffness: 220 } })}
    >
      {children}
    </motion.div>
  );
}
