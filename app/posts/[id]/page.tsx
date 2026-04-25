import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentForm } from "@/components/comment-form";
import { StatusMessage } from "@/components/messages";
import { canEditPost, getCurrentUser } from "@/lib/auth";
import { getPostById } from "@/lib/data";
import { formatDate, resolveDisplayImageUrl } from "@/lib/utils";

export default async function PostDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ id }, query, user] = await Promise.all([
    params,
    searchParams,
    getCurrentUser()
  ]);

  const post = await getPostById(id);
  if (!post) {
    notFound();
  }

  const success = typeof query.success === "string" ? query.success : undefined;
  const error = typeof query.error === "string" ? query.error : undefined;

  return (
    <div className="stack-xl">
      <StatusMessage error={error} success={success} />

      <article className="card stack-lg">
        <img
          src={resolveDisplayImageUrl(post.image_url)}
          alt={post.title}
          className="detail-image"
        />

        <div className="stack">
          <div className="section-header">
            <div>
              <p className="eyebrow">Post detail</p>
              <h1>{post.title}</h1>
            </div>
            {canEditPost(user, post) ? (
              <Link href={`/posts/${post.id}/edit`} className="button-link">
                Edit post
              </Link>
            ) : null}
          </div>

          <div className="post-meta">
            <span>{post.author?.name || "Unknown author"}</span>
            <span>{formatDate(post.created_at)}</span>
          </div>

          <section className="summary-panel">
            <h2>AI summary</h2>
            <p>{post.summary}</p>
          </section>

          <section className="body-copy">
            {post.body.split("\n").map((paragraph, index) => (
              <p key={`${post.id}-paragraph-${index}`}>{paragraph}</p>
            ))}
          </section>
        </div>
      </article>

      <section className="card stack-lg">
        <div>
          <h2>Comments</h2>
          <p className="muted">
            Viewers can comment on posts. Authors and admins can monitor discussion.
          </p>
        </div>

        {user ? (
          <CommentForm postId={post.id} />
        ) : (
          <p className="muted">
            <Link href="/login">Sign in</Link> to add a comment.
          </p>
        )}

        <div className="stack">
          {post.comments.length ? (
            post.comments.map((comment) => (
              <article key={comment.id} className="comment-card">
                <div className="post-meta">
                  <strong>{comment.user?.name || "Unknown user"}</strong>
                  <span>{formatDate(comment.created_at)}</span>
                </div>
                <p>{comment.comment_text}</p>
              </article>
            ))
          ) : (
            <p className="muted">No comments yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
