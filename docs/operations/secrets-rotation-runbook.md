# Secrets Rotation Runbook — Secom Backend

> Scope: All application secrets managed by the Secom backend.
> Last updated: P1-4 implementation.
> Related code: `backend/src/config/secrets/secretsLoader.ts`

---

## 1. Secret Inventory

| Secret | Env Var | Minimum Length | Rotation Frequency | Impact of Compromise |
|--------|---------|----------------|--------------------|----------------------|
| JWT access token signing key | `JWT_SECRET` | 64 chars | 90 days | All active sessions can be forged |
| JWT refresh token signing key | `JWT_REFRESH_SECRET` | 64 chars | 90 days | Refresh tokens can be forged; persistent sessions compromised |
| Portal (citizen) JWT signing key | `PORTAL_JWT_SECRET` | 64 chars | 90 days | Citizen portal sessions can be forged |
| CSRF protection secret | `CSRF_SECRET` | 32 chars | 90 days | CSRF protection bypassed on all state-changing routes |
| SendGrid API key | `SENDGRID_API_KEY` | — | On compromise | Unauthorised email sending; billing exposure |
| AWS access key | `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` | — | 90 days | S3 bucket access; potential data exfiltration |
| MongoDB connection string | `DATABASE_URL` | — | On compromise | Full database access |
| Default admin password | `DEFAULT_ADMIN_PASSWORD` | 12 chars | After first login | Admin account takeover |

---

## 2. Current Backend Configuration

Controlled by `SECRETS_BACKEND` in `.env`:

| Value | Description | Recommended For |
|-------|-------------|-----------------|
| `env` | Secrets read from environment variables | Development, CI |
| `aws-ssm` | Secrets injected by deployment pipeline from AWS SSM Parameter Store | Staging, Production |
| `aws-secrets` | Secrets fetched from AWS Secrets Manager at startup | Production (high-security) |

**Production requirement:** `SECRETS_BACKEND` must be set to `aws-ssm` or `aws-secrets`. The application emits a `WARN` log on startup if `SECRETS_BACKEND=env` in production.

---

## 3. JWT / CSRF Secret Rotation Procedure

### 3.1 Zero-Downtime Rotation (Recommended)

JWT rotation invalidates all active access tokens. To minimise user disruption:

1. **Generate new secrets:**
   ```bash
   openssl rand -hex 32   # new JWT_SECRET (64 hex chars)
   openssl rand -hex 32   # new JWT_REFRESH_SECRET
   openssl rand -hex 32   # new PORTAL_JWT_SECRET
   openssl rand -hex 16   # new CSRF_SECRET (32 hex chars)
   ```

2. **Deploy with dual-secret support** *(optional, for zero-downtime):*
   - Add `JWT_SECRET_PREVIOUS` alongside `JWT_SECRET`
   - Modify `authService.verifyAccessToken()` to try the new secret first, then fall back to the previous secret
   - This allows tokens signed with the old secret to remain valid during the rollout window (typically 15 minutes — one access token TTL)

3. **Update the secret store:**
   - **AWS SSM:** `aws ssm put-parameter --name /secom/prod/JWT_SECRET --value <new> --overwrite`
   - **AWS Secrets Manager:** `aws secretsmanager update-secret --secret-id secom/prod/jwt --secret-string '{"JWT_SECRET":"<new>"}'`
   - **`.env` (dev only):** Replace the value directly

4. **Redeploy the application.** New tokens will be signed with the new secret.

5. **After one access token TTL (15 minutes):** remove `JWT_SECRET_PREVIOUS` from the secret store and redeploy.

### 3.2 Immediate Rotation (Incident Response)

If a secret is suspected compromised:

1. Generate new secrets (step 1 above)
2. Update the secret store immediately
3. Redeploy all running instances
4. **Invalidate all refresh tokens:** run the following against MongoDB:
   ```javascript
   db.refreshtokens.updateMany({}, { $set: { isRevoked: true } });
   ```
5. All users will be logged out and must re-authenticate with the new secrets in place

---

## 4. SendGrid API Key Rotation

