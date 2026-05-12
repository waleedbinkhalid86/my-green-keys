const MUTE_KEY = "mgk_sound_muted";

const SOUND_URLS: Record<"correct" | "wrong" | "complete", string> = {
  correct: "/sounds/correct.mp3",
  wrong: "/sounds/wrong.mp3",
  complete: "/sounds/complete.mp3",
};

export function playSound(name: "correct" | "wrong" | "complete"): void {
  if (typeof window === "undefined") return;
  try {
    if (localStorage.getItem(MUTE_KEY) === "true") return;
    const audio = new Audio(SOUND_URLS[name]);
    audio.volume = 0.4;
    void audio.play();
  } catch {
    // Autoplay / missing audio / storage — fail silently
  }
}
