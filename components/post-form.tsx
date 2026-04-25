import { createPostAction, updatePostAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { PostRecord } from "@/lib/types";

export function PostForm({ post }: { post?: PostRecord }) {
  const action = post ? updatePostAction : createPostAction;

  return (
    <form action={action} className="stack-lg">
      {post ? <input type="hidden" name="postId" value={post.id} /> : null}

      <label className="field">
        <span>Title</span>
        <input
          name="title"
          type="text"
          defaultValue={post?.title}
          required
          minLength={5}
          placeholder="Write a clear, descriptive title"
        />
      </label>

      <label className="field">
        <span>Featured image URL</span>
        <input
          name="imageUrl"
          type="url"
          defaultValue={post?.image_url}
          required
          placeholder="https://images.unsplash.com/..."
        />
      </label>

      <label className="field">
        <span>Body content</span>
        <textarea
          name="body"
          defaultValue={post?.body}
          required
          minLength={50}
          rows={16}
          placeholder="Write the full blog post here..."
        />
      </label>

      <p className="muted">
        Tip: paste a direct image URL, or paste an Unsplash photo page URL and the app
        will convert it automatically.
      </p>

      <SubmitButton
        idleLabel={post ? "Update post" : "Create post and generate summary"}
        pendingLabel={post ? "Updating post..." : "Creating post..."}
      />
    </form>
  );
}
