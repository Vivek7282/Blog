export type Role = "admin" | "author" | "viewer";

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type PostRecord = {
  id: string;
  title: string;
  body: string;
  image_url: string;
  author_id: string;
  summary: string;
  created_at: string;
  updated_at: string;
};

export type CommentRecord = {
  id: string;
  post_id: string;
  user_id: string;
  comment_text: string;
  created_at: string;
};

export type PostListItem = PostRecord & {
  author: UserRecord | null;
  commentsCount: number;
};

export type PostDetails = PostRecord & {
  author: UserRecord | null;
  comments: Array<
    CommentRecord & {
      user: UserRecord | null;
    }
  >;
};
