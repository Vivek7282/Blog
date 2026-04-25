import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { getDashboardData } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!isAdmin(user)) {
    redirect("/?error=Admins only.");
  }

  const dashboard = await getDashboardData();

  return (
    <div className="stack-xl">
      <section className="metrics-grid">
        <div className="card metric-card">
          <span className="metric-label">Posts</span>
          <strong>{dashboard.postsCount}</strong>
        </div>
        <div className="card metric-card">
          <span className="metric-label">Comments</span>
          <strong>{dashboard.commentsCount}</strong>
        </div>
      </section>

      <section className="card stack">
        <div>
          <p className="eyebrow">Moderation</p>
          <h1>Recent comments</h1>
        </div>

        <div className="stack">
          {dashboard.recentComments.map((comment) => (
            <article key={comment.id} className="comment-card">
              <div className="post-meta">
                <strong>{comment.user?.name || "Unknown user"}</strong>
                <span>{formatDate(comment.created_at)}</span>
              </div>
              <p>{comment.comment_text}</p>
              {comment.post ? (
                <Link href={`/posts/${comment.post.id}`}>Open post: {comment.post.title}</Link>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
