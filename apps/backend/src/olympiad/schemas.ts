import { Schema, Types } from 'mongoose';

/**
 * MongoDB shapes of the Olympiad collections. The website's Payload admin defines the same
 * collections (apps/frontend/src/cms/collections/olympiad) and owns their indexes, so these schemas
 * must match its field names exactly. Collection names are the ones Payload's Mongoose adapter uses.
 */

const { ObjectId } = Schema.Types;
const base = { timestamps: true, autoIndex: false } as const;

export const COLLECTIONS = {
  people: 'olympiad-peoples',
  partnerRequests: 'olympiad-partner-requests',
  ambassadors: 'olympiad-ambassadors',
  schools: 'olympiad-schools',
  payments: 'olympiad-payments',
  counters: 'olympiad-counters',
  referralClicks: 'olympiad-referral-clicks',
  globals: 'globals',
} as const;

export const MODELS = {
  person: 'OlympiadPerson',
  partnerRequest: 'OlympiadPartnerRequest',
  ambassador: 'OlympiadAmbassador',
  school: 'OlympiadSchool',
  payment: 'OlympiadPayment',
  counter: 'OlympiadCounter',
  referralClick: 'OlympiadReferralClick',
  global: 'PayloadGlobal',
} as const;

export interface LastMessage {
  template?: string;
  channel?: 'whatsapp' | 'email';
  status?: 'queued' | 'sent' | 'delivered' | 'read' | 'failed' | 'skipped';
  at?: Date;
  providerId?: string;
}

export interface PersonDoc {
  _id: Types.ObjectId;
  /**
   * AO2-<group>-<000123> for a registration, given once the fee is paid (Group 0: when the form is
   * saved) and never changed; REM-/INV- for reminders and school invitations; absent while unpaid.
   */
  regId?: string;
  /** "invited": added by a school from Excel; the parent's link turns it into "registered". */
  type: 'reminder' | 'invited' | 'registered';
  edition: string;
  name: string;
  whatsapp: string;
  email?: string;
  interest?: string;
  stage?: string;
  group?: string;
  dob?: string;
  institution?: string;
  schoolType?: string;
  /** Students under 16: Std 6 to 8 fully in a government school (or in Std 8 there); true is Group 0. */
  govtStd6to8?: boolean;
  /** Std 10, Std 12 and Group C: the quiz slot they picked. */
  quizDate?: string;
  quizTime?: string;
  city?: string;
  district?: string;
  quizLanguage?: string;
  /** The fortnight for quiz Rounds 1 to 3: jan-1-15 or jan-16-31. */
  quizWindow?: string;
  /** The language the form was filled in; the receipt link opens in it. */
  formLanguage?: 'en' | 'gu';
  parentName?: string;
  parentPhone?: string;
  participant?: 'student' | 'teacher' | 'adult';
  parentRelation?: string;
  fatherName?: string;
  motherName?: string;
  /** Students: whether each parent is alive; an orphan has neither. */
  fatherAlive?: boolean;
  motherAlive?: boolean;
  orphan?: boolean;
  mobile?: string;
  address?: string;
  pin?: string;
  schoolId?: string;
  contactRole?: string;
  contactName?: string;
  contactPhone?: string;
  teacherStatus?: string;
  subject?: string;
  work?: string;
  achievements?: string[];
  aadhaarLast4?: string;
  /** Keyed hash of the Aadhaar number: finds a repeat registration without decrypting anything. */
  aadhaarHash?: string;
  /** AES-256-GCM, encrypted and decrypted only by the website (OLYMPIAD_DATA_KEY). */
  aadhaarEnc?: string;
  /** Ids of the encrypted files the website keeps in its olympiad-files collection. */
  documents?: {
    photo?: string;
    aadhaarCard?: string;
    schoolIdCard?: string;
  };
  fee?: number;
  /** "free": a ₹0 registration (Group 0); "paid" is set only by Razorpay's webhook. */
  paymentStatus?: 'free' | 'pending' | 'paid' | 'failed';
  paidAt?: Date;
  payment?: Types.ObjectId;
  razorpayPaymentId?: string;
  /** The Razorpay order the registration was paid with. */
  razorpayOrderId?: string;
  feeCheck?: boolean;
  source?: 'direct' | 'school' | 'ambassador';
  code?: string;
  school?: Types.ObjectId;
  ambassador?: Types.ObjectId;
  /** Group C, D or E: asked to become an Ambassador; the account is made once the fee is paid. */
  wantsAmbassador?: boolean;
  consent?: { at?: Date; version?: string };
  /** The Rules and Terms the person agreed to. */
  rules?: { at?: Date; version?: string };
  parentConsent?: { requestedAt?: Date; at?: Date };
  whatsappStopped?: boolean;
  emailStopped?: boolean;
  lastMessage?: LastMessage;
  rounds?: { r1?: string; r2?: string; r3?: string; r4?: string; r5?: string };
  scholarshipPct?: number;
  notes?: string;
  registeredAt?: Date;
  /** When the school's import emailed the parent their link. */
  inviteSentAt?: Date;
  meta?: {
    ipHash?: string;
    consentIpHash?: string;
    parentConsentIpHash?: string;
  };
  createdAt: Date;
}

