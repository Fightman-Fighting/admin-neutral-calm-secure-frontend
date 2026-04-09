"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { GripVertical, Users, Heart, Scale, Shield, Briefcase, UserCheck, type LucideIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import LogoLoader from "@/components/ui/LogoLoader";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { adminApi, type Audience } from "@/lib/api";
import {
  adminErrorTextClass,
  adminInputClass,
  adminInputFlatClass,
  adminLabelClass,
  adminModalWidePanelClass,
  adminMutedTextClass,
  adminOutlineButtonClass,
  adminPanelClass,
  adminPrimaryCtaClass,
  adminPrimarySubmitClass,
  adminTableBodyClass,
  adminTableClass,
  adminTableDeleteButtonClass,
  adminTableEditButtonClass,
  adminTableHeadRowClass,
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

const ICON_OPTIONS = Object.keys(ICON_MAP);

const COLOR_OPTIONS = [
  { value: "rose", label: "Rose", swatch: "bg-rose-500" },
  { value: "amber", label: "Amber", swatch: "bg-amber-500" },
  { value: "indigo", label: "Indigo", swatch: "bg-indigo-500" },
  { value: "emerald", label: "Emerald", swatch: "bg-emerald-500" },
  { value: "sky", label: "Sky", swatch: "bg-sky-500" },
  { value: "violet", label: "Violet", swatch: "bg-violet-500" },
  { value: "slate", label: "Slate", swatch: "bg-slate-500" },
  { value: "orange", label: "Orange", swatch: "bg-orange-500" },
];

const COLOR_BADGE: Record<string, string> = {
  rose: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  indigo: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  sky: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  violet: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  slate: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400",
  orange: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

interface FormState {
  code: string;
  label: string;
  icon: string;
  color: string;
  aliases: string;
  sort_order: number;
  is_active: boolean;
}

const EMPTY_FORM: FormState = {
  code: "",
  label: "",
  icon: "Users",
  color: "slate",
  aliases: "",
  sort_order: 0,
  is_active: true,
};

export default function AudiencesPage() {
  const { user, loading: authLoading, profileRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteCode, setDeleteCode] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchAudiences = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.listAudiences();
      setAudiences(res.audiences);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load audiences");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && profileRole === "admin") void fetchAudiences();
  }, [user, profileRole, fetchAudiences]);

  const startCreate = () => {
    setError("");
    setEditingCode(null);
    setForm({
      ...EMPTY_FORM,
      sort_order:
        audiences.length > 0
          ? Math.max(...audiences.map((a) => a.sort_order)) + 10
          : 10,
    });
    setCreating(true);
  };

  const startEdit = (a: Audience) => {
    setError("");
    setCreating(false);
    setEditingCode(a.code);
    setForm({
      code: a.code,
      label: a.label,
      icon: a.icon,
      color: a.color,
      aliases: a.aliases.join(", "),
      sort_order: a.sort_order,
      is_active: a.is_active,
    });
  };

  const resetFormState = () => {
    setEditingCode(null);
    setCreating(false);
    setForm(EMPTY_FORM);
    setError("");
  };

  const closeModal = (force = false) => {
    if (saving && !force) return;
    resetFormState();
  };

  const handleSave = async () => {
    if (!form.code.trim() || !form.label.trim()) {
      setError("Code and label are required.");
      return;
    }
    setSaving(true);
    setError("");
    const aliasArr = form.aliases
      .split(",")
      .map((a) => a.trim().toLowerCase())
      .filter(Boolean);

    try {
      if (creating) {
        await adminApi.createAudience({
          code: form.code.trim(),
          label: form.label.trim(),
          icon: form.icon,
          color: form.color,
          aliases: aliasArr,
          sort_order: form.sort_order,
          is_active: form.is_active,
        });
      } else if (editingCode) {
        await adminApi.updateAudience(editingCode, {
          label: form.label.trim(),
          icon: form.icon,
          color: form.color,
          aliases: aliasArr,
          sort_order: form.sort_order,
          is_active: form.is_active,
        });
      }
      resetFormState();
      await fetchAudiences();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const closeDeleteDialog = () => {
    if (!deleteLoading) setDeleteCode(null);
  };

  const confirmDeleteAudience = async () => {
    if (!deleteCode) return;
    setDeleteLoading(true);
    setError("");
    const code = deleteCode;
    try {
      await adminApi.deleteAudience(code);
      setDeleteCode(null);
      await fetchAudiences();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  };

  const ready = Boolean(user && profileRole === "admin");
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-cream/50 dark:bg-background">
        <LogoLoader />
      </div>
    );
  }

  const IconPreview = ICON_MAP[form.icon] || Users;

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className={adminPanelClass}>
          <h1 className={adminTitleH1Class}>Audiences</h1>
          <p className={`mt-2 ${adminMutedTextClass}`}>
            Audiences represent the recipient categories users can write to (e.g. Child, Ex-partner, Solicitor).
            Adding an audience here makes it available in the user app&apos;s folder tree and the prompt admin&apos;s
            audience dropdown &mdash; no code changes required.
          </p>
          <div className="mt-4 flex w-full flex-wrap items-end justify-between gap-3">
            <div className="min-w-0 flex-1" />
            <button type="button" onClick={startCreate} className={adminPrimaryCtaClass}>
              + ADD AUDIENCE
            </button>
          </div>

          {error && !(creating || editingCode) && (
            <p className={`mt-6 ${adminErrorTextClass}`}>{error}</p>
          )}
          {loading ? (
            <div className="mt-6 flex min-h-[240px] flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-brand-warm-gray/40 bg-brand-cream/20 py-12 dark:border-border dark:bg-muted/20">
              <LogoLoader size={48} />
              <div className={`max-w-sm px-4 text-center ${adminMutedTextClass}`}>
                <p className="font-semibold text-brand-navy-dark dark:text-foreground">Loading audiences</p>
                <p className="mt-1 text-sm">Fetching audience records from the server.</p>
              </div>
            </div>
          ) : audiences.length === 0 ? (
            <p className={`mt-6 ${adminMutedTextClass}`}>
              No audiences configured yet. Use &ldquo;+ ADD AUDIENCE&rdquo; above to get started.
            </p>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className={adminTableClass}>
                <thead>
                  <tr className={adminTableHeadRowClass}>
                    <th className="w-8 px-3 py-2" />
                    <th className="px-3 py-2">Code</th>
                    <th className="px-3 py-2">Label</th>
                    <th className="px-3 py-2">Preview</th>
                    <th className="hidden px-3 py-2 md:table-cell">Aliases</th>
                    <th className="px-3 py-2 text-center">Status</th>
                    <th className="px-3 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className={adminTableBodyClass}>
                  {audiences.map((a) => {
                    const Icon = ICON_MAP[a.icon] || Users;
                    const badgeClass = COLOR_BADGE[a.color] || COLOR_BADGE.slate;
                    return (
                      <tr key={a.code}>
                        <td className="px-3 py-2 text-brand-slate/40 dark:text-muted-foreground/40">
                          <GripVertical className="h-4 w-4" />
                        </td>
                        <td className="px-3 py-2 font-mono text-xs text-brand-navy-dark dark:text-foreground">
                          {a.code}
                        </td>
                        <td className="px-3 py-2 font-semibold text-brand-navy-dark dark:text-foreground">
                          {a.label}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClass}`}
                          >
                            <Icon className="h-3 w-3" />
                            {a.label}
                          </span>
                        </td>
                        <td className="hidden px-3 py-2 text-brand-slate dark:text-muted-foreground md:table-cell">
                          {a.aliases.length > 0 ? a.aliases.join(", ") : "—"}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                              a.is_active
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            {a.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => startEdit(a)} className={adminTableEditButtonClass}>
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteCode(a.code)}
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
        </div>

        {(creating || editingCode) && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={(e) => {
              if (e.currentTarget === e.target) closeModal();
            }}
          >
            <div
              className={adminModalWidePanelClass}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="audience-form-title"
            >
              <h3 id="audience-form-title" className={adminTitleH3Class}>
                {creating ? "Add audience" : "Edit audience"}
              </h3>
              {error && <p className={`mt-3 ${adminErrorTextClass}`}>{error}</p>}
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={adminLabelClass}>Code</span>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                  disabled={!!editingCode}
                  placeholder="e.g. mediator"
                  className={adminInputClass}
                />
              </label>
              <label className="block">
                <span className={adminLabelClass}>Label</span>
                <input
                  type="text"
                  value={form.label}
                  onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                  placeholder="e.g. Mediator"
                  className={adminInputClass}
                />
              </label>
              <label className="block">
                <span className={adminLabelClass}>Icon</span>
                <div className="mt-1 flex items-center gap-2">
                  <select
                    value={form.icon}
                    onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                    className={adminInputFlatClass}
                  >
                    {ICON_OPTIONS.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <IconPreview className="h-5 w-5 shrink-0 text-brand-slate dark:text-muted-foreground" />
                </div>
              </label>
              <label className="block">
                <span className={adminLabelClass}>Color</span>
                <div className="mt-1 flex items-center gap-2">
                  <select
                    value={form.color}
                    onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                    className={adminInputFlatClass}
                  >
                    {COLOR_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <span
                    className={`h-5 w-5 shrink-0 rounded-full ${
                      COLOR_OPTIONS.find((c) => c.value === form.color)?.swatch ?? "bg-slate-500"
                    }`}
                  />
                </div>
              </label>
              <label className="block sm:col-span-2">
                <span className={adminLabelClass}>
                  Aliases <span className="normal-case opacity-70">(comma-separated, lowercase)</span>
                </span>
                <input
                  type="text"
                  value={form.aliases}
                  onChange={(e) => setForm((f) => ({ ...f, aliases: e.target.value }))}
                  placeholder="e.g. mediator, mediation"
                  className={adminInputClass}
                />
              </label>
              <label className="block">
                <span className={adminLabelClass}>Sort order</span>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) || 0 }))}
                  className={adminInputClass}
                />
              </label>
              <label className="flex items-center gap-2 self-end pb-2">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                  className="h-4 w-4"
                />
                <span className={`${adminMutedTextClass} font-normal`}>Active</span>
              </label>
            </div>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => closeModal()}
                  className={adminOutlineButtonClass}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void handleSave()}
                  className={adminPrimarySubmitClass}
                >
                  {saving ? "Saving..." : creating ? "Create" : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AdminConfirmDialog
        open={deleteCode !== null}
        title="Delete audience"
        description={
          deleteCode
            ? `Delete audience "${deleteCode}"? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleteLoading}
        onCancel={closeDeleteDialog}
        onConfirm={() => void confirmDeleteAudience()}
      />
    </AdminShell>
  );
}
