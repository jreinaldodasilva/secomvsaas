import { motion, type Variants } from 'framer-motion';
import styles from './Landing.module.css';

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
};

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
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedItem({ children, className }: AnimatedGridProps) {
  return (
    <motion.div
      className={className}
      variants={itemVariants}
      whileHover={{ scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 220 }}
    >
      {children}
    </motion.div>
  );
}
