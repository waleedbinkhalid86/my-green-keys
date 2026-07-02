-- Blog system for SEO content. Writes happen via /admin/blog using the
-- service-role client (founder-locked in the route itself), so RLS only
-- needs to open up public reads of published posts.

create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  meta_description text not null,
  content_markdown text not null,
  cover_emoji text,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_blog_posts_published
  on blog_posts (published, published_at desc)
  where published = true;

alter table blog_posts enable row level security;

create policy "Published posts are public"
  on blog_posts for select
  using (published = true);
