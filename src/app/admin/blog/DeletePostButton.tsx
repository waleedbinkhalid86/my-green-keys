"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function DeletePostButton({ postId, title }: { postId: string; title: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const remove = () => {
    if (!window.confirm(`Delete "${title}"? This can't be undone.`)) return;
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/admin/blog/${postId}`, { method: "DELETE" });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? "Failed to delete post.");
        return;
      }
      router.refresh();
    });
  };

  return (
    <span>
      <button
        type="button"
        onClick={remove}
        disabled={isPending}
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "#B91C1C",
          background: "none",
          border: "none",
          cursor: isPending ? "default" : "pointer",
          padding: 0,
          opacity: isPending ? 0.6 : 1,
        }}
      >
        Delete
      </button>
      {error ? <span style={{ display: "block", fontSize: 11, color: "#B91C1C" }}>{error}</span> : null}
    </span>
  );
}
