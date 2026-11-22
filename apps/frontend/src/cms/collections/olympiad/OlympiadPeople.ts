import type { CollectionConfig, PayloadHandler, PayloadRequest, Where } from "payload";
import { decryptText, deleteFiles, readFile, type DocumentKind } from "../../../lib/olympiad/secure";
import { peopleWorkbook } from "../../../lib/olympiad/peopleExport";
import { canEdit, canManageRecords, hiddenFromAuthors, handlesRecords } from "../../access";
import { groupOptions, messageStatusOptions, quizLanguageOptions, roundOptions, schoolTypeOptions, districtOptions } from "./options";

const round = (n: number) => ({ name: `r${n}`, label: `Round ${n}`, type: "select" as const, options: roundOptions });

const DOCUMENT_KINDS: DocumentKind[] = ["photo", "aadhaarCard", "schoolIdCard"];
const SEARCHABLE = ["regId", "name", "whatsapp", "mobile", "email", "institution", "code"];
const SHOWN_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const privateHeaders = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "X-Robots-Tag": "noindex" };
const notFound = () => Response.json({ message: "Not found" }, { status: 404, headers: privateHeaders });

/** The person behind a document or Aadhaar request; only Admins, Editors and Officers get past this. */
async function personFor(req: PayloadRequest) {
  if (!handlesRecords(req.user)) return null;
  return req.payload
    .findByID({ collection: "olympiad-people", id: String(req.routeParams?.id ?? ""), depth: 0, overrideAccess: true, disableErrors: true })
    .catch(() => null);
}

/** Opens one uploaded document, decrypted on the fly; nothing decrypted is ever stored. */
const showDocument: PayloadHandler = async (req) => {
  const kind = String(req.routeParams?.kind ?? "") as DocumentKind;
  const person = DOCUMENT_KINDS.includes(kind) ? await personFor(req) : null;
  const fileId = person?.documents?.[kind];
  const file = fileId ? await readFile(req.payload, fileId) : null;
  if (!person || !file) return notFound();
  const type = SHOWN_TYPES.includes(file.contentType) ? file.contentType : "application/octet-stream";
  return new Response(new Uint8Array(file.body), {
    headers: { ...privateHeaders, "Content-Type": type, "Content-Disposition": `inline; filename="${person.regId}-${kind}"` },
  });
};

/** The full Aadhaar number, fetched only when someone on the team clicks "Show". */
const showAadhaar: PayloadHandler = async (req) => {
  const person = await personFor(req);
  if (!person?.aadhaarEnc) return notFound();
  const aadhaar = decryptText(person.aadhaarEnc).replace(/(\d{4})(?=\d)/g, "$1 ");
  return Response.json({ aadhaar }, { headers: privateHeaders });
};

