import Link from "next/link";
import type { CSSProperties, MouseEventHandler, ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  /** Internal paths render next/link; mailto:, tel:, http(s) and #hash render a plain anchor. */
  href?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  type?: "button" | "submit";
  disabled?: boolean;
  /** Use on #1B4332 / dark image backgrounds. */
  onDark?: boolean;
  block?: boolean;
  target?: string;
  rel?: string;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
};

function isPlainAnchor(href: string): boolean {
  return /^(mailto:|tel:|https?:|#)/.test(href);
}

function BaseButton({
  variant,
  children,
  href,
  onClick,
  type = "button",
  disabled,
  onDark,
  block,
  target,
  rel,
  className,
  style,
  "aria-label": ariaLabel,
}: ButtonProps & { variant: "primary" | "secondary" }) {
  const cls = [
    "mgk-btn",
    `mgk-btn--${variant}`,
    onDark && "mgk-btn--on-dark",
    block && "mgk-btn--block",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (href) {
    if (isPlainAnchor(href)) {
      return (
        <a href={href} className={cls} style={style} onClick={onClick} target={target} rel={rel} aria-label={ariaLabel}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls} style={style} onClick={onClick} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={cls} style={style} onClick={onClick} disabled={disabled} aria-label={ariaLabel}>
      {children}
    </button>
  );
}

/** #2D6A4F with white text (gold with #1B4332 text when `onDark`). */
export function PrimaryButton(props: ButtonProps) {
  return <BaseButton variant="primary" {...props} />;
}

/** Outlined #2D6A4F (white outline when `onDark`). */
export function SecondaryButton(props: ButtonProps) {
  return <BaseButton variant="secondary" {...props} />;
}
