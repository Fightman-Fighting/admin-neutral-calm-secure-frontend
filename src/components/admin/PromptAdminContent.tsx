"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import type { PromptVersion } from "@/lib/api";

const inputClass =
  "mt-1 w-full rounded-lg border border-brand-warm-gray/40 bg-brand-cream/50 px-3 py-2 text-sm text-brand-navy-dark focus:border-brand-teal/50 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 dark:border-border dark:bg-muted/50 dark:text-foreground";
const textareaClass =
  "mt-1 w-full rounded-lg border border-brand-warm-gray/40 bg-brand-cream/50 p-3 font-mono text-sm text-brand-navy-dark focus:border-brand-teal/50 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 dark:border-border dark:bg-muted/50 dark:text-foreground";
const labelClass =
  "text-xs font-semibold uppercase tracking-wide text-brand-slate dark:text-muted-foreground";

function audienceLabel(key: string): string {
  if (key === "child") return "Child";
  if (key === "ex-partner") return "Ex-partner";
  if (key === "solicitor") return "Solicitor";
  return key;
}

export function PromptAdminContent() {
  type ActiveFilter = "all" | "active" | "deactive";
  type AudienceFilter = "all" | "child" | "ex-partner" | "solicitor";
  type ConfirmAction = "activate" | "delete" | null;

  const [name, setName] = useState("");
  const [system, setSystem] = useState("");
  const [audience, setAudience] = useState<"child" | "ex-partner" | "solicitor">("child");
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
  const [audienceFilter, setAudienceFilter] = useState<AudienceFilter>("all");
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
    setAudience("child");
    setIsModalOpen(true);
    setSuccess("");
    setError("");
  };

  const openEditModal = (row: PromptVersion) => {
    setEditingId(row.id);
    setName(row.name);
    setSystem(row.components.system);
    setAudience(row.audience === "solicitor" || row.audience === "ex-partner" ? row.audience : "child");
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
      <div className="overflow-hidden rounded-2xl border border-brand-warm-gray/40 bg-white p-5 shadow-lg shadow-brand-navy/5 dark:border-border/60 dark:bg-card sm:p-8">
        <h1 className="font-serif text-xl font-bold text-brand-navy-dark dark:text-foreground sm:text-2xl">
          Prompt admin
        </h1>
        <p className="mt-2 text-sm text-brand-slate dark:text-muted-foreground">
          Manage prompt versions and keep exactly one active version.
        </p>

        <div className="mt-4 flex w-full flex-wrap items-end justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-end gap-3">
            <label className="w-full max-w-[220px] sm:max-w-[240px]">
              <span className={labelClass}>Search title or system prompt</span>
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void onSearchSubmit();
                }}
                className={inputClass}
                placeholder="Search..."
              />
            </label>
            <button
              type="button"
              onClick={() => void onSearchSubmit()}
              className="rounded-lg border border-brand-warm-gray/40 px-3 py-2 text-sm transition-colors hover:bg-brand-cream/80 dark:border-border dark:hover:bg-muted/50"
            >
              Search
            </button>
            <label className="min-w-[180px]">
              <span className={labelClass}>Audience</span>
              <select
                value={audienceFilter}
                onChange={(e) => setAudienceFilter(e.target.value as AudienceFilter)}
                className={inputClass}
              >
                <option value="all">All</option>
                <option value="child">Child</option>
                <option value="ex-partner">Ex-partner</option>
                <option value="solicitor">Solicitor</option>
              </select>
            </label>
            <label className="min-w-[180px]">
              <span className={labelClass}>Active</span>
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value as ActiveFilter)}
                className={inputClass}
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="deactive">Deactive</option>
              </select>
            </label>
          </div>
          <button
            type="button"
            onClick={openAddModal}
            className="ml-auto shrink-0 rounded-full bg-brand-navy-dark px-5 py-2.5 text-sm font-semibold tracking-wide text-white shadow-md transition-all hover:bg-brand-navy hover:shadow-lg hover:shadow-brand-navy/20 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
          >
            + ADD NEW PROMPT
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-brand-warm-gray/40 bg-white p-5 shadow-lg shadow-brand-navy/5 dark:border-border/60 dark:bg-card sm:p-8">
        <h2 className="font-serif text-lg font-bold text-brand-navy-dark dark:text-foreground">Versions</h2>
        {error && <p className="mt-3 text-sm text-rose-700 dark:text-rose-400">{error}</p>}
        {success && <p className="mt-3 text-sm text-brand-teal-dark dark:text-brand-teal-light">{success}</p>}
        {loading && rows.length === 0 ? (
          <p className="mt-3 text-sm text-brand-slate dark:text-muted-foreground">Loading versions...</p>
        ) : rows.length === 0 ? (
          <p className="mt-3 text-sm text-brand-slate dark:text-muted-foreground">No versions loaded yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-brand-warm-gray/30 text-sm dark:divide-border">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-brand-slate dark:text-muted-foreground">
                  <th className="px-3 py-2">
                    <span className="inline-flex items-center gap-1">
                      Created
                      <button
                        type="button"
                        onClick={() => setSortDir((prev) => (prev === "desc" ? "asc" : "desc"))}
                        className="inline-flex min-h-[1.25rem] min-w-[1.25rem] items-center justify-center p-0 text-brand-slate hover:text-brand-navy-dark dark:text-muted-foreground dark:hover:text-foreground"
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
              <tbody className="divide-y divide-brand-warm-gray/20 dark:divide-border">
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
                          className="rounded-lg border border-brand-warm-gray/40 px-3 py-1.5 text-xs transition-colors hover:bg-brand-cream/80 disabled:opacity-60 dark:border-border dark:hover:bg-muted/50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={submitting || confirmLoading || pendingRowId === row.id}
                          onClick={() => openConfirm("delete", row)}
                          className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs text-rose-700 transition-colors hover:bg-rose-50 disabled:opacity-60 dark:border-rose-900/60 dark:text-rose-300 dark:hover:bg-rose-950/40"
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

        <div className="mt-4 flex items-center justify-between text-sm text-brand-slate dark:text-muted-foreground">
          <p>
            Page {page} of {totalPages}
            {loading ? " (Loading...)" : ""}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={loading || page <= 1}
              onClick={() => void load(page - 1)}
              className="rounded-lg border border-brand-warm-gray/40 px-3 py-1.5 disabled:opacity-60 dark:border-border"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={loading || page >= totalPages}
              onClick={() => void load(page + 1)}
              className="rounded-lg border border-brand-warm-gray/40 px-3 py-1.5 disabled:opacity-60 dark:border-border"
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
          <div className="w-full max-w-3xl rounded-2xl border border-brand-warm-gray/40 bg-white p-5 shadow-2xl dark:border-border dark:bg-card sm:p-8">
            <h3 className="font-serif text-lg font-bold text-brand-navy-dark dark:text-foreground">
              {isEditing ? "Edit Prompt Version" : "Add Prompt Version"}
            </h3>
            <div className="mt-4 space-y-4">
              <label className="block">
                <span className={labelClass}>Prompt Version Name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
              </label>
              <label className="block">
                <span className={labelClass}>Audience</span>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value as "child" | "ex-partner" | "solicitor")}
                  className={inputClass}
                >
                  <option value="child">Child</option>
                  <option value="ex-partner">Ex-partner</option>
                  <option value="solicitor">Solicitor</option>
                </select>
              </label>
              <label className="block">
                <span className={labelClass}>Prompt Edit (Add)</span>
                <textarea
                  value={system}
                  onChange={(e) => setSystem(e.target.value)}
                  rows={12}
                  className={textareaClass}
                  spellCheck={false}
                />
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => closeModal()}
                disabled={submitting}
                className="rounded-lg border border-brand-warm-gray/40 px-3 py-2 text-sm dark:border-border"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => void submitModal()}
                className="rounded-full bg-brand-navy-dark px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 dark:bg-primary dark:text-primary-foreground"
              >
                {submitting ? "Saving..." : isEditing ? "Save" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
      {confirmAction && confirmTarget && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => {
            if (e.currentTarget === e.target) closeConfirm();
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-brand-warm-gray/40 bg-white p-5 shadow-2xl dark:border-border dark:bg-card">
            <h3 className="font-serif text-lg font-bold text-brand-navy-dark dark:text-foreground">
              Confirm {confirmAction === "activate" ? "Activate" : "Delete"}
            </h3>
            <p className="mt-2 text-sm text-brand-slate dark:text-muted-foreground">
              {confirmAction === "activate"
                ? `Are you sure you want to activate "${confirmTarget.name}"?`
                : `Are you sure you want to delete "${confirmTarget.name}"?`}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeConfirm}
                disabled={confirmLoading}
                className="rounded-lg border border-brand-warm-gray/40 px-3 py-2 text-sm disabled:opacity-60 dark:border-border"
              >
                No
              </button>
              <button
                type="button"
                onClick={() => void onConfirm()}
                disabled={confirmLoading}
                className="rounded-full bg-brand-navy-dark px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 dark:bg-primary dark:text-primary-foreground"
              >
                {confirmLoading ? "Processing..." : "Yes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
