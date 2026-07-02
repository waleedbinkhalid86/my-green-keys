"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function PublishToggleButton({
  postId,
  published,
}: {
  postId: string;
  published: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const toggle = () => {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/admin/blog/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !published }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? "Failed to update post.");
        return;
      }
      router.refresh();
    });
  };

  return (
    <span>
      <button
        type="button"
        onClick={toggle}
        disabled={isPending}
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: published ? "#92400E" : "#2D6A4F",
          background: "none",
          border: "none",
          cursor: isPending ? "default" : "pointer",
          padding: 0,
          opacity: isPending ? 0.6 : 1,
        }}
      >
        {published ? "Unpublish" : "Publish"}
      </button>
      {error ? <span style={{ display: "block", fontSize: 11, color: "#B91C1C" }}>{error}</span> : null}
    </span>
  );
}
