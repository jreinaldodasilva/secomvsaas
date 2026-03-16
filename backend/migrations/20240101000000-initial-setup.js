/**
 * Migration: initial-schema-indexes
 *
 * Creates all indexes for the initial Secom schema.
 * Collections: users, tenants, refreshtokens, auditlegs, invitetokens,
 *              webhooksubscriptions, pressreleases, mediacontacts, clippings,
 *              events, appointments, citizenportals, socialmedia
 *
 * Run:  npm run migrate:up
 * Roll: npm run migrate:down
 */

/** @param {import('mongodb').Db} db */
async function up(db) {
  // ── users ────────────────────────────────────────────────────────────────
  await db.collection('users').createIndexes([
    { key: { email: 1 }, unique: true, name: 'users_email_unique' },
    { key: { tenantId: 1, email: 1 }, name: 'users_tenantId_email' },
    { key: { tenantId: 1, role: 1 }, name: 'users_tenantId_role' },
  ]);

  // ── tenants ──────────────────────────────────────────────────────────────
  await db.collection('tenants').createIndexes([
    { key: { slug: 1 }, unique: true, name: 'tenants_slug_unique' },
    { key: { owner: 1 }, name: 'tenants_owner' },
    { key: { status: 1, createdAt: -1 }, name: 'tenants_status_createdAt' },
  ]);

  // ── refreshtokens ────────────────────────────────────────────────────────
  await db.collection('refreshtokens').createIndexes([
    { key: { token: 1 }, unique: true, name: 'refreshtokens_token_unique' },
    { key: { userId: 1, isRevoked: 1 }, name: 'refreshtokens_userId_isRevoked' },
    { key: { expiresAt: 1 }, expireAfterSeconds: 0, name: 'refreshtokens_ttl' },
  ]);

  // ── auditlogs ────────────────────────────────────────────────────────────
  const auditTtlDays = parseInt(process.env.AUDIT_LOG_TTL_DAYS || '90', 10);
  await db.collection('auditlogs').createIndexes([
    { key: { tenantId: 1, createdAt: -1 }, name: 'auditlogs_tenantId_createdAt' },
    { key: { user: 1, createdAt: -1 }, name: 'auditlogs_user_createdAt' },
    { key: { action: 1, createdAt: -1 }, name: 'auditlogs_action_createdAt' },
    { key: { createdAt: -1 }, name: 'auditlogs_createdAt' },
    { key: { createdAt: 1 }, expireAfterSeconds: auditTtlDays * 86400, name: 'auditlogs_ttl' },
  ]);

  // ── invitetokens ─────────────────────────────────────────────────────────
  await db.collection('invitetokens').createIndexes([
    { key: { token: 1 }, unique: true, name: 'invitetokens_token_unique' },
    { key: { tenantId: 1, email: 1 }, name: 'invitetokens_tenantId_email' },
    { key: { expiresAt: 1 }, expireAfterSeconds: 0, name: 'invitetokens_ttl' },
  ]);

  // ── webhooksubscriptions ─────────────────────────────────────────────────
  await db.collection('webhooksubscriptions').createIndexes([
    { key: { tenantId: 1, isActive: 1 }, name: 'webhooksubscriptions_tenantId_isActive' },
  ]);

  // ── pressreleases ────────────────────────────────────────────────────────
  await db.collection('pressreleases').createIndexes([
    { key: { tenantId: 1, createdAt: -1 }, name: 'pressreleases_tenantId_createdAt' },
    { key: { tenantId: 1, status: 1 }, name: 'pressreleases_tenantId_status' },
    { key: { tenantId: 1, category: 1 }, name: 'pressreleases_tenantId_category' },
  ]);

  // ── mediacontacts ────────────────────────────────────────────────────────
  await db.collection('mediacontacts').createIndexes([
    { key: { tenantId: 1, createdAt: -1 }, name: 'mediacontacts_tenantId_createdAt' },
    { key: { tenantId: 1, status: 1 }, name: 'mediacontacts_tenantId_status' },
    { key: { tenantId: 1, outlet: 1 }, name: 'mediacontacts_tenantId_outlet' },
  ]);

  // ── clippings ────────────────────────────────────────────────────────────
  await db.collection('clippings').createIndexes([
    { key: { tenantId: 1, createdAt: -1 }, name: 'clippings_tenantId_createdAt' },
    { key: { tenantId: 1, publishedAt: -1 }, name: 'clippings_tenantId_publishedAt' },
    { key: { tenantId: 1, sentiment: 1 }, name: 'clippings_tenantId_sentiment' },
  ]);

  // ── events ───────────────────────────────────────────────────────────────
  await db.collection('events').createIndexes([
    { key: { tenantId: 1, createdAt: -1 }, name: 'events_tenantId_createdAt' },
    { key: { tenantId: 1, startsAt: 1 }, name: 'events_tenantId_startsAt' },
    { key: { tenantId: 1, status: 1 }, name: 'events_tenantId_status' },
  ]);

  // ── appointments ─────────────────────────────────────────────────────────
  await db.collection('appointments').createIndexes([
    { key: { tenantId: 1, createdAt: -1 }, name: 'appointments_tenantId_createdAt' },
    { key: { tenantId: 1, scheduledAt: 1 }, name: 'appointments_tenantId_scheduledAt' },
    { key: { tenantId: 1, status: 1 }, name: 'appointments_tenantId_status' },
  ]);

  // ── citizenportals ───────────────────────────────────────────────────────
  await db.collection('citizenportals').createIndexes([
    { key: { tenantId: 1, userId: 1 }, unique: true, name: 'citizenportals_tenantId_userId_unique' },
    { key: { tenantId: 1, cpf: 1 }, name: 'citizenportals_tenantId_cpf' },
    { key: { tenantId: 1, createdAt: -1 }, name: 'citizenportals_tenantId_createdAt' },
  ]);

  // ── socialmedia ──────────────────────────────────────────────────────────
  await db.collection('socialmedia').createIndexes([
    { key: { tenantId: 1, createdAt: -1 }, name: 'socialmedia_tenantId_createdAt' },
    { key: { tenantId: 1, platform: 1, status: 1 }, name: 'socialmedia_tenantId_platform_status' },
    { key: { tenantId: 1, scheduledAt: 1 }, name: 'socialmedia_tenantId_scheduledAt' },
  ]);
}

