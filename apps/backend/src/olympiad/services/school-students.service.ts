import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, type Model } from 'mongoose';
import { background, FormError, longText, text } from '../../common/forms.js';
import {
  classesFor,
  EDITION,
  EMAIL,
  feeFor,
  groupFor,
  groupZeroSchool,
  isDistrict,
  isPlainText,
  isSchoolGroup,
  needsSchoolProof,
  normalizeMobile,
  PERSON_NAME,
  picksQuizSlot,
  PIN_CODE,
  QUIZ_LANGUAGES,
  QUIZ_WINDOWS,
  RULES_VERSION,
  withSchool,
  type GroupId,
} from '../rules.js';
import { hasRegId } from '../registration-ids.js';
import { MODELS, type PersonDoc, type SchoolDoc } from '../schemas.js';
import { CountersService } from './counters.service.js';
import { NotifyService } from './notify.service.js';
import { PartnersService } from './partners.service.js';
import { SettingsService, type OlympiadConfig } from './settings.service.js';

/** Rows read from one Excel upload; a bigger school uploads in parts. */
const MAX_ROWS = 500;

export const STUDENT_DOCUMENTS = [
  'photo',
  'aadhaarCard',
  'schoolIdCard',
] as const;
export type StudentDocument = (typeof STUDENT_DOCUMENTS)[number];

/**
 * One student row of the school's sheet, as the website sends it. The website has already encrypted
 * the Aadhaar number; a number it could not read arrives without the three Aadhaar values.
 */
export interface SheetStudent {
  row?: unknown;
  firstName?: unknown;
  fatherName?: unknown;
  surname?: unknown;
  motherName?: unknown;
  fatherAlive?: unknown;
  motherAlive?: unknown;
  dob?: unknown;
  std?: unknown;
  govtStd6to8?: unknown;
  mobile?: unknown;
  whatsapp?: unknown;
  email?: unknown;
  address?: unknown;
  district?: unknown;
  pin?: unknown;
  quizLanguage?: unknown;
  quizWindow?: unknown;
  quizDate?: unknown;
  quizTime?: unknown;
  parentRelation?: unknown;
  parentName?: unknown;
  parentMobile?: unknown;
  schoolId?: unknown;
  achievements?: unknown;
  aadhaarLast4?: unknown;
  aadhaarHash?: unknown;
  aadhaarEnc?: unknown;
}

const isName = (value: string) => value.length > 0 && PERSON_NAME.test(value);
const fileId = (value: unknown) =>
  typeof value === 'string' && /^[a-f0-9]{24}$/.test(value) ? value : null;

/** The school type the registration form would have asked the student for. */
const formSchoolType = (school: SchoolDoc) =>
  school.type === 'government'
    ? 'government'
    : school.type === 'grant-in-aid'
      ? 'granted'
      : 'private';

/** The school type kept on the person, as the public form stores it. */
const storedSchoolType = (group: GroupId, school: SchoolDoc) =>
  !isSchoolGroup(group)
    ? 'college'
    : school.type === 'government'
      ? 'government'
      : school.type === 'grant-in-aid'
        ? 'semi-government'
        : 'non-government';

/** The documents a student of this group must have before the registration is complete. */
export const requiredDocuments = (
  group: string,
  government: boolean,
): StudentDocument[] =>
  needsSchoolProof(group, government)
    ? ['photo', 'aadhaarCard', 'schoolIdCard']
    : ['photo', 'aadhaarCard'];

const missingDocuments = (person: PersonDoc, government: boolean) =>
  requiredDocuments(person.group ?? '', government).filter(
    (kind) => !person.documents?.[kind],
  );

/**
 * A School Partner registers its own students: the Excel sheet carries what the registration form
 * asks, each row is saved as an incomplete entry, and it becomes a registration once the photo,
 * Aadhaar card and (where the fee depends on it) the bonafide certificate are uploaded. The school
 * then pays for everyone at once.
 */
@Injectable()
export class SchoolStudentsService {
  constructor(
    @InjectModel(MODELS.person) private readonly people: Model<PersonDoc>,
    private readonly partners: PartnersService,
    private readonly counters: CountersService,
    private readonly notify: NotifyService,
    private readonly settings: SettingsService,
  ) {}

