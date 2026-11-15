process.env.OLYMPIAD_TOKEN_SECRET ??= 'test-token-secret';
process.env.BACKEND_API_KEY ??= 'test-api-key';
process.env.SITE_URL ??= 'http://localhost:3000';
process.env.DATABASE_URL ??= 'mongodb://localhost/test';

const { hasRegId, receiptToken } = await import('./registration-ids.js');
const { readToken } = await import('./tokens.js');

describe('Registration IDs', () => {
  it('counts only AO2- numbers as a Registration ID', () => {
    expect(hasRegId({ regId: 'AO2-A-000123' })).toBe(true);
    expect(hasRegId({ regId: 'AO2-0-000001' })).toBe(true);
    expect(hasRegId({ regId: 'REM-501' })).toBe(false);
    expect(hasRegId({ regId: 'INV-1001' })).toBe(false);
    expect(hasRegId({})).toBe(false);
    expect(hasRegId(null)).toBe(false);
  });

  it("makes a receipt link that opens only that person's receipt", () => {
    const token = receiptToken({ _id: 'abc123' });
    expect(readToken(token, 'receipt')?.id).toBe('abc123');
    expect(readToken(token, 'pay')).toBeNull();
  });
});
