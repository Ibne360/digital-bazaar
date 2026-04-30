import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase/server";
import { mapProfileToUser } from "./mappers";
import type { ProfileRow } from "./supabase/types";
import type { User, UserRole } from "./types";

/**
 * Returns the currently logged-in user (with profile data) or null.
 * Reads the Supabase session from cookies, then fetches the matching profile.
 */
export async function getCurrentUser(): Promise<User | null> {
  const sb = createSupabaseServerClient();
  const {
    data: { user: authUser },
  } = await sb.auth.getUser();
  if (!authUser) return null;

  const { data, error } = await sb
    .from("profiles")
    .select("*")
    .eq("id", authUser.id)
    .maybeSingle();
  if (error || !data) return null;
  return mapProfileToUser(data as ProfileRow);
}

/** Redirects to /login if not authenticated. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
    throw new Error("redirect"); // unreachable, satisfies TS narrowing
  }
  return user;
}

/** Redirects to /dashboard if user role is not in the allow-list. */
export async function requireRole(...roles: UserRole[]): Promise<User> {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    redirect("/dashboard");
    throw new Error("redirect");
  }
  return user;
}

/**
 * Sign up a new user via Supabase Auth.
 * - Trigger `on_auth_user_created` will populate `public.profiles`.
 * - Pass name via user_metadata so the trigger can use it.
 */
export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<User> {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim() || email.split("@")[0];

  const sb = createSupabaseServerClient();
  const { data, error } = await sb.auth.signUp({
    email,
    password: input.password,
    options: { data: { name } },
  });

  if (error) {
    if (/already.*registered|already.*exists/i.test(error.message)) {
      throw new Error("An account with this email already exists.");
    }
    throw new Error(error.message || "Could not register user.");
  }
  if (!data.user) {
    throw new Error("Registration failed — please try again.");
  }

  const user = await getCurrentUser();
  if (!user) {
    // Profile may not be ready yet (rare race); return a minimal stub.
    return {
      id: data.user.id,
      email,
      name,
      passwordHash: "",
      role: "user",
      resellerStatus: "none",
      walletBalance: 0,
      totalEarned: 0,
      createdAt: new Date().toISOString(),
    };
  }
  return user;
}

/** Sign in via Supabase Auth (email + password). */
export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<User> {
  const email = input.email.trim().toLowerCase();
  const sb = createSupabaseServerClient();

  const { error } = await sb.auth.signInWithPassword({
    email,
    password: input.password,
  });
  if (error) {
    throw new Error("Invalid email or password.");
  }

  const user = await getCurrentUser();
  if (!user) throw new Error("Could not load profile after login.");
  return user;
}

/** Clear the Supabase session cookies. */
export async function destroySession(): Promise<void> {
  const sb = createSupabaseServerClient();
  await sb.auth.signOut();
}
