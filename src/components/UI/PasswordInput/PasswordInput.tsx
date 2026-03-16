import { useState, useMemo, InputHTMLAttributes } from 'react';
import { useTranslation } from '../../../i18n';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  showStrength?: boolean;
  label?: string;
}

const RULES = [
  { test: (v: string) => v.length >= 8, key: 'password.minLength' },
  { test: (v: string) => /[A-Z]/.test(v), key: 'password.uppercase' },
  { test: (v: string) => /[0-9]/.test(v), key: 'password.number' },
  { test: (v: string) => /[^A-Za-z0-9]/.test(v), key: 'password.special' },
];

const STRENGTH_COLORS = ['#e74c3c', '#e74c3c', '#f39c12', '#2ecc71', '#27ae60'] as const;

export function PasswordInput({ showStrength = false, label, value, ...props }: PasswordInputProps) {
  const { t, tArray } = useTranslation();
  const [visible, setVisible] = useState(false);
  const val = String(value ?? '');

  const passed = useMemo(() => RULES.filter((r) => r.test(val)), [val]);
  const score = passed.length;
  const strengthLabels = tArray('password.strength');

  return (
    <div className="password-input">
      {label && <label htmlFor={props.id}>{label}</label>}
      <div className="password-input-wrapper">
        <input {...props} type={visible ? 'text' : 'password'} value={value} />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? t('password.hide') : t('password.show')}
          className="password-input-toggle"
        >
          {visible ? '🙈' : '👁'}
        </button>
      </div>
      {showStrength && val.length > 0 && (
        <div className="password-strength" aria-live="polite">
          <div className="password-strength-track">
            <div
              className="password-strength-bar"
              style={{ width: `${(score / RULES.length) * 100}%`, background: STRENGTH_COLORS[score] }}
            />
          </div>
          <small className="password-strength-label" style={{ color: STRENGTH_COLORS[score] }}>{strengthLabels[score]}</small>
          <ul className="password-strength-rules">
            {RULES.map((r) => (
              <li key={r.key} className={r.test(val) ? 'rule-pass' : 'rule-fail'}>
                {t(r.key)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
