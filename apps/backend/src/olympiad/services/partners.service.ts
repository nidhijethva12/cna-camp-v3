import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types, type Model } from 'mongoose';
import { background, FormError, text, tooMany } from '../../common/forms.js';
import { ipHash } from '../../common/security.js';
import {
  DUMMY_HASH,
  hashPassword,
  passwordProblem,
  verifyPassword,
} from '../password.js';
import {
  AMBASSADOR_CODE,
  AMBASSADOR_ROLES,
  EDITION,
  EMAIL,
  isSchoolGroup,
  needsSchoolProof,
  normalizeCode,
  SCHOOL_CODE,
  stageOf,
} from '../rules.js';
import {
  MODELS,
  type AmbassadorDoc,
  type PersonDoc,
  type SchoolDoc,
} from '../schemas.js';
import { passwordLinkFor, passwordVersion } from '../partner-links.js';
import { hasRegId } from '../registration-ids.js';
import { createToken, readToken } from '../tokens.js';
import { CountersService } from './counters.service.js';
import {
  partnerLinkUrl,
  NotifyService,
  type ApprovedPartner,
} from './notify.service.js';
import { PaymentsService } from './payments.service.js';
import { SettingsService } from './settings.service.js';

export type PartnerKind = 'school' | 'ambassador';

export const SESSION_SECONDS = 8 * 60 * 60;
const LOCK = { maxAttempts: 5, ms: 15 * 60 * 1000 };
const WRONG =
  'That email and password don\'t match. Check them, or use "Forgot your password?" below.';

/** A new reset email goes out at most this often per partner, so the form can't be used to flood an inbox. */
const RESET_GAP_MS = 2 * 60 * 1000;
const loginEmail = (p: SchoolDoc | AmbassadorDoc) =>
  'coordinator' in p ? p.coordinator?.email : p.email;
const greetName = (p: SchoolDoc | AmbassadorDoc) =>
  'coordinator' in p ? p.coordinator?.name : p.name;

const indiaDay = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

/** Schools and Ambassadors: referral links, dashboard login, dashboard data and approval steps. */
@Injectable()
export class PartnersService {
  constructor(
    @InjectModel(MODELS.ambassador)
    private readonly ambassadors: Model<AmbassadorDoc>,
    @InjectModel(MODELS.school) private readonly schools: Model<SchoolDoc>,
    @InjectModel(MODELS.person) private readonly people: Model<PersonDoc>,
    @InjectModel(MODELS.referralClick)
    private readonly clicks: Model<{
      ambassador: Types.ObjectId;
      visitor: string;
      day: string;
    }>,
    private readonly counters: CountersService,
    private readonly notify: NotifyService,
    private readonly payments: PaymentsService,
    private readonly settings: SettingsService,
  ) {}

  private model(kind: PartnerKind) {
    return (kind === 'school' ? this.schools : this.ambassadors) as Model<
      SchoolDoc | AmbassadorDoc
    >;
  }

  /** The approved partner a code belongs to; unknown, pending and blocked codes give null. */
  async byCode(input: string) {
    const code = normalizeCode(input);
    if (AMBASSADOR_CODE.test(code)) {
      const doc = await this.ambassadors
        .findOne({ code, status: 'approved' })
        .lean<AmbassadorDoc>();
      return doc ? { kind: 'ambassador' as const, doc } : null;
    }
    if (SCHOOL_CODE.test(code)) {
      const doc = await this.schools
        .findOne({ code, status: 'approved' })
        .lean<SchoolDoc>();
      return doc ? { kind: 'school' as const, doc } : null;
    }
    return null;
  }

