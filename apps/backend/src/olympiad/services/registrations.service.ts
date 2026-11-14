import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, type Model } from 'mongoose';
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
  ADULT_WORK,
  classesFor,
  EDITION,
  EMAIL,
  feeFor,
  groupFor,
  isDistrict,
  isSchoolGroup,
  needsSchoolProof,
  picksQuizSlot,
  RULES_VERSION,
  withSchool,
  normalizeMobile,
  PERSON_NAME,
  PIN_CODE,
  QUIZ_LANGUAGES,
  takesQuiz,
  type GroupId,
  type SchoolType,
} from '../rules.js';
import { MODELS, type PersonDoc, type SchoolDoc } from '../schemas.js';
import { readToken } from '../tokens.js';
import { CountersService } from './counters.service.js';
import { NotifyService } from './notify.service.js';
import { PartnersService } from './partners.service.js';
import { PaymentsService } from './payments.service.js';
import { registrationState, SettingsService } from './settings.service.js';

/**
 * The registration form's answers as the website sends them, after its own checks. The website has
 * already encrypted the Aadhaar number and stored the uploaded documents; only their ids come here.
 */
export interface RegistrationInput {
  website?: unknown;
  turnstileToken?: unknown;
  /** From the partner link the visitor arrived with. */
  refCode?: unknown;
  /** From the link a school's import emailed to the parent; credits the school and replaces the invited row. */
  invite?: unknown;
  who?: unknown;
  dob?: unknown;
  schoolType?: unknown;
  govtStd6to8?: unknown;
  firstName?: unknown;
  fatherName?: unknown;
  surname?: unknown;
  motherName?: unknown;
  fatherAlive?: unknown;
  motherAlive?: unknown;
  mobile?: unknown;
  whatsapp?: unknown;
  email?: unknown;
  address?: unknown;
  district?: unknown;
  pin?: unknown;
  quizLanguage?: unknown;
  parentRelation?: unknown;
  parentName?: unknown;
  parentMobile?: unknown;
  school?: unknown;
  std?: unknown;
  quizDate?: unknown;
  quizTime?: unknown;
  schoolId?: unknown;
  contactRole?: unknown;
  contactName?: unknown;
  contactMobile?: unknown;
  teacherStatus?: unknown;
  subject?: unknown;
  work?: unknown;
  achievements?: unknown;
  aadhaarLast4?: unknown;
  aadhaarHash?: unknown;
  aadhaarEnc?: unknown;
  documents?: {
    photo?: unknown;
    aadhaarCard?: unknown;
    schoolIdCard?: unknown;
  };
  agree?: unknown;
}

const DOCUMENT_KINDS = ['photo', 'aadhaarCard', 'schoolIdCard'] as const;
type DocumentKind = (typeof DOCUMENT_KINDS)[number];

const fileId = (value: unknown) =>
  typeof value === 'string' && /^[a-f0-9]{24}$/.test(value) ? value : null;

/** The fee type kept for reports: 0, A and B by school, C college, D and E not students. */
const schoolTypeOf = (group: GroupId, govt: boolean): SchoolType =>
  isSchoolGroup(group)
    ? govt
      ? 'government'
      : 'non-government'
    : group === 'C'
      ? 'college'
      : 'not-a-student';

/** Answers only some participants give; cleared when a new attempt leaves them out. */
const OPTIONAL_FIELDS = [
  'govtStd6to8',
  'quizDate',
  'quizTime',
  'fatherAlive',
  'motherAlive',
  'orphan',
  'quizLanguage',
  'parentRelation',
  'parentName',
  'parentPhone',
  'parentConsent',
  'institution',
  'stage',
  'schoolId',
  'contactRole',
  'contactName',
  'contactPhone',
  'teacherStatus',
  'subject',
  'work',
  'code',
  'school',
  'ambassador',
  'paidAt',
  'payment',
  'razorpayPaymentId',
] as const;

const alreadyPaid = (regId: string) =>
  new FormError(
    `This Aadhaar number is already registered (${regId}). The confirmation was sent by email.`,
    { aadhaar: `Already registered (${regId}).` },
  );

const usedElsewhere = () =>
  new FormError(
    'This Aadhaar number is already used in a registration with another mobile number. If it is yours, please contact CNA.',
    { aadhaar: 'Already used with another mobile number.' },
  );

