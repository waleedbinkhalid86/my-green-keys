"use client";

import { SiteBrandLogoLink } from "@/components/SiteBrandLogoLink";

export function SiteFooterBrand() {
  return (
    <div className="flex items-center gap-3">
      <SiteBrandLogoLink
        linkClassName="flex items-center gap-3 no-underline"
        imageClassName="h-11 w-11 shrink-0 md:h-[52px] md:w-[52px]"
        spanClassName="text-lg font-bold leading-tight text-white"
      />
    </div>
  );
}
