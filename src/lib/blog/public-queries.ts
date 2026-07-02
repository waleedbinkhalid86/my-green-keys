import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { BlogPost } from "./types";

export const getPublishedPosts = cache(async (): Promise<BlogPost[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });
  return (data as BlogPost[] | null) ?? [];
});

export const getPublishedPostBySlug = cache(async (slug: string): Promise<BlogPost | null> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  return (data as BlogPost | null) ?? null;
});
