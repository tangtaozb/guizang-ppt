// 单篇文章页 —— server 渲染 MDX 正文（文章自身语言），chrome 由客户端组件按站点语言切换
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { SiteNav } from "@/components/layout/site-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { getPost, getAllSlugs } from "@/lib/blog";
import type { Lang } from "@/lib/blog-format";
import { mdxComponents } from "@/components/blog/mdx-components";
import { BlogCTA } from "@/components/blog/blog-cta";
import {
  BlogBackLink,
  BlogDateline,
  BlogAltLink,
  BlogEndCTA,
} from "@/components/blog/blog-article-chrome";
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

  // hreflang：有译文时互相指向
  let languages: Record<string, string> | undefined;
  if (post.altSlug) {
    const selfCode = post.lang === "zh" ? "zh-CN" : "en";
    const altCode = post.lang === "zh" ? "en" : "zh-CN";
    languages = {
      [selfCode]: `/blog/${slug}`,
      [altCode]: `/blog/${post.altSlug}`,
    };
  }

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${slug}`, languages },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: "article",
      locale: post.lang === "zh" ? "zh_CN" : "en_US",
      publishedTime: post.date,
      authors: [post.author],
      images: post.ogImage ? [post.ogImage] : undefined,
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

  const otherLang: Lang = post.lang === "en" ? "zh" : "en";

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: post.lang === "zh" ? "zh-CN" : "en",
    author: { "@type": "Organization", name: post.author },
    publisher: {
      "@type": "Organization",
      name: "ArtifySlide",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/og.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${slug}` },
    image: post.ogImage ?? `${SITE_URL}/og.png`,
    keywords: post.keywords.join(", "),
  };

  return (
    <div className="min-h-screen bg-white text-foreground font-sans">
      <JsonLd data={[organizationSchema, websiteSchema, articleSchema]} />
      <SiteNav />

      <article className="mx-auto max-w-[720px] px-6 sm:px-10 pt-12 sm:pt-20 pb-24">
        {/* Breadcrumb + 译文互链 */}
        <div className="flex items-center justify-between gap-4 font-mono text-[11.5px] uppercase tracking-[0.16em] text-muted-foreground">
          <BlogBackLink />
          {post.altSlug && (
            <BlogAltLink altSlug={post.altSlug} targetLang={otherLang} />
          )}
        </div>

        {/* Article header */}
        <header className="mt-10 sm:mt-14">
          <div className="flex items-center gap-2.5 font-mono text-[11.5px] uppercase tracking-[0.16em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <BlogDateline date={post.date} minutes={post.readingMinutes} />
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

        {/* MDX body —— 服务端渲染，文章自身语言 */}
        <div className="mdx-body">
          <MDXRemote
            source={post.content}
            components={{ ...mdxComponents, BlogCTA }}
            options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
          />
        </div>

        {/* 文末 CTA（i18n） */}
        <BlogEndCTA />
      </article>

      <SiteFooter />
    </div>
  );
}
