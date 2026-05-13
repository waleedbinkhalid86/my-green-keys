"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuthProfileRoute } from "@/contexts/AuthProfileRouteContext";

type SiteBrandLogoLinkProps = {
  linkClassName?: string;
  imageClassName?: string;
  spanClassName?: string;
  /** When true, wraps only the image (e.g. centered auth shell). */
  imageOnly?: boolean;
  /** Pass true for above-the-fold brand marks (LCP). */
  imagePriority?: boolean;
};

export function SiteBrandLogoLink({
  linkClassName = "",
  imageClassName = "",
  spanClassName = "",
  imageOnly = false,
  imagePriority = false,
}: SiteBrandLogoLinkProps) {
  const { logoHref } = useAuthProfileRoute();

  return (
    <Link
      href={logoHref}
      className={linkClassName}
      aria-label={imageOnly ? "My Green Keys home" : undefined}
    >
      <Image
        src="/logo-bgr.png"
        alt="My Green Keys logo"
        width={52}
        height={52}
        className={imageClassName}
        priority={imagePriority}
      />
      {imageOnly ? null : <span className={spanClassName}>My Green Keys</span>}
    </Link>
  );
}
