import { createHmac } from 'node:crypto';

/** Local development reads apps/backend/.env; on Vercel the variables come from the project settings. */
try {
  process.loadEnvFile();
} catch {
  // No .env file: the environment is already set.
}

export function requireEnv(name: string) {
  const value = process.env[name];
  if (!value)
    throw new Error(`Missing required env var ${name} (see .env.example)`);
  return value;
}

const optional = (name: string) => process.env[name] || undefined;

/**
 * Same rules as the website's Payload config, so both apps reach the same database: a full
 * DATABASE_URL wins; MONGODB_HOSTS avoids the DNS SRV lookup that fails on some Windows networks.
 */
function databaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const auth = `${encodeURIComponent(requireEnv('MONGODB_USER'))}:${encodeURIComponent(requireEnv('MONGODB_PASSWORD'))}`;
  const options = 'retryWrites=true&w=majority&appName=Cluster0';
  if (process.env.MONGODB_HOSTS) {
    const replicaSet = requireEnv('MONGODB_REPLICA_SET');
    return `mongodb://${auth}@${process.env.MONGODB_HOSTS}/?tls=true&authSource=admin&replicaSet=${replicaSet}&${options}`;
  }
  return `mongodb+srv://${auth}@${requireEnv('MONGODB_HOST')}/?${options}`;
}

/** A secret for one purpose, derived from OLYMPIAD_TOKEN_SECRET so one key never serves two jobs. */
const derive = (purpose: string) =>
  createHmac('sha256', requireEnv('OLYMPIAD_TOKEN_SECRET'))
    .update(purpose)
    .digest('hex');

export const config = {
  port: Number(process.env.PORT ?? 4000),
  database: { url: databaseUrl(), name: process.env.MONGODB_DB || 'cnacamp' },
  /** Shared with the website's server; every non-webhook endpoint requires it. */
  apiKey: requireEnv('BACKEND_API_KEY'),
  /** The public website, for links in messages (unsubscribe, consent, dashboards). */
  siteUrl: requireEnv('SITE_URL').replace(/\/+$/, ''),
  tokenSecret: derive('olympiad-tokens'),
  ipHashSecret: derive('olympiad-ip-hash'),
  turnstileSecret: optional('TURNSTILE_SECRET_KEY'),
  smtp: process.env.SMTP_HOST
    ? {
        host: requireEnv('SMTP_HOST'),
        port: Number(process.env.SMTP_PORT || 587),
        user: requireEnv('SMTP_USER'),
        pass: requireEnv('SMTP_PASS'),
        from: requireEnv('EMAIL_FROM_ADDRESS'),
        fromName: process.env.EMAIL_FROM_NAME || 'CNA Camp',
      }
    : null,
  whatsapp: {
    token: optional('WHATSAPP_ACCESS_TOKEN'),
    phoneNumberId: optional('WHATSAPP_PHONE_NUMBER_ID'),
    appSecret: optional('WHATSAPP_APP_SECRET'),
    verifyToken: optional('WHATSAPP_VERIFY_TOKEN'),
  },
  razorpay: {
    keyId: optional('RAZORPAY_KEY_ID'),
    keySecret: optional('RAZORPAY_KEY_SECRET'),
    webhookSecret: optional('RAZORPAY_WEBHOOK_SECRET'),
  },
};
