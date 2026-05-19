"use client";

import { usePathname } from "next/navigation";
import SiteFooter from "@/components/SiteFooter";

const HIDE_FOOTER_PREFIXES = ["/login", "/signup", "/admin"];

export default function ConditionalSiteFooter() {
  const pathname = usePathname() || "";
  if (HIDE_FOOTER_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return null;
  }
  return <SiteFooter />;
}
