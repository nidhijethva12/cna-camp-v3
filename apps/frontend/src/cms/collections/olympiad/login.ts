import type { CollectionBeforeChangeHook, Field, FieldHook } from "payload";
import { ValidationError } from "payload";
import { hashPassword, passwordProblem } from "../../../lib/olympiad/password";

/**
 * Dashboard login for Schools and Ambassadors. CNA types a password here and shares it with the
 * partner; only a salted hash is kept, and the typed password is cleared before saving.
 */
export const loginFields = (emailPath: string): Field => ({
  name: "login",
  label: "Dashboard login",
  type: "group",
  admin: {
    description: `The partner logs in with the email above (${emailPath}). Approving emails them a link to choose their own password; you can also type one here and save.`,
  },
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "newPassword",
          label: "New password",
          type: "text",
          admin: { autoComplete: "new-password", placeholder: "At least 10 letters and numbers" },
        },
        { name: "passwordSetAt", label: "Password set on", type: "date", admin: { readOnly: true } },
        { name: "lastLoginAt", label: "Last login", type: "date", admin: { readOnly: true } },
      ],
    },
    // Never sent to the browser, not even to the admin; the site's server code reads it with full access.
    { name: "passwordHash", type: "text", access: { read: () => false }, admin: { hidden: true } },
    { name: "failedAttempts", type: "number", defaultValue: 0, access: { read: () => false }, admin: { hidden: true } },
    { name: "lockedUntil", type: "date", access: { read: () => false }, admin: { hidden: true } },
    { name: "resetSentAt", type: "date", access: { read: () => false }, admin: { hidden: true } },
  ],
});

/** Login emails are matched exactly, so they are stored trimmed and lower-case. */
export const lowerCaseEmail: FieldHook = ({ value }) => (typeof value === "string" ? value.trim().toLowerCase() : value);

/** Hashes a newly typed password, and makes sure the partner has a unique login email first. */
export const hashNewPassword: CollectionBeforeChangeHook = async ({ data, originalDoc, req, collection }) => {
  // The email check reads outside the save's transaction: a read inside it, followed by the slow
  // password hash, intermittently aborted the transaction on Atlas.
  const typed = data.login?.newPassword;
  if (!typed) return data;
  const isSchool = collection.slug === "olympiad-schools";
  const email = String((isSchool ? (data.coordinator?.email ?? originalDoc?.coordinator?.email) : (data.email ?? originalDoc?.email)) ?? "")
    .trim()
    .toLowerCase();
  const path = isSchool ? "coordinator.email" : "email";
  const fail = (message: string, at = "login.newPassword") => {
    throw new ValidationError({ collection: collection.slug, errors: [{ path: at, message }] });
  };
  if (!email) fail("Add an email first: the partner logs in with it.", path);
  const problem = passwordProblem(typed);
  if (problem) fail(problem);

  const clash = await req.payload.find({
    collection: collection.slug as "olympiad-schools" | "olympiad-ambassadors",
    where: { and: [{ [path]: { equals: email } }, ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : [])] },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  if (clash.docs.length) fail("Another partner already uses this email to log in. Use a different email.", path);

  data.login = {
    ...originalDoc?.login,
    ...data.login,
    newPassword: null,
    passwordHash: await hashPassword(typed),
    passwordSetAt: new Date().toISOString(),
    failedAttempts: 0,
    lockedUntil: null,
  };
  return data;
};
