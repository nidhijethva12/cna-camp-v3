import { Schema, type Types } from 'mongoose';

/** Collection names follow the website's Payload config, which owns the indexes. */
export const EXPEDITION_COLLECTIONS = {
  registrations: 'expedition-registrations',
  counters: 'expedition-counters',
  globals: 'globals',
} as const;

export const EXPEDITION_MODELS = {
  registration: 'ExpeditionRegistration',
  counter: 'ExpeditionCounter',
  global: 'ExpeditionGlobal',
} as const;

export const GENDERS = ['female', 'male', 'undisclosed'] as const;
export type Gender = (typeof GENDERS)[number];

/** How far a WhatsApp message got. "waiting": paid, but the Zoom link was not set yet. */
export type MessageStatus =
  'waiting' | 'skipped' | 'sent' | 'delivered' | 'read' | 'failed';

export interface ExpeditionMessage {
  status?: MessageStatus;
  providerId?: string;
  error?: string;
  at?: Date;
}

/** One person's registration for the Sarasvati - Sindhu Darshan Yatra information meeting. */
export interface ExpeditionDoc {
  _id: Types.ObjectId;
  regId?: string;
  name: string;
  /** E.164, e.g. +919825012345. One registration per number. */
  whatsapp: string;
  district: string;
  age: number;
  gender: Gender;
  status: 'pending' | 'paid' | 'failed';
  /** Rupees. */
  fee: number;
  /** Every Razorpay order opened for this registration; a payment for any of them confirms it. */
  orders: string[];
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paidAt?: Date;
  /** A second payment arrived for a registration that was already paid. */
  needsRefund?: boolean;
  failureReason?: string;
  /** The confirmation with the Zoom link. */
  message?: ExpeditionMessage;
  /** The reminder on the meeting day. */
  reminder?: ExpeditionMessage;
  /** "Send again" presses from the public page, to cap them. */
  resends?: number;
  agreedAt?: Date;
  ipHash?: string;
  createdAt?: Date;
}

const message = {
  status: String,
  providerId: String,
  error: String,
  at: Date,
};

export const ExpeditionSchema = new Schema<ExpeditionDoc>(
  {
    regId: String,
    name: String,
    whatsapp: String,
    district: String,
    age: Number,
    gender: String,
    status: String,
    fee: Number,
    orders: [String],
    razorpayOrderId: String,
    razorpayPaymentId: String,
    paidAt: Date,
    needsRefund: Boolean,
    failureReason: String,
    message,
    reminder: message,
    resends: Number,
    agreedAt: Date,
    ipHash: String,
  },
  { timestamps: true, autoIndex: false },
);

export const ExpeditionCounterSchema = new Schema<{
  key: string;
  value: number;
}>(
  { key: { type: String, unique: true }, value: Number },
  { timestamps: true, autoIndex: true },
);

/** The website's settings documents (Payload globals), read-only here. */
export const ExpeditionGlobalSchema = new Schema(
  { globalType: String },
  { strict: false, autoIndex: false },
);
