import Link from "next/link";
import { Pagination } from "@/components/pagination";
import { PostCard } from "@/components/post-card";
import { StatusMessage } from "@/components/messages";
import { getCurrentUser } from "@/lib/auth";
import { listPosts } from "@/lib/data";
import { hasSupabaseConfig, hasGeminiConfig } from "@/lib/env";

export default async function HomePage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q : "";
  const page = Math.max(
    1,
    Number(typeof params.page === "string" ? params.page : "1") || 1
  );
  const error = typeof params.error === "string" ? params.error : undefined;
  const success = typeof params.success === "string" ? params.success : undefined;

  const [user, postResults] = await Promise.all([
    getCurrentUser(),
    listPosts({ search, page })
  ]);

  return (
    <div className="stack-xl">
      <section className="hero">
        <div>
          <p className="eyebrow">Full-stack assignment build</p>
          <h1>Blog publishing, AI summaries, and role-based access in one Next.js app.</h1>
          <p className="hero-copy">
            This implementation supports Admin, Author, and Viewer roles, generates
            summaries for posts, and is ready to connect to Supabase Auth and database
            tables.
          </p>
        </div>

        <div className="hero-card">
          <p>
            <strong>Current mode:</strong>{" "}
            {hasSupabaseConfig ? "Supabase-backed" : "Demo mode with seeded content"}
          </p>
          <p>
            <strong>AI summary flow:</strong>{" "}
            {hasGeminiConfig ? "Gemini API enabled" : "Local fallback until API key is added"}
          </p>
          <p>
            <strong>Submission ready:</strong> README, SQL schema, setup notes, and
            deployment instructions are included.
          </p>
        </div>
      </section>

      <StatusMessage error={error} success={success} />

      <section className="card stack">
        <div className="section-header">
          <div>
            <h2>Explore posts</h2>
            <p className="muted">
              Search titles, body text, and summaries. Pagination keeps the listing fast.
            </p>
          </div>
          {user ? (
            <span className="muted">Signed in as {user.name}</span>
          ) : (
            <Link href="/login" className="button-link">
              Sign in to comment or publish
            </Link>
          )}
        </div>

        <form className="search-row">
          <input
            type="search"
            name="q"
            defaultValue={search}
            placeholder="Search posts..."
          />
          <button type="submit" className="primary-button">
            Search
          </button>
        </form>
      </section>

      <section className="post-grid">
        {postResults.items.length ? (
          postResults.items.map((post) => (
            <PostCard key={post.id} post={post} currentUser={user} />
          ))
        ) : (
          <div className="card empty-state">
            <h3>No posts found</h3>
            <p>Try a different search term or create the first post.</p>
          </div>
        )}
      </section>

      <Pagination
        currentPage={page}
        totalPages={postResults.totalPages}
        search={search}
      />
    </div>
  );
}
