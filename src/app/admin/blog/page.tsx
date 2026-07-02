import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { requireFounderPage } from "@/lib/admin/require-founder";
import type { BlogPost } from "@/lib/blog/types";
import PublishToggleButton from "./PublishToggleButton";
import DeletePostButton from "./DeletePostButton";
import AdminTabs from "../AdminTabs";

export const metadata: Metadata = {
  title: "Blog admin",
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

const tableCard: CSSProperties = {
  background:
    "linear-gradient(145deg, rgba(255,255,255,0.92) 0%, rgba(240,249,244,0.82) 55%)",
  border: "1px solid rgba(116, 198, 157, 0.45)",
  borderRadius: "20px",
  padding: 0,
  overflow: "hidden",
  boxShadow: "0 8px 32px rgba(27, 67, 50, 0.1)",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function AdminBlogListPage() {
  await requireFounderPage();

  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  const posts = (data as BlogPost[] | null) ?? [];

  return (
    <div style={pageBg}>
      <main style={shell}>
        <AdminTabs active="blog" />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div>
            <h1
              style={{
                margin: "8px 0 0",
                fontSize: "clamp(1.5rem, 4vw, 2rem)",
                fontWeight: 800,
                color: "#1B4332",
              }}
            >
              Blog posts
            </h1>
          </div>
          <Link
            href="/admin/blog/new"
            style={{
              background: "#2D6A4F",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              padding: "10px 18px",
              borderRadius: 10,
              textDecoration: "none",
            }}
          >
            + New post
          </Link>
        </div>

        <section style={tableCard}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "rgba(240, 249, 244, 0.65)" }}>
                {["Title", "Status", "Created", "Published", ""].map((col) => (
                  <th
                    key={col}
                    style={{
                      textAlign: "left",
                      padding: "12px 16px",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "#2D6A4F",
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {error ? (
                <tr>
                  <td colSpan={5} style={{ padding: "20px 16px", color: "#2D6A4F", fontWeight: 600 }}>
                    Error loading posts: {error.message}
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "20px 16px", color: "#2D6A4F" }}>
                    No posts yet.
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} style={{ borderTop: "1px solid rgba(116, 198, 157, 0.2)" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "#1B4332" }}>
                      {post.cover_emoji ? `${post.cover_emoji} ` : ""}
                      {post.title}
                      <div style={{ fontSize: 12, color: "#74C69D", fontWeight: 500 }}>
                        /blog/{post.slug}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          padding: "3px 10px",
                          borderRadius: 999,
                          color: post.published ? "#1B4332" : "#92400E",
                          background: post.published ? "rgba(82,183,136,0.25)" : "rgba(245,158,11,0.18)",
                        }}
                      >
                        {post.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#2D6A4F" }}>
                      {formatDate(post.created_at)}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#2D6A4F" }}>
                      {formatDate(post.published_at)}
                    </td>
                    <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <Link
                          href={`/admin/blog/${post.id}/edit`}
                          style={{ fontSize: 13, fontWeight: 700, color: "#2D6A4F", textDecoration: "none" }}
                        >
                          Edit
                        </Link>
                        <PublishToggleButton postId={post.id} published={post.published} />
                        <DeletePostButton postId={post.id} title={post.title} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
