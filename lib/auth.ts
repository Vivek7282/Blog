import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDemoDb } from "@/lib/demo-db";
import { hasSupabaseConfig } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PostRecord, Role, UserRecord } from "@/lib/types";

const DEMO_COOKIE = "demo-user-id";

export async function getCurrentUser(): Promise<UserRecord | null> {
  if (!hasSupabaseConfig) {
    const cookieStore = await cookies();
    const selectedId = cookieStore.get(DEMO_COOKIE)?.value;
    if (!selectedId) {
      return null;
    }

    return getDemoDb().users.find((user) => user.id === selectedId) ?? null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id, name, email, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile) {
    return profile as UserRecord;
  }

  return {
    id: user.id,
    email: user.email || "unknown@example.com",
    name: user.user_metadata?.name || user.email?.split("@")[0] || "Viewer",
    role: "viewer"
  };
}

export async function getDemoUsers() {
  return getDemoDb().users;
}

export async function setDemoUser(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(DEMO_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/"
  });
}

export async function clearDemoUser() {
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_COOKIE);
}

export function canCreatePosts(user: UserRecord | null) {
  return user?.role === "author" || user?.role === "admin";
}

export function canEditPost(user: UserRecord | null, post: PostRecord) {
  if (!user) {
    return false;
  }

  return user.role === "admin" || post.author_id === user.id;
}

export function isAdmin(user: UserRecord | null) {
  return user?.role === "admin";
}

export function requireUser(user: UserRecord | null) {
  if (!user) {
    redirect("/login?error=Please sign in to continue.");
  }

  return user;
}

export function requireRole(
  user: UserRecord | null,
  allowed: Role[],
  message = "You do not have permission to access this page."
) {
  if (!user || !allowed.includes(user.role)) {
    redirect(`/?error=${encodeURIComponent(message)}`);
  }

  return user;
}
