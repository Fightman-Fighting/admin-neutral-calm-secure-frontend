import type { Session } from "@supabase/supabase-js";

export type ProfileRole = "user" | "admin";

/** Normalize DB value (handles enum / casing / whitespace). */
export function parseProfileRole(raw: unknown): ProfileRole | null {
  if (typeof raw !== "string") return null;
  const r = raw.trim().toLowerCase();
  if (r === "user" || r === "admin") return r;
  return null;
}

/**
 * Loads role via the admin Next.js API (service role), so login works even when
 * RLS prevents the browser from selecting `profiles` directly.
 */
export async function fetchProfileRole(session: Session | null): Promise<ProfileRole | null> {
  const token = session?.access_token;
  if (!token) return null;

  const res = await fetch("/api/profile-role", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return null;

  const json = (await res.json()) as { role?: unknown };
  return parseProfileRole(json.role);
}