const isName = (value: string) => value.length > 0 && PERSON_NAME.test(value);

/** "Register" / "Pay": checks the answers, prices the fee, saves the person and opens the Razorpay order. */
@Injectable()
export class RegistrationsService implements OnModuleInit {
  private readonly log = new Logger('Registrations');

  constructor(
    @InjectModel(MODELS.person) private readonly people: Model<PersonDoc>,
    private readonly counters: CountersService,
    private readonly notify: NotifyService,
    private readonly partners: PartnersService,
    private readonly payments: PaymentsService,
    private readonly settings: SettingsService,
  ) {}

  /** Builds the one index this API owns: a single registration per Aadhaar number and edition. */
  async onModuleInit() {
    await this.people.createIndexes().catch((err: unknown) => {
      this.log.error('creating the Aadhaar index failed', err);
    });
  }

  async register(input: RegistrationInput, ip: string | undefined) {
    const config = await this.settings.olympiad();
    if (registrationState(config) !== 'open')
      throw new FormError(
        'Registration is not open right now. Please check the dates on the Olympiad page.',
      );

    const v = {
      who: text(input.who, 10),
      dob: text(input.dob, 10),
      schoolType: text(input.schoolType, 12),
      firstName: text(input.firstName, 60),
      fatherName: text(input.fatherName, 60),
      surname: text(input.surname, 60),
      motherName: text(input.motherName, 60),
      email: text(input.email, 120).toLowerCase(),
      address: longText(input.address, 200),
      district: text(input.district, 40),
      pin: text(input.pin, 6),
      quizLanguage: text(input.quizLanguage, 5),
      parentRelation: text(input.parentRelation, 10),
      parentName: text(input.parentName, 60),
      school: text(input.school, 150),
      std: text(input.std, 40),
      quizDate: text(input.quizDate, 60),
      quizTime: text(input.quizTime, 60),
      govtStd6to8: text(input.govtStd6to8, 3),
      schoolId: text(input.schoolId, 40),
      contactRole: text(input.contactRole, 20),
      contactName: text(input.contactName, 60),
      teacherStatus: text(input.teacherStatus, 10),
      subject: text(input.subject, 60),
      work: text(input.work, 60),
      aadhaarLast4: text(input.aadhaarLast4, 4),
      aadhaarHash: text(input.aadhaarHash, 64),
      aadhaarEnc: text(input.aadhaarEnc, 200),
      refCode: text(input.refCode, 20),
    };
    const achievements = (
      Array.isArray(input.achievements) ? (input.achievements as unknown[]) : []
    )
      .map((a) => text(a, 120))
      .filter(Boolean)
      .slice(0, 12);
    const mobile = normalizeMobile(text(input.mobile, 20));
    const whatsapp = normalizeMobile(text(input.whatsapp, 20));
    const parentPhone = normalizeMobile(text(input.parentMobile, 20));
    const contactPhone = normalizeMobile(text(input.contactMobile, 20));
    const documents = Object.fromEntries(
      DOCUMENT_KINDS.map((k) => [k, fileId(input.documents?.[k])]),
    ) as Record<DocumentKind, string | null>;

    const result = groupFor(v.who, v.dob);
    const ageGroup = result && 'group' in result ? result.group : null;
    const student = v.who === 'student';
    const minor = ageGroup ? isSchoolGroup(ageGroup) : false;
    const govt = minor && v.schoolType === 'government';
    const asksStd6to8 = student && ageGroup === 'A';
    const group = ageGroup
      ? withSchool(ageGroup, asksStd6to8 && v.govtStd6to8 === 'yes')
      : null;
    const proof = group ? needsSchoolProof(group, govt) : false;
    const slot = student && group ? picksQuizSlot(group, v.std) : false;
    const slots = slot ? config.quizSlots : [];

    const errors: FieldErrors = {};
    const need = (field: string, ok: boolean, message: string) => {
      if (!ok) errors[field] = message;
    };
    need(
      'group',
      Boolean(group),
      result && 'warning' in result
        ? result.warning
        : 'Group could not be decided.',
    );
    if (student)
      need(
        'schoolType',
        ['government', 'private'].includes(v.schoolType),
        'Choose the school type.',
      );
    if (asksStd6to8)
      need('govtStd6to8', ['yes', 'no'].includes(v.govtStd6to8), 'Choose one.');
    need('firstName', isName(v.firstName), 'Enter the name.');
    need('fatherName', isName(v.fatherName), "Enter the father's name.");
    need('surname', isName(v.surname), 'Enter the surname.');
    need('motherName', isName(v.motherName), "Enter the mother's name.");
    need('mobile', Boolean(mobile), 'Enter a 10 digit mobile number.');
    need('whatsapp', Boolean(whatsapp), 'Enter a 10 digit WhatsApp number.');
    need('email', EMAIL.test(v.email), 'Enter a valid email.');
    need('address', v.address.length >= 3, 'Enter the address.');
    need('district', isDistrict(v.district), 'Choose the district.');
    need('pin', PIN_CODE.test(v.pin), 'Enter the 6 digit PIN code.');
    if (group && takesQuiz(group))
      need(
        'quizLanguage',
        QUIZ_LANGUAGES.some((l) => l.value === v.quizLanguage),
        'Choose the quiz language.',
      );
    // Students say whether each parent is alive; a parent who is not can't be the one filling in the form.
    const fatherAlive = student ? input.fatherAlive !== false : undefined;
    const motherAlive = student ? input.motherAlive !== false : undefined;
    if (minor) {
      need(
        'parentWho',
        ['father', 'mother', 'other'].includes(v.parentRelation) &&
          !(v.parentRelation === 'father' && fatherAlive === false) &&
          !(v.parentRelation === 'mother' && motherAlive === false),
        'Choose the parent.',
      );
      need('parentName', isName(v.parentName), "Enter the parent's name.");
      need(
        'parentMobile',
        Boolean(parentPhone),
        "Enter the parent's mobile number.",
      );
    }
    if (v.who !== 'adult')
      need('school', v.school.length >= 2, 'Enter the school or college name.');
    if (student) {
      need(
        'std',
        group ? classesFor(group).includes(v.std) : false,
        'Choose the class.',
      );
      if (slots.length) {
        const day = slots.find((d) => d.date === v.quizDate);
        need('quizDate', Boolean(day), 'Choose the quiz date.');
        if (day)
          need(
            'quizTime',
            day.times.includes(v.quizTime),
            'Choose the quiz time.',
          );
      }
      if (proof)
        need(
          'schoolIdCard',
          Boolean(documents.schoolIdCard),
          'Upload the school ID card or bonafide certificate.',
        );
      need(
        'contactRole',
        ['Principal', 'Class teacher'].includes(v.contactRole),
        'Choose one.',
      );
      need('contactName', isName(v.contactName), 'Enter the name.');
      need(
        'contactMobile',
        Boolean(contactPhone),
        'Enter a 10 digit mobile number.',
      );
    }
    if (v.who === 'teacher')
      need(
        'teacherStatus',
        ['current', 'retired'].includes(v.teacherStatus),
        'Choose one.',
      );
    if (v.who === 'adult')
      need(
        'work',
        (ADULT_WORK as readonly string[]).includes(v.work),
        'Choose your work.',
      );
    need(
      'aadhaar',
      /^\d{4}$/.test(v.aadhaarLast4) &&
        /^[a-f0-9]{64}$/.test(v.aadhaarHash) &&
        v.aadhaarEnc.length > 20,
      'Enter the 12 digit Aadhaar number.',
    );
    need('photo', Boolean(documents.photo), 'Upload the photo.');
    need(
      'aadhaarCard',
      Boolean(documents.aadhaarCard),
      'Upload the Aadhaar card.',
    );
    need('agree', input.agree === true, 'Tick to continue.');
    throwIfErrors(errors);

    if (text(input.website)) throw new FormError('Please try again.');
    if (!(await passesTurnstile(text(input.turnstileToken, 2048), ip)))
      throw new FormError('Please complete the security check and try again.');
    // A family or a school computer may register a few children in a row; a script may not.
    const visitor = ipHash(ip);
    if (
      visitor &&
      (await this.people.countDocuments({
        'meta.consentIpHash': visitor,
        registeredAt: { $gt: since(30 * 60 * 1000) },
      })) >= 10
    )
      throw tooMany(
        'Many registrations were sent from here in the last half hour. Please wait a little and try again.',
      );

    const g = group!;
    const fee = feeFor(config.fees, g, govt);
    const inviteRef = readToken(text(input.invite, 512), 'invite');
    const invited =
      inviteRef && isValidObjectId(inviteRef.id)
        ? await this.people
            .findOne({ _id: inviteRef.id, type: 'invited', edition: EDITION })
            .lean<PersonDoc>()
        : null;
    // A school's invitation decides the school; otherwise the partner link the visitor came with.
    const partnerCode = invited?.code || v.refCode;
    const partner = partnerCode
      ? await this.partners.byCode(partnerCode)
      : null;
    const school =
      partner?.kind === 'school' ? (partner.doc as SchoolDoc) : null;
    const ambassador =
      partner?.kind === 'ambassador' && partner.doc.whatsapp !== whatsapp
        ? partner.doc
        : null;
    // The free or lower fee is checked by CNA against the uploaded proof, unless an approved government
    // school added this student itself. A school's public class link vouches for nobody.
    const feeCheck = proof && !(invited && school?.type === 'government');
    const now = new Date();
    const name = `${v.firstName} ${v.fatherName} ${v.surname}`;
    const free = fee === 0;

    const fields = {
      type: 'registered' as const,
      edition: EDITION,
      participant: v.who as PersonDoc['participant'],
      name,
      fatherName: v.fatherName,
      motherName: v.motherName,
      ...(student
        ? { fatherAlive, motherAlive, orphan: !fatherAlive && !motherAlive }
        : {}),
      mobile: mobile!,
      whatsapp: whatsapp!,
      email: v.email,
      dob: v.dob,
      group: g,
      ...(asksStd6to8 ? { govtStd6to8: v.govtStd6to8 === 'yes' } : {}),
      address: v.address,
      district: v.district,
      pin: v.pin,
      ...(takesQuiz(g) ? { quizLanguage: v.quizLanguage } : {}),
      ...(minor
        ? {
            parentRelation: v.parentRelation,
            parentName: v.parentName,
            parentPhone: parentPhone!,
            // For an under-18 participant the parent fills in and submits the form.
            parentConsent: { at: now },
          }
        : {}),
      ...(v.who !== 'adult' ? { institution: v.school } : {}),
      schoolType: schoolTypeOf(g, govt),
      ...(student
        ? {
            stage: v.std,
            ...(slots.length
              ? { quizDate: v.quizDate, quizTime: v.quizTime }
              : {}),
            ...(v.schoolId ? { schoolId: v.schoolId } : {}),
            contactRole: v.contactRole,
            contactName: v.contactName,
            contactPhone: contactPhone!,
          }
        : {}),
      ...(v.who === 'teacher'
        ? { teacherStatus: v.teacherStatus, subject: v.subject }
        : {}),
      ...(v.who === 'adult' ? { work: v.work } : {}),
      achievements,
      aadhaarLast4: v.aadhaarLast4,
      aadhaarHash: v.aadhaarHash,
      aadhaarEnc: v.aadhaarEnc,
      documents: {
        photo: documents.photo!,
        aadhaarCard: documents.aadhaarCard!,
        ...(proof && documents.schoolIdCard
          ? { schoolIdCard: documents.schoolIdCard }
          : {}),
      },
      fee,
      feeCheck,
      source: school
        ? ('school' as const)
        : ambassador
          ? ('ambassador' as const)
          : ('direct' as const),
      ...(partner && (school || ambassador) ? { code: partner.doc.code } : {}),
      ...(school ? { school: school._id } : {}),
      ...(ambassador ? { ambassador: ambassador._id } : {}),
      consent: { at: now, version: config.consentVersion },
      rules: { at: now, version: RULES_VERSION },
      registeredAt: now,
      paymentStatus: free ? ('free' as const) : ('pending' as const),
    };
    const meta = {
      consentIpHash: visitor,
      ...(minor ? { parentConsentIpHash: visitor } : {}),
    };
    const metaUpdate = Object.fromEntries(
      Object.entries(meta).map(([k, val]) => [`meta.${k}`, val]),
    );

    // Optional answers the new form did not give are removed, so a changed answer (another group,
    // no school link this time) never leaves old values behind.
    const unset = Object.fromEntries(
      OPTIONAL_FIELDS.filter((f) => !(f in fields)).map((f) => [f, 1]),
    );
    const update = (regId?: string) => ({
      $set: { ...fields, ...metaUpdate, ...(regId ? { regId } : {}) },
      ...(Object.keys(unset).length ? { $unset: unset } : {}),
    });

    // One Aadhaar, one registration. Only the same mobile or WhatsApp number may continue an earlier
    // attempt, so someone holding another person's Aadhaar number can neither overwrite their form
    // nor learn their Reg. ID.
    const same = await this.people
      .findOne({
        type: 'registered',
        edition: EDITION,
        aadhaarHash: v.aadhaarHash,
      })
      .lean<PersonDoc>();
    const owner =
      !!same &&
      [same.mobile, same.whatsapp].some((n) => n === mobile || n === whatsapp);
    if (same && !owner) throw usedElsewhere();
    if (same?.paymentStatus === 'paid' || same?.paymentStatus === 'free')
      throw alreadyPaid(same.regId);

    // Documents of the earlier attempt that this one replaces; the website deletes them.
    const kept = new Set(DOCUMENT_KINDS.map((k) => documents[k]));
    const staleFiles = DOCUMENT_KINDS.map((k) => same?.documents?.[k]).filter(
      (id): id is string => !!id && !kept.has(id),
    );

    let person: PersonDoc | null = null;
    try {
      if (same) {
        // A Reg. ID carries the group letter, so a changed group gets a new one.
        const regId = same.regId.startsWith(`AO2-${g}-`)
          ? undefined
          : await this.counters.registrationId(g);
        person = await this.people
          .findOneAndUpdate(
            { _id: same._id, paymentStatus: { $nin: ['paid', 'free'] } },
            update(regId),
            { new: true },
          )
          .lean<PersonDoc>();
        // Paid in the moment between the check above and this update.
        if (!person) throw alreadyPaid(same.regId);
        // The school's invited row is now a duplicate of this registration.
        if (invited)
          await this.people.deleteOne({ _id: invited._id, type: 'invited' });
      } else if (invited) {
        person = await this.people
          .findOneAndUpdate(
            { _id: invited._id, type: 'invited' },
            update(await this.counters.registrationId(g)),
            { new: true },
          )
          .lean<PersonDoc>();
        if (!person)
          throw new FormError(
            'This form was just sent. Please wait a minute and check your email before trying again.',
          );
      } else {
        // A "Remind me" row for this number becomes the registration, keeping its consent history.
        const reminder = await this.people
          .findOne({ type: 'reminder', edition: EDITION, whatsapp })
          .lean<PersonDoc>();
        const regId = await this.counters.registrationId(g);
        person = reminder
          ? await this.people
              .findOneAndUpdate(
                { _id: reminder._id, type: 'reminder' },
                update(regId),
                { new: true },
              )
              .lean<PersonDoc>()
          : null;
        person ??= (
          await this.people.create({
            ...fields,
            regId,
            whatsappStopped: false,
            emailStopped: false,
            meta: { ipHash: visitor, ...meta },
          })
        ).toObject();
      }
    } catch (err) {
      // The unique index on the Aadhaar hash: the same form was sent twice at the same moment.
      if ((err as { code?: number }).code === 11000)
        throw new FormError(
          'This form was just sent. Please wait a minute and check your email before trying again.',
          { aadhaar: 'Already being registered.' },
        );
      throw err;
    }

    const saved = person!;
    const summary = {
      regId: saved.regId,
      name: saved.name,
      group: g,
      fee,
      staleFiles,
      prefill: { name: saved.name, email: v.email, contact: mobile! },
    };
    if (free) {
      background('registration confirmation', () =>
        this.notify.registrationConfirmed(saved),
      );
      return { ...summary, paid: true, order: null };
    }
    // The form is saved either way; if Razorpay can't open the payment now, the person is told so
    // and can pay later, rather than losing the form.
    const order = await this.payments
      .openOrder([saved], saved.regId, 'participant')
      .catch((err: unknown) => {
        this.log.error(`opening the order for ${saved.regId} failed`, err);
        return null;
      });
    return { ...summary, paid: false, order };
  }
}
