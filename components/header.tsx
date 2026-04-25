import Link from "next/link";
import { hasSupabaseConfig } from "@/lib/env";
import { canCreatePosts, isAdmin } from "@/lib/auth";
import { roleLabel } from "@/lib/utils";
import { UserRecord } from "@/lib/types";
import { signOutAction } from "@/app/actions";

export function Header({ user }: { user: UserRecord | null }) {
  return (
    <header className="site-header">
      <div>
        <Link href="/" className="brand">
          Hivon Blog
        </Link>
        <p className="muted">
          Next.js + Supabase blogging platform with role-based access and AI summaries
        </p>
      </div>

      <nav className="header-nav">
        <Link href="/">Home</Link>
        {canCreatePosts(user) ? <Link href="/posts/new">New Post</Link> : null}
        {isAdmin(user) ? <Link href="/admin">Admin</Link> : null}
        {user ? (
          <div className="header-user">
            <span className={`role-badge role-${user.role}`}>{roleLabel(user.role)}</span>
            <span>{user.name}</span>
            <form action={signOutAction}>
              <button type="submit" className="ghost-button">
                {hasSupabaseConfig ? "Sign out" : "Exit demo"}
              </button>
            </form>
          </div>
        ) : (
          <Link href="/login" className="primary-link">
            Sign in
          </Link>
        )}
      </nav>
    </header>
  );
}