/** @param {import('mongodb').Db} db */
async function down(db) {
  const drops = [
    ['users', ['users_email_unique', 'users_tenantId_email', 'users_tenantId_role']],
    ['tenants', ['tenants_slug_unique', 'tenants_owner', 'tenants_status_createdAt']],
    ['refreshtokens', ['refreshtokens_token_unique', 'refreshtokens_userId_isRevoked', 'refreshtokens_ttl']],
    ['auditlogs', ['auditlogs_tenantId_createdAt', 'auditlogs_user_createdAt', 'auditlogs_action_createdAt', 'auditlogs_createdAt', 'auditlogs_ttl']],
    ['invitetokens', ['invitetokens_token_unique', 'invitetokens_tenantId_email', 'invitetokens_ttl']],
    ['webhooksubscriptions', ['webhooksubscriptions_tenantId_isActive']],
    ['pressreleases', ['pressreleases_tenantId_createdAt', 'pressreleases_tenantId_status', 'pressreleases_tenantId_category']],
    ['mediacontacts', ['mediacontacts_tenantId_createdAt', 'mediacontacts_tenantId_status', 'mediacontacts_tenantId_outlet']],
    ['clippings', ['clippings_tenantId_createdAt', 'clippings_tenantId_publishedAt', 'clippings_tenantId_sentiment']],
    ['events', ['events_tenantId_createdAt', 'events_tenantId_startsAt', 'events_tenantId_status']],
    ['appointments', ['appointments_tenantId_createdAt', 'appointments_tenantId_scheduledAt', 'appointments_tenantId_status']],
    ['citizenportals', ['citizenportals_tenantId_userId_unique', 'citizenportals_tenantId_cpf', 'citizenportals_tenantId_createdAt']],
    ['socialmedia', ['socialmedia_tenantId_createdAt', 'socialmedia_tenantId_platform_status', 'socialmedia_tenantId_scheduledAt']],
  ];

  for (const [collection, indexes] of drops) {
    for (const name of indexes) {
      await db.collection(collection).dropIndex(name).catch(() => {
        // ignore if index does not exist
      });
    }
  }
}

module.exports = { up, down };