  /**
   * Someone opened a partner's link. For Ambassadors, counts one open per visitor per day: the
   * unique index on (ambassador, visitor, day) turns a repeat into a no-op.
   */
  async openLink(input: string, ip: string | undefined) {
    const found = await this.byCode(input);
    if (!found) return null;
    const visitor = ipHash(ip);
    if (found.kind === 'ambassador' && visitor) {
      try {
        await this.clicks.create({
          ambassador: found.doc._id,
          visitor,
          day: indiaDay(),
        });
        const total = await this.clicks.countDocuments({
          ambassador: found.doc._id,
        });
        await this.ambassadors.updateOne(
          { _id: found.doc._id },
          { $set: { 'stats.clicks': total } },
        );
      } catch (err) {
        if ((err as { code?: number }).code !== 11000) throw err; // 11000: already counted today.
      }
    }
    return { kind: found.kind, code: found.doc.code! };
  }

  /**
   * Email and password login. The password is set by the CNA team in the admin. Five wrong tries lock
   * the account for 15 minutes; the answer never says whether the email exists.
   */
  async login(
    kind: PartnerKind,
    input: { email?: unknown; password?: unknown },
  ) {
    const email = text(input.email, 120).toLowerCase();
    const password =
      typeof input.password === 'string' ? input.password.slice(0, 200) : '';
    if (!EMAIL.test(email) || !password) throw new FormError(WRONG);

    const field = kind === 'school' ? 'coordinator.email' : 'email';
    const partner = await this.model(kind)
      .findOne({ [field]: email, status: 'approved' })
      .lean<SchoolDoc | AmbassadorDoc>();
    const login = partner?.login;
    if (!partner || !login?.passwordHash) {
      // Same work as a real check, so the response time doesn't reveal whether the email exists.
      await verifyPassword(password, DUMMY_HASH);
      throw new FormError(WRONG);
    }
    const locked = tooMany(
      'Too many wrong tries. Please wait 15 minutes, or use "Forgot your password?" below.',
    );
    // Each try is counted atomically before the slow password check, so parallel guesses can't
    // all slip past the limit. An expired lock starts the count again.
    const now = new Date();
    const claim = await this.model(kind)
      .findOneAndUpdate(
        {
          _id: partner._id,
          $or: [
            { 'login.lockedUntil': null },
            { 'login.lockedUntil': { $lte: now } },
          ],
        },
        [
          {
            $set: {
              'login.failedAttempts': {
                $add: [
                  {
                    $cond: [
                      { $gt: ['$login.lockedUntil', null] },
                      0,
                      { $ifNull: ['$login.failedAttempts', 0] },
                    ],
                  },
                  1,
                ],
              },
              'login.lockedUntil': null,
            },
          },
        ],
        { new: true },
      )
      .lean<SchoolDoc | AmbassadorDoc>();
    const tries = claim?.login?.failedAttempts ?? Infinity;
    if (tries > LOCK.maxAttempts) throw locked;
    if (!(await verifyPassword(password, login.passwordHash))) {
      if (tries >= LOCK.maxAttempts)
        await this.model(kind).updateOne(
          { _id: partner._id },
          { $set: { 'login.lockedUntil': new Date(Date.now() + LOCK.ms) } },
        );
      throw new FormError(WRONG);
    }
    await this.model(kind).updateOne(
      { _id: partner._id },
      {
        $set: {
          'login.failedAttempts': 0,
          'login.lockedUntil': null,
          'login.lastLoginAt': new Date(),
        },
      },
    );
    return {
      // The password's version rides in the session, so setting a new password ends every session.
      token: createToken(
        'session',
        String(partner._id),
        SESSION_SECONDS,
        kind,
        passwordVersion(partner),
      ),
      maxAge: SESSION_SECONDS,
    };
  }

  /** The signed-in partner, re-checked on every request so blocking takes effect at once. */
  private async session<K extends PartnerKind>(
    kind: K,
    token: string | undefined,
  ) {
    const session = readToken(token, 'session');
    if (
      !session ||
      session.kind !== kind ||
      !Types.ObjectId.isValid(session.id)
    )
      return null;
    const doc = await this.model(kind)
      .findOne({ _id: session.id, status: 'approved' })
      .lean<K extends 'school' ? SchoolDoc : AmbassadorDoc>();
    if (!doc?.code || session.version !== passwordVersion(doc)) return null;
    return doc;
  }

