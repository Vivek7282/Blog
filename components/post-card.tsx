import Link from "next/link";
import { PostListItem, UserRecord } from "@/lib/types";
import { canEditPost } from "@/lib/auth";
import { formatDate, resolveDisplayImageUrl } from "@/lib/utils";

export function PostCard({
  post,
  currentUser
}: {
  post: PostListItem;
  currentUser: UserRecord | null;
}) {
  return (
    <article className="card post-card">
      <img
        src={resolveDisplayImageUrl(post.image_url)}
        alt={post.title}
        className="post-card-image"
      />
      <div className="post-card-body">
        <div className="post-meta">
          <span>{post.author?.name || "Unknown author"}</span>
          <span>{formatDate(post.created_at)}</span>
          <span>{post.commentsCount} comments</span>
        </div>

        <h2>{post.title}</h2>
        <p className="summary">{post.summary}</p>

        <div className="card-actions">
          <Link href={`/posts/${post.id}`} className="button-link">
            Read post
          </Link>
          {canEditPost(currentUser, post) ? (
            <Link href={`/posts/${post.id}/edit`} className="ghost-button">
              Edit
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
