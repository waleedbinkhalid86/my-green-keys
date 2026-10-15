import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { getPublishedPosts } from "@/lib/blog/public-queries";
import { Container } from "@/components/marketing/Container";
import { Section } from "@/components/marketing/Section";
import { Card } from "@/components/marketing/Card";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Tips and stories on kids' typing, daily learning habits, and raising eco-conscious kids — from My Green Keys.",
};

const pageBg: CSSProperties = {
  backgroundColor: "#FAFAF5",
  backgroundImage: "radial-gradient(circle, #D1D5DB 1px, transparent 1px)",
  backgroundSize: "20px 20px",
  minHeight: "100%",
};

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts();

  return (
    <div style={pageBg}>
      <Section>
        <Container narrow>
          <h1 className="mgk-h1">Blog</h1>
          <p className="mgk-lead" style={{ marginTop: 16, marginBottom: "var(--mgk-space-5)" }}>
            Tips and stories on kids&apos; typing, daily learning habits, and raising eco-conscious kids.
          </p>

          {posts.length === 0 ? (
            <p className="mgk-body">No posts yet — check back soon.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--mgk-space-3)" }}>
              {posts.map((post) => (
                <Card key={post.id} href={`/blog/${post.slug}`}>
                  <h2 className="mgk-h3" style={{ fontSize: "1.375rem" }}>
                    {post.cover_emoji ? `${post.cover_emoji} ` : ""}
                    {post.title}
                  </h2>
                  <p className="mgk-label" style={{ marginTop: 8, fontSize: "0.875rem", color: "#2D6A4F" }}>
                    {formatDate(post.published_at)}
                  </p>
                  <p className="mgk-body" style={{ marginTop: 8 }}>
                    {post.meta_description}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </Container>
      </Section>
    </div>
  );
}
