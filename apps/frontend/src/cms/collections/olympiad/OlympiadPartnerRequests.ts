import type { CollectionAfterChangeHook, CollectionConfig } from "payload";
import { canEdit, hiddenFromAuthors } from "../../access";

type Ref = string | { id: string } | null | undefined;
const idOf = (ref: Ref) => (ref && typeof ref === "object" ? ref.id : ref) || null;

/**
 * Approving an Ambassador request creates (or approves) the Ambassador, which gives them a code and
 * sends the welcome message. School requests are approved by adding the school under Olympiad → Schools.
 */
const approveAmbassador: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  if (doc.kind !== "ambassador" || doc.status !== "approved" || previousDoc?.status === "approved" || idOf(doc.ambassador)) return doc;
  const { payload } = req;
  const found = await payload.find({
    collection: "olympiad-ambassadors",
    where: { whatsapp: { equals: doc.phone } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
    req,
  });
  const ambassador = found.docs[0]
    ? await payload.update({
        collection: "olympiad-ambassadors",
        id: found.docs[0].id,
        data: { status: "approved" },
        overrideAccess: true,
        req,
      })
    : await payload.create({
        collection: "olympiad-ambassadors",
        data: { status: "approved", name: doc.name, whatsapp: doc.phone, email: doc.email || undefined },
        overrideAccess: true,
        req,
      });
  await payload.update({
    collection: "olympiad-partner-requests",
    id: doc.id,
    data: { ambassador: ambassador.id },
    overrideAccess: true,
    req,
    context: { skipRevalidate: true },
  });
  return { ...doc, ambassador: ambassador.id };
};

/** Sign-ups from the "For schools and teachers" form: one list for both kinds, filtered by "Register as". */
export const OlympiadPartnerRequests: CollectionConfig = {
  slug: "olympiad-partner-requests",
  labels: { singular: "School / Ambassador request", plural: "School & Ambassador requests" },
  admin: {
    hidden: hiddenFromAuthors,
    group: "Olympiad",
    useAsTitle: "name",
    defaultColumns: ["name", "kind", "phone", "email", "status", "createdAt"],
    listSearchableFields: ["name", "phone", "email", "message"],
    description: "Sign-ups from the Olympiad page. Approving an Ambassador request gives them their code automatically.",
  },
  // Personal data (DPDP Act): the signed-in admin only; rows are created by the site's server action.
  access: { create: () => false, read: canEdit, update: canEdit, delete: canEdit },
  defaultSort: "-createdAt",
  hooks: { afterChange: [approveAmbassador] },
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "kind",
          label: "Register as",
          type: "select",
          required: true,
          index: true,
          options: [
            { label: "School", value: "school" },
            { label: "Ambassador", value: "ambassador" },
          ],
        },
        {
          name: "status",
          type: "select",
          required: true,
          defaultValue: "new",
          index: true,
          options: [
            { label: "New", value: "new" },
            { label: "Contacted", value: "contacted" },
            { label: "Approved", value: "approved" },
            { label: "Not approved", value: "rejected" },
          ],
        },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "name", label: "Full name", type: "text", required: true, maxLength: 80 },
        {
          name: "phone",
          label: "Phone / WhatsApp",
          type: "text",
          required: true,
          index: true,
          admin: { description: "+91 and 10 digits." },
        },
        { name: "email", type: "email" },
      ],
    },
    { name: "message", type: "textarea", maxLength: 1000 },
    {
      type: "row",
      fields: [
        {
          name: "ambassador",
          type: "relationship",
          relationTo: "olympiad-ambassadors",
          admin: { readOnly: true, description: "Created on approval." },
        },
        {
          name: "school",
          type: "relationship",
          relationTo: "olympiad-schools",
          admin: { description: "Link the school once it is added." },
        },
      ],
    },
    { name: "notes", type: "textarea", admin: { description: "Visible to the CNA team only." } },
    {
      name: "meta",
      type: "group",
      admin: { position: "sidebar", readOnly: true },
      fields: [
        { name: "sourcePath", type: "text" },
        { name: "ipHash", type: "text", index: true, admin: { hidden: true } },
      ],
    },
  ],
};
