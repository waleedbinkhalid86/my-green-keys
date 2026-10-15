import type { CSSProperties, ReactNode } from "react";

/** 1120px content width, 16px gutter on mobile, 24px from 768px. `narrow` = 720px reading width. */
export function Container({
  children,
  narrow = false,
  className,
  style,
}: {
  children: ReactNode;
  narrow?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={["mgk-wrap", narrow && "mgk-wrap--narrow", className].filter(Boolean).join(" ")}
      style={style}
    >
      {children}
    </div>
  );
}
