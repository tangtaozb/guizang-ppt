// 博客文章读取层 —— 文件系统（src/content/blog/*.mdx），Node runtime only。
// 每个 .mdx = 一篇文章（单一语言），frontmatter 带 lang + 可选 altSlug 关联译文。

import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import type { Lang, BlogPostMeta } from "./blog-format";

export type { Lang, BlogPostMeta } from "./blog-format";

export type BlogFrontmatter = {
  title: string;
  description: string;
  date: string; // ISO 8601
  author?: string;
  keywords?: string[];
  ogImage?: string;
  dek?: string;
  lang?: Lang; // 默认 "en"
  altSlug?: string;
};

export type BlogPost = BlogPostMeta & {
  content: string;
};

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");

async function readAllSlugs(): Promise<string[]> {
  try {
    const files = await fs.readdir(BLOG_DIR);
    return files
      .filter((f) => f.endsWith(".mdx"))
      .map((f) => f.replace(/\.mdx$/, ""));
  } catch {
    return [];
  }
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = matter(raw);
    const fm = parsed.data as BlogFrontmatter;
    const rt = readingTime(parsed.content);
    return {
      slug,
      title: fm.title,
      description: fm.description,
      date: fm.date,
      author: fm.author ?? "ArtifySlide",
      keywords: fm.keywords ?? [],
      ogImage: fm.ogImage,
      dek: fm.dek,
      lang: fm.lang ?? "en",
      altSlug: fm.altSlug,
      readingMinutes: Math.max(1, Math.ceil(rt.minutes)),
      wordCount: rt.words,
      content: parsed.content,
    };
  } catch {
    return null;
  }
}

export async function getAllPosts(): Promise<BlogPostMeta[]> {
  const slugs = await readAllSlugs();
  const posts = (await Promise.all(slugs.map((s) => getPost(s)))).filter(
    (p): p is BlogPost => !!p
  );
  return posts
    .map(({ content: _content, ...meta }) => meta)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getAllSlugs(): Promise<string[]> {
  return readAllSlugs();
}
