"use client";

import { ConfirmationModal, toast, useAuth, useConfig, useModal, useRouteCache } from "@payloadcms/ui";
import Link from "next/link";
import type { DefaultCellComponentProps } from "payload";

/** Edit and Delete for one row of an admin list. Delete shows only to roles allowed to delete, and asks first. */
export function RowActions({ collectionSlug, rowData }: DefaultCellComponentProps) {
  const {
    config: {
      routes: { admin, api },
    },
  } = useConfig();
  const { permissions } = useAuth();
  const { openModal } = useModal();
  const { clearRouteCache } = useRouteCache();

  const id = String(rowData.id);
  const modalSlug = `delete-${collectionSlug}-${id}`;
  // A paid payment is never deleted, so its row offers no button that could only fail.
  const locked = collectionSlug === "olympiad-payments" && rowData.status === "paid";
  const canDelete = !locked && Boolean(permissions?.collections?.[collectionSlug]?.delete);

  const remove = async () => {
    try {
      const res = await fetch(`${api}/${collectionSlug}/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { errors?: { message?: string }[] };
        toast.error(data.errors?.[0]?.message ?? "Could not delete this entry.");
        return;
      }
      toast.success("Deleted.");
      clearRouteCache();
    } catch {
      toast.error("Could not reach the server. Please try again.");
    }
  };

  return (
    <div className="cna-row-actions">
      <Link href={`${admin}/collections/${collectionSlug}/${id}`} className="btn btn--style-secondary btn--size-small">
        Edit
      </Link>
      {canDelete && (
        <>
          <button
            type="button"
            className="btn btn--style-secondary btn--size-small cna-row-actions__delete"
            onClick={() => openModal(modalSlug)}
          >
            Delete
          </button>
          <ConfirmationModal
            modalSlug={modalSlug}
            heading="Delete this entry?"
            body="This removes it permanently, with any files uploaded for it. It cannot be undone."
            confirmLabel="Delete"
            confirmingLabel="Deleting…"
            onConfirm={remove}
          />
        </>
      )}
    </div>
  );
}

/** A list-only column has nothing to show on the edit page. */
export const NoField = () => null;
