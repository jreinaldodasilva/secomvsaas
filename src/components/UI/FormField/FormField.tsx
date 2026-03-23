import React from 'react';
import styles from './FormField.module.css';

interface FormFieldProps {
  label?: string;
  name: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  children: React.ReactNode;
}

export const FormField = React.memo<FormFieldProps>((
  { label, name, error, helpText, required, children },
) => {
  const describedBy = [
    error ? `${name}-error` : null,
    helpText ? `${name}-help` : null,
  ].filter(Boolean).join(' ') || undefined;

  const child = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
        'aria-describedby': describedBy,
      })
    : children;

  return (
    <div className={`${styles.field} ${error ? styles.hasError : ''}`}>
      {label && (
        <label htmlFor={name} className={styles.label}>
          {label}
          {required && <span className={styles.required} aria-label="obrigatório">*</span>}
        </label>
      )}
      {helpText && (
        <p className={styles.help} id={`${name}-help`}>{helpText}</p>
      )}
      <div className={styles.input}>{child}</div>
      {error && (
        <p className={styles.error} id={`${name}-error`} role="alert">{error}</p>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';
