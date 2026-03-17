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
 *   'aws-secrets'  — secrets are fetched from AWS Secrets Manager at startup
 *                    using the AWS SDK. Requires:
 *                      1. @aws-sdk/client-secrets-manager installed
 *                      2. IAM role with secretsmanager:GetSecretValue on the
 *                         relevant secret ARNs
 *                      3. AWS_REGION set in the environment
 *                    See docs/operations/SECRETS_ROTATION_RUNBOOK.md for the
 *                    full integration guide.
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

  if (backend === 'aws-secrets') {
    /**
     * AWS Secrets Manager integration — uncomment when ready to implement:
     *
     * import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
     *
     * const client = new SecretsManagerClient({ region: env.aws.region });
     *
     * const getSecret = async (secretId: string): Promise<string> => {
     *   const cmd = new GetSecretValueCommand({ SecretId: secretId });
     *   const res = await client.send(cmd);
     *   if (!res.SecretString) throw new Error(`Secret ${secretId} has no string value`);
     *   return res.SecretString;
     * };
     *
     * const [jwtSecret, jwtRefreshSecret, portalJwtSecret, csrfSecret] = await Promise.all([
     *   getSecret(process.env.SECRET_ARN_JWT!),
     *   getSecret(process.env.SECRET_ARN_JWT_REFRESH!),
     *   getSecret(process.env.SECRET_ARN_PORTAL_JWT!),
     *   getSecret(process.env.SECRET_ARN_CSRF!),
     * ]);
     *
     * logger.info({ backend }, 'Secrets loaded from AWS Secrets Manager');
     * return Object.freeze({ jwtSecret, jwtRefreshSecret, portalJwtSecret, csrfSecret });
     */
    throw new Error(
      'SECRETS_BACKEND=aws-secrets is not yet implemented. ' +
      'See src/config/secrets/secretsLoader.ts for the integration guide, ' +
      'and docs/operations/SECRETS_ROTATION_RUNBOOK.md for the rotation procedure.'
    );
  }

  // 'env' and 'aws-ssm' both read from the validated env object.
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
