import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

/**
 * One card style: 16px radius, 24px padding, one shadow.
 * `media` renders edge-to-edge above the padded body. `href` makes the whole card a link.
 */
export function Card({
  children,
  media,
  href,
  className,
  style,
  bodyStyle,
}: {
  children: ReactNode;
  media?: ReactNode;
  href?: string;
  className?: string;
  style?: CSSProperties;
  bodyStyle?: CSSProperties;
}) {
  const cls = ["mgk-panel", className].filter(Boolean).join(" ");
  const inner = (
    <>
      {media ? <div className="mgk-panel__media">{media}</div> : null}
      <div className="mgk-panel__body" style={bodyStyle}>
        {children}
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cls} style={style}>
        {inner}
      </Link>
    );
  }
  return (
    <div className={cls} style={style}>
      {inner}
    </div>
  );
}
