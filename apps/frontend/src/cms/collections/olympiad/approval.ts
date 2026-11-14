import type { CollectionAfterChangeHook, CollectionBeforeChangeHook } from "payload";
import { ValidationError } from "payload";
import { backendPost } from "../../backend";

const kindOf = (slug: string) => (slug === "olympiad-schools" ? "school" : "ambassador");

/** The first approval gives an Ambassador or School its code from the Olympiad API; the code then never changes. */
export const assignCodeOnApproval: CollectionBeforeChangeHook = async ({ data, originalDoc, collection }) => {
  if (data.status !== "approved" || originalDoc?.code) return data;
  try {
    const { code } = await backendPost<{ code: string }>(`/olympiad/partners/${kindOf(collection.slug)}/code`, {
      district: data.district ?? originalDoc?.district,
    });
    data.code = code;
  } catch (err) {
    console.error("[olympiad] code request failed", err);
    throw new ValidationError({
      collection: collection.slug,
      errors: [{ path: "status", message: "Couldn't get a code from the Olympiad server. Please try approving again in a minute." }],
    });
  }
  data.approvedAt = new Date().toISOString();
  return data;
};

/** Asks the Olympiad API to send the welcome message, once, right after the first approval. */
export const notifyOnApproval: CollectionAfterChangeHook = async ({ doc, previousDoc, collection }) => {
  if (doc.status !== "approved" || previousDoc?.status === "approved" || !doc.code) return doc;
  const kind = kindOf(collection.slug);
  const partner =
    kind === "school"
      ? { name: doc.coordinator?.name, whatsapp: doc.coordinator?.whatsapp, email: doc.coordinator?.email, schoolName: doc.name }
      : { name: doc.name, whatsapp: doc.whatsapp, email: doc.email };
  try {
    await backendPost("/olympiad/partners/approved", { kind, id: String(doc.id), code: doc.code, ...partner });
  } catch (err) {
    // The approval stands; only the message is missing, and the team can share the code by hand.
    console.error(`[olympiad] approval message failed for ${collection.slug} ${doc.id}`, err);
  }
  return doc;
};