/** The list as an Excel file, with the filters the admin has applied; Aadhaar shows only its last 4 digits. */
const exportPeople: PayloadHandler = async (req) => {
  if (!handlesRecords(req.user)) return notFound();
  const filters = (req.query?.where ?? {}) as Where;
  // The list's search box searches these fields, as Payload's own list does.
  const search = typeof req.query?.search === "string" ? req.query.search.trim().slice(0, 100) : "";
  const searched: Where = search ? { or: SEARCHABLE.map((field) => ({ [field]: { like: search } })) } : {};
  const { docs } = await req.payload.find({
    collection: "olympiad-people",
    where: search ? { and: [filters, searched] } : filters,
    sort: "-createdAt",
    pagination: false,
    depth: 0,
    // As the signed-in user, so filters can only use fields that user may read (not hashes or ciphertext).
    overrideAccess: false,
    user: req.user,
  });
  const body = await peopleWorkbook(docs);
  const day = new Date().toISOString().slice(0, 10);
  return new Response(new Uint8Array(body), {
    headers: {
      ...privateHeaders,
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="olympiad-master-list-${day}.xlsx"`,
    },
  });
};

const hiddenSecret = { admin: { hidden: true }, access: { read: () => false, update: () => false } };
/** Written only by the Olympiad API. An admin save keeps the stored value instead of writing back what the page loaded. */
const apiOwned = { access: { update: () => false } };

/**
 * The Olympiad master list: one row per person. "Remind me" creates a Reminder row; registering turns
 * the same row into a Registered one. Rows are written by the Olympiad API (apps/backend), never
 * through this admin's public API (personal data, DPDP Act); the admin views, edits and exports them.
 */
export const OlympiadPeople: CollectionConfig = {
  slug: "olympiad-people",
  labels: { singular: "Person", plural: "Master list" },
  admin: {
    hidden: hiddenFromAuthors,
    group: "Olympiad",
    useAsTitle: "name",
    defaultColumns: ["regId", "name", "group", "paymentStatus", "type", "institution", "stage", "district", "whatsapp", "registeredAt"],
    listSearchableFields: SEARCHABLE,
    description: "Everyone who asked for a reminder or registered, in one list. Click a number to filter, then export or message.",
    components: {
      beforeListTable: ["@/components/admin/OlympiadOverview#OlympiadOverview", "@/components/admin/ExportPeople#ExportPeople"],
    },
  },
  access: { create: () => false, read: canManageRecords, update: canManageRecords, delete: canEdit },
  endpoints: [
    { path: "/:id/document/:kind", method: "get", handler: showDocument },
    { path: "/:id/aadhaar", method: "get", handler: showAadhaar },
    { path: "/export", method: "get", handler: exportPeople },
  ],
  hooks: {
    // Deleting a person deletes their documents too.
    afterDelete: [
      ({ doc, req }) =>
        deleteFiles(
          req.payload,
          DOCUMENT_KINDS.map((k) => doc.documents?.[k]),
        ),
    ],
  },
  defaultSort: "-createdAt",
  indexes: [{ fields: ["whatsapp", "type"] }, { fields: ["meta.ipHash", "createdAt"] }, { fields: ["name", "dob", "parentPhone"] }],
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "regId",
          label: "Reg. ID",
          type: "text",
          unique: true,
          admin: {
            readOnly: true,
            description:
              "AO2-<group>-<number>: given when the fee is paid (Group 0: when the form is saved). Never changes. Empty while unpaid.",
          },
        },
        {
          name: "type",
          type: "select",
          required: true,
          index: true,
          options: [
            { label: "Reminder", value: "reminder" },
            { label: "Added by school, documents pending", value: "invited" },
            { label: "Registered", value: "registered" },
          ],
        },
        { name: "edition", type: "text", required: true, defaultValue: "2.0", index: true, admin: { readOnly: true } },
      ],
    },
    { name: "summary", type: "ui", admin: { components: { Field: "@/components/admin/OlympiadSummary#OlympiadSummary" } } },
    {
      type: "tabs",
      tabs: [
        {
          label: "Person",
          fields: [
            {
              type: "row",
              fields: [
                { name: "name", label: "Full name", type: "text", required: true, maxLength: 200 },
                {
                  name: "participant",
                  label: "Registered as",
                  type: "select",
                  options: [
                    { label: "Student", value: "student" },
                    { label: "Teacher", value: "teacher" },
                    { label: "Other (18+)", value: "adult" },
                  ],
                },
              ],
            },
            {
              type: "row",
              fields: [
                { name: "fatherName", label: "Father's name", type: "text" },
                { name: "motherName", label: "Mother's name", type: "text" },
              ],
            },
            {
              type: "row",
              fields: [
                { name: "fatherAlive", label: "Father alive", type: "checkbox" },
                { name: "motherAlive", label: "Mother alive", type: "checkbox" },
                {
                  name: "orphan",
                  label: "Orphan",
                  type: "checkbox",
                  index: true,
                  admin: { description: "Students whose parents have both passed away." },
                },
              ],
            },
            {
              type: "row",
              fields: [
                { name: "mobile", type: "text", admin: { description: "+91 and 10 digits." } },
                {
                  name: "whatsapp",
                  label: "WhatsApp number",
                  type: "text",
                  required: true,
                  index: true,
                  admin: { description: "+91 and 10 digits." },
                },
                {
                  name: "email",
                  type: "email",
                  admin: { description: "Required on the public forms; optional for students a school adds." },
                },
              ],
            },
            {
              name: "interest",
              label: "Asked about (reminder)",
              type: "select",
              options: [...groupOptions, { label: "A school or class", value: "school" }, { label: "Not sure yet", value: "unsure" }],
            },
            {
              type: "row",
              fields: [
                { name: "group", type: "select", index: true, options: groupOptions },
                { name: "dob", label: "Date of birth", type: "text", admin: { description: "YYYY-MM-DD" } },
                { name: "quizLanguage", type: "select", options: quizLanguageOptions },
                {
                  name: "quizWindow",
                  label: "Quiz dates (Rounds 1-3)",
                  type: "select",
                  options: [
                    { label: "1 to 15 Jan 2027", value: "jan-1-15" },
                    { label: "16 to 31 Jan 2027", value: "jan-16-31" },
                  ],
                },
                {
                  name: "formLanguage",
                  label: "Form language",
                  type: "select",
                  options: [
                    { label: "English", value: "en" },
                    { label: "Gujarati", value: "gu" },
                  ],
                  admin: { readOnly: true, description: "The receipt link in the confirmation opens in this language." },
                },
              ],
            },
            { name: "address", type: "textarea" },
            {
              type: "row",
              fields: [
                { name: "city", type: "text", index: true },
                { name: "district", type: "select", options: districtOptions },
                { name: "pin", label: "PIN code", type: "text" },
              ],
            },
            {
              type: "row",
              fields: [
                {
                  name: "parentRelation",
                  label: "Parent",
                  type: "select",
                  options: [
                    { label: "Father", value: "father" },
                    { label: "Mother", value: "mother" },
                    { label: "Other", value: "other" },
                  ],
                },
                { name: "parentName", type: "text" },
                { name: "parentPhone", type: "text" },
              ],
            },
          ],
        },
        {
          label: "School and work",
          fields: [
            {
              type: "row",
              fields: [
                { name: "institution", label: "School / college name", type: "text" },
                { name: "stage", label: "Std / year", type: "text" },
                { name: "schoolType", type: "select", index: true, options: schoolTypeOptions },
              ],
            },
            {
              type: "row",
              fields: [
                {
                  name: "govtStd6to8",
                  label: "Std 6 to 8 in a government school",
                  type: "checkbox",
                  index: true,
                  admin: { description: "Students under 16. Ticked means Group 0." },
                },
                { name: "quizDate", label: "Quiz date", type: "text", index: true },
                { name: "quizTime", label: "Quiz time", type: "text" },
              ],
            },
            {
              type: "row",
              fields: [
                { name: "schoolId", label: "School ID / GR number", type: "text" },
                { name: "contactRole", label: "School contact", type: "text" },
                { name: "contactName", label: "Contact name", type: "text" },
                { name: "contactPhone", label: "Contact mobile", type: "text" },
              ],
            },
            {
              type: "row",
              fields: [
                {
                  name: "teacherStatus",
                  label: "Teacher",
                  type: "select",
                  options: [
                    { label: "Teaching now", value: "current" },
                    { label: "Retired", value: "retired" },
                  ],
                },
                { name: "subject", type: "text" },
                { name: "work", label: "Work (18+)", type: "text" },
              ],
            },
            { name: "achievements", type: "text", hasMany: true },
          ],
        },
        {
          label: "Documents",
          fields: [
            {
              name: "documentsView",
              type: "ui",
              admin: { components: { Field: "@/components/admin/OlympiadDocuments#OlympiadDocuments" } },
            },
            { name: "aadhaarLast4", label: "Aadhaar (last 4 digits)", type: "text", ...apiOwned, admin: { readOnly: true } },
            {
              name: "documents",
              type: "group",
              ...apiOwned,
              admin: { hidden: true },
              fields: DOCUMENT_KINDS.map((name) => ({ name, type: "text" as const })),
            },
            // Encrypted by the website (OLYMPIAD_DATA_KEY); never sent to the browser.
            { name: "aadhaarEnc", type: "text", ...hiddenSecret },
            { name: "aadhaarHash", type: "text", index: true, ...hiddenSecret },
          ],
        },
        {
          label: "Payment and source",
          fields: [
            {
              type: "row",
              fields: [
                { name: "fee", label: "Fee (₹)", type: "number", min: 0 },
                {
                  name: "paymentStatus",
                  type: "select",
                  index: true,
                  options: [
                    { label: "Free (₹0)", value: "free" },
                    { label: "Pending", value: "pending" },
                    { label: "Paid", value: "paid" },
                    { label: "Failed", value: "failed" },
                  ],
                },
                { name: "paidAt", label: "Paid on", type: "date", ...apiOwned },
              ],
            },
            {
              type: "row",
              fields: [
                { name: "payment", type: "relationship", relationTo: "olympiad-payments", ...apiOwned, admin: { readOnly: true } },
                { name: "razorpayPaymentId", label: "Razorpay payment ID", type: "text", ...apiOwned, admin: { readOnly: true } },
                { name: "razorpayOrderId", label: "Razorpay order ID", type: "text", ...apiOwned, admin: { readOnly: true } },
              ],
            },
            {
              name: "feeCheck",
              label: "Check the school proof",
              type: "checkbox",
              defaultValue: false,
              index: true,
              admin: {
                description:
                  "Group 0 or Group B at the government fee, without an approved government school code. Check the School ID card / bonafide certificate.",
              },
            },
            {
              type: "row",
              fields: [
                {
                  name: "source",
                  type: "select",
                  defaultValue: "direct",
                  index: true,
                  options: [
                    { label: "Direct", value: "direct" },
                    { label: "School", value: "school" },
                    { label: "Ambassador", value: "ambassador" },
                  ],
                },
                { name: "code", label: "School code / referral code", type: "text", index: true },
              ],
            },
            {
              name: "wantsAmbassador",
              label: "Asked to be an Ambassador",
              type: "checkbox",
              ...apiOwned,
              admin: {
                readOnly: true,
                description: "Groups C, D and E. The Ambassador account is made automatically once the fee is paid.",
              },
            },
            {
              type: "row",
              fields: [
                { name: "school", type: "relationship", relationTo: "olympiad-schools", index: true },
                { name: "ambassador", type: "relationship", relationTo: "olympiad-ambassadors", index: true },
              ],
            },
          ],
        },
        {
          label: "Rounds",
          fields: [
            { name: "rounds", type: "group", fields: [{ type: "row", fields: [1, 2, 3, 4, 5].map(round) }] },
            { name: "scholarshipPct", label: "Scholarship %", type: "number", min: 0, max: 100 },
          ],
        },
        {
          label: "Consent and messages",
          fields: [
            {
              name: "consent",
              type: "group",
              ...apiOwned,
              admin: { readOnly: true },
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "at", label: "Consent given on", type: "date" },
                    { name: "version", label: "Consent text version", type: "text" },
                  ],
                },
              ],
            },
            {
              name: "rules",
              label: "Rules and Terms",
              type: "group",
              ...apiOwned,
              admin: { readOnly: true },
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "at", label: "Agreed on", type: "date" },
                    { name: "version", label: "Rules version", type: "text" },
                  ],
                },
              ],
            },
            {
              name: "parentConsent",
              type: "group",
              ...apiOwned,
              admin: { readOnly: true, description: "Under 18: the parent fills in and submits the form." },
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "requestedAt", label: "Link sent on", type: "date" },
                    { name: "at", label: "Parent confirmed on", type: "date" },
                  ],
                },
              ],
            },
            {
              type: "row",
              fields: [
                { name: "whatsappStopped", label: "WhatsApp stopped", type: "checkbox", defaultValue: false, index: true },
                { name: "emailStopped", label: "Email stopped", type: "checkbox", defaultValue: false, index: true },
              ],
            },
            {
              name: "lastMessage",
              type: "group",
              ...apiOwned,
              admin: { readOnly: true },
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "template", type: "text" },
                    {
                      name: "channel",
                      type: "select",
                      options: [
                        { label: "WhatsApp", value: "whatsapp" },
                        { label: "Email", value: "email" },
                      ],
                    },
                    { name: "status", type: "select", options: messageStatusOptions },
                    { name: "at", type: "date" },
                  ],
                },
                { name: "providerId", type: "text", index: true, admin: { hidden: true } },
              ],
            },
            { name: "notes", type: "textarea", admin: { description: "Visible to the CNA team only." } },
          ],
        },
      ],
    },
    { name: "registeredAt", type: "date", ...apiOwned, admin: { position: "sidebar", readOnly: true } },
    { name: "inviteSentAt", label: "Parent link emailed", type: "date", ...apiOwned, admin: { position: "sidebar", readOnly: true } },
    {
      name: "meta",
      type: "group",
      ...apiOwned,
      admin: { position: "sidebar", readOnly: true },
      fields: [
        // Keyed hash of the sender's IP: consent proof and rate limiting without keeping the IP itself.
        { name: "ipHash", type: "text", admin: { hidden: true } },
        { name: "consentIpHash", type: "text", admin: { hidden: true } },
        { name: "parentConsentIpHash", type: "text", admin: { hidden: true } },
      ],
    },
  ],
};
