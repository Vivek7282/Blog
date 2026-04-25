"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  canCreatePosts,
  canEditPost,
  clearDemoUser,
  getCurrentUser,
  setDemoUser
} from "@/lib/auth";
import { generatePostSummary } from "@/lib/ai";
import {
  createComment,
  createPost,
  getPostById,
  hasRecentDuplicateComment,
  hasRecentDuplicatePost,
  upsertViewerProfile,
  updatePost
} from "@/lib/data";
import { hasSupabaseConfig } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeImageUrl } from "@/lib/utils";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export async function signInDemoAction(formData: FormData) {
  const userId = getString(formData, "userId");
  if (!userId) {
    redirect("/login?error=Select a demo user first.");
  }

  await setDemoUser(userId);
  redirect("/?success=Demo session started.");
}

export async function signOutAction() {
  if (hasSupabaseConfig) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } else {
    await clearDemoUser();
  }

  redirect("/?success=Signed out successfully.");
}

export async function signInAction(formData: FormData) {
  const email = getString(formData, "email");
  const password = getString(formData, "password");

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  if (data.user) {
    await upsertViewerProfile({
      id: data.user.id,
      email: data.user.email || email,
      name:
        data.user.user_metadata?.name ||
        email.split("@")[0]
    });
  }

  redirect("/?success=Welcome back.");
}

export async function signUpAction(formData: FormData) {
  const name = getString(formData, "name");
  const email = getString(formData, "email");
  const password = getString(formData, "password");

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name
      }
    }
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/login?success=Account created. You can sign in now.");
}

export async function createPostAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || !canCreatePosts(user)) {
    redirect("/?error=Only authors and admins can create posts.");
  }

  const title = getString(formData, "title");
  const imageUrl = normalizeImageUrl(getString(formData, "imageUrl"));
  const body = getString(formData, "body");

  const isDuplicate = await hasRecentDuplicatePost({
    title,
    body,
    author_id: user.id
  });

  if (isDuplicate) {
    redirect("/?error=That post was already submitted a moment ago.");
  }

  const summary = await generatePostSummary(title, body);
  const post = await createPost({
    title,
    body,
    image_url: imageUrl,
    author_id: user.id,
    summary
  });

  revalidatePath("/");
  revalidatePath("/admin");
  redirect(`/posts/${post.id}?success=Post created successfully.`);
}

export async function updatePostAction(formData: FormData) {
  const postId = getString(formData, "postId");
  const existing = await getPostById(postId);

  if (!existing) {
    redirect("/?error=That post no longer exists.");
  }

  const user = await getCurrentUser();
  if (!canEditPost(user, existing)) {
    redirect("/?error=You do not have permission to edit this post.");
  }

  const title = getString(formData, "title");
  const imageUrl = normalizeImageUrl(getString(formData, "imageUrl"));
  const body = getString(formData, "body");
  const summary = await generatePostSummary(title, body);

  await updatePost(postId, {
    title,
    body,
    image_url: imageUrl,
    summary
  });

  revalidatePath("/");
  revalidatePath(`/posts/${postId}`);
  revalidatePath("/admin");
  redirect(`/posts/${postId}?success=Post updated successfully.`);
}

export async function addCommentAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?error=Sign in before leaving a comment.");
  }

  const postId = getString(formData, "postId");
  const commentText = getString(formData, "commentText");

  const isDuplicate = await hasRecentDuplicateComment({
    post_id: postId,
    user_id: user.id,
    comment_text: commentText
  });

  if (isDuplicate) {
    redirect(`/posts/${postId}?error=That comment was already submitted.`);
  }

  await createComment({
    post_id: postId,
    user_id: user.id,
    comment_text: commentText
  });

  revalidatePath(`/posts/${postId}`);
  revalidatePath("/admin");
  redirect(`/posts/${postId}?success=Comment added.`);
}
