"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MarkContactedButton({ id }: { id: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  const markContacted = async () => {
    setSaving(true);
    setFailed(false);
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, { method: "PATCH" });
      if (!res.ok) throw new Error(String(res.status));
      router.refresh();
    } catch {
      setFailed(true);
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-start" }}>
      <button
        type="button"
        onClick={markContacted}
        disabled={saving}
        style={{
          padding: "6px 12px",
          fontSize: 12.5,
          fontWeight: 700,
          borderRadius: 999,
          border: "1px solid #52B788",
          background: saving ? "#F0F9F4" : "#FFFFFF",
          color: "#1B4332",
          cursor: saving ? "default" : "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {saving ? "Saving…" : "Mark contacted"}
      </button>
      {failed && <span style={{ fontSize: 11.5, color: "#92400E" }}>Could not save. Try again.</span>}
    </div>
  );
}
