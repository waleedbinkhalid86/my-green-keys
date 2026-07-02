import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedPostBySlug } from "@/lib/blog/public-queries";
import { markdownToHtml } from "@/lib/blog/markdown";

const baseUrl = "https://mygreenkeys.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return {};

  const url = `${baseUrl}/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.meta_description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.meta_description,
      url,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.meta_description,
    },
  };
}

const pageBg: CSSProperties = {
  backgroundColor: "#FAFAF7",
  backgroundImage: "radial-gradient(circle, #D1D5DB 1px, transparent 1px)",
  backgroundSize: "20px 20px",
  minHeight: "100%",
};

const shell: CSSProperties = {
  maxWidth: 720,
  margin: "0 auto",
  padding: "48px 20px 80px",
};

const articleStyle: CSSProperties = {
  fontSize: 16,
  lineHeight: 1.75,
  color: "#2D6A4F",
};

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.meta_description,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: { "@type": "Person", name: "Waleed Bin Khalid" },
    publisher: {
      "@type": "Organization",
      name: "My Green Keys",
      logo: { "@type": "ImageObject", url: `${baseUrl}/logo-bgr.png` },
    },
    mainEntityOfPage: `${baseUrl}/blog/${post.slug}`,
  };

  return (
    <div style={pageBg}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main style={shell}>
        <Link href="/blog" style={{ fontSize: 13, fontWeight: 600, color: "#52B788", textDecoration: "none" }}>
          ← Blog
        </Link>

        <h1
          style={{
            margin: "12px 0 8px",
            fontSize: "clamp(1.8rem, 5vw, 2.5rem)",
            fontWeight: 800,
            color: "#1B4332",
          }}
        >
          {post.cover_emoji ? `${post.cover_emoji} ` : ""}
          {post.title}
        </h1>
        <p style={{ margin: "0 0 32px", fontSize: 13, fontWeight: 600, color: "#74C69D" }}>
          {formatDate(post.published_at)}
        </p>

        <article
          style={articleStyle}
          // Content is founder-authored via /admin/blog and passed through markdownToHtml,
          // which escapes raw HTML before emitting its whitelisted tag set.
          dangerouslySetInnerHTML={{ __html: markdownToHtml(post.content_markdown) }}
        />
      </main>
    </div>
  );
}
