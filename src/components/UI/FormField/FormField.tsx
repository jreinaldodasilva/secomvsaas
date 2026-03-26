import React, { useId } from 'react';
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
  const uid = useId();
  const fieldId = `${uid}-${name}`;
  const errorId = `${uid}-${name}-error`;
  const helpId = `${uid}-${name}-help`;

  const describedBy = [
    error ? errorId : null,
    helpText ? helpId : null,
  ].filter(Boolean).join(' ') || undefined;

  const child = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
        id: fieldId,
        'aria-describedby': describedBy,
      })
    : children;

  return (
    <div className={`${styles.field} ${error ? styles.hasError : ''}`}>
      {label && (
        <label htmlFor={fieldId} className={styles.label}>
          {label}
          {required && <span className={styles.required} aria-label="obrigatório">*</span>}
        </label>
      )}
      <div className={styles.input}>{child}</div>
      {helpText && (
        <p className={styles.help} id={helpId}>{helpText}</p>
      )}
      {error && (
        <p className={styles.error} id={errorId} role="alert">{error}</p>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';
