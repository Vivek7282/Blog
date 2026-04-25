import {
  CommentRecord,
  PostRecord,
  Role,
  UserRecord
} from "@/lib/types";

type DemoDatabase = {
  users: UserRecord[];
  posts: PostRecord[];
  comments: CommentRecord[];
};

declare global {
  // eslint-disable-next-line no-var
  var __hivonDemoDb: DemoDatabase | undefined;
}

function makeUser(id: string, name: string, email: string, role: Role): UserRecord {
  return { id, name, email, role };
}

function makePost(
  id: string,
  title: string,
  body: string,
  image_url: string,
  author_id: string,
  summary: string,
  created_at: string
): PostRecord {
  return {
    id,
    title,
    body,
    image_url,
    author_id,
    summary,
    created_at,
    updated_at: created_at
  };
}

function makeComment(
  id: string,
  post_id: string,
  user_id: string,
  comment_text: string,
  created_at: string
): CommentRecord {
  return { id, post_id, user_id, comment_text, created_at };
}

function createSeedDatabase(): DemoDatabase {
  const users: UserRecord[] = [
    makeUser("user-admin", "Ava Admin", "admin@hivon-demo.local", "admin"),
    makeUser("user-author", "Arjun Author", "author@hivon-demo.local", "author"),
    makeUser("user-viewer", "Vanya Viewer", "viewer@hivon-demo.local", "viewer")
  ];

  const posts: PostRecord[] = [
    makePost(
      "post-1",
      "Designing Better Internal Automation Workflows",
      "Internal automation projects usually fail when teams optimize only for speed and not for adoption. The best systems reduce repetitive steps, but they also keep humans in the loop when judgment matters. A practical rollout plan starts with one narrow workflow, measures time saved, and treats user feedback as part of the product rather than an afterthought.\n\nThis demo post shows the required blogging experience: featured image, summary, comments, search, pagination, role-based editing, and AI-powered summaries.",
      "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80",
      "user-author",
      "This post explains how strong automation programs balance efficiency with adoption. It focuses on starting with one narrow workflow, measuring actual time saved, and keeping human judgment in the loop where it matters. The article also highlights an iterative rollout approach in which feedback from real users is treated as part of the product itself. In this assignment build, the post doubles as a working example of the required feature set, including summaries, comments, editing controls, and role-aware access management.",
      "2026-04-24T09:30:00.000Z"
    ),
    makePost(
      "post-2",
      "How Teams Can Reduce AI Costs Without Losing Quality",
      "Cost optimization starts by asking when the model should run at all. If the same output will be shown repeatedly, generate it once and store it. Keep prompts focused, remove redundant context, and choose the smallest capable model for the job. In this assignment, summaries are generated only during post creation or major edits, then persisted in the database so listing pages never trigger fresh AI calls.",
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
      "user-admin",
      "This article covers practical ways to control AI costs without hurting user experience. The key strategies are generating content only when necessary, storing outputs for reuse, trimming prompts to the minimum needed context, and selecting smaller models when they are sufficient. The sample blogging platform applies the same idea by generating post summaries once and persisting them, which keeps the listing page fast and prevents repeated API spend. The result is a cleaner architecture with predictable runtime behavior and lower operating cost.",
      "2026-04-23T14:15:00.000Z"
    )
  ];

  const comments: CommentRecord[] = [
    makeComment(
      "comment-1",
      "post-1",
      "user-viewer",
      "The rollout advice is useful. Starting with one workflow feels much more realistic than a full-platform rewrite.",
      "2026-04-24T12:10:00.000Z"
    ),
    makeComment(
      "comment-2",
      "post-2",
      "user-author",
      "Persisting summaries is a strong optimization. It keeps the UX stable and the API bill predictable.",
      "2026-04-24T15:45:00.000Z"
    )
  ];

  return { users, posts, comments };
}

export function getDemoDb() {
  if (!global.__hivonDemoDb) {
    global.__hivonDemoDb = createSeedDatabase();
  }

  return global.__hivonDemoDb;
}
