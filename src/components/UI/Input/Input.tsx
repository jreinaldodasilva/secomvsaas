import React, { useState, useId, forwardRef } from 'react';
import styles from './Input.module.css';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'floating';
  isLoading?: boolean;
  success?: boolean;
  showClearButton?: boolean;
  onClear?: () => void;
}

const SpinnerIcon = () => (
  <svg className={styles.spinner} viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeDasharray="50" strokeDashoffset="50"
      style={{ animation: 'inputSpinnerDash 1.5s ease-in-out infinite' }} />
  </svg>
);

const SuccessIcon = () => (
  <svg className={styles.successIcon} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const ErrorIcon = () => (
  <svg className={styles.errorIcon} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
  </svg>
);

export const Input = React.memo(forwardRef<HTMLInputElement, InputProps>((
  {
    label, error, helperText, leftIcon, rightIcon,
    size = 'md', variant = 'default',
    isLoading = false, success = false,
    showClearButton = false, onClear,
    className = '', id, value, disabled, required, type,
    onChange, onFocus, onBlur, onKeyDown,
    ...props
  },
  ref
) => {
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(Boolean(value));
  const uid = useId();
  const inputId = id || uid;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  const groupCls = [
    styles.group,
    styles[variant],
    styles[size],
    focused && styles.focused,
    error && styles.hasError,
    success && !error && styles.hasSuccess,
    disabled && styles.disabled,
    (hasValue || focused) && styles.hasValue,
    className,
  ].filter(Boolean).join(' ');

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    onFocus?.(e);
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    onBlur?.(e);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(Boolean(e.target.value));
    onChange?.(e);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape' && hasValue && showClearButton) {
      e.preventDefault();
      setHasValue(false);
      onClear?.();
    }
    onKeyDown?.(e);
  };

  const describedBy = [error ? errorId : null, helperText ? helperId : null]
    .filter(Boolean).join(' ') || undefined;

  return (
    <div className={groupCls}>
      {label && variant !== 'floating' && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && <span className={styles.required} aria-label="obrigatório"> *</span>}
        </label>
      )}
      <div className={styles.container}>
        {leftIcon && <span className={`${styles.icon} ${styles.iconLeft}`}>{leftIcon}</span>}
        <input
          ref={ref}
          id={inputId}
          className={styles.field}
          type={type}
          value={value}
          disabled={disabled}
          required={required}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          aria-required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          {...props}
        />
        {variant === 'floating' && label && (
          <label htmlFor={inputId} className={`${styles.label} ${styles.labelFloating}`}>
            {label}
            {required && <span className={styles.required}> *</span>}
          </label>
        )}
        <span className={styles.iconsRight}>
          {isLoading && <SpinnerIcon />}
          {success && !error && !isLoading && <SuccessIcon />}
          {error && !isLoading && <ErrorIcon />}
          {showClearButton && hasValue && !isLoading && !disabled && (
            <button type="button" className={styles.clearBtn} onClick={() => { setHasValue(false); onClear?.(); }} aria-label="Limpar campo">
              <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
            </button>
          )}
          {rightIcon && !isLoading && !success && !error && !showClearButton && (
            <span className={styles.icon}>{rightIcon}</span>
          )}
        </span>
      </div>
      {error && <p id={errorId} className={styles.errorText} role="alert">{error}</p>}
      {helperText && !error && <p id={helperId} className={styles.helperText}>{helperText}</p>}
    </div>
  );
}));

Input.displayName = 'Input';
export default Input;