  /** The signed-in school, for the services that act on its students. */
  schoolSession(token: string | undefined) {
    return this.session('school', token);
  }

  /**
   * Dashboard data. Counts are taken live from the master list (only paid registrations count towards
   * milestones), and the stored counts the admin sorts by are refreshed on the way.
   */
  async ambassadorDashboard(token: string | undefined) {
    const me = await this.session('ambassador', token);
    if (!me) return null;
    const mine = { ambassador: me._id, type: 'registered' };
    const [registered, paid, clicks, config] = await Promise.all([
      this.people.countDocuments(mine),
      this.people.countDocuments({
        ...mine,
        paymentStatus: { $in: ['paid', 'free'] },
      }),
      this.clicks.countDocuments({ ambassador: me._id }),
      this.settings.olympiad(),
    ]);
    await this.ambassadors.updateOne(
      { _id: me._id },
      { $set: { stats: { clicks, registered, paid } } },
    );
    return {
      name: me.name,
      role: AMBASSADOR_ROLES.find((r) => r.value === me.role)?.label ?? null,
      city: me.city ?? null,
      approvedAt: me.approvedAt ?? null,
      code: me.code!,
      shareUrl: partnerLinkUrl(me.code!),
      stats: { clicks, registered, paid },
      milestones: config.milestones,
      // What each milestone counts: link opens, or confirmed registrations (paid, or free in Group 0).
      progress: { clicks, paid },
    };
  }

  async schoolDashboard(token: string | undefined) {
    const me = await this.session('school', token);
    if (!me) return null;
    const everyone = await this.people
      .find({ school: me._id, type: { $in: ['registered', 'invited'] } })
      .sort({ createdAt: -1 })
      .select(
        'type regId name stage group fee paymentStatus parentConsent dob email inviteSentAt aadhaarLast4 documents parentPhone mobile payment',
      )
      .lean<PersonDoc[]>();
    const students = everyone.filter((s) => s.type === 'registered');
    const invited = everyone.filter((s) => s.type === 'invited');
    const done = (s: PersonDoc) =>
      s.paymentStatus === 'paid' || s.paymentStatus === 'free';
    const owed = students.filter((s) => !done(s) && (s.fee ?? 0) > 0);
    const paid = students.filter(done).length;
    await this.schools.updateOne(
      { _id: me._id },
      { $set: { stats: { students: students.length, paid } } },
    );
    return {
      name: me.name,
      code: me.code!,
      type: me.type,
      district: me.district,
      coordinator: me.coordinator.name,
      stats: {
        students: students.length,
        paid,
        pending: students.length - paid,
        consentPending: students.filter(
          (s) => isSchoolGroup(s.group ?? '') && !s.parentConsent?.at,
        ).length,
        waitingForParent: 0,
        documentsPending: invited.length,
      },
      pay: {
        count: owed.length,
        amount: owed.reduce((sum, s) => sum + (s.fee ?? 0), 0),
      },
      // Kept empty for older dashboard pages: parents no longer finish the form from a link.
      invited: [],
      classLink: partnerLinkUrl(me.code!),
      // Every student the school added from its sheet, with what each still needs.
      sheet: everyone.map((s) => {
        const proof = needsSchoolProof(s.group ?? '', me.type === 'government');
        return {
          id: String(s._id),
          regId: hasRegId(s) ? s.regId! : '',
          name: s.name,
          dob: s.dob ?? '',
          stage: s.stage ?? '',
          group: s.group ?? '',
          fee: s.fee ?? 0,
          aadhaarLast4: s.aadhaarLast4 ?? '',
          mobile: s.parentPhone ?? s.mobile ?? '',
          needsProof: proof,
          documents: {
            photo: Boolean(s.documents?.photo),
            aadhaarCard: Boolean(s.documents?.aadhaarCard),
            schoolIdCard: Boolean(s.documents?.schoolIdCard),
          },
          status:
            s.type === 'invited'
              ? ('documents' as const)
              : done(s)
                ? s.paymentStatus === 'free'
                  ? ('free' as const)
                  : ('paid' as const)
                : ('pending' as const),
          // A student can be taken off the sheet until they are confirmed or a payment is started.
          removable: !done(s) && !s.payment,
        };
      }),
      students: students.map((s) => ({
        id: String(s._id),
        regId: hasRegId(s) ? s.regId! : '',
        name: s.name,
        stage: stageOf(s.stage ?? '')?.label ?? s.stage ?? '',
        group: s.group ?? '',
        fee: s.fee ?? null,
        paymentStatus: s.paymentStatus ?? 'pending',
        parentConsent: Boolean(s.parentConsent?.at),
      })),
    };
  }

