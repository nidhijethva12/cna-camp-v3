import { createHmac } from 'node:crypto';

// Test values only: set before the config module reads the environment.
Object.assign(process.env, {
  OLYMPIAD_TOKEN_SECRET: 'test-token-secret',
  BACKEND_API_KEY: 'test-api-key',
  SITE_URL: 'http://localhost:3000',
  DATABASE_URL: 'mongodb://localhost/test',
  RAZORPAY_KEY_ID: 'rzp_test_key',
  RAZORPAY_KEY_SECRET: 'test-key-secret',
  RAZORPAY_WEBHOOK_SECRET: 'test-webhook-secret',
});

const { createToken, readToken } = await import('./tokens.js');
const { checkoutSignatureValid, webhookSignatureValid } =
  await import('./razorpay.js');

const hmac = (secret: string, data: string) =>
  createHmac('sha256', secret).update(data).digest('hex');

describe('signed tokens', () => {
  it('reads back a valid token with its kind and version', () => {
    const token = createToken('session', 'abc', 60, 'school', '123');
    expect(readToken(token, 'session')).toEqual({
      id: 'abc',
      kind: 'school',
      version: '123',
    });
  });

  it('refuses a token made for another purpose', () => {
    expect(readToken(createToken('pay', 'abc', 60), 'session')).toBeNull();
  });

  it('refuses an expired token', () => {
    expect(readToken(createToken('session', 'abc', -1), 'session')).toBeNull();
  });

  it('refuses a token whose body was changed', () => {
    const [, sig] = createToken('session', 'abc', 60).split('.');
    const forged = Buffer.from(
      JSON.stringify({ p: 'session', id: 'someone-else', exp: 9e9 }),
    ).toString('base64url');
    expect(readToken(`${forged}.${sig}`, 'session')).toBeNull();
  });

  it('refuses empty, malformed and oversized input', () => {
    expect(readToken(undefined, 'session')).toBeNull();
    expect(readToken('no-dot', 'session')).toBeNull();
    expect(readToken('a'.repeat(600), 'session')).toBeNull();
  });
});

describe('Razorpay signatures', () => {
  it('accepts the checkout signature Razorpay computes and nothing else', () => {
    const good = hmac('test-key-secret', 'order_1|pay_1');
    expect(checkoutSignatureValid('order_1', 'pay_1', good)).toBe(true);
    expect(checkoutSignatureValid('order_2', 'pay_1', good)).toBe(false);
    expect(checkoutSignatureValid('order_1', 'pay_1', '')).toBe(false);
  });

  it('checks the webhook signature against the exact raw body', () => {
    const body = Buffer.from('{"event":"payment.captured"}');
    const good = hmac('test-webhook-secret', body.toString());
    expect(webhookSignatureValid(body, good)).toBe(true);
    expect(webhookSignatureValid(Buffer.from('{"event":"x"}'), good)).toBe(
      false,
    );
    expect(webhookSignatureValid(body, undefined)).toBe(false);
    expect(webhookSignatureValid(undefined, good)).toBe(false);
  });
});
