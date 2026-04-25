import { getDemoDb } from "@/lib/demo-db";
import { hasSupabaseConfig } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  CommentRecord,
  PostDetails,
  PostListItem,
  PostRecord,
  Role,
  UserRecord
} from "@/lib/types";
import { escapeLikeQuery } from "@/lib/utils";

const PAGE_SIZE = 6;

function sortByNewest<T extends { created_at: string }>(items: T[]) {
  return [...items].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

function attachAuthor(post: PostRecord, users: UserRecord[]): PostListItem {
  return {
    ...post,
    author: users.find((user) => user.id === post.author_id) ?? null,
    commentsCount: 0
  };
}

export async function getDashboardData() {
  const posts = await listPosts({ page: 1, pageSize: 50 });
  const allComments = await listRecentComments();

  return {
    postsCount: posts.totalCount,
    commentsCount: allComments.length,
    recentComments: allComments.slice(0, 8)
  };
}

export async function listPosts({
  search,
  page = 1,
  pageSize = PAGE_SIZE
}: {
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  if (!hasSupabaseConfig) {
    const db = getDemoDb();
    const normalized = search?.trim().toLowerCase();

    const filtered = sortByNewest(db.posts).filter((post) => {
      if (!normalized) {
        return true;
      }

      const haystack = `${post.title} ${post.body} ${post.summary}`.toLowerCase();
      return haystack.includes(normalized);
    });

    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize).map((post) => ({
      ...attachAuthor(post, db.users),
      commentsCount: db.comments.filter((comment) => comment.post_id === post.id).length
    }));

    return {
      items,
      totalCount: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / pageSize))
    };
  }

  const supabase = await createSupabaseServerClient();
  const query = supabase
    .from("posts")
    .select("id, title, body, image_url, author_id, summary, created_at, updated_at", {
      count: "exact"
    })
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (search?.trim()) {
    const q = `%${escapeLikeQuery(search.trim())}%`;
    query.or(`title.ilike.${q},body.ilike.${q},summary.ilike.${q}`);
  }

  const { data: posts, count, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  const authorIds = Array.from(new Set((posts || []).map((post) => post.author_id)));
  const { data: authors } = authorIds.length
    ? await supabase
        .from("users")
        .select("id, name, email, role")
        .in("id", authorIds)
    : { data: [] };

  const { data: comments } = await supabase
    .from("comments")
    .select("id, post_id")
    .in("post_id", (posts || []).map((post) => post.id));

  const items: PostListItem[] = (posts || []).map((post) => ({
    ...(post as PostRecord),
    author:
      (authors || []).find((author) => author.id === post.author_id) ?? null,
    commentsCount:
      (comments || []).filter((comment) => comment.post_id === post.id).length
  }));

  return {
    items,
    totalCount: count || 0,
    totalPages: Math.max(1, Math.ceil((count || 0) / pageSize))
  };
}