  /** Why a row can't be used, or the fields to save for it. */
  private check(raw: SheetStudent, school: SchoolDoc, config: OlympiadConfig) {
    const v = {
      firstName: text(raw.firstName, 60),
      fatherName: text(raw.fatherName, 60),
      surname: text(raw.surname, 60),
      motherName: text(raw.motherName, 60),
      dob: text(raw.dob, 10),
      std: text(raw.std, 40),
      govtStd6to8: text(raw.govtStd6to8, 3),
      email: text(raw.email, 120).toLowerCase(),
      address: longText(raw.address, 200),
      district: text(raw.district, 40),
      pin: text(raw.pin, 6),
      quizLanguage: text(raw.quizLanguage, 5),
      quizWindow: text(raw.quizWindow, 12),
      quizDate: text(raw.quizDate, 60),
      quizTime: text(raw.quizTime, 60),
      parentRelation: text(raw.parentRelation, 10),
      parentName: text(raw.parentName, 60),
      schoolId: text(raw.schoolId, 40),
      aadhaarLast4: text(raw.aadhaarLast4, 4),
      aadhaarHash: text(raw.aadhaarHash, 64),
      aadhaarEnc: text(raw.aadhaarEnc, 200),
    };
    const achievements = (
      Array.isArray(raw.achievements) ? (raw.achievements as unknown[]) : []
    )
      .map((a) => text(a, 120))
      .filter(Boolean)
      .slice(0, 12);
    const mobile = normalizeMobile(text(raw.mobile, 20));
    const whatsapp = normalizeMobile(text(raw.whatsapp, 20)) ?? mobile;
    const parentPhone = normalizeMobile(text(raw.parentMobile, 20));
    const fatherAlive = raw.fatherAlive !== false;
    const motherAlive = raw.motherAlive !== false;
    const orphan = !fatherAlive && !motherAlive;

    const aged = groupFor('student', v.dob);
    if (!aged) return { problem: 'Date of birth missing or not a date' };
    if (!('group' in aged))
      return { problem: 'The student must have completed 13 years' };
    const schoolType = formSchoolType(school);
    const minor = isSchoolGroup(aged.group);
    const government = minor && schoolType === 'government';
    const asksStd6to8 = aged.group === 'A' && groupZeroSchool(schoolType);
    if (asksStd6to8 && !['yes', 'no'].includes(v.govtStd6to8))
      return {
        problem: '"Std 6 to 8 in a government school" must be Yes or No',
      };
    const group = withSchool(
      aged.group,
      asksStd6to8 && v.govtStd6to8 === 'yes',
    );
    const slots = picksQuizSlot(group, v.std) ? config.quizSlots : [];
    const day = slots.find((d) => d.date === v.quizDate);

    const parentOk =
      ['father', 'mother', 'other'].includes(v.parentRelation) &&
      !(v.parentRelation === 'father' && !fatherAlive) &&
      !(v.parentRelation === 'mother' && !motherAlive) &&
      // A guardian stands in only when neither parent is alive.
      !(v.parentRelation === 'other' && !orphan);
    const aadhaarOk =
      /^\d{4}$/.test(v.aadhaarLast4) &&
      /^[a-f0-9]{64}$/.test(v.aadhaarHash) &&
      v.aadhaarEnc.length > 20;
    // The first rule a row breaks is what the school is told about it.
    const rules: [ok: boolean, problem: string][] = [
      [isName(v.firstName), 'First name missing or not valid'],
      [isName(v.surname), 'Surname missing or not valid'],
      [orphan || isName(v.fatherName), "Father's name missing or not valid"],
      [orphan || isName(v.motherName), "Mother's name missing or not valid"],
      [
        classesFor(group).includes(v.std),
        `For this age the class must be one of: ${classesFor(group).join(', ')}`,
      ],
      [Boolean(mobile), 'Mobile must be 10 digits'],
      [!v.email || EMAIL.test(v.email), 'Email not valid'],
      [v.address.length >= 3 && isPlainText(v.address), 'Address missing'],
      [
        isDistrict(v.district),
        'District must be a Gujarat district from the list',
      ],
      [PIN_CODE.test(v.pin), 'PIN code must be 6 digits'],
      [
        QUIZ_LANGUAGES.some((l) => l.value === v.quizLanguage),
        'Quiz language must be Gujarati or English',
      ],
      [
        (QUIZ_WINDOWS as readonly string[]).includes(v.quizWindow),
        'Quiz dates must be chosen from the list',
      ],
      [
        !slots.length || Boolean(day),
        `Quiz date must be one of: ${slots.map((d) => d.date).join(', ')}`,
      ],
      [
        !day || day.times.includes(v.quizTime),
        `Quiz time must be one of: ${(day?.times ?? []).join(', ')}`,
      ],
      [
        !minor || parentOk,
        'Parent must be Father or Mother (Guardian only when neither parent is alive)',
      ],
      [!minor || isName(v.parentName), "Parent's name missing or not valid"],
      [!minor || Boolean(parentPhone), "Parent's mobile must be 10 digits"],
      [isPlainText(v.schoolId), 'GR number not valid'],
      [achievements.every(isPlainText), 'Achievements must not contain links'],
      [aadhaarOk, 'Aadhaar number must be 12 digits'],
    ];
    const problem = rules.find(([ok]) => !ok)?.[1];
    if (problem) return { problem };

    const now = new Date();
    const takesSlot = Boolean(day);
    return {
      aadhaarHash: v.aadhaarHash,
      fields: {
        type: 'invited' as const,
        edition: EDITION,
        participant: 'student' as const,
        name: [v.firstName, orphan ? '' : v.fatherName, v.surname]
          .filter(Boolean)
          .join(' '),
        ...(orphan
          ? {}
          : { fatherName: v.fatherName, motherName: v.motherName }),
        fatherAlive,
        motherAlive,
        orphan,
        mobile: mobile!,
        whatsapp: whatsapp!,
        ...(v.email ? { email: v.email } : {}),
        dob: v.dob,
        group,
        ...(asksStd6to8 ? { govtStd6to8: v.govtStd6to8 === 'yes' } : {}),
        address: v.address,
        district: v.district,
        pin: v.pin,
        quizLanguage: v.quizLanguage,
        quizWindow: v.quizWindow,
        formLanguage: 'en' as const,
        ...(minor
          ? {
              parentRelation: v.parentRelation,
              parentName: v.parentName,
              parentPhone: parentPhone!,
              // The school declares, with each upload, that it holds the parent's consent.
              parentConsent: { at: now },
            }
          : {}),
        institution: school.name,
        schoolType: storedSchoolType(group, school),
        stage: v.std,
        ...(takesSlot ? { quizDate: v.quizDate, quizTime: v.quizTime } : {}),
        ...(v.schoolId ? { schoolId: v.schoolId } : {}),
        contactRole: 'Class teacher',
        contactName: school.coordinator.name,
        contactPhone: school.coordinator.whatsapp,
        achievements,
        aadhaarLast4: v.aadhaarLast4,
        aadhaarHash: v.aadhaarHash,
        aadhaarEnc: v.aadhaarEnc,
        fee: feeFor(config.fees, group, government),
        // An approved school vouches for its own students, so CNA does not re-check the fee proof.
        feeCheck: false,
        source: 'school' as const,
        code: school.code,
        school: school._id,
        consent: { at: now, version: config.consentVersion },
        rules: { at: now, version: RULES_VERSION },
        whatsappStopped: false,
        emailStopped: false,
      },
    };
  }

