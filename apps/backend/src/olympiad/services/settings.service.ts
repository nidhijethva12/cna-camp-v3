import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import {
  DEFAULT_FEES,
  type Fees,
  type GroupId,
  type QuizSlot,
} from '../rules.js';
import { MODELS } from '../schemas.js';

export interface OlympiadConfig {
  mode: 'auto' | 'open' | 'closed';
  opensAt: Date;
  closesAt: Date;
  feeLastDate: Date;
  fees: Fees;
  consentText: string;
  consentVersion: string;
  milestones: { paid: number; reward: string }[];
  quizSlots: QuizSlot[];
}

export interface Contact {
  phone: string;
  email: string;
}

type Raw = Record<string, unknown> & { globalType?: string };

const CACHE_MS = 60_000;

const FALLBACK = {
  opensAt: '2026-11-14T18:30:00.000Z',
  closesAt: '2026-12-14T18:29:00.000Z',
  feeLastDate: '2026-12-31T18:29:00.000Z',
  consentText:
    'I agree to get Olympiad updates from CNA on WhatsApp and email. I can stop them any time.',
  consentVersion: '2026-10',
  // The admin's defaults for Ambassador milestones, until CNA saves the settings.
  milestones: [
    { paid: 25, reward: 'Olympiad Ambassador certificate' },
    { paid: 50, reward: 'Name on the website Ambassadors list' },
    {
      paid: 100,
      reward: 'A free seat or escort seat on a camp (to be confirmed)',
    },
  ],
};

const istDate = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

/** "2026-11-14T18:30:00Z" → "15 Nov 2026", in India time. */
export const formatIstDate = (date: Date) => istDate.format(date);

/** Reads the Olympiad settings and the site's contact details that CNA edits in the admin. */
@Injectable()
export class SettingsService {
  private cache = new Map<string, { at: number; doc: Raw | null }>();

  constructor(
    @InjectModel(MODELS.global) private readonly globals: Model<Raw>,
  ) {}

  private async global(slug: string) {
    const hit = this.cache.get(slug);
    if (hit && Date.now() - hit.at < CACHE_MS) return hit.doc;
    const doc = await this.globals.findOne({ globalType: slug }).lean<Raw>();
    this.cache.set(slug, { at: Date.now(), doc });
    return doc;
  }

  async olympiad(): Promise<OlympiadConfig> {
    const doc = (await this.global('olympiad-settings')) ?? {};
    // Group 0's fee lives in the "G0" field (the admin can't name a field "0").
    const fees = (doc.fees ?? {}) as Record<
      string,
      { govt?: number | null; other?: number | null } | undefined
    >;
    const fee = (g: GroupId) => {
      const set = fees[g === '0' ? 'G0' : g];
      const other = set?.other ?? DEFAULT_FEES[g].other;
      return {
        govt: g === 'B' ? (set?.govt ?? DEFAULT_FEES.B.govt) : other,
        other,
      };
    };
    const date = (value: unknown, fallback: string) =>
      new Date((value as string | Date | undefined) ?? fallback);
    return {
      mode: (doc.registrationMode as OlympiadConfig['mode']) ?? 'auto',
      opensAt: date(doc.opensAt, FALLBACK.opensAt),
      closesAt: date(doc.closesAt, FALLBACK.closesAt),
      feeLastDate: date(doc.feeLastDate, FALLBACK.feeLastDate),
      fees: {
        '0': fee('0'),
        A: fee('A'),
        B: fee('B'),
        C: fee('C'),
        D: fee('D'),
        E: fee('E'),
      },
      consentText: (doc.consentText as string) || FALLBACK.consentText,
      consentVersion: (doc.consentVersion as string) || FALLBACK.consentVersion,
      milestones: (
        (doc.milestones as { paid: number; reward: string }[] | undefined) ??
        FALLBACK.milestones
      )
        .map(({ paid, reward }) => ({ paid, reward }))
        .sort((a, b) => a.paid - b.paid),
      quizSlots: (
        (doc.quizSlots as
          { date: string; times?: { time: string }[] }[] | undefined) ?? []
      )
        .map((s) => ({
          date: s.date,
          times: (s.times ?? []).map((t) => t.time),
        }))
        .filter((s) => s.times.length),
    };
  }

  async contact(): Promise<Contact> {
    const doc = (await this.global('site-settings')) ?? {};
    return {
      phone: (doc.phone as string) ?? '',
      email: (doc.email as string) ?? '',
    };
  }
}

export type RegistrationState = 'soon' | 'open' | 'closed';

/** Same rule as the website's page: CNA can open or close early; otherwise the dates decide. */
export function registrationState(
  config: OlympiadConfig,
  now = new Date(),
): RegistrationState {
  if (config.mode === 'open') return 'open';
  if (config.mode === 'closed')
    return config.opensAt.getTime() > now.getTime() ? 'soon' : 'closed';
  if (now.getTime() < config.opensAt.getTime()) return 'soon';
  return now.getTime() > config.closesAt.getTime() ? 'closed' : 'open';
}
