"use client";

import { LogOut, Moon, Sun } from "lucide-react";
import Logo from "@/components/branding/Logo";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/contexts/AuthContext";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();

  const toggleTheme = () => {
    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "light" : "dark");
      return;
    }
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen bg-brand-cream/50 dark:bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md dark:bg-background/90">
        <div className="container flex h-16 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Logo size="sm" subtitle="Admin · Powered by civilly.ai" />
            <span className="hidden rounded-full bg-brand-teal/15 px-2.5 py-0.5 text-xs font-medium text-brand-teal-dark dark:text-brand-teal-light sm:inline-block">
              Admin
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {user?.email && (
              <span className="hidden max-w-[200px] truncate text-sm text-muted-foreground md:block">
                {user.email}
              </span>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => signOut()}
            >
              <LogOut className="mr-1.5 h-4 w-4" />
              <span className="hidden sm:inline">Log out</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="relative"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </div>
        </div>
      </header>
      <main className="container py-8">{children}</main>
    </div>
  );
}