  /**
   * "Upload Excel": every valid row becomes an entry on the school's sheet, waiting for its documents.
   * A student whose Aadhaar number is already registered or already on a sheet is skipped, so the same
   * file uploaded twice adds nobody twice.
   */
  async importSheet(
    token: string | undefined,
    input: { rows?: unknown; declared?: unknown },
  ) {
    const school = await this.partners.schoolSession(token);
    if (!school) return null;
    if (input.declared !== true)
      throw new FormError(
        "Please confirm that the school holds each parent's consent.",
      );
    const rows = (Array.isArray(input.rows) ? input.rows : []).slice(
      0,
      MAX_ROWS,
    ) as SheetStudent[];
    const config = await this.settings.olympiad();
    const skipped: { row: number; reason: string }[] = [];
    const valid: {
      row: number;
      aadhaarHash: string;
      fields: Record<string, unknown>;
    }[] = [];
    const seen = new Set<string>();
    for (const [i, raw] of rows.entries()) {
      const row = Number(raw.row) || i + 2;
      const checked = this.check(raw, school, config);
      if ('problem' in checked) {
        skipped.push({ row, reason: checked.problem ?? '' });
      } else if (seen.has(checked.aadhaarHash)) {
        skipped.push({
          row,
          reason: 'Same Aadhaar number as another row in this sheet',
        });
      } else {
        seen.add(checked.aadhaarHash);
        valid.push({ row, ...checked });
      }
    }

    const known = new Map(
      (
        await this.people
          .find({
            edition: EDITION,
            aadhaarHash: { $in: valid.map((s) => s.aadhaarHash) },
          })
          .select('aadhaarHash school')
          .lean<Pick<PersonDoc, 'aadhaarHash' | 'school'>[]>()
      ).map((p) => [p.aadhaarHash, String(p.school ?? '')]),
    );
    const fresh = valid.filter((s) => {
      const owner = known.get(s.aadhaarHash);
      if (owner === undefined) return true;
      skipped.push({
        row: s.row,
        reason:
          owner === String(school._id)
            ? 'Already on your sheet'
            : 'This Aadhaar number is already registered',
      });
      return false;
    });

    let added = 0;
    for (const student of fresh) {
      try {
        await this.people.create(student.fields);
        added += 1;
      } catch (err) {
        // The unique index on the Aadhaar number: registered elsewhere in this very moment.
        if ((err as { code?: number }).code !== 11000) throw err;
        skipped.push({
          row: student.row,
          reason: 'This Aadhaar number is already registered',
        });
      }
    }
    skipped.sort((a, b) => a.row - b.row);
    return { added, skipped };
  }

