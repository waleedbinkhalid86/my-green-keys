"use client";

import { useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/blog/slugify";
import { markdownToHtml } from "@/lib/blog/markdown";
import type { BlogPost } from "@/lib/blog/types";

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(116, 198, 157, 0.5)",
  fontSize: 14,
  color: "#1B4332",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const labelStyle: CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "#52B788",
  marginBottom: 6,
};

const fieldWrap: CSSProperties = { marginBottom: 18 };

function CharCount({ value, limit }: { value: string; limit: number }) {
  const over = value.length > limit;
  return (
    <p style={{ margin: "4px 0 0", fontSize: 11.5, color: over ? "#B91C1C" : "#74C69D" }}>
      {value.length} / {limit} characters
    </p>
  );
}

export default function BlogEditorForm({ post }: { post?: BlogPost }) {
  const router = useRouter();
  const isEdit = Boolean(post);

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [metaDescription, setMetaDescription] = useState(post?.meta_description ?? "");
  const [coverEmoji, setCoverEmoji] = useState(post?.cover_emoji ?? "");
  const [contentMarkdown, setContentMarkdown] = useState(post?.content_markdown ?? "");
  const [published, setPublished] = useState(post?.published ?? false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      meta_description: metaDescription.trim(),
      content_markdown: contentMarkdown.trim(),
      cover_emoji: coverEmoji.trim(),
      published,
    };

    const res = await fetch(isEdit ? `/api/admin/blog/${post!.id}` : "/api/admin/blog", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? "Something went wrong.");
      setSubmitting(false);
      return;
    }

    router.push("/admin/blog");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1fr", alignItems: "start" }}>
        <div>
          <div style={fieldWrap}>
            <label style={labelStyle}>Title</label>
            <input
              style={inputStyle}
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
            />
            <CharCount value={title} limit={60} />
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle}>Slug</label>
            <input
              style={inputStyle}
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              required
            />
            <p style={{ margin: "4px 0 0", fontSize: 11.5, color: "#74C69D" }}>/blog/{slug || "…"}</p>
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle}>Cover emoji (optional)</label>
            <input
              style={{ ...inputStyle, width: 120 }}
              value={coverEmoji}
              onChange={(e) => setCoverEmoji(e.target.value)}
              maxLength={8}
            />
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle}>Meta description</label>
            <textarea
              style={{ ...inputStyle, minHeight: 70, resize: "vertical" }}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              required
            />
            <CharCount value={metaDescription} limit={160} />
          </div>

          <div style={fieldWrap}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
              />
              <span style={{ fontSize: 14, fontWeight: 600, color: "#1B4332" }}>Published</span>
            </label>
          </div>
        </div>

        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr", alignItems: "start" }}>
          <div style={fieldWrap}>
            <label style={labelStyle}>Content (Markdown)</label>
            <textarea
              style={{ ...inputStyle, minHeight: 320, fontFamily: "monospace", resize: "vertical" }}
              value={contentMarkdown}
              onChange={(e) => setContentMarkdown(e.target.value)}
              required
            />
          </div>
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>Preview</label>
          <div
            style={{
              border: "1px solid rgba(116, 198, 157, 0.5)",
              borderRadius: 12,
              padding: "16px 20px",
              background: "#fff",
              minHeight: 120,
              color: "#1B4332",
              lineHeight: 1.7,
            }}
            dangerouslySetInnerHTML={{
              __html: contentMarkdown ? markdownToHtml(contentMarkdown) : "<p style='color:#74C69D'>Nothing to preview yet.</p>",
            }}
          />
        </div>
      </div>

      {error ? (
        <p style={{ color: "#B91C1C", fontWeight: 600, fontSize: 14, marginBottom: 12 }}>{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        style={{
          background: "#2D6A4F",
          color: "#fff",
          fontWeight: 700,
          fontSize: 14,
          padding: "12px 24px",
          borderRadius: 10,
          border: "none",
          cursor: submitting ? "default" : "pointer",
          opacity: submitting ? 0.7 : 1,
        }}
      >
        {submitting ? "Saving…" : isEdit ? "Save changes" : "Create post"}
      </button>
    </form>
  );
}
