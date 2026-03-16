import { useState, type FormEvent } from 'react';
import styles from './ContactForm.module.css';

interface FormData { name: string; email: string; department: string; specialty: string; phone: string; }
interface FormErrors { name?: string; email?: string; department?: string; specialty?: string; phone?: string; general?: string; }

function validate(d: FormData): FormErrors {
  const e: FormErrors = {};
  if (!d.name || d.name.length < 2) e.name = 'Nome é obrigatório (mín. 2 caracteres)';
  if (!d.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) e.email = 'Digite um e-mail válido';
  if (!d.department || d.department.length < 2) e.department = 'Nome da secretaria é obrigatório';
  if (!d.specialty || d.specialty.length < 2) e.specialty = 'Área de atuação é obrigatória';
  if (!d.phone || !/^[\d\s\-()+]{10,20}$/.test(d.phone)) e.phone = 'Digite um telefone válido (10–20 dígitos)';
  return e;
}

export function ContactForm() {
  const [form, setForm] = useState<FormData>({ name: '', email: '', department: '', specialty: '', phone: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name as keyof FormErrors]) setErrors(p => ({ ...p, [name]: undefined }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className={styles.success}>
        <div className={styles.successIcon}>✅</div>
        <h3>Mensagem Enviada com Sucesso!</h3>
        <p>Nossa equipe retornará em até 24 horas úteis.</p>
        <button className={styles.resetBtn} onClick={() => { setSubmitted(false); setForm({ name: '', email: '', department: '', specialty: '', phone: '' }); }}>
          Enviar outra mensagem
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      {errors.general && <div className={styles.errorGeneral}>{errors.general}</div>}

      {([
        { name: 'name',       type: 'text',  placeholder: 'Nome completo *' },
        { name: 'email',      type: 'email', placeholder: 'E-mail profissional *' },
        { name: 'department', type: 'text',  placeholder: 'Nome da secretaria *' },
        { name: 'specialty',  type: 'text',  placeholder: 'Área de atuação (ex: Jornalismo, Design, Cerimonial) *' },
        { name: 'phone',      type: 'tel',   placeholder: 'Telefone com WhatsApp (ex: 11999999999) *' },
      ] as const).map(f => (
        <div key={f.name} className={styles.field}>
          <input
            name={f.name}
            type={f.type}
            value={form[f.name]}
            onChange={handleChange}
            placeholder={f.placeholder}
            disabled={submitting}
            className={`${styles.input} ${errors[f.name] ? styles.inputError : form[f.name] && !errors[f.name] ? styles.inputSuccess : ''}`}
            aria-invalid={!!errors[f.name]}
          />
          {errors[f.name] && <span className={styles.error} role="alert">{errors[f.name]}</span>}
        </div>
      ))}

      <button type="submit" disabled={submitting} className={`btn btn-primary ${styles.btn}`}>
        {submitting ? '⏳ Enviando...' : 'Quero conhecer o Secom em Ação'}
      </button>
      <p className={styles.help}>Retornaremos em até 24 horas úteis</p>
    </form>
  );
}
