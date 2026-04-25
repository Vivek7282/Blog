import { notFound, redirect } from "next/navigation";
import { PostForm } from "@/components/post-form";
import { canEditPost, getCurrentUser } from "@/lib/auth";
import { getPostById } from "@/lib/data";

export default async function EditPostPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [user, post] = await Promise.all([getCurrentUser(), getPostById(id)]);

  if (!post) {
    notFound();
  }

  if (!canEditPost(user, post)) {
    redirect("/?error=You do not have permission to edit this post.");
  }

  return (
    <div className="card stack-lg">
      <div>
        <p className="eyebrow">Editing</p>
        <h1>Edit post</h1>
        <p className="muted">
          Authors can edit their own posts, while admins can edit any post.
        </p>
      </div>
      <PostForm post={post} />
    </div>
  );
}
