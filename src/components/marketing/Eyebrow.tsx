import type { CSSProperties, ReactNode } from "react";

/** Small gold pill label above a heading. */
export function Eyebrow({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <span className="mgk-eyebrow" style={style}>
      {children}
    </span>
  );
}