  /** Called by the admin when it approves a partner: the next code in the series. */
  async nextCode(kind: PartnerKind, district?: string) {
    return kind === 'school'
      ? this.counters.schoolCode(text(district, 40))
      : this.counters.ambassadorCode();
  }

  /** Called by the admin right after an approval: the welcome message with the code and, if no password is set yet, the link to choose one. */
  async approved(input: Partial<ApprovedPartner> & { id?: unknown }) {
    const kind =
      input.kind === 'school' || input.kind === 'ambassador'
        ? input.kind
        : null;
    const code = text(input.code, 40);
    const whatsapp = text(input.whatsapp, 20);
    if (!kind || !code || !whatsapp) throw new NotFoundException();
    const id = text(input.id, 24);
    const partner = Types.ObjectId.isValid(id)
      ? await this.model(kind).findById(id).lean<SchoolDoc | AmbassadorDoc>()
      : null;
    await this.notify.partnerApproved({
      kind,
      code,
      whatsapp,
      name: text(input.name, 80),
      email: text(input.email, 120) || undefined,
      schoolName: text(input.schoolName, 120) || undefined,
      setPasswordUrl:
        partner && !partner.login?.passwordHash
          ? passwordLinkFor(kind, partner)
          : undefined,
    });
  }

  /** The partner a "choose your password" link belongs to, if the link is still good. */
  private async fromPasswordToken(token: unknown) {
    const ref = readToken(text(token, 512), 'password');
    const kind: PartnerKind | null =
      ref?.kind === 'school' || ref?.kind === 'ambassador' ? ref.kind : null;
    if (!ref || !kind || !Types.ObjectId.isValid(ref.id)) return null;
    const partner = await this.model(kind)
      .findOne({ _id: ref.id, status: 'approved' })
      .lean<SchoolDoc | AmbassadorDoc>();
    const current = partner ? passwordVersion(partner) : '0';
    if (!partner || current !== ref.version) return null;
    return { kind, partner };
  }

  /** What the "choose your password" page shows before the form. */
  async passwordPreview(token: unknown) {
    const found = await this.fromPasswordToken(token);
    if (!found) return { valid: false as const };
    return {
      valid: true as const,
      kind: found.kind,
      name: greetName(found.partner) ?? '',
      email: loginEmail(found.partner) ?? '',
    };
  }

  /** Sets the partner's own password from a one-time link; the link can't be used again afterwards. */
  async setPassword(input: { token?: unknown; password?: unknown }) {
    const password =
      typeof input.password === 'string' ? input.password.slice(0, 200) : '';
    const problem = passwordProblem(password);
    if (problem) throw new FormError(problem, { password: problem });
    const found = await this.fromPasswordToken(input.token);
    if (!found)
      throw new FormError(
        'This link has expired or was already used. Ask for a new one from the dashboard login.',
      );
    const { kind, partner } = found;
    // The filter repeats the version check, so two tabs using the same link can't both succeed.
    const done = await this.model(kind).updateOne(
      {
        _id: partner._id,
        'login.passwordSetAt': partner.login?.passwordSetAt ?? null,
      },
      {
        $set: {
          'login.passwordHash': await hashPassword(password),
          'login.passwordSetAt': new Date(),
          'login.failedAttempts': 0,
          'login.lockedUntil': null,
        },
      },
    );
    if (!done.modifiedCount)
      throw new FormError(
        'This link was just used. Log in with your new password.',
      );
    return { kind, email: loginEmail(partner) ?? '' };
  }

