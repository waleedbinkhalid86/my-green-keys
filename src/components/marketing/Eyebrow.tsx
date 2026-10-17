import type { CSSProperties, ReactNode } from "react";

/**
 * Small label above a heading. `pill` = gold pill (default).
 * `text` = plain bold label in #2D6A4F (#74C69D when `onDark`).
 */
export function Eyebrow({
  children,
  style,
  variant = "pill",
  onDark = false,
}: {
  children: ReactNode;
  style?: CSSProperties;
  variant?: "pill" | "text";
  onDark?: boolean;
}) {
  const cls =
    variant === "text"
      ? ["mgk-eyebrow-text", onDark && "mgk-eyebrow-text--on-dark"].filter(Boolean).join(" ")
      : "mgk-eyebrow";
  return (
    <span className={cls} style={style}>
      {children}
    </span>
  );
}
