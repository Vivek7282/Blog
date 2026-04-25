import { StatusMessage } from "@/components/messages";
import {
  signInAction,
  signInDemoAction,
  signUpAction
} from "@/app/actions";
import { getDemoUsers } from "@/lib/auth";
import { hasSupabaseConfig } from "@/lib/env";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : undefined;
  const success = typeof params.success === "string" ? params.success : undefined;
  const demoUsers = hasSupabaseConfig ? [] : await getDemoUsers();

  return (
    <div className="two-column">
      <section className="card stack-lg">
        <div>
          <p className="eyebrow">Authentication</p>
          <h1>{hasSupabaseConfig ? "Sign in with Supabase Auth" : "Start a demo session"}</h1>
          <p className="muted">
            {hasSupabaseConfig
              ? "Use email/password authentication. New signups are added as viewers by default."
              : "Pick a seeded role to test author, viewer, and admin permissions immediately."}
          </p>
        </div>

        <StatusMessage error={error} success={success} />

        {hasSupabaseConfig ? (
          <div className="two-column">
            <form action={signInAction} className="stack">
              <h2>Sign in</h2>
              <label className="field">
                <span>Email</span>
                <input name="email" type="email" required />
              </label>
              <label className="field">
                <span>Password</span>
                <input name="password" type="password" required />
              </label>
              <button type="submit" className="primary-button">
                Sign in
              </button>
            </form>

            <form action={signUpAction} className="stack">
              <h2>Create account</h2>
              <label className="field">
                <span>Name</span>
                <input name="name" type="text" required />
              </label>
              <label className="field">
                <span>Email</span>
                <input name="email" type="email" required />
              </label>
              <label className="field">
                <span>Password</span>
                <input name="password" type="password" minLength={6} required />
              </label>
              <button type="submit" className="primary-button">
                Create account
              </button>
            </form>
          </div>
        ) : (
          <div className="stack">
            {demoUsers.map((user) => (
              <form key={user.id} action={signInDemoAction} className="demo-user-row">
                <input type="hidden" name="userId" value={user.id} />
                <div>
                  <strong>{user.name}</strong>
                  <p className="muted">
                    {user.email} · {user.role}
                  </p>
                </div>
                <button type="submit" className="primary-button">
                  Continue as {user.role}
                </button>
              </form>
            ))}
          </div>
        )}
      </section>

      <aside className="card stack">
        <h2>What this page covers</h2>
        <ul className="plain-list">
          <li>Supabase Auth flow for real environments</li>
          <li>Role testing without external setup in demo mode</li>
          <li>Simple entry point for reviewers checking permissions quickly</li>
        </ul>
      </aside>
    </div>
  );
}
