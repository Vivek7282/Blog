# Hivon Blog Platform

A full-stack blogging platform built in Next.js for the Hivon Automations internship assignment. The app supports three roles, AI-generated post summaries, comments, search, pagination, and a Supabase-backed production path.

## What is included

- Next.js App Router project
- Supabase Auth integration for real environments
- Demo mode with seeded Admin, Author, and Viewer users for quick review
- AI summary generation using the Google Gemini API
- Search and pagination on the post listing page
- Role-aware post creation and editing
- Admin monitoring page for recent comments
- Supabase SQL schema with RLS policies

## Tech stack

- Next.js
- React
- TypeScript
- Supabase Auth
- Supabase Database
- Google Gemini API for summaries

## AI tools used

- Tool used: Codex
- Why I chose it: It is well-suited for structured full-stack implementation, refactoring, and fast iteration on server and UI code in the same workspace.
- How it helped: It accelerated project scaffolding, role-based flow implementation, Supabase wiring, and the final README and SQL setup artifacts.

## Running locally

1. Copy `.env.example` to `.env.local`.
2. Add your Supabase URL, Supabase anon key, and Gemini API key.
3. Install dependencies:

```bash
pnpm install
```

4. Start the dev server:

```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000)

If Supabase credentials are missing, the app falls back to demo mode so the UI and role behavior can still be reviewed locally.

## Supabase setup

1. Create a new Supabase project.
2. Run the SQL in [supabase/schema.sql](/Users/vivekkumar/Documents/Codex/2026-04-25/files-mentioned-by-the-user-fullstack/supabase/schema.sql:1).
3. In Supabase Auth, enable Email/Password sign-in.
4. Seed or update user roles directly in the `users` table:
   - `viewer`
   - `author`
   - `admin`

## Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash
```

## Feature logic explanation

### Authentication flow

- Real mode uses Supabase Auth with email/password sign-up and sign-in.
- New users are inserted into the `users` table as `viewer` by default.
- Demo mode is included so reviewers can switch roles immediately without external setup.

### Role-based access

- `viewer`: can browse posts, read summaries, and add comments.
- `author`: can create posts, edit their own posts, and view comments on those posts.
- `admin`: can view all posts, edit any post, and monitor recent comments in the admin dashboard.

### Post creation logic

- The create-post action is server-side.
- Only `author` and `admin` roles are allowed through the action.
- The body, title, and image URL are stored with the generated summary.

### AI summary generation flow

- When a post is created or substantially edited, the server action calls the Gemini `generateContent` endpoint.
- The response text is stored in the `summary` column.
- The post listing page reads stored summaries directly, so it never re-calls the AI model just to render content.

## Cost optimization decisions

- Summaries are generated once and stored in the database.
- Listing pages always use persisted summaries.
- Prompt scope is intentionally narrow: title + body only.
- The app can run without Gemini configured, which helps local UI development avoid unnecessary API calls.

## Development understanding

- A practical issue encountered in this environment was the missing package manager despite Node being present. I resolved that by installing `pnpm` locally and then wiring the project around a standard dependency setup.
- The main architectural choice was to keep a single app that supports both a real Supabase mode and a zero-setup demo mode. That makes the project easier to review while preserving a production-ready backend path.

## Deployment steps

### Vercel

1. Push this project to GitHub.
2. Import the repository into Vercel.
3. Add the same environment variables from `.env.local`.
4. Deploy.

### Netlify

1. Push this project to GitHub.
2. Create a new Netlify site from the repository.
3. Set the build command to `pnpm build`.
4. Set the publish directory automatically for Next.js using the Netlify adapter/workflow.
5. Add the same environment variables and deploy.

## Submission checklist

- GitHub repository link
- Live deployment URL
- Explanation of AI tools used
- Explanation of authentication, RBAC, post creation, and AI flow
- Cost optimization notes
- One bug encountered and how it was resolved
