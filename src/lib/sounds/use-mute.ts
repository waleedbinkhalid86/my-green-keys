"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "mgk_sound_muted";

export function useMuted(): [boolean, (muted: boolean) => void] {
  const [muted, setMutedState] = useState(false);

  useEffect(() => {
    try {
      setMutedState(localStorage.getItem(STORAGE_KEY) === "true");
    } catch {
      // ignore
    }
  }, []);

  const setMuted = useCallback((value: boolean) => {
    setMutedState(value);
    try {
      localStorage.setItem(STORAGE_KEY, value ? "true" : "false");
    } catch {
      // ignore
    }
  }, []);

  return [muted, setMuted];
}
