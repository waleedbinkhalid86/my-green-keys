export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  meta_description: string;
  content_markdown: string;
  cover_emoji: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};
