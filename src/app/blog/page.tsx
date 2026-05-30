// 博客列表页 —— 杂志感期刊封面
import Link from "next/link";
import type { Metadata } from "next";
import { SiteNav } from "@/components/layout/site-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { getAllPosts, formatDate } from "@/lib/blog";

const SITE_URL = "https://www.artifyslide.com";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Editorial notes on AI presentations, magazine-style design, and what makes a deck actually worth looking at.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "ArtifySlide Blog",
    description:
      "Editorial notes on AI presentations, magazine-style design, and what makes a deck actually worth looking at.",
    url: `${SITE_URL}/blog`,
    type: "website",
  },
};

export default async function BlogIndex() {
  const posts = await getAllPosts();

  return (
    <div className="min-h-screen bg-white text-foreground font-sans">
      <SiteNav />

      <header className="mx-auto max-w-[1100px] px-6 sm:px-14 pt-16 sm:pt-24 pb-10">
        <div className="flex items-center gap-2.5 font-mono text-[11.5px] uppercase tracking-[0.16em] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          ARTIFYSLIDE · JOURNAL
        </div>
        <h1 className="mt-6 text-[48px] sm:text-[72px] font-medium leading-[0.96] tracking-[-0.045em]">
          Notes on decks{" "}
          <span className="font-serif text-muted-foreground">worth looking at.</span>
        </h1>
        <p className="mt-6 max-w-[640px] text-[17px] leading-[1.6] text-neutral-700">
          Essays on AI presentations, editorial typography, and the design choices
          most slide tools refuse to make.
        </p>
      </header>

      <section className="mx-auto max-w-[1100px] px-6 sm:px-14 pb-24">
        {posts.length === 0 ? (
          <div className="border-t border-border pt-10 text-neutral-500">
            No posts yet.
          </div>
        ) : (
          <ul className="divide-y divide-border border-t border-border">
            {posts.map((p, i) => (
              <li key={p.slug} className="py-8 sm:py-10">
                <Link
                  href={`/blog/${p.slug}`}
                  className="group grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-4 sm:gap-10 items-baseline"
                >
                  <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground pt-2">
                    <div>{String(i + 1).padStart(2, "0")} / {formatDate(p.date)}</div>
                    <div className="mt-1 normal-case tracking-normal opacity-70">
                      {p.readingTimeText}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-[26px] sm:text-[34px] font-medium leading-[1.1] tracking-[-0.02em] group-hover:text-accent transition-colors">
                      {p.title}
                    </h2>
                    <p className="mt-3 max-w-[720px] text-[16px] leading-[1.6] text-neutral-700">
                      {p.dek ?? p.description}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
