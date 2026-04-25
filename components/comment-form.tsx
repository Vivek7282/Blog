import { addCommentAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";

export function CommentForm({ postId }: { postId: string }) {
  return (
    <form action={addCommentAction} className="stack">
      <input type="hidden" name="postId" value={postId} />
      <label className="field">
        <span>Add a comment</span>
        <textarea
          name="commentText"
          rows={4}
          required
          minLength={3}
          placeholder="Share your thoughts about this post..."
        />
      </label>
      <SubmitButton idleLabel="Publish comment" pendingLabel="Publishing..." />
    </form>
  );
}
