"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

const MAX_CHARS = 20;
const MILESTONE = 10;
const YAY_MS = 1500;

const HOP: Keyframe[] = [
  { transform: "translateY(0)" },
  { transform: "translateY(-10px)", offset: 0.45 },
  { transform: "translateY(0) scale(1.05, 0.94)", offset: 0.8 },
  { transform: "none" },
];

const JUMP: Keyframe[] = [
  { transform: "translateY(0)" },
  { transform: "translateY(-24px) rotate(-4deg)", offset: 0.4 },
  { transform: "translateY(0) rotate(0) scale(1.07, 0.9)", offset: 0.75 },
  { transform: "none" },
];

function messageFor(length: number): string {
  if (length === 0) return "Panda is waiting for your first letter.";
  if (length <= 4) return "Keep going, the sprout is waking up.";
  if (length <= 9) return "Nice typing! Look how it grows.";
  return "Wow, you are a Green Keys star!";
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Hero grid: server-rendered intro, Panda with a CSS sprout, and the typing card.
 * Panda hops on each keystroke and cheers at every 10 characters (no network calls).
 */
export function HeroPlayground({ intro }: { intro: ReactNode }) {
  const [text, setText] = useState("");
  const [yay, setYay] = useState(0);
  const inputId = useId();
  const reactRef = useRef<HTMLDivElement>(null);
  const motionRef = useRef<Animation | null>(null);
  const reached = useRef(new Set<number>());
  const yayTimer = useRef<number | undefined>(undefined);
  const len = text.length;
  const stem = 8 + Math.min(len, 12) * 5.5;

  useEffect(() => () => window.clearTimeout(yayTimer.current), []);

  // Cancel the running hop/jump first so fast typing never stacks animations.
  const play = (frames: Keyframe[], duration: number, counter: "hops" | "jumps") => {
    const el = reactRef.current;
    if (!el || prefersReducedMotion()) return;
    motionRef.current?.cancel();
    motionRef.current = el.animate(frames, { duration, easing: "ease-out" });
    el.dataset[counter] = String(Number(el.dataset[counter] ?? 0) + 1);
  };

  const handleChange = (value: string) => {
    const next = value.slice(0, MAX_CHARS);
    const grew = next.length > text.length;
    setText(next);
    if (next.length === 0) reached.current.clear();
    if (!grew) return;

    const milestone = Math.floor(next.length / MILESTONE) * MILESTONE;
    if (milestone > 0 && !reached.current.has(milestone)) {
      reached.current.add(milestone);
      setYay((n) => n + 1);
      window.clearTimeout(yayTimer.current);
      yayTimer.current = window.setTimeout(() => setYay(0), YAY_MS);
      play(JUMP, 600, "jumps");
    } else {
      play(HOP, 250, "hops");
    }
  };

  return (
    <div className="mgk-home-hero__grid">
      <div className="mgk-home-hero__intro">{intro}</div>

      <div className="mgk-home-hero__art">
        <div className="mgk-home-pet">
          <span className="mgk-home-pet__shadow" aria-hidden />
          <div className="mgk-home-pet__hover">
            <div className="mgk-home-pet__float">
              <div className="mgk-home-pet__react" ref={reactRef}>
                <Image
                  src="/images/home/panda-happy.webp"
                  alt="Panda, the My Green Keys companion, waving with a bamboo sprig"
                  width={640}
                  height={659}
                  priority
                  sizes="(max-width: 899px) 220px, 340px"
                  className="mgk-home-panda"
                />
              </div>
            </div>
          </div>
          {yay > 0 ? (
            <span key={yay} className="mgk-home-yay" aria-hidden>
              Yay!
            </span>
          ) : null}
        </div>
        <div className="mgk-home-sprout" aria-hidden>
          <div className="mgk-home-sprout__plant" style={{ height: stem }}>
            <span className="mgk-home-sprout__stem" />
            <span
              className="mgk-home-leaf mgk-home-leaf--left"
              data-visible={len >= 4 ? "true" : "false"}
            />
            <span
              className="mgk-home-leaf mgk-home-leaf--right"
              data-visible={len >= 8 ? "true" : "false"}
            />
          </div>
          <span className="mgk-home-sprout__soil" />
        </div>
      </div>

      <div className="mgk-home-hero__card">
        <div className="mgk-home-typecard">
          <label htmlFor={inputId} className="mgk-home-typecard__label">
            Type any word and watch Panda&apos;s sprout grow
          </label>
          <input
            id={inputId}
            type="text"
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            maxLength={MAX_CHARS}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="sunflower"
            className="mgk-home-typecard__input"
          />
          <p className="mgk-home-typecard__msg" aria-live="polite">
            {messageFor(len)}
          </p>
        </div>
      </div>
    </div>
  );
}
