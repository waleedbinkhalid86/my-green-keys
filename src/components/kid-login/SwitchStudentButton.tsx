"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isKioskDevice } from "@/lib/kid-login/kiosk-storage";

const BTN_STYLE: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 22px",
  fontSize: "0.95rem",
  fontWeight: 700,
  color: "#1B4332",
  background: "#fff",
  border: "2px solid #52B788",
  borderRadius: 9999,
  cursor: "pointer",
  boxShadow: "0 4px 14px rgba(82, 183, 136, 0.25)",
};

type SwitchStudentButtonProps = {
  style?: React.CSSProperties;
};

/** Signs out and returns to class roster on kiosk devices. */
export function SwitchStudentButton({ style }: SwitchStudentButtonProps) {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setShow(isKioskDevice());
  }, []);

  if (!show) return null;

  const handleClick = async () => {
    setBusy(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.replace("/kid-login");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      style={{ ...BTN_STYLE, opacity: busy ? 0.65 : 1, ...style }}
    >
      {busy ? "One moment…" : "I'm finished — switch student"}
    </button>
  );
}
