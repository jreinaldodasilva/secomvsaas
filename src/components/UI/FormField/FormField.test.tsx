import { render, screen } from '@testing-library/react';
import { FormField } from './FormField';

describe('FormField', () => {
  it('renders children', () => {
    render(<FormField name="email"><input id="email" /></FormField>);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders label linked to input via htmlFor', () => {
    render(
      <FormField name="email" label="E-mail">
        <input id="email" />
      </FormField>,
    );
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
  });

  it('does not render label when omitted', () => {
    render(<FormField name="x"><input id="x" /></FormField>);
    expect(screen.queryByRole('label')).not.toBeInTheDocument();
  });

  it('renders required asterisk when required=true', () => {
    render(
      <FormField name="x" label="Nome" required>
        <input id="x" />
      </FormField>,
    );
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('does not render asterisk when required is omitted', () => {
    render(
      <FormField name="x" label="Nome">
        <input id="x" />
      </FormField>,
    );
    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });

  it('renders helpText with correct id', () => {
    render(
      <FormField name="pwd" helpText="Mínimo 8 caracteres">
        <input id="pwd" />
      </FormField>,
    );
    const help = screen.getByText('Mínimo 8 caracteres');
    expect(help).toBeInTheDocument();
    expect(help).toHaveAttribute('id', 'pwd-help');
  });

  it('renders error with role=alert and correct id', () => {
    render(
      <FormField name="pwd" error="Campo obrigatório">
        <input id="pwd" />
      </FormField>,
    );
    const err = screen.getByRole('alert');
    expect(err).toHaveTextContent('Campo obrigatório');
    expect(err).toHaveAttribute('id', 'pwd-error');
  });

  it('does not render error element when error is omitted', () => {
    render(<FormField name="x"><input id="x" /></FormField>);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
