"use client";

import {
  adminCancelButtonDisabledClass,
  adminModalNarrowPanelClass,
  adminMutedTextClass,
  adminPrimarySubmitClass,
  adminTitleH3Class,
} from "@/components/admin/adminUi";

export type AdminConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Controlled confirm overlay — same chrome as Prompt admin delete/activate confirmation.
 */
export function AdminConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Yes",
  cancelLabel = "No",
  loading = false,
  onConfirm,
  onCancel,
}: AdminConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onClick={(e) => {
        if (e.currentTarget === e.target && !loading) onCancel();
      }}
    >
      <div
        className={adminModalNarrowPanelClass}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="admin-confirm-title" className={adminTitleH3Class}>
          {title}
        </h3>
        <p className={`mt-2 ${adminMutedTextClass}`}>{description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className={adminCancelButtonDisabledClass}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={adminPrimarySubmitClass}
          >
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
