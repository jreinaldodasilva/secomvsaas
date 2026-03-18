import { useState, useMemo, InputHTMLAttributes } from 'react';
import { useTranslation } from '@/i18n';
import styles from './PasswordInput.module.css';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  showStrength?: boolean;
  label?: string;
  wrapperClassName?: string;
}

const RULES = [
  { test: (v: string) => v.length >= 8,          key: 'password.minLength' },
  { test: (v: string) => /[A-Z]/.test(v),         key: 'password.uppercase' },
  { test: (v: string) => /[0-9]/.test(v),         key: 'password.number' },
  { test: (v: string) => /[^A-Za-z0-9]/.test(v), key: 'password.special' },
];

const STRENGTH_COLORS = ['#e74c3c', '#e74c3c', '#f39c12', '#2ecc71', '#27ae60'] as const;

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

export function PasswordInput({ showStrength = false, label, value, wrapperClassName, ...props }: PasswordInputProps) {
  const { t, tArray } = useTranslation();
  const [visible, setVisible] = useState(false);
  const val = String(value ?? '');

  const passed = useMemo(() => RULES.filter((r) => r.test(val)), [val]);
  const score = passed.length;
  const strengthLabels = tArray('password.strength');

  return (
    <div className={wrapperClassName}>
      {label && <label htmlFor={props.id} className={styles.label}>{label}</label>}
      <div className={styles.wrapper}>
        <input
          {...props}
          type={visible ? 'text' : 'password'}
          value={value}
          className={styles.input}
        />
        <button
          type="button"
          onClick={() => setVisible(v => !v)}
          aria-label={visible ? t('password.hide') : t('password.show')}
          className={styles.toggle}
        >
          <EyeIcon open={visible} />
        </button>
      </div>
      {showStrength && val.length > 0 && (
        <div className={styles.strength} aria-live="polite">
          <div className={styles.strengthTrack}>
            <div
              className={styles.strengthBar}
              style={{ width: `${(score / RULES.length) * 100}%`, background: STRENGTH_COLORS[score] }}
            />
          </div>
          <span className={styles.strengthLabel} style={{ color: STRENGTH_COLORS[score] }}>
            {strengthLabels[score]}
          </span>
          <ul className={styles.rules}>
            {RULES.map((r) => (
              <li key={r.key} className={r.test(val) ? styles.rulePass : styles.ruleFail}>
                {t(r.key)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
