import { useState, type FormEvent } from 'react';
import { z } from 'zod';
import { FormField, Button } from '@/components/UI';
import Input from '@/components/UI/Input/Input';
import { isValidPhone } from '@/validation/shared/phone';
import styles from './ContactForm.module.css';

const contactSchema = z.object({
  name:       z.string().min(2, 'Nome é obrigatório (mín. 2 caracteres)'),
  email:      z.string().email('Digite um e-mail válido'),
  department: z.string().min(2, 'Nome da secretaria é obrigatório'),
  specialty:  z.string().min(2, 'Área de atuação é obrigatória'),
  phone:      z.string().refine(isValidPhone, 'Digite um telefone válido (10–11 dígitos)'),
});

type ContactFormState = z.infer<typeof contactSchema>;

const empty: ContactFormState = { name: '', email: '', department: '', specialty: '', phone: '' };

function validate(data: ContactFormState): Record<string, string> {
  const result = contactSchema.safeParse(data);
  if (result.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as string;
    if (!errors[field]) errors[field] = issue.message;
  }
  return errors;
}

export function ContactForm() {
  const [form, setForm] = useState<ContactFormState>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (field: keyof ContactFormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(p => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors(p => { const n = { ...p }; delete n[field]; return n; });
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
        <button className={styles.resetBtn} onClick={() => { setSubmitted(false); setForm(empty); }}>
          Enviar outra mensagem
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <FormField name="name" label="Nome completo" error={errors.name} required>
        <Input id="name" type="text" value={form.name} onChange={set('name')} disabled={submitting} autoComplete="name" />
      </FormField>

      <FormField name="email" label="E-mail profissional" error={errors.email} required>
        <Input id="email" type="email" value={form.email} onChange={set('email')} disabled={submitting} autoComplete="email" />
      </FormField>

      <FormField name="department" label="Nome da secretaria" error={errors.department} required>
        <Input id="department" type="text" value={form.department} onChange={set('department')} disabled={submitting} />
      </FormField>

      <FormField name="specialty" label="Área de atuação" error={errors.specialty} required>
        <Input id="specialty" type="text" value={form.specialty} onChange={set('specialty')} disabled={submitting} placeholder="ex: Jornalismo, Design, Cerimonial" />
      </FormField>

      <FormField name="phone" label="Telefone com WhatsApp" error={errors.phone} required>
        <Input id="phone" type="tel" value={form.phone} onChange={set('phone')} disabled={submitting} autoComplete="tel" inputMode="tel" placeholder="ex: 11999999999" />
      </FormField>

      <Button type="submit" fullWidth isLoading={submitting} className={styles.btn}>
        Quero conhecer o Secom em Ação
      </Button>
      <p className={styles.help}>Retornaremos em até 24 horas úteis</p>
    </form>
  );
}
