import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { requireFounder } from "@/lib/admin/require-founder";
import { slugify } from "@/lib/blog/slugify";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await requireFounder();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const { id } = await context.params;

  const body = await req.json();
  const admin = createServiceRoleClient();

  const { data: existing, error: fetchErr } = await admin
    .from("blog_posts")
    .select("published")
    .eq("id", id)
    .maybeSingle();
  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  if (!existing) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof body.title === "string") update.title = body.title.trim();
  if (typeof body.meta_description === "string") update.meta_description = body.meta_description.trim();
  if (typeof body.content_markdown === "string") update.content_markdown = body.content_markdown.trim();
  if (typeof body.cover_emoji === "string") update.cover_emoji = body.cover_emoji.trim() || null;
  if (typeof body.slug === "string" && body.slug.trim()) update.slug = slugify(body.slug.trim());

  if (typeof body.published === "boolean") {
    update.published = body.published;
    if (body.published && !existing.published) {
      update.published_at = new Date().toISOString();
    } else if (!body.published) {
      update.published_at = null;
    }
  }

  const { data, error } = await admin
    .from("blog_posts")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "That slug is already taken." }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ post: data });
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await requireFounder();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const { id } = await context.params;

  const admin = createServiceRoleClient();
  const { error } = await admin.from("blog_posts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
