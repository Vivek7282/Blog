import { redirect } from "next/navigation";
import { PostForm } from "@/components/post-form";
import { canCreatePosts, getCurrentUser } from "@/lib/auth";

export default async function NewPostPage() {
  const user = await getCurrentUser();
  if (!canCreatePosts(user)) {
    redirect("/?error=Only authors and admins can create posts.");
  }

  return (
    <div className="card stack-lg">
      <div>
        <p className="eyebrow">Authoring</p>
        <h1>Create a new post</h1>
        <p className="muted">
          Saving a post automatically generates a summary and stores it for future
          listing-page reads.
        </p>
      </div>
      <PostForm />
    </div>
  );
}
