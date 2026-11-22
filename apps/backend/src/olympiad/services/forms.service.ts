import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import {
  background,
  FormError,
  longText,
  text,
  throwIfErrors,
  tooMany,
  type FieldErrors,
} from '../../common/forms.js';
import { ipHash, passesTurnstile, since } from '../../common/security.js';
import {
  AMBASSADOR_ROLES,
  EDITION,
  EMAIL,
  formatMobile,
  INSTITUTION_TYPES,
  isDistrict,
  normalizeMobile,
  PERSON_NAME,
} from '../rules.js';
import {
  MODELS,
  type AmbassadorDoc,
  type PartnerRequestDoc,
  type PersonDoc,
  type SchoolDoc,
} from '../schemas.js';
import { CountersService } from './counters.service.js';
import { NotifyService } from './notify.service.js';
import { SettingsService } from './settings.service.js';

/** What the website forwards from a public form, plus the anti-spam fields. */
export interface FormInput {
  /** Hidden field only bots fill in. */
  website?: unknown;
  turnstileToken?: unknown;
}

export interface ReminderInput extends FormInput {
  name?: unknown;
  whatsapp?: unknown;
  email?: unknown;
  interest?: unknown;
  consent?: unknown;
}

export interface PartnerRequestInput extends FormInput {
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  kind?: unknown;
  message?: unknown;
  sourcePath?: unknown;
}

export interface SchoolSignupInput extends FormInput {
  /** The language of the sign-up page ("en" or "gu"); later messages use it. */
  lang?: unknown;
  name?: unknown;
  udise?: unknown;
  type?: unknown;
  district?: unknown;
  principal?: unknown;
  coordinatorName?: unknown;
  coordinatorWhatsapp?: unknown;
  email?: unknown;
  consent?: unknown;
}

export interface AmbassadorSignupInput extends FormInput {
  lang?: unknown;
  name?: unknown;
  whatsapp?: unknown;
  city?: unknown;
  role?: unknown;
  email?: unknown;
  consent?: unknown;
}

/** The answer to a sign-up: "waiting" while CNA checks it, "approved" if it already is. */
export type SignupResult = {
  firstName: string;
  status: 'waiting' | 'approved';
};

/** UDISE codes of Indian schools are 11 digits. */
const UDISE = /^\d{11}$/;

const INTERESTS = ['0', 'A', 'B', 'C', 'D', 'E', 'school', 'unsure'];
const KINDS = ['school', 'ambassador'] as const;

const nameError = (name: string) =>
  name.length < 2
    ? 'Please enter your name.'
    : PERSON_NAME.test(name)
      ? null
      : 'Please use letters only in your name.';

/** The public Olympiad forms: "Remind me" and the School / Ambassador sign-up. */
@Injectable()
export class FormsService {
  constructor(
    @InjectModel(MODELS.person) private readonly people: Model<PersonDoc>,
    @InjectModel(MODELS.partnerRequest)
    private readonly requests: Model<PartnerRequestDoc>,
    @InjectModel(MODELS.school) private readonly schools: Model<SchoolDoc>,
    @InjectModel(MODELS.ambassador)
    private readonly ambassadors: Model<AmbassadorDoc>,
    private readonly counters: CountersService,
    private readonly notify: NotifyService,
    private readonly settings: SettingsService,
  ) {}

  /**
   * The checks every public form runs before touching data: the honeypot, Cloudflare Turnstile and a
   * per-visitor rate limit on recent rows. Returns the visitor hash, or "bot" for a silent fake success.
   */
  private async guard(
    input: FormInput,
    ip: string | undefined,
    countRecent: (visitor: string, after: Date) => Promise<number>,
    limit: number,
    windowMs: number,
  ) {
    if (text(input.website)) return 'bot' as const;
    if (!(await passesTurnstile(text(input.turnstileToken, 2048), ip))) {
      throw new FormError('Please complete the security check and try again.');
    }
    const visitor = ipHash(ip);
    if (visitor) {
      if ((await countRecent(visitor, since(windowMs))) >= limit)
        throw tooMany(
          'You have sent this form several times in the last few minutes. Please wait a little.',
        );
    }
    return visitor;
  }

