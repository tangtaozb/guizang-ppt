// 博客文章读取层 —— 文件系统优先（src/content/blog/*.mdx）。
// MDX 通过 next-mdx-remote 在 RSC 中渲染，不产生客户端 JS 包体。

import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";

export type BlogFrontmatter = {
  title: string;
  description: string;
  date: string; // ISO 8601
  author?: string;
  keywords?: string[];
  ogImage?: string;
  /** 用于列表卡片的短摘要，未提供则取 description */
  dek?: string;
};

export type BlogPostMeta = BlogFrontmatter & {
  slug: string;
  readingTimeText: string;
  wordCount: number;
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
      readingTimeText: rt.text,
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

/** 格式化日期：May 30, 2026 */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
