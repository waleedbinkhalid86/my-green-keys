import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { getPublishedPosts } from "@/lib/blog/public-queries";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Tips and stories on kids' typing, daily learning habits, and raising eco-conscious kids — from My Green Keys.",
};

const pageBg: CSSProperties = {
  backgroundColor: "#FAFAF7",
  backgroundImage: "radial-gradient(circle, #D1D5DB 1px, transparent 1px)",
  backgroundSize: "20px 20px",
  minHeight: "100%",
};

const shell: CSSProperties = {
  maxWidth: 800,
  margin: "0 auto",
  padding: "48px 20px 80px",
};

const cardStyle: CSSProperties = {
  background:
    "linear-gradient(145deg, rgba(255,255,255,0.92) 0%, rgba(240,249,244,0.82) 55%)",
  border: "1px solid rgba(116, 198, 157, 0.45)",
  borderRadius: "20px",
  padding: "24px",
  marginBottom: "20px",
  boxShadow: "0 8px 32px rgba(27, 67, 50, 0.1)",
  display: "block",
  textDecoration: "none",
};

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts();

  return (
    <div style={pageBg}>
      <main style={shell}>
        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 2.75rem)",
            fontWeight: 800,
            color: "#1B4332",
            marginBottom: "12px",
          }}
        >
          Blog
        </h1>
        <p style={{ fontSize: 16, color: "#2D6A4F", marginBottom: "36px", lineHeight: 1.6 }}>
          Tips and stories on kids&apos; typing, daily learning habits, and raising eco-conscious kids.
        </p>

        {posts.length === 0 ? (
          <p style={{ color: "#2D6A4F" }}>No posts yet — check back soon.</p>
        ) : (
          posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} style={cardStyle}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#1B4332" }}>
                {post.cover_emoji ? `${post.cover_emoji} ` : ""}
                {post.title}
              </h2>
              <p style={{ margin: "6px 0 0", fontSize: 13, color: "#74C69D", fontWeight: 600 }}>
                {formatDate(post.published_at)}
              </p>
              <p style={{ margin: "10px 0 0", fontSize: 15, color: "#2D6A4F", lineHeight: 1.6 }}>
                {post.meta_description}
              </p>
            </Link>
          ))
        )}
      </main>
    </div>
  );
}
