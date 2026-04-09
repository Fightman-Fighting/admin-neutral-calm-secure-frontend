"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { AdminShell } from "@/components/admin/AdminShell";
import { PromptAdminContent } from "@/components/admin/PromptAdminContent";
import LogoLoader from "@/components/ui/LogoLoader";

export default function AdminHomePage() {
  const { user, loading, profileRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  const ready = Boolean(user && profileRole === "admin");

  // Do not tie the full-screen loader to `loading` alone: Supabase may set loading during
  // token refresh while the user is already an authenticated admin, which would flash this UI.
  if (!ready) {
    if (loading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-brand-cream/50 dark:bg-background">
          <LogoLoader />
        </div>
      );
    }
    if (!user) {
      return null;
    }
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-cream/50 dark:bg-background">
        <LogoLoader />
      </div>
    );
  }

  return (
    <AdminShell>
      <PromptAdminContent />
    </AdminShell>
  );
}
