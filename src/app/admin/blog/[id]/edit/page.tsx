import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { requireFounderPage } from "@/lib/admin/require-founder";
import type { BlogPost } from "@/lib/blog/types";
import BlogEditorForm from "../../BlogEditorForm";

export const metadata: Metadata = {
  title: "Edit blog post",
  robots: { index: false, follow: false },
};

const pageBg: CSSProperties = {
  backgroundColor: "#FAFAF7",
  backgroundImage: "radial-gradient(circle, #D1D5DB 1px, transparent 1px)",
  backgroundSize: "20px 20px",
  minHeight: "100vh",
};

const shell: CSSProperties = {
  maxWidth: 1000,
  margin: "0 auto",
  padding: "32px 20px 64px",
};

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireFounderPage();
  const { id } = await params;

  const admin = createServiceRoleClient();
  const { data } = await admin.from("blog_posts").select("*").eq("id", id).maybeSingle();
  const post = data as BlogPost | null;

  if (!post) notFound();

  return (
    <div style={pageBg}>
      <main style={shell}>
        <Link
          href="/admin/blog"
          style={{ fontSize: 13, fontWeight: 600, color: "#52B788", textDecoration: "none" }}
        >
          ← Blog posts
        </Link>
        <h1
          style={{
            margin: "8px 0 24px",
            fontSize: "clamp(1.5rem, 4vw, 2rem)",
            fontWeight: 800,
            color: "#1B4332",
          }}
        >
          Edit post
        </h1>
        <BlogEditorForm post={post} />
      </main>
    </div>
  );
}
