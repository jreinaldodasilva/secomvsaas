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

  it('renders helpText with a unique id', () => {
    render(
      <FormField name="pwd" helpText="Mínimo 8 caracteres">
        <input id="pwd" />
      </FormField>,
    );
    const help = screen.getByText('Mínimo 8 caracteres');
    expect(help).toBeInTheDocument();
    expect(help).toHaveAttribute('id');
    expect(help.id).toBeTruthy();
  });

  it('renders error with role=alert and a unique id', () => {
    render(
      <FormField name="pwd" error="Campo obrigatório">
        <input id="pwd" />
      </FormField>,
    );
    const err = screen.getByRole('alert');
    expect(err).toHaveTextContent('Campo obrigatório');
    expect(err).toHaveAttribute('id');
    expect(err.id).toBeTruthy();
  });

  it('does not render error element when error is omitted', () => {
    render(<FormField name="x"><input id="x" /></FormField>);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('injects aria-describedby on input matching the error element id', () => {
    render(
      <FormField name="email" error="Campo obrigatório">
        <input id="email" />
      </FormField>,
    );
    const input = screen.getByRole('textbox');
    const errorEl = screen.getByRole('alert');
    expect(input).toHaveAttribute('aria-describedby', errorEl.id);
  });

  it('injects aria-describedby on input matching the help element id', () => {
    render(
      <FormField name="email" helpText="Dica">
        <input id="email" />
      </FormField>,
    );
    const input = screen.getByRole('textbox');
    const helpEl = screen.getByText('Dica');
    expect(input).toHaveAttribute('aria-describedby', helpEl.id);
  });

  it('injects aria-describedby with both ids when error and helpText are present', () => {
    render(
      <FormField name="email" error="Inválido" helpText="Dica">
        <input id="email" />
      </FormField>,
    );
    const input = screen.getByRole('textbox');
    const errorEl = screen.getByRole('alert');
    const helpEl = screen.getByText('Dica');
    expect(input).toHaveAttribute('aria-describedby', `${errorEl.id} ${helpEl.id}`);
  });

  it('does not inject aria-describedby when neither error nor helpText is present', () => {
    render(
      <FormField name="email">
        <input id="email" />
      </FormField>,
    );
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-describedby');
  });

  it('generates unique ids for two FormField instances with the same name', () => {
    render(
      <>
        <FormField name="title" error="Erro A">
          <input id="title-a" />
        </FormField>
        <FormField name="title" error="Erro B">
          <input id="title-b" />
        </FormField>
      </>,
    );
    const [errA, errB] = screen.getAllByRole('alert');
    expect(errA.id).not.toBe(errB.id);
    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveAttribute('aria-describedby', errA.id);
    expect(inputs[1]).toHaveAttribute('aria-describedby', errB.id);
  });
});
