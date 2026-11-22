import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { passwordLinkFor } from '../partner-links.js';
import { MODELS, type AmbassadorDoc, type PersonDoc } from '../schemas.js';
import { CountersService } from './counters.service.js';
import { NotifyService } from './notify.service.js';

/** The Ambassador role that matches how the person registered. */
const roleOf = (person: PersonDoc) =>
  person.participant === 'teacher' ? 'teacher' : 'other';

/**
 * A participant of Group C, D or E who said "yes" to being an Ambassador gets their Ambassador
 * account as soon as their own registration is paid: approved, with a code, and the welcome message
 * with the link to choose a dashboard password.
 */
@Injectable()
export class AmbassadorEnrolService {
  private readonly log = new Logger('AmbassadorEnrol');

  constructor(
    @InjectModel(MODELS.ambassador)
    private readonly ambassadors: Model<AmbassadorDoc>,
    private readonly counters: CountersService,
    private readonly notify: NotifyService,
  ) {}

  /** Never throws: a problem here must not undo or delay the payment that triggered it. */
  async enrol(person: PersonDoc) {
    if (!person.wantsAmbassador) return;
    try {
      const ambassador = await this.accountFor(person);
      if (!ambassador?.code) return;
      await this.notify.partnerApproved({
        kind: 'ambassador',
        code: ambassador.code,
        name: ambassador.name,
        whatsapp: ambassador.whatsapp,
        email: ambassador.email,
        setPasswordUrl: ambassador.login?.passwordHash
          ? undefined
          : passwordLinkFor('ambassador', ambassador),
        language: ambassador.language,
      });
    } catch (err) {
      this.log.error(`making ${String(person._id)} an Ambassador failed`, err);
    }
  }

  /**
   * The newly approved account, or null when nothing new was made: the person is an Ambassador
   * already, was blocked by CNA, or their email is the login of another Ambassador.
   */
  private async accountFor(person: PersonDoc) {
    const existing = await this.ambassadors
      .findOne({ whatsapp: person.whatsapp })
      .lean<AmbassadorDoc>();
    if (existing?.status === 'approved' || existing?.status === 'blocked')
      return null;
    if (
      person.email &&
      (await this.ambassadors.exists({
        email: person.email,
        ...(existing ? { _id: { $ne: existing._id } } : {}),
      }))
    ) {
      this.log.warn(
        `${String(person._id)} asked to be an Ambassador, but their email is another Ambassador's login`,
      );
      return null;
    }
    const approval = {
      status: 'approved' as const,
      code: await this.counters.ambassadorCode(),
      approvedAt: new Date(),
    };
    // Someone who signed up earlier and was still waiting is approved with the details they gave then.
    if (existing)
      return this.ambassadors
        .findOneAndUpdate(
          { _id: existing._id, status: 'pending' },
          { $set: approval },
          { new: true },
        )
        .lean<AmbassadorDoc>();
    return (
      await this.ambassadors.create({
        ...approval,
        name: person.name,
        whatsapp: person.whatsapp,
        ...(person.email ? { email: person.email } : {}),
        ...(person.district ? { city: person.district } : {}),
        role: roleOf(person),
        // Their messages come in the language they registered in.
        ...(person.formLanguage ? { language: person.formLanguage } : {}),
        stats: { clicks: 0, registered: 0, paid: 0 },
        meta: { consentAt: person.registeredAt ?? new Date() },
      })
    ).toObject();
  }
}
