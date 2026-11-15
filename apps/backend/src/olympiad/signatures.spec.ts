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
const { checkoutSignatureValid, createOrder, webhookSignatureValid } =
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

describe('Razorpay orders', () => {
  const answer = (status: number, body: unknown) =>
    vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify(body), { status }));
  const statusOf = (p: Promise<unknown>) =>
    p.then(
      () => 200,
      (err: { getStatus?: () => number }) => err.getStatus?.(),
    );
  afterEach(() => vi.restoreAllMocks());

  it('refuses an amount under 100 paise without calling Razorpay', async () => {
    const fetch = answer(200, { id: 'order_1' });
    expect(await statusOf(createOrder(99, 'r', {}))).toBe(400);
    expect(await statusOf(createOrder(150.5, 'r', {}))).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('creates an INR order with the amount in paise', async () => {
    const fetch = answer(200, {
      id: 'order_1',
      amount: 50000,
      currency: 'INR',
    });
    expect((await createOrder(50000, 'form-1', {})).id).toBe('order_1');
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe('https://api.razorpay.com/v1/orders');
    expect(JSON.parse(init?.body as string)).toMatchObject({
      amount: 50000,
      currency: 'INR',
      receipt: 'form-1',
    });
  });

  it('answers 401 when Razorpay rejects the keys and 500 for other failures', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    answer(401, { error: { description: 'Authentication failed' } });
    expect(await statusOf(createOrder(100, 'r', {}))).toBe(401);
    answer(400, { error: { description: 'Bad request' } });
    expect(await statusOf(createOrder(100, 'r', {}))).toBe(500);
  });
});
