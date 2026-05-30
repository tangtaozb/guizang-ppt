// 单篇文章页 —— 阅读体验优先
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { SiteNav } from "@/components/layout/site-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { getPost, getAllSlugs, formatDate } from "@/lib/blog";
import { mdxComponents } from "@/components/blog/mdx-components";
import { BlogCTA } from "@/components/blog/blog-cta";
import {
  JsonLd,
  organizationSchema,
  websiteSchema,
} from "@/components/seo/json-ld";

const SITE_URL = "https://www.artifyslide.com";

export const dynamicParams = false; // 仅生成 src/content/blog/ 下存在的文章

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Not found" };
  const url = `${SITE_URL}/blog/${slug}`;
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: "article",
      publishedTime: post.date,
      authors: [post.author ?? "ArtifySlide"],
      images: post.ogImage ? [post.ogImage] : undefined, // 否则继承根 metadata 的 /og.png
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: post.ogImage ? [post.ogImage] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Organization", name: post.author },
    publisher: {
      "@type": "Organization",
      name: "ArtifySlide",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/og.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${slug}` },
    image: post.ogImage ?? `${SITE_URL}/og.png`,
    keywords: post.keywords?.join(", "),
  };

  return (
    <div className="min-h-screen bg-white text-foreground font-sans">
      <JsonLd data={[organizationSchema, websiteSchema, articleSchema]} />
      <SiteNav />

      <article className="mx-auto max-w-[720px] px-6 sm:px-10 pt-12 sm:pt-20 pb-24">
        {/* Breadcrumb */}
        <div className="font-mono text-[11.5px] uppercase tracking-[0.16em] text-muted-foreground">
          <Link href="/blog" className="hover:text-accent transition-colors">
            ← Journal
          </Link>
        </div>

        {/* Article header */}
        <header className="mt-10 sm:mt-14">
          <div className="flex items-center gap-2.5 font-mono text-[11.5px] uppercase tracking-[0.16em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {formatDate(post.date)} · {post.readingTimeText}
          </div>
          <h1 className="mt-6 text-[36px] sm:text-[52px] font-medium leading-[1.05] tracking-[-0.035em]">
            {post.title}
          </h1>
          {post.dek && (
            <p className="mt-5 text-[18px] sm:text-[20px] leading-[1.55] text-neutral-700 font-serif">
              {post.dek}
            </p>
          )}
          <div className="mt-8 border-b border-border" />
        </header>

        {/* MDX body */}
        <div className="mdx-body">
          <MDXRemote
            source={post.content}
            components={{ ...mdxComponents, BlogCTA }}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
              },
            }}
          />
        </div>

        {/* End-of-article CTA */}
        <div className="mt-20 border-t border-border pt-10">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            — End of article
          </div>
          <div className="mt-4 text-[22px] sm:text-[26px] font-medium leading-[1.3] tracking-[-0.01em] max-w-[560px]">
            If this resonated, the simplest next step is to try it.
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex h-11 items-center rounded-md bg-foreground px-5 text-[14.5px] font-medium text-white hover:opacity-90 transition-opacity"
            >
              Open ArtifySlide →
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-11 items-center rounded-md border border-border px-4.5 text-[14.5px] font-medium hover:bg-muted transition-colors"
            >
              See pricing
            </Link>
            <Link
              href="/blog"
              className="inline-flex h-11 items-center rounded-md border border-border px-4.5 text-[14.5px] font-medium hover:bg-muted transition-colors"
            >
              More posts
            </Link>
          </div>
        </div>
      </article>

      <SiteFooter />
    </div>
  );
}