const lastMessage = {
  template: String,
  channel: String,
  status: String,
  at: Date,
  providerId: String,
};

export const PersonSchema = new Schema<PersonDoc>(
  {
    regId: String,
    type: String,
    edition: String,
    name: String,
    whatsapp: String,
    email: String,
    interest: String,
    stage: String,
    group: String,
    dob: String,
    institution: String,
    schoolType: String,
    govtStd6to8: Boolean,
    quizDate: String,
    quizTime: String,
    city: String,
    district: String,
    quizLanguage: String,
    quizWindow: String,
    formLanguage: String,
    parentName: String,
    parentPhone: String,
    participant: String,
    parentRelation: String,
    fatherName: String,
    motherName: String,
    fatherAlive: Boolean,
    motherAlive: Boolean,
    orphan: Boolean,
    mobile: String,
    address: String,
    pin: String,
    schoolId: String,
    contactRole: String,
    contactName: String,
    contactPhone: String,
    teacherStatus: String,
    subject: String,
    work: String,
    achievements: [String],
    aadhaarLast4: String,
    aadhaarHash: String,
    aadhaarEnc: String,
    documents: {
      photo: String,
      aadhaarCard: String,
      schoolIdCard: String,
    },
    fee: Number,
    paymentStatus: String,
    paidAt: Date,
    payment: { type: ObjectId },
    razorpayPaymentId: String,
    razorpayOrderId: String,
    feeCheck: Boolean,
    source: String,
    code: String,
    school: { type: ObjectId },
    ambassador: { type: ObjectId },
    wantsAmbassador: Boolean,
    rounds: { r1: String, r2: String, r3: String, r4: String, r5: String },
    scholarshipPct: Number,
    consent: { at: Date, version: String },
    rules: { at: Date, version: String },
    parentConsent: { requestedAt: Date, at: Date },
    whatsappStopped: Boolean,
    emailStopped: Boolean,
    lastMessage,
    notes: String,
    registeredAt: Date,
    inviteSentAt: Date,
    meta: {
      ipHash: String,
      consentIpHash: String,
      parentConsentIpHash: String,
    },
  },
  base,
);

// One registration per Aadhaar number and edition. The only index the API builds itself (see
// RegistrationsService); Payload owns all the others.
PersonSchema.index(
  { edition: 1, aadhaarHash: 1 },
  {
    unique: true,
    partialFilterExpression: { aadhaarHash: { $type: 'string' } },
  },
);

export interface PartnerRequestDoc {
  _id: Types.ObjectId;
  kind: 'school' | 'ambassador';
  status: 'new' | 'contacted' | 'approved' | 'rejected';
  name: string;
  phone: string;
  email?: string;
  message?: string;
  ambassador?: Types.ObjectId;
  school?: Types.ObjectId;
  notes?: string;
  meta?: { sourcePath?: string; ipHash?: string };
}

export const PartnerRequestSchema = new Schema<PartnerRequestDoc>(
  {
    kind: String,
    status: String,
    name: String,
    phone: String,
    email: String,
    message: String,
    ambassador: { type: ObjectId },
    school: { type: ObjectId },
    notes: String,
    meta: { sourcePath: String, ipHash: String },
  },
  base,
);

