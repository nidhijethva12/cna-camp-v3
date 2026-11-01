import type { Access, FieldAccess } from "payload";

export type Role = "admin" | "editor" | "author";

export const roles: { label: string; value: Role }[] = [
  { label: "Admin: everything, including accounts", value: "admin" },
  { label: "Editor: all site content, no accounts", value: "editor" },
  { label: "Author: blog drafts only", value: "author" },
];

export const roleOf = (user: unknown): Role | undefined =>
  user && typeof user === "object" && "role" in user ? (user.role as Role) : undefined;

export const anyone: Access = () => true;
export const signedIn: Access = ({ req }) => Boolean(req.user);

/** Admins and Editors: everything except accounts. */
export const canEdit: Access = ({ req }) => roleOf(req.user) === "admin" || roleOf(req.user) === "editor";

export const isAdmin: Access = ({ req }) => roleOf(req.user) === "admin";
export const isAdminField: FieldAccess = ({ req }) => roleOf(req.user) === "admin";

/** Drafts stay private: the public only reads published documents. */
export const publishedOrSignedIn: Access = ({ req }) => (req.user ? true : { _status: { equals: "published" } });

/** Keeps a collection or global out of an Author's menu; the access rules above still decide what they can do. */
export const hiddenFromAuthors = ({ user }: { user: unknown }) => roleOf(user) === "author";