1. Log in to SendGrid → Settings → API Keys
2. Create a new API key with the same permissions as the current one
3. Update `SENDGRID_API_KEY` in the secret store
4. Redeploy the application
5. Verify email delivery is working (send a test password-reset email)
6. Delete the old API key from SendGrid

---

## 5. AWS Credentials Rotation

Use IAM roles instead of long-lived access keys wherever possible (EC2 instance profiles, ECS task roles, Lambda execution roles). If long-lived keys are unavoidable:

1. Create a new access key for the IAM user: `aws iam create-access-key --user-name secom-app`
2. Update `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in the secret store
3. Redeploy the application
4. Verify S3 operations are working
5. Delete the old access key: `aws iam delete-access-key --user-name secom-app --access-key-id <old>`

---

## 6. AWS Secrets Manager Integration Guide

To activate `SECRETS_BACKEND=aws-secrets`:

### 6.1 Prerequisites

```bash
cd backend
npm install @aws-sdk/client-secrets-manager
```

### 6.2 Create secrets in AWS

```bash
# Create each secret (run once per environment)
aws secretsmanager create-secret \
  --name secom/prod/jwt \
  --secret-string "{\"JWT_SECRET\":\"$(openssl rand -hex 32)\",\"JWT_REFRESH_SECRET\":\"$(openssl rand -hex 32)\",\"PORTAL_JWT_SECRET\":\"$(openssl rand -hex 32)\"}"

aws secretsmanager create-secret \
  --name secom/prod/csrf \
  --secret-string "{\"CSRF_SECRET\":\"$(openssl rand -hex 16)\"}"
```

### 6.3 IAM policy

Attach this policy to the application's IAM role (ECS task role or EC2 instance profile):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "secretsmanager:GetSecretValue",
      "Resource": [
        "arn:aws:secretsmanager:<region>:<account>:secret:secom/prod/jwt*",
        "arn:aws:secretsmanager:<region>:<account>:secret:secom/prod/csrf*"
      ]
    }
  ]
}
```

### 6.4 Add ARN env vars

```env
SECRETS_BACKEND=aws-secrets
AWS_REGION=us-east-1
SECRET_ARN_JWT=arn:aws:secretsmanager:us-east-1:<account>:secret:secom/prod/jwt
SECRET_ARN_JWT_REFRESH=arn:aws:secretsmanager:us-east-1:<account>:secret:secom/prod/jwt
SECRET_ARN_PORTAL_JWT=arn:aws:secretsmanager:us-east-1:<account>:secret:secom/prod/jwt
SECRET_ARN_CSRF=arn:aws:secretsmanager:us-east-1:<account>:secret:secom/prod/csrf
```

### 6.5 Uncomment the implementation

In `backend/src/config/secrets/secretsLoader.ts`, uncomment the `aws-secrets` implementation block and remove the `throw new Error(...)` line.

### 6.6 Enable automatic rotation

```bash
aws secretsmanager rotate-secret \
  --secret-id secom/prod/jwt \
  --rotation-rules AutomaticallyAfterDays=90
```

Note: automatic rotation requires a Lambda rotation function. For JWT secrets, automatic rotation must be coordinated with a deployment (new secret → redeploy → old tokens expire). A custom rotation Lambda that triggers a deployment pipeline is the recommended approach.

---

## 7. Secret Compromise Response Checklist

- [ ] Identify which secret was compromised and when
- [ ] Rotate the compromised secret immediately (section 3.2 or 4 or 5)
- [ ] If JWT secrets: invalidate all refresh tokens in MongoDB
- [ ] If database credentials: rotate MongoDB user password and update `DATABASE_URL`
- [ ] Review audit logs for suspicious activity during the exposure window
- [ ] Notify affected users if their data may have been accessed
- [ ] Document the incident and update this runbook if the procedure was insufficient

---

## 8. Verification After Rotation

After any secret rotation and redeployment:

```bash
# Health check
curl https://api.secom.gov.br/api/v1/health

# Verify authentication works (should return 200 with a valid token)
curl -X POST https://api.secom.gov.br/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@secom.gov.br","password":"<password>"}'

# Verify CSRF token endpoint works
curl https://api.secom.gov.br/api/csrf-token
```
