import "server-only";
import { headers } from "next/headers";
import { handlesRecords, roleOf } from "@/cms/access";
import { getCms } from "@/lib/payload";

export interface Staff {
  email: string;
  /** Only an Admin may record a fee taken at the office. */
  canRecordPayments: boolean;
}

/**
 * The staff member signed in to the admin in this browser, if their role handles Olympiad records
 * (Admin, Editor or Officer). Office registration and office payments are allowed only through this.
 */
export async function currentStaff(): Promise<Staff | null> {
  const payload = await getCms();
  const { user } = await payload.auth({ headers: await headers() });
  if (!user || !handlesRecords(user) || !user.email) return null;
  return { email: user.email, canRecordPayments: roleOf(user) === "admin" };
}
