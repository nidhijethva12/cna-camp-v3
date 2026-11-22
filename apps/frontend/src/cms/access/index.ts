import type { Access, FieldAccess } from "payload";

export type Role = "admin" | "editor" | "officer" | "author";

export const roles: { label: string; value: Role }[] = [
  { label: "Admin: everything, including accounts", value: "admin" },
  { label: "Editor: all site content, no accounts", value: "editor" },
  { label: "Officer: enquiries and Olympiad records only, no site content", value: "officer" },
  { label: "Author: blog drafts only", value: "author" },
];

export const roleOf = (user: unknown): Role | undefined =>
  user && typeof user === "object" && "role" in user ? (user.role as Role) : undefined;

const hasRole = (user: unknown, ...allowed: Role[]) => {
  const role = roleOf(user);
  return role !== undefined && allowed.includes(role);
};

export const anyone: Access = () => true;

/** Everyone who writes for the site: Admins, Editors and Authors. Officers only handle records. */
export const canWriteContent: Access = ({ req }) => hasRole(req.user, "admin", "editor", "author");

/** Who may open what people send in: enquiries, Olympiad registrations, payments, schools and Ambassadors. */
export const handlesRecords = (user: unknown) => hasRole(user, "admin", "editor", "officer");
export const canManageRecords: Access = ({ req }) => handlesRecords(req.user);

/** Admins and Editors: everything except accounts. */
export const canEdit: Access = ({ req }) => roleOf(req.user) === "admin" || roleOf(req.user) === "editor";

export const isAdmin: Access = ({ req }) => roleOf(req.user) === "admin";
export const isAdminField: FieldAccess = ({ req }) => roleOf(req.user) === "admin";

/** Drafts stay private: the public only reads published documents. */
export const publishedOrSignedIn: Access = ({ req }) => (req.user ? true : { _status: { equals: "published" } });

/** Keeps a collection or global out of an Author's menu; the access rules above still decide what they can do. */
export const hiddenFromAuthors = ({ user }: { user: unknown }) => roleOf(user) === "author";

/** Site content (pages, trips, settings) stays out of the menu for Authors and Officers. */
export const contentHidden = ({ user }: { user: unknown }) => hasRole(user, "author", "officer");

/** What Authors work on (blog posts, photos) but Officers don't. */
export const hiddenFromOfficers = ({ user }: { user: unknown }) => roleOf(user) === "officer";
