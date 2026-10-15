import type { CSSProperties, ReactNode } from "react";

type SectionTone = "default" | "pale" | "dark";

/** Vertical rhythm for marketing pages: 64px mobile, 96px desktop. */
export function Section({
  children,
  tone = "default",
  id,
  className,
  style,
  "aria-labelledby": ariaLabelledBy,
}: {
  children: ReactNode;
  tone?: SectionTone;
  id?: string;
  className?: string;
  style?: CSSProperties;
  "aria-labelledby"?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={["mgk-sec", tone !== "default" && `mgk-sec--${tone}`, className].filter(Boolean).join(" ")}
      style={style}
    >
      {children}
    </section>
  );
}
