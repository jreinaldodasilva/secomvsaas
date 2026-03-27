import { useState, useMemo, InputHTMLAttributes } from 'react';
import { useTranslation } from '@/i18n';
import { PASSWORD_RULES } from '@/validation/shared/passwordRules';
import styles from './PasswordInput.module.css';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  showStrength?: boolean;
  label?: string;
  wrapperClassName?: string;
  error?: string;
}

const STRENGTH_LABEL_CLASSES = [
  styles.strengthWeak,
  styles.strengthFair,
  styles.strengthGood,
  styles.strengthStrong,
] as const;

const STRENGTH_BAR_CLASSES = [
  styles.strengthBar0,
  styles.strengthBar1,
  styles.strengthBar2,
  styles.strengthBar3,
  styles.strengthBarWeak,
  styles.strengthBarFair,
  styles.strengthBarGood,
  styles.strengthBarStrong,
] as const;

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

export function PasswordInput({ showStrength = false, label, value, wrapperClassName, error, ...props }: PasswordInputProps) {
  const { t, tArray } = useTranslation();
  const [visible, setVisible] = useState(false);
  const val = String(value ?? '');
  const errorId = props.id ? `${props.id}-error` : undefined;

  const passed = useMemo(() => PASSWORD_RULES.filter((r) => r.test(val)), [val]);
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
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
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
      {error && (
        <p id={errorId} role="alert" className={styles.errorMsg}>{error}</p>
      )}
      {showStrength && val.length > 0 && (
        <div className={styles.strength} aria-live="polite">
          <div className={styles.strengthTrack}>
            <div
              className={`${styles.strengthBar} ${STRENGTH_BAR_CLASSES[score]} ${STRENGTH_BAR_CLASSES[score + 4]}`}
            />
          </div>
          <span className={`${styles.strengthLabel} ${STRENGTH_LABEL_CLASSES[score]}`}>
            {strengthLabels[score]}
          </span>
          <ul className={styles.rules}>
            {PASSWORD_RULES.map((r) => (
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
