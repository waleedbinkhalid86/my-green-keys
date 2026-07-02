import type { CSSProperties } from "react";
import Link from "next/link";

const TABS = [
  { key: "dashboard", label: "Dashboard", href: "/admin" },
  { key: "blog", label: "Blog", href: "/admin/blog" },
  { key: "seo", label: "SEO health", href: "/admin/seo" },
] as const;

export default function AdminTabs({ active }: { active: (typeof TABS)[number]["key"] }) {
  const wrap: CSSProperties = {
    display: "flex",
    gap: 6,
    marginBottom: 24,
    borderBottom: "1px solid rgba(116, 198, 157, 0.35)",
    paddingBottom: 0,
  };

  return (
    <nav style={wrap}>
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        const style: CSSProperties = {
          padding: "10px 16px",
          fontSize: 13.5,
          fontWeight: 700,
          textDecoration: "none",
          color: isActive ? "#1B4332" : "#52B788",
          borderBottom: isActive ? "2px solid #2D6A4F" : "2px solid transparent",
        };
        return (
          <Link key={tab.key} href={tab.href} style={style}>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
