import { supabase } from "@/lib/supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

export interface PromptComponents {
  system: string;
}

export interface PromptVersion {
  id: string;
  purpose: string;
  audience: "solicitor" | "ex-partner" | "child" | string;
  name: string;
  components: PromptComponents;
  is_active: boolean;
  created_at: string;
}

export interface PromptVersionListResponse {
  prompt_versions: PromptVersion[];
  total: number;
  page: number;
  pageSize: number;
}

async function authedFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers || {}),
      },
    });
  } catch {
    throw new Error("Cannot reach admin API. Ensure admin-neutral-calm-secure-backend is running (NEXT_PUBLIC_API_URL).");
  }

  // 204 No Content — return immediately without reading the body.
  if (res.status === 204) {
    return undefined as T;
  }

  // Read the body once as text so we never call res.json() (which throws on empty bodies).
  let text: string;
  try {
    text = await res.text();
  } catch {
    if (res.ok) return undefined as T;
    throw new Error("Request failed");
  }

  if (!res.ok) {
    let message = "Request failed";
    if (text) {
      try {
        const body = JSON.parse(text) as { error?: string };
        message = body.error || message;
      } catch {
        message = text;
      }
    }
    throw new Error(message);
  }

  if (!text.trim()) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Invalid JSON from server");
  }
}

export interface Country {
  code: string;
  label: string;
  aliases: string[];
  sort_order: number;
  is_active: boolean;
}

export interface Audience {
  code: string;
  label: string;
  icon: string;
  color: string;
  aliases: string[];
  sort_order: number;
  is_active: boolean;
}

export const adminApi = {
  // ── Audiences ──
  listAudiences: () =>
    authedFetch<{ audiences: Audience[] }>("/admin/audiences"),
  createAudience: (payload: {
    code: string;
    label: string;
    icon?: string;
    color?: string;
    aliases?: string[];
    sort_order?: number;
    is_active?: boolean;
  }) =>
    authedFetch<{ audience: Audience }>("/admin/audiences", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateAudience: (code: string, payload: Partial<Omit<Audience, "code">>) =>
    authedFetch<{ audience: Audience }>(`/admin/audiences/${encodeURIComponent(code)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deleteAudience: (code: string) =>
    authedFetch<void>(`/admin/audiences/${encodeURIComponent(code)}`, {
      method: "DELETE",
    }),

  // ── Countries ──
  listCountries: () =>
    authedFetch<{ countries: Country[] }>("/admin/countries"),
  createCountry: (payload: {
    code: string;
    label: string;
    aliases?: string[];
    sort_order?: number;
    is_active?: boolean;
  }) =>
    authedFetch<{ country: Country }>("/admin/countries", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateCountry: (code: string, payload: Partial<Omit<Country, "code">>) =>
    authedFetch<{ country: Country }>(`/admin/countries/${encodeURIComponent(code)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deleteCountry: (code: string) =>
    authedFetch<void>(`/admin/countries/${encodeURIComponent(code)}`, {
      method: "DELETE",
    }),

  // ── Prompts ──
  listPromptVersions: (params?: {
    purpose?: string;
    activeOnly?: boolean;
    activeState?: "all" | "active" | "deactive";
    audience?: string;
    search?: string;
    page?: number;
    pageSize?: number;
    sortDir?: "asc" | "desc";
  }) => {
    const qs = new URLSearchParams();
    if (params?.purpose) qs.set("purpose", params.purpose);
    if (params?.activeOnly) qs.set("activeOnly", "true");
    if (params?.activeState) qs.set("activeState", params.activeState);
    if (params?.audience) qs.set("audience", params.audience);
    if (params?.search) qs.set("search", params.search);
    if (params?.page) qs.set("page", String(params.page));
    if (params?.pageSize) qs.set("pageSize", String(params.pageSize));
    if (params?.sortDir) qs.set("sortDir", params.sortDir);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return authedFetch<PromptVersionListResponse>(`/admin/prompts${suffix}`);
  },
  createPromptVersion: (payload: {
    purpose?: string;
    audience: string;
    name: string;
    system: string;
    is_active?: boolean;
  }) =>
    authedFetch<{ prompt_version: PromptVersion }>("/admin/prompts", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  activatePromptVersion: (id: string) =>
    authedFetch<{ prompt_version: PromptVersion }>(`/admin/prompts/${id}/activate`, {
      method: "POST",
    }),
  updatePromptVersion: (
    id: string,
    payload: { name: string; system: string; audience: string; is_active?: boolean }
  ) =>
    authedFetch<{ prompt_version: PromptVersion }>(`/admin/prompts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deletePromptVersion: (id: string) =>
    authedFetch<void>(`/admin/prompts/${id}`, {
      method: "DELETE",
    }),
};
