import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { config } from '../../config.js';
import { FormError, text } from '../../common/forms.js';
import { hmacHex, ipHash, safeEqual } from '../../common/security.js';
import { MODELS, type PersonDoc } from '../schemas.js';
import { readToken } from '../tokens.js';

/** Words that stop Olympiad WhatsApp messages, as Meta's opt-out guidance expects. */
const STOP_WORDS = new Set(['stop', 'unsubscribe', 'stop all', 'cancel']);

const STATUS_RANK = { sent: 1, delivered: 2, read: 3, failed: 4 } as const;
type DeliveryStatus = keyof typeof STATUS_RANK;

interface WhatsAppWebhook {
  entry?: {
    changes?: {
      value?: {
        statuses?: { id: string; status: string }[];
        messages?: {
          from: string;
          type: string;
          text?: { body?: string };
          button?: { text?: string };
        }[];
      };
    }[];
  }[];
}

/** Links people open from a message (unsubscribe, parent consent) and replies coming back from WhatsApp. */
@Injectable()
export class LinksService {
  constructor(
    @InjectModel(MODELS.person) private readonly people: Model<PersonDoc>,
  ) {}

  private async personFor(token: unknown, purpose: 'unsubscribe' | 'consent') {
    const ref = readToken(text(token, 512), purpose);
    const person = ref
      ? await this.people
          .findById(ref.id)
          .select('name parentName emailStopped parentConsent')
          .lean<PersonDoc>()
      : null;
    if (!person) throw new FormError('This link is not valid any more.');
    return person;
  }

  /** What the confirm page shows before the person presses the button. */
  async preview(token: unknown, purpose: 'unsubscribe' | 'consent') {
    const person = await this.personFor(token, purpose);
    return purpose === 'consent'
      ? {
          name: person.name,
          parentName: person.parentName ?? null,
          done: Boolean(person.parentConsent?.at),
        }
      : { name: person.name, done: Boolean(person.emailStopped) };
  }

  /**
   * Acts only on a POST from the confirm page, never on opening the link: WhatsApp and mail apps open
   * links themselves to show previews, which must not unsubscribe anyone or give consent.
   */
  async unsubscribe(token: unknown) {
    const person = await this.personFor(token, 'unsubscribe');
    await this.people.updateOne(
      { _id: person._id },
      { $set: { emailStopped: true } },
    );
    return { done: true };
  }

  async giveParentConsent(token: unknown, ip: string | undefined) {
    const person = await this.personFor(token, 'consent');
    if (!person.parentConsent?.at) {
      await this.people.updateOne(
        { _id: person._id },
        {
          $set: {
            'parentConsent.at': new Date(),
            'meta.parentConsentIpHash': ipHash(ip),
          },
        },
      );
    }
    return { done: true, name: person.name };
  }

  /** Meta signs every webhook with the app secret (X-Hub-Signature-256: "sha256=<hex>"). */
  whatsappSignatureValid(
    rawBody: Buffer | undefined,
    header: string | undefined,
  ) {
    const secret = config.whatsapp.appSecret;
    if (!secret || !rawBody || !header?.startsWith('sha256=')) return false;
    return safeEqual(
      hmacHex(secret, rawBody.toString('utf8')),
      header.slice(7),
    );
  }

  /** Delivery ticks update the person's last message; a STOP reply stops Olympiad WhatsApp messages. */
  async whatsappEvent(body: WhatsAppWebhook) {
    for (const change of body.entry?.flatMap((e) => e.changes ?? []) ?? []) {
      for (const s of change.value?.statuses ?? []) {
        if (!(s.status in STATUS_RANK)) continue;
        const status = s.status as DeliveryStatus;
        // Ticks can arrive out of order; never move "read" back to "delivered".
        const lower = (Object.keys(STATUS_RANK) as DeliveryStatus[]).filter(
          (k) => STATUS_RANK[k] < STATUS_RANK[status],
        );
        await this.people.updateMany(
          {
            'lastMessage.providerId': s.id,
            'lastMessage.status': { $in: [...lower, 'queued', null] },
          },
          { $set: { 'lastMessage.status': status } },
        );
      }
      for (const m of change.value?.messages ?? []) {
        const said = (m.text?.body ?? m.button?.text ?? '')
          .trim()
          .toLowerCase();
        if (STOP_WORDS.has(said))
          await this.people.updateMany(
            { whatsapp: `+${m.from}` },
            { $set: { whatsappStopped: true } },
          );
      }
    }
  }
}
