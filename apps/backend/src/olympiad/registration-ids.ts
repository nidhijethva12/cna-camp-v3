import { createToken, DAY } from './tokens.js';

/**
 * A real Registration ID, AO2-<group>-<000123>: given when the fee is paid (Group 0: when the form is
 * saved) and never changed. A reminder's REM- or an invitation's INV- number is not one.
 */
export const hasRegId = (row?: { regId?: string } | null) =>
  !!row?.regId?.startsWith('AO2-');

/** The link token for a person's registration receipt; it works for two years. */
export const receiptToken = (row: { _id: unknown }) =>
  createToken('receipt', String(row._id), 730 * DAY);