  /** "Forgot your password?": emails a fresh link to an approved partner. The answer never says whether the email is known. */
  async requestPasswordReset(kind: PartnerKind, input: { email?: unknown }) {
    const email = text(input.email, 120).toLowerCase();
    if (!EMAIL.test(email))
      throw new FormError('Enter the email you log in with.', {
        email: 'Enter the email you log in with.',
      });
    const field = kind === 'school' ? 'coordinator.email' : 'email';
    const cutoff = new Date(Date.now() - RESET_GAP_MS);
    const partner = await this.model(kind)
      .findOneAndUpdate(
        {
          [field]: email,
          status: 'approved',
          $or: [
            { 'login.resetSentAt': null },
            { 'login.resetSentAt': { $lt: cutoff } },
          ],
        },
        { $set: { 'login.resetSentAt': new Date() } },
        { new: true },
      )
      .lean<SchoolDoc | AmbassadorDoc>();
    if (partner) {
      const link = passwordLinkFor(kind, partner);
      background('password reset email', () =>
        this.notify.passwordReset(email, greetName(partner) ?? '', link),
      );
    }
    return { sent: true };
  }

  /** Paid-for students only count once they finished the form; ₹0 students have nothing to pay. */
  private owedBySchool(schoolId: Types.ObjectId) {
    return this.people
      .find({
        school: schoolId,
        type: 'registered',
        paymentStatus: { $nin: ['paid', 'free'] },
        fee: { $gt: 0 },
      })
      .lean<PersonDoc[]>();
  }

  /** "Pay for N pending students": one Razorpay order for every registered student the school still owes for. */
  async schoolPay(token: string | undefined) {
    const me = await this.session('school', token);
    if (!me) return null;
    const owed = await this.owedBySchool(me._id);
    if (!owed.length)
      throw new FormError('There are no pending payments right now.');
    const amount = owed.reduce((sum, p) => sum + (p.fee ?? 0), 0);
    const order = await this.payments.openOrder(
      owed,
      `${me.code}-${Date.now().toString(36)}`,
      'school',
      me._id,
    );
    return {
      order,
      count: owed.length,
      amount,
      prefill: {
        name: me.coordinator.name,
        email: me.coordinator.email,
        contact: me.coordinator.whatsapp,
      },
    };
  }

  /** What the registration form fills in for a student a school added; null when the link is not valid. */
  async invitePreview(token: unknown) {
    const ref = readToken(text(token, 512), 'invite');
    if (!ref || !Types.ObjectId.isValid(ref.id))
      return { valid: false as const };
    const person = await this.people
      .findOne({ _id: ref.id, type: 'invited', edition: EDITION })
      .lean<PersonDoc>();
    const school = person?.school
      ? await this.schools
          .findOne({ _id: person.school, status: 'approved' })
          .lean<SchoolDoc>()
      : null;
    if (!person || !school) return { valid: false as const };
    return {
      valid: true as const,
      name: person.name,
      dob: person.dob ?? '',
      std: person.stage ?? '',
      parentName: person.parentName ?? '',
      parentMobile: (person.parentPhone ?? '').replace(/^\+91/, ''),
      email: person.email ?? '',
      schoolName: school.name,
      schoolType:
        school.type === 'government'
          ? 'government'
          : school.type === 'grant-in-aid'
            ? 'granted'
            : 'private',
    };
  }
}
