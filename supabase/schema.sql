create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null unique,
  role text not null check (role in ('admin', 'author', 'viewer')) default 'viewer'
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  image_url text not null,
  author_id uuid not null references public.users (id) on delete cascade,
  summary text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  comment_text text not null,
  created_at timestamptz not null default now()
);

create index if not exists posts_author_id_idx on public.posts (author_id);
create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists comments_post_id_idx on public.comments (post_id);
create index if not exists comments_created_at_idx on public.comments (created_at desc);

alter table public.users enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;

drop policy if exists "Public read users" on public.users;
create policy "Public read users"
on public.users for select
using (true);

drop policy if exists "Authenticated users can manage own profile" on public.users;
create policy "Authenticated users can manage own profile"
on public.users for all
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Public read posts" on public.posts;
create policy "Public read posts"
on public.posts for select
using (true);

drop policy if exists "Authors and admins can insert posts" on public.posts;
create policy "Authors and admins can insert posts"
on public.posts for insert
with check (
  exists (
    select 1 from public.users
    where users.id = auth.uid()
      and users.role in ('author', 'admin')
      and users.id = author_id
  )
);

drop policy if exists "Authors can update own posts and admins can update any" on public.posts;
create policy "Authors can update own posts and admins can update any"
on public.posts for update
using (
  exists (
    select 1 from public.users
    where users.id = auth.uid()
      and (
        users.role = 'admin'
        or (users.role = 'author' and posts.author_id = auth.uid())
      )
  )
)
with check (
  exists (
    select 1 from public.users
    where users.id = auth.uid()
      and (
        users.role = 'admin'
        or (users.role = 'author' and posts.author_id = auth.uid())
      )
  )
);

drop policy if exists "Public read comments" on public.comments;
create policy "Public read comments"
on public.comments for select
using (true);

drop policy if exists "Authenticated users can insert comments" on public.comments;
create policy "Authenticated users can insert comments"
on public.comments for insert
with check (auth.uid() = user_id);