  /**
   * "Remind me on WhatsApp": one Reminder row per WhatsApp number in the master list. Asking again with
   * the same number updates the row and sends nothing twice.
   */
  async reminder(input: ReminderInput, ip: string | undefined) {
    const name = text(input.name, 80);
    const email = text(input.email, 120).toLowerCase();
    const interest = text(input.interest, 10);
    const whatsapp = normalizeMobile(text(input.whatsapp, 20));

    const errors: FieldErrors = {};
    const badName = nameError(name);
    if (badName) errors.name = badName;
    if (!whatsapp)
      errors.whatsapp =
        'Enter a 10 digit mobile number that starts with 6, 7, 8 or 9.';
    if (!EMAIL.test(email))
      errors.email = 'Enter an email like name@example.com.';
    if (interest && !INTERESTS.includes(interest))
      errors.interest = 'Please choose from the list.';
    if (input.consent !== true)
      errors.consent = 'Please tick the box so we can message you.';
    throwIfErrors(errors);

    const result = (already: boolean) => ({
      firstName: name.split(' ')[0],
      whatsapp: formatMobile(whatsapp!),
      email,
      already,
    });
    const visitor = await this.guard(
      input,
      ip,
      (hash, after) =>
        this.people
          .countDocuments({ 'meta.ipHash': hash, createdAt: { $gt: after } })
          .exec(),
      5,
      10 * 60 * 1000,
    );
    if (visitor === 'bot') return result(false);

    const existing = await this.people
      .findOne({ whatsapp, edition: EDITION })
      .lean<PersonDoc>();
    if (existing) {
      const changed =
        existing.name !== name ||
        existing.email !== email ||
        (interest && interest !== existing.interest);
      if (existing.type === 'reminder' && changed) {
        await this.people.updateOne(
          { _id: existing._id },
          { $set: { name, email, ...(interest ? { interest } : {}) } },
        );
      }
      return result(true);
    }

    const { consentVersion } = await this.settings.olympiad();
    const now = new Date();
    const person = await this.people.create({
      regId: await this.counters.reminderId(),
      type: 'reminder',
      edition: EDITION,
      name,
      whatsapp: whatsapp!,
      email,
      ...(interest ? { interest } : {}),
      whatsappStopped: false,
      emailStopped: false,
      feeCheck: false,
      source: 'direct',
      consent: { at: now, version: consentVersion },
      meta: { ipHash: visitor, consentIpHash: visitor },
    });
    background('reminder messages', () =>
      this.notify.reminder(person.toObject()),
    );
    return result(false);
  }

  /** "Register your school" / "Become an Ambassador": one short form, saved for the CNA team to follow up. */
  async partnerRequest(input: PartnerRequestInput, ip: string | undefined) {
    const name = text(input.name, 80);
    const email = text(input.email, 120).toLowerCase();
    const kind = KINDS.find((k) => k === text(input.kind, 20));
    const message = longText(input.message);
    const phone = normalizeMobile(text(input.phone, 20));

    const errors: FieldErrors = {};
    const badName = nameError(name);
    if (badName)
      errors.name =
        badName === 'Please enter your name.'
          ? 'Please enter your full name.'
          : badName;
    if (!phone)
      errors.phone =
        'Enter a 10 digit mobile number that starts with 6, 7, 8 or 9.';
    if (email && !EMAIL.test(email))
      errors.email = 'Enter an email like name@example.com, or leave it empty.';
    if (!kind) errors.kind = 'Please choose school or Ambassador.';
    throwIfErrors(errors);

    const result = { firstName: name.split(' ')[0], kind: kind! };
    const visitor = await this.guard(
      input,
      ip,
      (hash, after) =>
        this.requests
          .countDocuments({ 'meta.ipHash': hash, createdAt: { $gt: after } })
          .exec(),
      3,
      10 * 60 * 1000,
    );
    if (visitor === 'bot') return result;

    const fields = {
      name,
      ...(email ? { email } : {}),
      ...(message ? { message } : {}),
    };
    // The same person asking again for the same role updates their open request instead of adding a copy.
    const open = await this.requests.findOneAndUpdate(
      { phone, kind, status: { $in: ['new', 'contacted'] } },
      { $set: fields },
    );
    if (!open) {
      await this.requests.create({
        ...fields,
        kind: kind!,
        phone: phone!,
        status: 'new',
        meta: {
          sourcePath: text(input.sourcePath, 200) || '/olympiad',
          ipHash: visitor,
        },
      });
    }
    return result;
  }

