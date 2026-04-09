"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Folder,
  FolderOpen,
  Heart,
  Scale,
  Shield,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { adminApi } from "@/lib/api";
import type { PromptVersion, Audience } from "@/lib/api";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import LogoLoader from "@/components/ui/LogoLoader";
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

const ICON_MAP: Record<string, LucideIcon> = {
  Heart,
  Users,
  Scale,
  Shield,
  Briefcase,
  UserCheck,
};

const COLOR_MAP: Record<
  string,
  { color: string; folderActive: string; badgeBg: string }
> = {
  rose: {
    color: "text-rose-600",
    folderActive: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
    badgeBg: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  },
  amber: {
    color: "text-amber-600",
    folderActive: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
    badgeBg: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  },
  indigo: {
    color: "text-indigo-600",
    folderActive: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800",
    badgeBg: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  },
  emerald: {
    color: "text-emerald-600",
    folderActive: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
    badgeBg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  sky: {
    color: "text-sky-600",
    folderActive: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800",
    badgeBg: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  },
  violet: {
    color: "text-violet-600",
    folderActive: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800",
    badgeBg: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  },
  slate: {
    color: "text-slate-600",
    folderActive: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/40 dark:text-slate-300 dark:border-slate-700",
    badgeBg: "bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300",
  },
  orange: {
    color: "text-orange-600",
    folderActive: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800",
    badgeBg: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  },
};

const DEFAULT_STYLE = COLOR_MAP.slate;

function getAudienceFolderStyle(audiencesList: Audience[], code: string) {
  const a = audiencesList.find((x) => x.code === code);
  const colors = COLOR_MAP[a?.color ?? "slate"] ?? DEFAULT_STYLE;
  const Icon = ICON_MAP[a?.icon ?? "Users"] || Users;
  return {
    label: a?.label ?? code,
    icon: Icon,
    ...colors,
  };
}

/** Matches audiences table Status column styling */
const PROMPT_STATUS_ACTIVE_CLASS =
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
const PROMPT_STATUS_INACTIVE_CLASS =
  "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400";

export function PromptAdminContent() {
  type ActiveFilter = "all" | "active" | "deactive";
  type ConfirmAction = "delete" | null;

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
  const [isActive, setIsActive] = useState(true);
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
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

  const folderAudiences = audiences.filter((a) => a.is_active).length > 0
    ? audiences.filter((a) => a.is_active)
    : audiences;

  const folderBadgeStyle =
    audienceFilter !== "all" ? getAudienceFolderStyle(audiences, audienceFilter) : null;
  const FolderBadgeIcon = folderBadgeStyle?.icon;

  const openAddModal = () => {
    setEditingId(null);
    setName("");
    setSystem("");
    setIsActive(true);
    const defaultAud =
      audienceFilter !== "all"
        ? audienceFilter
        : folderAudiences.length > 0
          ? folderAudiences[0].code
          : audiences.length > 0
            ? audiences[0].code
            : "";
    setAudience(defaultAud);
    setIsModalOpen(true);
    setSuccess("");
    setError("");
  };

  const openEditModal = (row: PromptVersion) => {
    setEditingId(row.id);
    setName(row.name);
    setSystem(row.components.system);
    setAudience(row.audience);
    setIsActive(row.is_active);
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
          is_active: isActive,
        });
        setSuccess("Prompt version updated.");
      } else {
        await adminApi.createPromptVersion({
          name: name.trim(),
          system: system.trim(),
          audience,
          is_active: isActive,
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

  const openDeleteConfirm = (row: PromptVersion) => {
    setConfirmAction("delete");
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

  const onConfirmDelete = async () => {
    if (!confirmTarget) return;
    setConfirmLoading(true);
    setPendingRowId(confirmTarget.id);
    setError("");
    setSuccess("");
    try {
      await remove(confirmTarget.id);
      await load(page);
      setConfirmAction(null);
      setConfirmTarget(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete version.");
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
          Manage prompt versions and keep exactly one active version. Pick an audience folder to filter the table, or
          All versions to see every prompt.
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

        <div className="mt-6 flex min-h-0 border-t border-brand-warm-gray/30 pt-6 dark:border-border">
          <div
            className={`shrink-0 border-r border-brand-warm-gray/30 transition-all dark:border-border ${
              sidebarOpen ? "w-56" : "w-0 overflow-hidden border-r-0"
            }`}
          >
            {sidebarOpen && (
              <nav className="p-3 pr-4" aria-label="Prompt versions by audience">
                <button
                  type="button"
                  onClick={() => {
                    setAudienceFilter("all");
                    setPage(1);
                  }}
                  className={`mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    audienceFilter === "all"
                      ? "bg-brand-navy-dark text-white shadow-sm dark:bg-primary dark:text-primary-foreground"
                      : "text-brand-slate hover:bg-brand-cream/60 hover:text-brand-navy-dark dark:text-muted-foreground dark:hover:bg-muted/50 dark:hover:text-foreground"
                  }`}
                >
                  {audienceFilter === "all" ? (
                    <FolderOpen className="h-4 w-4 shrink-0" />
                  ) : (
                    <Folder className="h-4 w-4 shrink-0" />
                  )}
                  All versions
                </button>
                <div className="ml-2 border-l border-brand-warm-gray/30 pl-1 dark:border-border">
                  {folderAudiences.map((a) => {
                    const style = getAudienceFolderStyle(audiences, a.code);
                    const Icon = style.icon;
                    const isActive = audienceFilter === a.code;
                    return (
                      <button
                        key={a.code}
                        type="button"
                        onClick={() => {
                          setAudienceFilter(a.code);
                          setPage(1);
                        }}
                        className={`mb-0.5 flex w-full items-center gap-2 rounded-lg border border-transparent px-3 py-2 text-sm font-medium transition-colors ${
                          isActive
                            ? `${style.folderActive} shadow-sm`
                            : "text-brand-slate hover:bg-brand-cream/60 hover:text-brand-navy-dark dark:text-muted-foreground dark:hover:bg-muted/50 dark:hover:text-foreground"
                        }`}
                      >
                        {isActive ? (
                          <FolderOpen className={`h-4 w-4 shrink-0 ${style.color}`} />
                        ) : (
                          <Folder className="h-4 w-4 shrink-0" />
                        )}
                        <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? style.color : ""}`} />
                        <span className="truncate">{a.label}</span>
                      </button>
                    );
                  })}
                </div>
              </nav>
            )}
          </div>

          <div className="min-w-0 flex-1 pl-4 sm:pl-5">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSidebarOpen((v) => !v)}
                className={adminOutlineButtonClass}
                aria-label={sidebarOpen ? "Hide audience folders" : "Show audience folders"}
              >
                {sidebarOpen ? (
                  <ChevronLeft className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {folderBadgeStyle && FolderBadgeIcon && (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${folderBadgeStyle.badgeBg}`}
                >
                  <FolderBadgeIcon className="h-3 w-3" />
                  {folderBadgeStyle.label}
                </span>
              )}
            </div>

            {error && <p className={`mb-3 ${adminErrorTextClass}`}>{error}</p>}
            {success && <p className={`mb-3 ${adminSuccessTextClass}`}>{success}</p>}
            {loading && rows.length === 0 ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 py-12">
                <LogoLoader size={52} />
                <div className={`max-w-sm text-center ${adminMutedTextClass}`}>
                  <p className="font-semibold text-brand-navy-dark dark:text-foreground">Loading prompt versions</p>
                  <p className="mt-1 text-sm">Fetching the list from the server. Large tables may take a moment.</p>
                </div>
              </div>
            ) : rows.length === 0 ? (
              <p className={adminMutedTextClass}>No versions loaded yet.</p>
            ) : (
              <div className="relative min-w-0 overflow-hidden">
                {loading && (
                  <div
                    className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-lg bg-white/75 backdrop-blur-[2px] dark:bg-background/75"
                    role="status"
                    aria-live="polite"
                    aria-busy="true"
                  >
                    <LogoLoader size={44} />
                    <p className={`text-sm ${adminMutedTextClass}`}>Updating the prompt list…</p>
                  </div>
                )}
                <table className={`${adminTableClass} w-full table-fixed`}>
                  <colgroup>
                    {/* Narrow created column; system prompt col (no width) absorbs remaining table width. */}
                    <col style={{ width: "12rem" }} />
                    <col style={{ width: "14rem" }} />
                    <col />
                    <col style={{ width: "8.5rem" }} />
                    <col style={{ width: "6.5rem" }} />
                    <col style={{ width: "11rem" }} />
                  </colgroup>
                  <thead>
                    <tr className={adminTableHeadRowClass}>
                      <th className="align-top px-3 py-2">
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
                      <th className="align-top px-3 py-2">Prompt Version Title</th>
                      <th className="align-top px-3 py-2">System Prompt</th>
                      <th className="align-top px-3 py-2">Audience</th>
                      <th className="align-top px-3 py-2 text-center">Status</th>
                      <th className="align-top px-3 py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className={adminTableBodyClass}>
                    {rows.map((row) => {
                      const createdStr = new Date(row.created_at).toLocaleString();
                      return (
                      <tr key={row.id}>
                        <td className="align-top overflow-hidden px-3 py-2 text-brand-slate dark:text-muted-foreground">
                          <span className="block whitespace-nowrap" title={createdStr}>
                            {createdStr}
                          </span>
                        </td>
                        <td className="align-top overflow-hidden px-3 py-2 font-semibold text-brand-navy-dark dark:text-foreground">
                          <span className="block whitespace-normal break-words [overflow-wrap:anywhere]">
                            {row.name}
                          </span>
                        </td>
                        <td className="min-w-0 align-top overflow-hidden px-3 py-2 text-brand-slate dark:text-muted-foreground">
                          <span className="block truncate" title={row.components.system}>
                            {row.components.system}
                          </span>
                        </td>
                        <td className="align-top overflow-hidden px-3 py-2 text-brand-slate dark:text-muted-foreground">
                          <span className="block whitespace-normal break-words [overflow-wrap:anywhere]">
                            {audienceLabel(row.audience)}
                          </span>
                        </td>
                        <td className="align-top px-3 py-2 text-center">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                              row.is_active ? PROMPT_STATUS_ACTIVE_CLASS : PROMPT_STATUS_INACTIVE_CLASS
                            }`}
                          >
                            {row.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="align-top whitespace-nowrap px-3 py-2">
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
                              onClick={() => openDeleteConfirm(row)}
                              className={adminTableDeleteButtonClass}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className={`mt-4 flex items-center justify-between ${adminMutedTextClass}`}>
              <p>
                Page {page} of {totalPages}
                {loading && rows.length > 0 ? " — updating list" : ""}
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
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4"
                />
                <span className={`${adminMutedTextClass} font-normal`}>Active</span>
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
        open={confirmAction === "delete" && confirmTarget !== null}
        title="Confirm Delete"
        description={
          confirmTarget ? `Are you sure you want to delete "${confirmTarget.name}"?` : ""
        }
        confirmLabel="Yes"
        cancelLabel="No"
        loading={confirmLoading}
        onCancel={closeConfirm}
        onConfirm={() => void onConfirmDelete()}
      />
    </div>
  );
}
