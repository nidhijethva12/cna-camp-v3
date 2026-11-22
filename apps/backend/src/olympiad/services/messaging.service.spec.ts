// Test values only: set before the config module reads the environment.
Object.assign(process.env, {
  OLYMPIAD_TOKEN_SECRET: 'test-token-secret',
  BACKEND_API_KEY: 'test-api-key',
  SITE_URL: 'http://localhost:3000',
  DATABASE_URL: 'mongodb://localhost/test',
  WHATSAPP_ACCESS_TOKEN: 'test-whatsapp-token',
  WHATSAPP_PHONE_NUMBER_ID: '1234567890',
});

const { MessagingService } = await import('./messaging.service.js');

type Sent = {
  to: string;
  template: { name: string; language: { code: string }; components: unknown[] };
};

/** Stands in for Meta: answers each request in turn and keeps what was sent. */
function meta(...answers: { ok: boolean; body: object }[]) {
  const sent: Sent[] = [];
  const fetchMock = vi.fn(
    async (_url: string | URL | Request, init?: RequestInit) => {
      sent.push(JSON.parse(init?.body as string) as Sent);
      const answer = answers[sent.length - 1] ?? answers[answers.length - 1];
      return new Response(JSON.stringify(answer.body), {
        status: answer.ok ? 200 : 400,
      });
    },
  );
  vi.stubGlobal('fetch', fetchMock);
  return { sent, fetchMock };
}

const accepted = { ok: true, body: { messages: [{ id: 'wamid.TEST' }] } };
const missing = {
  ok: false,
  body: {
    error: { message: 'Template name does not exist in the translation' },
  },
};

describe('WhatsApp template messages', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('sends the body values and the link button of a template', async () => {
    const { sent, fetchMock } = meta(accepted);
    const result = await new MessagingService().whatsapp({
      to: '+919825012345',
      template: 'olympiad_registration_confirmed',
      params: ['Riya', 'AO2-A-000123', 'A', '230'],
      buttonParam: 'receipt-token',
    });

    expect(result).toEqual({ status: 'sent', providerId: 'wamid.TEST' });
    expect(fetchMock.mock.calls[0][0] as string).toContain(
      '/1234567890/messages',
    );
    expect(sent[0].to).toBe('919825012345');
    expect(sent[0].template).toEqual({
      name: 'olympiad_registration_confirmed',
      language: { code: 'en' },
      components: [
        {
          type: 'body',
          parameters: ['Riya', 'AO2-A-000123', 'A', '230'].map((text) => ({
            type: 'text',
            text,
          })),
        },
        {
          type: 'button',
          sub_type: 'url',
          index: '0',
          parameters: [{ type: 'text', text: 'receipt-token' }],
        },
      ],
    });
  });

  it('sends the Gujarati copy when asked', async () => {
    const { sent } = meta(accepted);
    await new MessagingService().whatsapp({
      to: '+919825012345',
      template: 't',
      params: ['x'],
      language: 'gu',
    });

    expect(sent).toHaveLength(1);
    expect(sent[0].template.language.code).toBe('gu');
  });

  it('falls back to English when the Gujarati copy is not available', async () => {
    const { sent } = meta(missing, accepted);
    const result = await new MessagingService().whatsapp({
      to: '+919825012345',
      template: 't',
      params: ['x'],
      language: 'gu',
    });

    expect(sent.map((m) => m.template.language.code)).toEqual(['gu', 'en']);
    expect(result.status).toBe('sent');
  });

  it('reports a failed English message without trying again', async () => {
    const { sent } = meta(missing);
    const result = await new MessagingService().whatsapp({
      to: '+919825012345',
      template: 't',
      params: ['x'],
    });

    expect(sent).toHaveLength(1);
    expect(result).toEqual({
      status: 'failed',
      error: 'Template name does not exist in the translation',
    });
  });
});
