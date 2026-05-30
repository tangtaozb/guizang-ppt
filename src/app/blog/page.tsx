// 博客列表页 —— server 取数据，客户端组件负责 i18n chrome + 按语言筛选
import type { Metadata } from "next";
import { SiteNav } from "@/components/layout/site-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { getAllPosts } from "@/lib/blog";
import { BlogIndexClient } from "@/components/blog/blog-index-client";

const SITE_URL = "https://www.artifyslide.com";

export const metadata: Metadata = {
  title: "Blog · 博客",
  description:
    "Editorial notes on AI presentations and magazine-style design. AI 演示与杂志风格设计的编辑手记。",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "ArtifySlide Blog",
    description:
      "Editorial notes on AI presentations and magazine-style design.",
    url: `${SITE_URL}/blog`,
    type: "website",
  },
};

export default async function BlogIndex() {
  const posts = await getAllPosts();

  return (
    <div className="min-h-screen bg-white text-foreground font-sans">
      <SiteNav />
      <BlogIndexClient posts={posts} />
      <SiteFooter />
    </div>
  );
}