  /**
   * "Register your school": saved under Olympiad → Schools as "Waiting for approval". The same UDISE
   * code signing up again adds nothing and changes nothing; the team is told of new details.
   */
  async schoolSignup(
    input: SchoolSignupInput,
    ip: string | undefined,
  ): Promise<SignupResult> {
    const v = {
      name: text(input.name, 120),
      udise: text(input.udise, 20).replace(/\s/g, ''),
      type: text(input.type, 20),
      district: text(input.district, 40),
      principal: text(input.principal, 80),
      coordinatorName: text(input.coordinatorName, 80),
      email: text(input.email, 120).toLowerCase(),
    };
    const whatsapp = normalizeMobile(text(input.coordinatorWhatsapp, 20));
    const errors: FieldErrors = {};
    if (v.name.length < 3) errors.name = 'Enter the school or college name.';
    if (!UDISE.test(v.udise)) errors.udise = 'Enter the 11 digit UDISE code.';
    if (!INSTITUTION_TYPES.some((t) => t.value === v.type))
      errors.type = 'Choose the type.';
    if (!isDistrict(v.district)) errors.district = 'Choose the district.';
    const badPrincipal = nameError(v.principal);
    if (badPrincipal) errors.principal = badPrincipal;
    const badCoordinator = nameError(v.coordinatorName);
    if (badCoordinator) errors.coordinatorName = badCoordinator;
    if (!whatsapp)
      errors.coordinatorWhatsapp =
        'Enter a 10 digit mobile number that starts with 6, 7, 8 or 9.';
    if (!EMAIL.test(v.email))
      errors.email = 'Enter an email like name@example.com.';
    if (input.consent !== true) errors.consent = 'Please tick to confirm.';
    throwIfErrors(errors);

    const result = (status: SignupResult['status']): SignupResult => ({
      firstName: v.coordinatorName.split(' ')[0],
      status,
    });
    const visitor = await this.guard(
      input,
      ip,
      (hash, after) =>
        this.schools
          .countDocuments({ 'meta.ipHash': hash, createdAt: { $gt: after } })
          .exec(),
      3,
      10 * 60 * 1000,
    );
    if (visitor === 'bot') return result('waiting');

    const same = await this.schools
      .findOne({ udise: v.udise })
      .lean<SchoolDoc>();
    if (same?.status === 'approved') return result('approved');
    if (same?.status === 'blocked')
      throw new FormError(
        'This school cannot sign up online. Please contact the CNA team.',
      );
    // The coordinator's email is their dashboard login, so it must belong to one school only.
    const clash = await this.schools
      .findOne({
        'coordinator.email': v.email,
        ...(same ? { _id: { $ne: same._id } } : {}),
      })
      .lean<SchoolDoc>();
    if (clash)
      throw new FormError('Please check the highlighted fields.', {
        email:
          'This email is already used by another school. Use a different one.',
      });

    const details = {
      name: v.name,
      udise: v.udise,
      type: v.type,
      district: v.district,
      principal: v.principal,
      coordinator: {
        name: v.coordinatorName,
        whatsapp: whatsapp!,
        email: v.email,
      },
    };
    const detail = `UDISE ${v.udise} · ${v.district} · Coordinator ${v.coordinatorName}, ${formatMobile(whatsapp!)}, ${v.email}`;
    // A school waiting for approval keeps the details it first gave: anyone can know a UDISE code, so a
    // second sign-up must not redirect the approval email. The team sees the new details and decides.
    if (same) {
      const changed =
        same.coordinator?.email !== v.email ||
        same.coordinator?.whatsapp !== whatsapp ||
        same.coordinator?.name !== v.coordinatorName;
      if (changed)
        background('school sign-up email', () =>
          this.notify.partnerSignup({
            kind: 'school',
            id: String(same._id),
            name: v.name,
            detail: `Signed up again with different details (not saved; confirm with the school before changing them): ${detail}`,
          }),
        );
      return result('waiting');
    }
    const school = (
      await this.schools.create({
        ...details,
        language: input.lang === 'gu' ? 'gu' : 'en',
        status: 'pending',
        meta: { consentAt: new Date(), ipHash: visitor },
        stats: { students: 0, paid: 0 },
      })
    ).toObject();
    background('school sign-up email', () =>
      this.notify.partnerSignup({
        kind: 'school',
        id: String(school._id),
        name: v.name,
        detail,
      }),
    );
    return result('waiting');
  }

