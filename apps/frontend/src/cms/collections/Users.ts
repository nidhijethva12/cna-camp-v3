import type {
  Access,
  CollectionBeforeChangeHook,
  CollectionBeforeDeleteHook,
  CollectionBeforeOperationHook,
  CollectionBeforeValidateHook,
  CollectionConfig,
  PayloadRequest,
} from "payload";
import { APIError, ValidationError } from "payload";
import { isAdmin, isAdminField, roleOf, roles } from "../access";

const isProduction = process.env.NODE_ENV === "production";

/** Admins see and change every account; everyone else only their own. */
const adminOrSelf: Access = ({ req: { user } }) => (roleOf(user) === "admin" ? true : user ? { id: { equals: user.id } } : false);

const MIN_PASSWORD_LENGTH = 12;

function checkPassword(password: unknown, email: unknown, collection: string) {
  if (typeof password !== "string" || !password) return;
  const emailName = String(email ?? "")
    .toLowerCase()
    .split("@")[0];
  const problems: string[] = [];
  if (password.length < MIN_PASSWORD_LENGTH) problems.push(`be at least ${MIN_PASSWORD_LENGTH} characters`);
  if (!/[a-z]/i.test(password) || !/\d/.test(password)) problems.push("include letters and numbers");
  if (emailName && password.toLowerCase().includes(emailName)) problems.push("not contain your email name");
  if (/^(.)\1+$/.test(password) || /password|cnacamp|123456|qwerty/i.test(password)) problems.push("not be a common password");

  if (problems.length) {
    throw new ValidationError({ collection, errors: [{ path: "password", message: `Password must ${problems.join("; ")}.` }] });
  }
}

/** Runs before Payload hashes the password, so the raw value can be checked. */
const enforcePasswordPolicy: CollectionBeforeValidateHook = ({ data, collection }) => {
  checkPassword(data?.password, data?.email, collection.slug);
  return data;
};

/** Password reset hashes before `beforeValidate` runs, so the new password is checked here instead. */
const enforcePolicyOnReset: CollectionBeforeOperationHook = ({ args, operation, collection }) => {
  if (operation === "resetPassword") checkPassword(args.data?.password, null, collection.slug);
  return args;
};

const adminCount = async (req: PayloadRequest) =>
  (await req.payload.count({ collection: "users", where: { role: { equals: "admin" } }, req })).totalDocs;

const LAST_ADMIN = "At least one Admin account must remain, so the site always has someone who can manage accounts.";

/** The very first account (made on /admin's first-user screen) is the Admin. */
const firstAccountIsAdmin: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  if (operation !== "create") return data;
  // A plain find: MongoDB can't run a whole-collection count inside the transaction a save runs in.
  const { docs } = await req.payload.find({ collection: "users", limit: 1, depth: 0, pagination: false, req });
  if (!docs.length) data.role = "admin";
  return data;
};

const keepLastAdminRole: CollectionBeforeChangeHook = async ({ data, originalDoc, operation, req }) => {
  if (operation === "update" && originalDoc?.role === "admin" && data.role && data.role !== "admin" && (await adminCount(req)) <= 1) {
    throw new APIError(LAST_ADMIN, 400, null, true);
  }
  return data;
};

const keepLastAdmin: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const doc = await req.payload.findByID({ collection: "users", id, depth: 0, req });
  if (doc.role === "admin" && (await adminCount(req)) <= 1) throw new APIError(LAST_ADMIN, 400, null, true);
};

/**
 * Site accounts, each with a role: Admin (everything, including accounts), Editor (all site content)
 * or Author (blog drafts only). Only Admins add or remove accounts and change roles; nobody can delete
 * their own account, and the last Admin can't be removed or demoted, so the site is never left without one.
 */
export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "Account", plural: "Accounts" },
  admin: {
    group: "Settings",
    useAsTitle: "email",
    defaultColumns: ["name", "email", "role"],
    hidden: ({ user }) => roleOf(user) !== "admin",
  },
  auth: {
    useSessions: true,
    tokenExpiration: 2 * 60 * 60,
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    removeTokenFromResponses: true,
    cookies: { secure: isProduction, sameSite: "Strict" },
    forgotPassword: { expiration: 30 * 60 * 1000 },
  },
  hooks: {
    beforeOperation: [enforcePolicyOnReset],
    beforeValidate: [enforcePasswordPolicy],
    beforeChange: [firstAccountIsAdmin, keepLastAdminRole],
    beforeDelete: [keepLastAdmin],
  },
  access: {
    create: isAdmin,
    read: adminOrSelf,
    update: adminOrSelf,
    delete: ({ req: { user } }) => (roleOf(user) === "admin" ? { id: { not_equals: user?.id } } : false),
  },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "author",
      options: roles,
      saveToJWT: true,
      access: { create: isAdminField, update: isAdminField },
      admin: { description: "What this account can do. Only an Admin can change it." },
    },
  ],
};
