import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content/blog");
const ZH_BLOG_DIR = path.join(process.cwd(), "content/zh/blog");

export type BlogPostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
};

export type BlogPost = BlogPostMeta & { content: string };

function readPostMeta(dir: string, file: string): BlogPostMeta {
  const slug = file.replace(/\.mdx$/, "");
  const raw = fs.readFileSync(path.join(dir, file), "utf-8");
  const { data } = matter(raw);
  return {
    slug,
    title: data.title as string,
    description: data.description as string,
    date: data.date as string,
    tags: (data.tags as string[]) ?? [],
  };
}

function readPost(dir: string, slug: string): BlogPost | null {
  const file = path.join(dir, `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf-8");
  const { data, content } = matter(raw);
  return {
    slug,
    title: data.title as string,
    description: data.description as string,
    date: data.date as string,
    tags: (data.tags as string[]) ?? [],
    content,
  };
}

export function getBlogPosts(): BlogPostMeta[] {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));
  const posts = files.map((file) => readPostMeta(BLOG_DIR, file));
  return posts.sort((a, b) => (a.date > b.date ? -1 : 1));
}

export function getBlogPost(slug: string): BlogPost | null {
  return readPost(BLOG_DIR, slug);
}

export function getAllSlugs(): string[] {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

/** Chinese blog posts live in content/zh/blog and share slugs with the English originals. */
export function getZhBlogPosts(): BlogPostMeta[] {
  if (!fs.existsSync(ZH_BLOG_DIR)) return [];
  const files = fs.readdirSync(ZH_BLOG_DIR).filter((f) => f.endsWith(".mdx"));
  const posts = files.map((file) => readPostMeta(ZH_BLOG_DIR, file));
  return posts.sort((a, b) => (a.date > b.date ? -1 : 1));
}

export function getZhBlogPost(slug: string): BlogPost | null {
  return readPost(ZH_BLOG_DIR, slug);
}

export function getAllZhSlugs(): string[] {
  if (!fs.existsSync(ZH_BLOG_DIR)) return [];
  return fs
    .readdirSync(ZH_BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

/** True when a Chinese translation exists for the given English blog slug. */
export function hasZhTranslation(slug: string): boolean {
  return fs.existsSync(path.join(ZH_BLOG_DIR, `${slug}.mdx`));
}
