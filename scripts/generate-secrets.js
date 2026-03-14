#!/usr/bin/env node
const crypto = require('crypto');

const secrets = {
  JWT_SECRET: crypto.randomBytes(32).toString('hex'),
  JWT_REFRESH_SECRET: crypto.randomBytes(32).toString('hex'),
  PORTAL_JWT_SECRET: crypto.randomBytes(32).toString('hex'),
  CSRF_SECRET: crypto.randomBytes(16).toString('hex'),
};

console.log('\n# Generated secrets — paste into backend/.env\n');
for (const [key, value] of Object.entries(secrets)) {
  console.log(`${key}=${value}`);
}
console.log('');