  /**
   * "Become an Ambassador": saved under Olympiad → Ambassadors as "Waiting for approval". One entry
   * per WhatsApp number; signing up again changes nothing and tells the team of new details.
   */
  async ambassadorSignup(
    input: AmbassadorSignupInput,
    ip: string | undefined,
  ): Promise<SignupResult> {
    const v = {
      name: text(input.name, 80),
      city: text(input.city, 60),
      role: text(input.role, 20),
      email: text(input.email, 120).toLowerCase(),
    };
    const whatsapp = normalizeMobile(text(input.whatsapp, 20));
    const errors: FieldErrors = {};
    const badName = nameError(v.name);
    if (badName) errors.name = badName;
    if (!whatsapp)
      errors.whatsapp =
        'Enter a 10 digit mobile number that starts with 6, 7, 8 or 9.';
    if (v.city.length < 2) errors.city = 'Enter your city or village.';
    if (!AMBASSADOR_ROLES.some((r) => r.value === v.role))
      errors.role = 'Choose one.';
    if (!EMAIL.test(v.email))
      errors.email = 'Enter an email like name@example.com.';
    if (input.consent !== true) errors.consent = 'Please tick to confirm.';
    throwIfErrors(errors);

    const result = (status: SignupResult['status']): SignupResult => ({
      firstName: v.name.split(' ')[0],
      status,
    });
    const visitor = await this.guard(
      input,
      ip,
      (hash, after) =>
        this.ambassadors
          .countDocuments({ 'meta.ipHash': hash, createdAt: { $gt: after } })
          .exec(),
      3,
      10 * 60 * 1000,
    );
    if (visitor === 'bot') return result('waiting');

    const same = await this.ambassadors
      .findOne({ whatsapp })
      .lean<AmbassadorDoc>();
    if (same?.status === 'approved') return result('approved');
    if (same?.status === 'blocked')
      throw new FormError(
        'This number cannot sign up online. Please contact the CNA team.',
      );
    const clash = await this.ambassadors
      .findOne({
        email: v.email,
        ...(same ? { _id: { $ne: same._id } } : {}),
      })
      .lean<AmbassadorDoc>();
    if (clash)
      throw new FormError('Please check the highlighted fields.', {
        email:
          'This email is already used by another Ambassador. Use a different one.',
      });

    const details = {
      name: v.name,
      email: v.email,
      city: v.city,
      role: v.role,
    };
    const detail = `${AMBASSADOR_ROLES.find((r) => r.value === v.role)?.label ?? v.role} · ${v.city} · ${formatMobile(whatsapp!)}, ${v.email}`;
    // Someone waiting for approval keeps the email they first gave, so a second sign-up with their
    // WhatsApp number can't redirect the approval email. The team sees the new details and decides.
    if (same) {
      if (same.email !== v.email || same.name !== v.name)
        background('ambassador sign-up email', () =>
          this.notify.partnerSignup({
            kind: 'ambassador',
            id: String(same._id),
            name: v.name,
            detail: `Signed up again with different details (not saved; confirm with them before changing): ${detail}`,
          }),
        );
      return result('waiting');
    }
    const ambassador = (
      await this.ambassadors.create({
        ...details,
        whatsapp: whatsapp!,
        language: input.lang === 'gu' ? 'gu' : 'en',
        status: 'pending',
        meta: { consentAt: new Date(), ipHash: visitor },
        stats: { clicks: 0, registered: 0, paid: 0 },
      })
    ).toObject();
    background('ambassador sign-up email', () =>
      this.notify.partnerSignup({
        kind: 'ambassador',
        id: String(ambassador._id),
        name: v.name,
        detail,
      }),
    );
    return result('waiting');
  }
}