export interface PartnerLogin {
  newPassword?: string | null;
  passwordHash?: string;
  passwordSetAt?: Date;
  lastLoginAt?: Date;
  failedAttempts?: number;
  lockedUntil?: Date | null;
  /** Last "forgot password" email, to space them out. */
  resetSentAt?: Date;
}

const login = {
  newPassword: String,
  passwordHash: String,
  passwordSetAt: Date,
  lastLoginAt: Date,
  failedAttempts: Number,
  lockedUntil: Date,
  resetSentAt: Date,
};

export interface AmbassadorDoc {
  _id: Types.ObjectId;
  status: 'pending' | 'approved' | 'blocked';
  code?: string;
  approvedAt?: Date;
  name: string;
  whatsapp: string;
  email?: string;
  city?: string;
  role?: string;
  stats?: { clicks?: number; registered?: number; paid?: number };
  rewards?: { milestone: number; givenOn: Date; note?: string }[];
  login?: PartnerLogin;
  notes?: string;
  meta?: { consentAt?: Date; ipHash?: string };
}

export const AmbassadorSchema = new Schema<AmbassadorDoc>(
  {
    status: String,
    code: String,
    approvedAt: Date,
    name: String,
    whatsapp: String,
    email: String,
    city: String,
    role: String,
    stats: { clicks: Number, registered: Number, paid: Number },
    rewards: [{ milestone: Number, givenOn: Date, note: String }],
    login,
    notes: String,
    meta: { consentAt: Date, ipHash: String },
  },
  base,
);

export interface SchoolDoc {
  _id: Types.ObjectId;
  status: 'pending' | 'approved' | 'blocked';
  code?: string;
  approvedAt?: Date;
  name: string;
  udise: string;
  type: string;
  district: string;
  principal: string;
  coordinator: { name: string; whatsapp: string; email: string };
  stats?: { students?: number; paid?: number };
  login?: PartnerLogin;
  notes?: string;
  meta?: { consentAt?: Date; ipHash?: string };
}

export const SchoolSchema = new Schema<SchoolDoc>(
  {
    status: String,
    code: String,
    approvedAt: Date,
    name: String,
    udise: String,
    type: String,
    district: String,
    principal: String,
    coordinator: { name: String, whatsapp: String, email: String },
    stats: { students: Number, paid: Number },
    login,
    notes: String,
    meta: { consentAt: Date, ipHash: String },
  },
  base,
);

export interface PaymentDoc {
  _id: Types.ObjectId;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  receipt: string;
  amount: number;
  status: 'created' | 'paid' | 'failed';
  mode: 'single' | 'bulk';
  paidBy: 'participant' | 'school';
  people: Types.ObjectId[];
  school?: Types.ObjectId;
  paidAt?: Date;
  failureReason?: string;
  /** Money taken for someone already paid or on a newer order; CNA refunds it in Razorpay. */
  needsRefund?: boolean;
}

export const PaymentSchema = new Schema<PaymentDoc>(
  {
    razorpayOrderId: String,
    razorpayPaymentId: String,
    receipt: String,
    amount: Number,
    status: String,
    mode: String,
    paidBy: String,
    people: [{ type: ObjectId }],
    school: { type: ObjectId },
    paidAt: Date,
    failureReason: String,
    needsRefund: Boolean,
  },
  base,
);

/** Owned by this API (the admin never shows it), so it builds its own unique index. */
export const CounterSchema = new Schema<{ key: string; value: number }>(
  { key: { type: String, unique: true }, value: Number },
  { timestamps: true, autoIndex: true },
);

/** One row per visitor per day per Ambassador link; the unique index makes a repeat open a no-op. */
export const ReferralClickSchema = new Schema<{
  ambassador: Types.ObjectId;
  visitor: string;
  day: string;
}>(
  { ambassador: { type: ObjectId, index: true }, visitor: String, day: String },
  { timestamps: true, autoIndex: true },
);
ReferralClickSchema.index(
  { ambassador: 1, visitor: 1, day: 1 },
  { unique: true },
);

/** Payload stores every global in one collection, told apart by `globalType`. Read-only here. */
export const GlobalSchema = new Schema(
  { globalType: String },
  { strict: false, autoIndex: false },
);
