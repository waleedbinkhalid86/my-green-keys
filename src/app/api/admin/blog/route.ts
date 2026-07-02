import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { requireFounder } from "@/lib/admin/require-founder";
import { slugify } from "@/lib/blog/slugify";

export async function GET() {
  const user = await requireFounder();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ posts: data ?? [] });
}

export async function POST(req: Request) {
  const user = await requireFounder();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const body = await req.json();
  const title = String(body.title ?? "").trim();
  const metaDescription = String(body.meta_description ?? "").trim();
  const contentMarkdown = String(body.content_markdown ?? "").trim();
  const coverEmoji = String(body.cover_emoji ?? "").trim() || null;
  const published = Boolean(body.published);
  const slug = slugify(String(body.slug ?? "").trim() || title);

  if (!title || !metaDescription || !contentMarkdown || !slug) {
    return NextResponse.json(
      { error: "Title, slug, meta description, and content are required." },
      { status: 400 }
    );
  }

  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("blog_posts")
    .insert({
      slug,
      title,
      meta_description: metaDescription,
      content_markdown: contentMarkdown,
      cover_emoji: coverEmoji,
      published,
      published_at: published ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "That slug is already taken." }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ post: data }, { status: 201 });
}
