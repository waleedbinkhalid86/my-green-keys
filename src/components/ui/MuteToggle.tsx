"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useMuted } from "@/lib/sounds/use-mute";

export function MuteToggle() {
  const [muted, setMuted] = useMuted();

  return (
    <button
      type="button"
      onClick={() => setMuted(!muted)}
      aria-label={muted ? "Unmute sounds" : "Mute sounds"}
      title={muted ? "Sound off — click to turn on" : "Sound on — click to mute"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        borderRadius: 10,
        border: "1px solid rgba(82, 183, 136, 0.45)",
        cursor: "pointer",
        background: muted ? "rgba(45, 106, 79, 0.35)" : "rgba(45, 106, 79, 0.2)",
        color: "#52B788",
        flexShrink: 0,
      }}
    >
      {muted ? (
        <VolumeX className="h-5 w-5" strokeWidth={2.25} aria-hidden />
      ) : (
        <Volume2 className="h-5 w-5" strokeWidth={2.25} aria-hidden />
      )}
    </button>
  );
}
