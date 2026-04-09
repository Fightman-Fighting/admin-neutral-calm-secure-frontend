"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { adminApi } from "@/lib/api";
import type { PromptVersion, Audience } from "@/lib/api";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import {
  adminErrorTextClass,
  adminInputClass,
  adminLabelClass,
  adminModalWidePanelClass,
  adminMutedTextClass,
  adminOutlineButtonClass,
  adminPaginationButtonClass,
  adminPanelClass,
  adminPrimaryCtaClass,
  adminPrimarySubmitClass,
  adminSuccessTextClass,
  adminTableBodyClass,
  adminTableClass,
  adminTableDeleteButtonClass,
  adminTableEditButtonClass,
  adminTableHeadRowClass,
  adminTableSortButtonClass,
  adminTextareaClass,
  adminTitleH1Class,
  adminTitleH3Class,
} from "@/components/admin/adminUi";

export function PromptAdminContent() {
  type ActiveFilter = "all" | "active" | "deactive";
  type ConfirmAction = "activate" | "delete" | null;

  const [audiences, setAudiences] = useState<Audience[]>([]);
  const audiencesFetched = useRef(false);

  const fetchAudiences = useCallback(async () => {
    if (audiencesFetched.current) return;
    audiencesFetched.current = true;
    try {
      const res = await adminApi.listAudiences();
      if (res.audiences.length > 0) setAudiences(res.audiences);
    } catch {
      /* fall through — dropdown will be empty until retry */
    }
  }, []);

  useEffect(() => { void fetchAudiences(); }, [fetchAudiences]);

  const audienceLabel = (key: string): string => {
    const found = audiences.find((a) => a.code === key);
    return found ? found.label : key;
  };

  const [name, setName] = useState("");
  const [system, setSystem] = useState("");
  const [audience, setAudience] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [rows, setRows] = useState<PromptVersion[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [audienceFilter, setAudienceFilter] = useState("all");
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [confirmTarget, setConfirmTarget] = useState<PromptVersion | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [pendingRowId, setPendingRowId] = useState<string | null>(null);
  const pageSize = 10;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const isEditing = Boolean(editingId);

  const load = async (targetPage = page) => {
    setLoading(true);
    setError("");
    try {
      const data = await adminApi.listPromptVersions({
        page: targetPage,
        pageSize,
        search,
        sortDir,
        activeState: activeFilter,
        audience: audienceFilter,
      });
      setRows(data.prompt_versions);
      setTotal(data.total);
      setPage(data.page);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load prompt versions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sortDir, activeFilter, audienceFilter]);

  const openAddModal = () => {
    setEditingId(null);
    setName("");
    setSystem("");
    setAudience(audiences.length > 0 ? audiences[0].code : "");
    setIsModalOpen(true);
    setSuccess("");
    setError("");
  };

  const openEditModal = (row: PromptVersion) => {
    setEditingId(row.id);
    setName(row.name);
    setSystem(row.components.system);
    setAudience(row.audience);
    setIsModalOpen(true);
    setSuccess("");
    setError("");
  };

  const closeModal = (force = false) => {
    if (submitting && !force) return;
    setIsModalOpen(false);
    setEditingId(null);
  };

  const submitModal = async () => {
    if (!name.trim() || !system.trim()) {
      setError("Prompt version title and system prompt are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      if (editingId) {
        await adminApi.updatePromptVersion(editingId, {
          name: name.trim(),
          system: system.trim(),
          audience,
        });
        setSuccess("Prompt version updated.");
      } else {
        await adminApi.createPromptVersion({
          name: name.trim(),
          system: system.trim(),
          audience,
          is_active: false,
        });
        setSuccess("Prompt version created.");
      }
      closeModal(true);
      await load(page);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save prompt version.");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    setError("");
    setSuccess("");
    try {
      await adminApi.deletePromptVersion(id);
      setSuccess("Prompt version deleted.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete version.");
      throw err;
    }
  };

  const openConfirm = (action: Exclude<ConfirmAction, null>, row: PromptVersion) => {
    setConfirmAction(action);
    setConfirmTarget(row);
    setConfirmLoading(false);
    setError("");
    setSuccess("");
  };

  const closeConfirm = () => {
    if (confirmLoading) return;
    setConfirmAction(null);
    setConfirmTarget(null);
  };

  const onConfirm = async () => {
    if (!confirmAction || !confirmTarget) return;
    setConfirmLoading(true);
    setPendingRowId(confirmTarget.id);
    setError("");
    setSuccess("");
    try {
      if (confirmAction === "activate") {
        await adminApi.activatePromptVersion(confirmTarget.id);
        setSuccess("Prompt version activated.");
      } else {
        await remove(confirmTarget.id);
      }
      await load(page);
      setConfirmAction(null);
      setConfirmTarget(null);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : confirmAction === "activate"
            ? "Failed to activate version."
            : "Failed to delete version."
      );
    } finally {
      setConfirmLoading(false);
      setPendingRowId(null);
    }
  };

  const onSearchSubmit = async () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <div className="space-y-6">
      <div className={adminPanelClass}>
        <h1 className={adminTitleH1Class}>Prompt admin</h1>
        <p className={`mt-2 ${adminMutedTextClass}`}>
          Manage prompt versions and keep exactly one active version.
        </p>

        <div className="mt-4 flex w-full flex-wrap items-end justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-end gap-3">
            <label className="w-full max-w-[220px] sm:max-w-[240px]">
              <span className={adminLabelClass}>Search title or system prompt</span>
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void onSearchSubmit();
                }}
                className={adminInputClass}
                placeholder="Search..."
              />
            </label>
            <button type="button" onClick={() => void onSearchSubmit()} className={adminOutlineButtonClass}>
              Search
            </button>
            <label className="min-w-[180px]">
              <span className={adminLabelClass}>Audience</span>
              <select
                value={audienceFilter}
                onChange={(e) => setAudienceFilter(e.target.value)}
                className={adminInputClass}
              >
                <option value="all">All</option>
                {audiences.map((a) => (
                  <option key={a.code} value={a.code}>{a.label}</option>
                ))}
              </select>
            </label>
            <label className="min-w-[180px]">
              <span className={adminLabelClass}>Active</span>
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value as ActiveFilter)}
                className={adminInputClass}
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="deactive">Deactive</option>
              </select>
            </label>
          </div>
          <button type="button" onClick={openAddModal} className={adminPrimaryCtaClass}>
            + ADD NEW PROMPT
          </button>
        </div>

        {error && <p className={`mt-6 ${adminErrorTextClass}`}>{error}</p>}
        {success && <p className={`mt-6 ${adminSuccessTextClass}`}>{success}</p>}
        {loading && rows.length === 0 ? (
          <p className={`mt-6 ${adminMutedTextClass}`}>Loading versions...</p>
        ) : rows.length === 0 ? (
          <p className={`mt-6 ${adminMutedTextClass}`}>No versions loaded yet.</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className={adminTableClass}>
              <thead>
                <tr className={adminTableHeadRowClass}>
                  <th className="px-3 py-2">
                    <span className="inline-flex items-center gap-1">
                      Created
                      <button
                        type="button"
                        onClick={() => setSortDir((prev) => (prev === "desc" ? "asc" : "desc"))}
                        className={adminTableSortButtonClass}
                        aria-label={sortDir === "desc" ? "Sort oldest first" : "Sort newest first"}
                      >
                        {sortDir === "desc" ? "↓" : "↑"}
                      </button>
                    </span>
                  </th>
                  <th className="px-3 py-2">Prompt Version Title</th>
                  <th className="px-3 py-2 min-w-[440px]">System Prompt</th>
                  <th className="px-3 py-2">Audience</th>
                  <th className="px-3 py-2">Active</th>
                  <th className="px-3 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className={adminTableBodyClass}>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-3 py-2 text-brand-slate dark:text-muted-foreground">
                      {new Date(row.created_at).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 font-semibold text-brand-navy-dark dark:text-foreground">{row.name}</td>
                    <td className="max-w-[640px] truncate px-3 py-2 text-brand-slate dark:text-muted-foreground">
                      {row.components.system}
                    </td>
                    <td className="px-3 py-2 text-brand-slate dark:text-muted-foreground">
                      {audienceLabel(row.audience)}
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={row.is_active}
                        disabled={confirmLoading || pendingRowId === row.id || row.is_active}
                        onChange={() => {
                          if (row.is_active) return;
                          openConfirm("activate", row);
                        }}
                        className="h-4 w-4"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          disabled={submitting || confirmLoading || pendingRowId === row.id}
                          onClick={() => openEditModal(row)}
                          className={adminTableEditButtonClass}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={submitting || confirmLoading || pendingRowId === row.id}
                          onClick={() => openConfirm("delete", row)}
                          className={adminTableDeleteButtonClass}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className={`mt-4 flex items-center justify-between ${adminMutedTextClass}`}>
          <p>
            Page {page} of {totalPages}
            {loading ? " (Loading...)" : ""}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={loading || page <= 1}
              onClick={() => void load(page - 1)}
              className={adminPaginationButtonClass}
            >
              Previous
            </button>
            <button
              type="button"
              disabled={loading || page >= totalPages}
              onClick={() => void load(page + 1)}
              className={adminPaginationButtonClass}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => {
            if (e.currentTarget === e.target) closeModal();
          }}
        >
          <div className={adminModalWidePanelClass}>
            <h3 className={adminTitleH3Class}>
              {isEditing ? "Edit Prompt Version" : "Add Prompt Version"}
            </h3>
            <div className="mt-4 space-y-4">
              <label className="block">
                <span className={adminLabelClass}>Prompt Version Name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} className={adminInputClass} />
              </label>
              <label className="block">
                <span className={adminLabelClass}>Audience</span>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className={adminInputClass}
                  disabled={audiences.length === 0}
                >
                  {audiences.length === 0 && <option value="">Loading...</option>}
                  {audiences.map((a) => (
                    <option key={a.code} value={a.code}>{a.label}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={adminLabelClass}>Prompt Edit (Add)</span>
                <textarea
                  value={system}
                  onChange={(e) => setSystem(e.target.value)}
                  rows={12}
                  className={adminTextareaClass}
                  spellCheck={false}
                />
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => closeModal()}
                disabled={submitting}
                className={adminOutlineButtonClass}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => void submitModal()}
                className={adminPrimarySubmitClass}
              >
                {submitting ? "Saving..." : isEditing ? "Save" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
      <AdminConfirmDialog
        open={confirmAction !== null && confirmTarget !== null}
        title={
          confirmAction === "activate"
            ? "Confirm Activate"
            : confirmAction === "delete"
              ? "Confirm Delete"
              : "Confirm"
        }
        description={
          confirmTarget && confirmAction === "activate"
            ? `Are you sure you want to activate "${confirmTarget.name}"?`
            : confirmTarget && confirmAction === "delete"
              ? `Are you sure you want to delete "${confirmTarget.name}"?`
              : ""
        }
        confirmLabel="Yes"
        cancelLabel="No"
        loading={confirmLoading}
        onCancel={closeConfirm}
        onConfirm={() => void onConfirm()}
      />
    </div>
  );
}
