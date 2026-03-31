"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";
import { fetchProfileRole, type ProfileRole } from "@/lib/profileRole";

const MAIN_APP_LOGIN_URL =
  (typeof process.env.NEXT_PUBLIC_APP_LOGIN_URL === "string" && process.env.NEXT_PUBLIC_APP_LOGIN_URL.trim()) ||
  "http://localhost:3000/login";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profileRole: ProfileRole | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profileRole: null,
  loading: true,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profileRole, setProfileRole] = useState<ProfileRole | null>(null);
  const [loading, setLoading] = useState(true);
  /** When set, we already verified this user is admin — skip heavy re-check on benign auth events. */
  const stableAdminUserIdRef = useRef<string | null>(null);

  const applySession = useCallback(async (nextSession: Session | null) => {
    setSession(nextSession);
    setUser(nextSession?.user ?? null);
    if (!nextSession?.user) {
      stableAdminUserIdRef.current = null;
      setProfileRole(null);
      setLoading(false);
      return;
    }

    const role = await fetchProfileRole(nextSession);

    if (role === "user") {
      stableAdminUserIdRef.current = null;
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setProfileRole(null);
      setLoading(false);
      if (typeof window !== "undefined") {
        window.location.assign(MAIN_APP_LOGIN_URL);
      }
      return;
    }

    if (role !== "admin") {
      stableAdminUserIdRef.current = null;
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setProfileRole(null);
      setLoading(false);
      return;
    }

    stableAdminUserIdRef.current = nextSession.user.id;
    setProfileRole("admin");
    setLoading(false);
  }, []);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data: { session: s } }) => {
      void applySession(s);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === "INITIAL_SESSION") return;
      if (!s?.user) {
        stableAdminUserIdRef.current = null;
        setSession(null);
        setUser(null);
        setProfileRole(null);
        setLoading(false);
        return;
      }
      // Token refresh: never blocks UI or re-fetches profile.
      if (event === "TOKEN_REFRESHED") {
        setSession(s);
        setUser(s.user);
        return;
      }
      // Same verified admin: duplicate SIGNED_IN / USER_UPDATED (e.g. tab focus) without user change.
      const sameVerifiedAdmin =
        stableAdminUserIdRef.current !== null && stableAdminUserIdRef.current === s.user.id;
      if (sameVerifiedAdmin && (event === "SIGNED_IN" || event === "USER_UPDATED")) {
        setSession(s);
        setUser(s.user);
        return;
      }
      setLoading(true);
      void applySession(s);
    });

    return () => subscription.unsubscribe();
  }, [applySession]);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    if (!data.user) return { error: "Sign-in failed." };

    let nextSession: Session | null = data.session ?? null;
    if (!nextSession) {
      const { data: s2 } = await supabase.auth.getSession();
      nextSession = s2.session ?? null;
    }
    if (!nextSession) {
      await supabase.auth.signOut();
      return { error: "Session could not be established. Try again or confirm your email." };
    }

    const role = await fetchProfileRole(nextSession);
    if (role === null) {
      await supabase.auth.signOut();
      return {
        error:
          "Could not load your profile. Ensure SUPABASE_SERVICE_ROLE_KEY is set on the admin app server and your profile row exists.",
      };
    }
    if (role === "user") {
      await supabase.auth.signOut();
      return {
        error: "This account does not have admin access. Sign in on the main app instead.",
      };
    }
    if (role !== "admin") {
      await supabase.auth.signOut();
      return { error: "Access denied." };
    }

    setSession(nextSession);
    setUser(data.user);
    stableAdminUserIdRef.current = data.user.id;
    setProfileRole("admin");
    setLoading(false);
    return { error: null };
  };

  const signOut = async () => {
    stableAdminUserIdRef.current = null;
    await supabase.auth.signOut();
    setProfileRole(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, session, profileRole, loading, signUp, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};