  /**
   * One uploaded document for one student on the school's sheet. With the last required document the
   * entry becomes a registration: free groups get their Registration ID at once, the others wait for
   * the school's payment. Returns the id of the file this upload replaces, for the website to delete.
   */
  async attachDocument(
    token: string | undefined,
    input: { id?: unknown; kind?: unknown; file?: unknown },
  ) {
    const school = await this.partners.schoolSession(token);
    if (!school) return null;
    const id = text(input.id, 24);
    const kind = STUDENT_DOCUMENTS.find((k) => k === input.kind);
    const file = fileId(input.file);
    if (!isValidObjectId(id) || !kind || !file)
      throw new FormError('This upload could not be saved. Please try again.');
    const government = school.type === 'government';
    const mine = {
      _id: id,
      school: school._id,
      edition: EDITION,
      type: { $in: ['invited', 'registered'] },
      paymentStatus: { $nin: ['paid', 'free'] },
    };
    const before = await this.people.findOne(mine).lean<PersonDoc>();
    if (!before)
      throw new FormError(
        'This student is already confirmed, or is no longer on your sheet.',
      );
    if (!requiredDocuments(before.group ?? '', government).includes(kind))
      throw new FormError('This document is not needed for this student.');
    const person = await this.people
      .findOneAndUpdate(
        mine,
        { $set: { [`documents.${kind}`]: file } },
        { new: true },
      )
      .lean<PersonDoc>();
    if (!person)
      throw new FormError(
        'This student is already confirmed, or is no longer on your sheet.',
      );
    const complete =
      person.type === 'invited' &&
      missingDocuments(person, government).length === 0
        ? await this.complete(person)
        : person.type === 'registered';
    return { complete, replaced: before.documents?.[kind] ?? null };
  }

  /** The entry has every document: it is now a registration, at today's fee. */
  private async complete(person: PersonDoc) {
    const free = (person.fee ?? 0) === 0;
    const now = new Date();
    const saved = await this.people
      .findOneAndUpdate(
        { _id: person._id, type: 'invited' },
        {
          $set: {
            type: 'registered',
            registeredAt: now,
            paymentStatus: free ? 'free' : 'pending',
            ...(free && !hasRegId(person)
              ? {
                  regId: await this.counters.registrationId(person.group ?? ''),
                }
              : {}),
          },
        },
        { new: true },
      )
      .lean<PersonDoc>();
    if (saved && free)
      background('registration confirmation', () =>
        this.notify.registrationConfirmed(saved),
      );
    return true;
  }

  /**
   * Takes a student off the school's sheet: only one who is not confirmed and has no payment started.
   * Returns the ids of their uploaded files, for the website to delete.
   */
  async remove(token: string | undefined, input: { id?: unknown }) {
    const school = await this.partners.schoolSession(token);
    if (!school) return null;
    const id = text(input.id, 24);
    if (!isValidObjectId(id))
      throw new FormError('This student could not be removed.');
    const person = await this.people
      .findOneAndDelete({
        _id: id,
        school: school._id,
        edition: EDITION,
        type: { $in: ['invited', 'registered'] },
        paymentStatus: { $nin: ['paid', 'free'] },
        payment: { $exists: false },
      })
      .lean<PersonDoc>();
    if (!person)
      throw new FormError(
        'This student is confirmed or a payment was started for them, so they cannot be removed here. Please contact the CNA team.',
      );
    return {
      files: STUDENT_DOCUMENTS.map((k) => person.documents?.[k]).filter(
        (f): f is string => Boolean(f),
      ),
    };
  }
}
