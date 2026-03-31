"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/branding/Logo";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn, user, loading: authLoading, profileRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user && profileRole === "admin") router.replace("/");
  }, [user, authLoading, profileRole, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    const { error: authError } = await signIn(email.trim(), password);
    setLoading(false);
    if (authError) setError(authError);
    else router.replace("/");
  };

  // Avoid full-screen spinner on background auth refresh when already resolved (same as home page).
  if (user && profileRole === "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-cream/50 dark:bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-brand-teal" aria-hidden />
      </div>
    );
  }
  if (authLoading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-cream/50 dark:bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-brand-teal" aria-hidden />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-b from-brand-cream/60 via-white to-white dark:from-background dark:via-background dark:to-background">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12 sm:px-6">
        <div className="mb-8 flex justify-center">
          <Logo size="lg" subtitle="Admin · Powered by civilly.ai" />
        </div>
        <div className="rounded-2xl border border-brand-warm-gray/40 bg-white p-6 shadow-lg shadow-brand-navy/5 dark:border-border dark:bg-card sm:p-8">
          <h1 className="font-serif text-2xl font-bold text-brand-navy-dark dark:text-foreground">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-brand-slate dark:text-muted-foreground">
            Use the same Supabase account as Reply Right. Access requires{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">profiles.role = admin</code>{" "}
            for your user.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-slate dark:text-muted-foreground">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-brand-warm-gray/40 bg-brand-cream/30 py-2.5 pl-10 pr-3 text-sm text-brand-navy-dark focus:border-brand-teal/50 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 dark:border-border dark:bg-muted/50 dark:text-foreground"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-slate dark:text-muted-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-brand-warm-gray/40 bg-brand-cream/30 py-2.5 pl-10 pr-12 text-sm text-brand-navy-dark focus:border-brand-teal/50 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 dark:border-border dark:bg-muted/50 dark:text-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>}
            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
