"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, GripVertical } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { adminApi, type Country } from "@/lib/api";
import {
  adminErrorTextClass,
  adminInputClass,
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

interface CountryFormState {
  code: string;
  label: string;
  aliases: string;
  sort_order: number;
  is_active: boolean;
}

const EMPTY_FORM: CountryFormState = {
  code: "",
  label: "",
  aliases: "",
  sort_order: 0,
  is_active: true,
};

export default function CountriesPage() {
  const { user, loading: authLoading, profileRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CountryFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteCode, setDeleteCode] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCountries = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.listCountries();
      setCountries(res.countries);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load countries");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && profileRole === "admin") void fetchCountries();
  }, [user, profileRole, fetchCountries]);

  const startCreate = () => {
    setError("");
    setEditingCode(null);
    setForm({
      ...EMPTY_FORM,
      sort_order:
        countries.length > 0 ? Math.max(...countries.map((c) => c.sort_order)) + 10 : 10,
    });
    setCreating(true);
  };

  const startEdit = (c: Country) => {
    setError("");
    setCreating(false);
    setEditingCode(c.code);
    setForm({
      code: c.code,
      label: c.label,
      aliases: c.aliases.join(", "),
      sort_order: c.sort_order,
      is_active: c.is_active,
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
        await adminApi.createCountry({
          code: form.code.trim(),
          label: form.label.trim(),
          aliases: aliasArr,
          sort_order: form.sort_order,
          is_active: form.is_active,
        });
      } else if (editingCode) {
        await adminApi.updateCountry(editingCode, {
          label: form.label.trim(),
          aliases: aliasArr,
          sort_order: form.sort_order,
          is_active: form.is_active,
        });
      }
      resetFormState();
      await fetchCountries();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const closeDeleteDialog = () => {
    if (!deleteLoading) setDeleteCode(null);
  };

  const confirmDeleteCountry = async () => {
    if (!deleteCode) return;
    setDeleteLoading(true);
    setError("");
    try {
      await adminApi.deleteCountry(deleteCode);
      setDeleteCode(null);
      await fetchCountries();
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
        <Loader2 className="h-8 w-8 animate-spin text-brand-teal" aria-hidden />
      </div>
    );
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className={adminPanelClass}>
          <h1 className={adminTitleH1Class}>Countries / Jurisdictions</h1>
          <p className={`mt-2 ${adminMutedTextClass}`}>
            Countries listed here appear in the user&apos;s &ldquo;Country&rdquo; dropdown on the rewrite page.
            Adding a country here is all that&apos;s needed &mdash; no code changes required. Make sure a matching
            prompt exists for each audience + country combination.
          </p>
          <div className="mt-4 flex w-full flex-wrap items-end justify-between gap-3">
            <div className="min-w-0 flex-1" />
            <button type="button" onClick={startCreate} className={adminPrimaryCtaClass}>
              + ADD COUNTRY
            </button>
          </div>

          {error && !(creating || editingCode) && (
            <p className={`mt-6 ${adminErrorTextClass}`}>{error}</p>
          )}
          {loading ? (
            <p className={`mt-6 ${adminMutedTextClass}`}>Loading countries...</p>
          ) : countries.length === 0 ? (
            <p className={`mt-6 ${adminMutedTextClass}`}>
              No countries configured yet. Use &ldquo;+ ADD COUNTRY&rdquo; above to get started.
            </p>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className={adminTableClass}>
                <thead>
                  <tr className={adminTableHeadRowClass}>
                    <th className="w-8 px-3 py-2" />
                    <th className="px-3 py-2">Code</th>
                    <th className="px-3 py-2">Label</th>
                    <th className="hidden px-3 py-2 md:table-cell">Aliases</th>
                    <th className="px-3 py-2 text-center">Status</th>
                    <th className="px-3 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className={adminTableBodyClass}>
                  {countries.map((c) => (
                    <tr key={c.code}>
                      <td className="px-3 py-2 text-brand-slate/40 dark:text-muted-foreground/40">
                        <GripVertical className="h-4 w-4" />
                      </td>
                      <td className="px-3 py-2 font-mono text-xs text-brand-navy-dark dark:text-foreground">
                        {c.code}
                      </td>
                      <td className="px-3 py-2 font-semibold text-brand-navy-dark dark:text-foreground">
                        {c.label}
                      </td>
                      <td className="hidden px-3 py-2 text-brand-slate dark:text-muted-foreground md:table-cell">
                        {c.aliases.length > 0 ? c.aliases.join(", ") : "—"}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                            c.is_active
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          {c.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => startEdit(c)} className={adminTableEditButtonClass}>
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteCode(c.code)}
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
              aria-labelledby="country-form-title"
            >
              <h3 id="country-form-title" className={adminTitleH3Class}>
                {creating ? "Add country" : "Edit country"}
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
                  placeholder="e.g. en-AU"
                  className={adminInputClass}
                />
              </label>
              <label className="block">
                <span className={adminLabelClass}>Label</span>
                <input
                  type="text"
                  value={form.label}
                  onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                  placeholder="e.g. Australia"
                  className={adminInputClass}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className={adminLabelClass}>
                  Aliases <span className="normal-case opacity-70">(comma-separated, lowercase)</span>
                </span>
                <input
                  type="text"
                  value={form.aliases}
                  onChange={(e) => setForm((f) => ({ ...f, aliases: e.target.value }))}
                  placeholder="e.g. australia, au, en-au"
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
        title="Delete country"
        description={
          deleteCode
            ? `Delete country "${deleteCode}"? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleteLoading}
        onCancel={closeDeleteDialog}
        onConfirm={() => void confirmDeleteCountry()}
      />
    </AdminShell>
  );
}
