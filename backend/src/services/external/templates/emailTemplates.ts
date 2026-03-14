import { env } from '../../../config/env';

const baseUrl = env.frontend.url;

const layout = (content: string) => `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:0;background:#f4f4f7}
.container{max-width:560px;margin:40px auto;background:#fff;border-radius:8px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,.1)}
.btn{display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;font-weight:600}
.footer{margin-top:32px;font-size:12px;color:#999;text-align:center}</style>
</head><body><div class="container">${content}<div class="footer">© vSaaS</div></div></body></html>`;

export const emailTemplates = {
  welcome: (name: string) => ({
    subject: 'Bem-vindo ao vSaaS',
    html: layout(`<h2>Bem-vindo, ${name}!</h2><p>Sua conta foi criada com sucesso.</p>
      <p><a class="btn" href="${baseUrl}/login">Acessar plataforma</a></p>`),
  }),

  passwordReset: (name: string, token: string) => ({
    subject: 'Redefinição de senha',
    html: layout(`<h2>Olá, ${name}</h2><p>Você solicitou a redefinição de senha. Clique no botão abaixo (válido por 10 minutos):</p>
      <p><a class="btn" href="${baseUrl}/reset-password?token=${token}">Redefinir senha</a></p>
      <p style="font-size:13px;color:#666">Se você não solicitou, ignore este e-mail.</p>`),
  }),

  accountLocked: (name: string) => ({
    subject: 'Conta bloqueada temporariamente',
    html: layout(`<h2>Olá, ${name}</h2>
      <p>Sua conta foi bloqueada temporariamente devido a múltiplas tentativas de login malsucedidas.</p>
      <p>Se não foi você, recomendamos redefinir sua senha imediatamente:</p>
      <p><a class="btn" href="${baseUrl}/forgot-password">Redefinir senha</a></p>
      <p style="font-size:13px;color:#666">A conta será desbloqueada automaticamente após o período de bloqueio.</p>`),
  }),

  invite: (inviterName: string, tenantName: string, token: string, role: string) => ({
    subject: `Convite para ${tenantName}`,
    html: layout(`<h2>Você foi convidado!</h2>
      <p><strong>${inviterName}</strong> convidou você para participar de <strong>${tenantName}</strong> como <strong>${role}</strong>.</p>
      <p><a class="btn" href="${baseUrl}/accept-invite?token=${token}">Aceitar convite</a></p>
      <p style="font-size:13px;color:#666">Este convite expira em 7 dias.</p>`),
  }),
};
