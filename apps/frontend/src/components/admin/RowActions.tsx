"use client";

import { ConfirmationModal, EditIcon, toast, useAuth, useConfig, useModal, useRouteCache, useSelection } from "@payloadcms/ui";
import { TrashIcon } from "@payloadcms/ui/icons/Trash";
import Link from "next/link";
import type { DefaultCellComponentProps } from "payload";

/** Edit (pencil) and Delete (trash) for a ticked row of an admin list. Delete shows only to roles allowed to delete, and asks first. */
export function RowActions({ collectionSlug, rowData }: DefaultCellComponentProps) {
  const {
    config: {
      routes: { admin, api },
    },
  } = useConfig();
  const { permissions } = useAuth();
  const { openModal } = useModal();
  const { clearRouteCache } = useRouteCache();
  const { selected } = useSelection();

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

  // The icons show on ticked rows only, so the list stays calm until someone picks a row to act on.
  if (!selected.get(rowData.id as number | string)) return null;

  return (
    <div className="cna-row-actions">
      <Link href={`${admin}/collections/${collectionSlug}/${id}`} className="cna-row-actions__button" aria-label="Edit" title="Edit">
        <EditIcon />
      </Link>
      {canDelete && (
        <>
          <button
            type="button"
            className="cna-row-actions__button cna-row-actions__delete"
            aria-label="Delete"
            title="Delete"
            onClick={() => openModal(modalSlug)}
          >
            <TrashIcon />
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
