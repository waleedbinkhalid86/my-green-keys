import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";

const TITLE_LIMIT = 60;
const DESCRIPTION_LIMIT = 160;

// Mirrors src/app/layout.tsx's root metadata — what a page gets when it
// exports no metadata of its own, or a plain-string title gets appended to.
const DEFAULT_TITLE = "My Green Keys — Daily learning habits for kids 6–14";
const TITLE_TEMPLATE_SUFFIX = " | My Green Keys";
const DEFAULT_DESCRIPTION =
  "A daily learning platform for kids 6–14. Typing, math, and eco lessons that build daily habits — not just screen time. Try free.";

export type SeoAuditRow = {
  route: string;
  title: string;
  titleLength: number;
  titleOk: boolean;
  description: string;
  descriptionLength: number;
  descriptionOk: boolean;
  h1Count: number;
  h1Ok: boolean;
  usesDefaultMetadata: boolean;
};

const AUDITED_ROUTES = [
  "/",
  "/pricing",
  "/brain-sprint",
  "/schools",
  "/story",
  "/blog",
  "/privacy",
  "/terms",
  "/refund",
] as const;

/**
 * Both the dynamic import() and fs.readFileSync() below use literal paths
 * inlined per case (not passed through a shared helper) so Turbopack/webpack
 * can statically scope its file trace to just these 9 files instead of
 * conservatively tracing the whole project.
 */
async function auditOneRoute(
  route: (typeof AUDITED_ROUTES)[number]
): Promise<{ metadata: Metadata | undefined; h1Count: number }> {
  switch (route) {
    case "/": {
      const m = await import("@/app/page");
      return {
        metadata: "metadata" in m ? (m.metadata as Metadata) : undefined,
        h1Count: countH1(path.join(process.cwd(), "src/app/page.tsx")),
      };
    }
    case "/pricing": {
      const m = await import("@/app/pricing/page");
      return {
        metadata: "metadata" in m ? (m.metadata as Metadata) : undefined,
        h1Count: countH1(path.join(process.cwd(), "src/app/pricing/page.tsx")),
      };
    }
    case "/brain-sprint": {
      const m = await import("@/app/brain-sprint/page");
      return {
        metadata: "metadata" in m ? (m.metadata as Metadata) : undefined,
        h1Count: countH1(path.join(process.cwd(), "src/app/brain-sprint/page.tsx")),
      };
    }
    case "/schools": {
      const m = await import("@/app/schools/page");
      return {
        metadata: "metadata" in m ? (m.metadata as Metadata) : undefined,
        h1Count: countH1(path.join(process.cwd(), "src/app/schools/page.tsx")),
      };
    }
    case "/story": {
      const m = await import("@/app/story/page");
      return {
        metadata: "metadata" in m ? (m.metadata as Metadata) : undefined,
        h1Count: countH1(path.join(process.cwd(), "src/app/story/page.tsx")),
      };
    }
    case "/blog": {
      const m = await import("@/app/blog/page");
      return {
        metadata: "metadata" in m ? (m.metadata as Metadata) : undefined,
        h1Count: countH1(path.join(process.cwd(), "src/app/blog/page.tsx")),
      };
    }
    case "/privacy": {
      const m = await import("@/app/privacy/page");
      return {
        metadata: "metadata" in m ? (m.metadata as Metadata) : undefined,
        h1Count: countH1(path.join(process.cwd(), "src/app/privacy/page.tsx")),
      };
    }
    case "/terms": {
      const m = await import("@/app/terms/page");
      return {
        metadata: "metadata" in m ? (m.metadata as Metadata) : undefined,
        h1Count: countH1(path.join(process.cwd(), "src/app/terms/page.tsx")),
      };
    }
    case "/refund": {
      const m = await import("@/app/refund/page");
      return {
        metadata: "metadata" in m ? (m.metadata as Metadata) : undefined,
        h1Count: countH1(path.join(process.cwd(), "src/app/refund/page.tsx")),
      };
    }
  }
}

/** The title as it would actually render in a browser tab, template applied. */
function resolveEffectiveTitle(metadata: Metadata | undefined): string {
  const t = metadata?.title;
  if (!t) return DEFAULT_TITLE;
  if (typeof t === "string") return `${t}${TITLE_TEMPLATE_SUFFIX}`;
  if (typeof t === "object" && "absolute" in t && t.absolute) return t.absolute;
  return DEFAULT_TITLE;
}

function resolveEffectiveDescription(metadata: Metadata | undefined): string {
  return typeof metadata?.description === "string" ? metadata.description : DEFAULT_DESCRIPTION;
}

function countH1(fullPath: string): number {
  try {
    const source = fs.readFileSync(fullPath, "utf-8");
    return (source.match(/<h1[\s>]/g) ?? []).length;
  } catch {
    return -1;
  }
}

export async function runSeoAudit(): Promise<SeoAuditRow[]> {
  const rows: SeoAuditRow[] = [];

  for (const route of AUDITED_ROUTES) {
    const { metadata, h1Count } = await auditOneRoute(route);
    const title = resolveEffectiveTitle(metadata);
    const description = resolveEffectiveDescription(metadata);

    rows.push({
      route,
      title,
      titleLength: title.length,
      titleOk: title.length > 0 && title.length <= TITLE_LIMIT,
      description,
      descriptionLength: description.length,
      descriptionOk: description.length > 0 && description.length <= DESCRIPTION_LIMIT,
      h1Count,
      h1Ok: h1Count === 1,
      usesDefaultMetadata: !metadata,
    });
  }

  return rows;
}