export async function getPostById(postId: string): Promise<PostDetails | null> {
  if (!hasSupabaseConfig) {
    const db = getDemoDb();
    const post = db.posts.find((item) => item.id === postId);
    if (!post) {
      return null;
    }

    const comments = db.comments
      .filter((comment) => comment.post_id === postId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map((comment) => ({
        ...comment,
        user: db.users.find((user) => user.id === comment.user_id) ?? null
      }));

    return {
      ...post,
      author: db.users.find((user) => user.id === post.author_id) ?? null,
      comments
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data: post, error } = await supabase
    .from("posts")
    .select("id, title, body, image_url, author_id, summary, created_at, updated_at")
    .eq("id", postId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!post) {
    return null;
  }

  const [{ data: author }, { data: comments }] = await Promise.all([
    supabase
      .from("users")
      .select("id, name, email, role")
      .eq("id", post.author_id)
      .maybeSingle(),
    supabase
      .from("comments")
      .select("id, post_id, user_id, comment_text, created_at")
      .eq("post_id", postId)
      .order("created_at", { ascending: true })
  ]);

  const userIds = Array.from(new Set((comments || []).map((comment) => comment.user_id)));
  const { data: users } = userIds.length
    ? await supabase.from("users").select("id, name, email, role").in("id", userIds)
    : { data: [] };

  return {
    ...(post as PostRecord),
    author: (author as UserRecord | null) ?? null,
    comments: (comments || []).map((comment) => ({
      ...(comment as CommentRecord),
      user: (users || []).find((user) => user.id === comment.user_id) ?? null
    }))
  };
}

export async function createPost(input: {
  title: string;
  body: string;
  image_url: string;
  author_id: string;
  summary: string;
}) {
  if (!hasSupabaseConfig) {
    const db = getDemoDb();
    const now = new Date().toISOString();
    const post: PostRecord = {
      id: crypto.randomUUID(),
      title: input.title,
      body: input.body,
      image_url: input.image_url,
      author_id: input.author_id,
      summary: input.summary,
      created_at: now,
      updated_at: now
    };

    db.posts.unshift(post);
    return post;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("posts")
    .insert(input)
    .select("id, title, body, image_url, author_id, summary, created_at, updated_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as PostRecord;
}

export async function updatePost(
  postId: string,
  input: {
    title: string;
    body: string;
    image_url: string;
    summary: string;
  }
) {
  if (!hasSupabaseConfig) {
    const db = getDemoDb();
    const target = db.posts.find((post) => post.id === postId);
    if (!target) {
      throw new Error("Post not found.");
    }

    target.title = input.title;
    target.body = input.body;
    target.image_url = input.image_url;
    target.summary = input.summary;
    target.updated_at = new Date().toISOString();
    return target;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("posts")
    .update({
      ...input,
      updated_at: new Date().toISOString()
    })
    .eq("id", postId)
    .select("id, title, body, image_url, author_id, summary, created_at, updated_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as PostRecord;
}

export async function createComment(input: {
  post_id: string;
  user_id: string;
  comment_text: string;
}) {
  if (!hasSupabaseConfig) {
    const db = getDemoDb();
    const comment: CommentRecord = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      ...input
    };

    db.comments.push(comment);
    return comment;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("comments")
    .insert(input)
    .select("id, post_id, user_id, comment_text, created_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as CommentRecord;
}

export async function hasRecentDuplicatePost(input: {
  title: string;
  body: string;
  author_id: string;
}) {
  if (!hasSupabaseConfig) {
    const db = getDemoDb();
    const now = Date.now();
    return db.posts.some(
      (post) =>
        post.author_id === input.author_id &&
        post.title.trim() === input.title.trim() &&
        post.body.trim() === input.body.trim() &&
        now - new Date(post.created_at).getTime() < 2 * 60 * 1000
    );
  }

  const supabase = await createSupabaseServerClient();
  const since = new Date(Date.now() - 2 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("posts")
    .select("id")
    .eq("author_id", input.author_id)
    .eq("title", input.title.trim())
    .eq("body", input.body.trim())
    .gte("created_at", since)
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data?.length);
}

export async function hasRecentDuplicateComment(input: {
  post_id: string;
  user_id: string;
  comment_text: string;
}) {
  if (!hasSupabaseConfig) {
    const db = getDemoDb();
    const now = Date.now();
    return db.comments.some(
      (comment) =>
        comment.post_id === input.post_id &&
        comment.user_id === input.user_id &&
        comment.comment_text.trim() === input.comment_text.trim() &&
        now - new Date(comment.created_at).getTime() < 60 * 1000
    );
  }

  const supabase = await createSupabaseServerClient();
  const since = new Date(Date.now() - 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("comments")
    .select("id")
    .eq("post_id", input.post_id)
    .eq("user_id", input.user_id)
    .eq("comment_text", input.comment_text.trim())
    .gte("created_at", since)
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data?.length);
}

export async function listRecentComments() {
  if (!hasSupabaseConfig) {
    const db = getDemoDb();
    return sortByNewest(db.comments).map((comment) => ({
      ...comment,
      user: db.users.find((user) => user.id === comment.user_id) ?? null,
      post: db.posts.find((post) => post.id === comment.post_id) ?? null
    }));
  }

  const supabase = await createSupabaseServerClient();
  const { data: comments, error } = await supabase
    .from("comments")
    .select("id, post_id, user_id, comment_text, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(error.message);
  }

  const postIds = Array.from(new Set((comments || []).map((comment) => comment.post_id)));
  const userIds = Array.from(new Set((comments || []).map((comment) => comment.user_id)));

  const [{ data: posts }, { data: users }] = await Promise.all([
    postIds.length
      ? supabase.from("posts").select("id, title, body, image_url, author_id, summary, created_at, updated_at").in("id", postIds)
      : Promise.resolve({ data: [] }),
    userIds.length
      ? supabase.from("users").select("id, name, email, role").in("id", userIds)
      : Promise.resolve({ data: [] })
  ]);

  return (comments || []).map((comment) => ({
    ...(comment as CommentRecord),
    user: (users || []).find((user) => user.id === comment.user_id) ?? null,
    post: (posts || []).find((post) => post.id === comment.post_id) ?? null
  }));
}

export async function upsertViewerProfile(input: {
  id: string;
  email: string;
  name: string;
  role?: Role;
}) {
  if (!hasSupabaseConfig) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("users").upsert({
    id: input.id,
    email: input.email,
    name: input.name,
    role: input.role || "viewer"
  });

  if (error) {
    throw new Error(error.message);
  }
}
