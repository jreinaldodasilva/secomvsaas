/**
 * Secrets Loader
 *
 * Single access point for all application secrets. Abstracts the secrets
 * source so the rest of the application never reads secrets directly from
 * `env` or `process.env`.
 *
 * Supported backends (configured via SECRETS_BACKEND env var):
 *
 *   'env'          — secrets are read from validated env object (default).
 *                    Suitable for development and CI. Not recommended for
 *                    production because there is no rotation mechanism.
 *
 *   'aws-ssm'      — secrets are injected into the process environment by
 *                    the deployment pipeline (e.g. AWS ECS task definition
 *                    referencing SSM Parameter Store). No code change needed;
 *                    the 'env' loader handles them transparently once injected.
 *                    Set SECRETS_BACKEND=aws-ssm to suppress the production
 *                    warning without changing the loading mechanism.
 *
 * NOT YET IMPLEMENTED:
 *   'aws-secrets'  — AWS Secrets Manager integration is not available.
 *                    @aws-sdk/client-secrets-manager is not installed.
 *                    This value is not accepted by the Zod schema.
 *                    See secretsLoader.ts for the commented integration guide.
 *
 * Rotation:
 *   See docs/operations/SECRETS_ROTATION_RUNBOOK.md
 */

import { env } from '../env';
import logger from '../logger';

export interface AppSecrets {
  jwtSecret: string;
  jwtRefreshSecret: string;
  portalJwtSecret: string;
  csrfSecret: string;
  sendgridApiKey?: string;
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
}

/**
 * Load secrets from the configured backend.
 *
 * Called once at startup by server.ts and worker.ts before the application
 * begins serving requests. Returns a frozen secrets object.
 *
 * For 'aws-secrets' backend: install @aws-sdk/client-secrets-manager and
 * uncomment the implementation block below, then remove the thrown error.
 */
export async function loadSecrets(): Promise<AppSecrets> {
  const backend = env.secretsBackend;

  // 'env' and 'aws-ssm' both read from the validated env object.
  // To implement 'aws-secrets' (AWS Secrets Manager), install
  // @aws-sdk/client-secrets-manager, add 'aws-secrets' back to the
  // SECRETS_BACKEND enum in env.ts, and implement the fetch logic here.
  // See docs/operations/SECRETS_ROTATION_RUNBOOK.md for the rotation guide.
  // For 'aws-ssm', the deployment pipeline injects secrets as environment
  // variables before the process starts — no difference at the code level.
  if (backend === 'env') {
    logger.debug({ backend }, 'Secrets loaded from environment variables');
  } else {
    logger.info({ backend }, 'Secrets loaded (injected by deployment pipeline)');
  }

  return Object.freeze({
    jwtSecret: env.jwt.secret,
    jwtRefreshSecret: env.jwt.refreshSecret,
    portalJwtSecret: env.jwt.portalSecret,
    csrfSecret: env.csrf.secret,
    sendgridApiKey: env.email.sendgridApiKey,
    awsAccessKeyId: env.aws.accessKeyId || undefined,
    awsSecretAccessKey: env.aws.secretAccessKey || undefined,
  });
}
