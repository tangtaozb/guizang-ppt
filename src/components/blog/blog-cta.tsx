// 文章中插的 CTA 卡片 —— 引导回首页 / 试用
// MDX 里写 <BlogCTA /> 即可

import Link from "next/link";

export function BlogCTA({
  title = "Try the magazine-style approach yourself",
  body = "ArtifySlide turns your text into a magazine-styled HTML deck — pick from 9 editorial themes, chat to edit any slide, and download a single file you own.",
  href = "/",
  cta = "Open ArtifySlide →",
}: {
  title?: string;
  body?: string;
  href?: string;
  cta?: string;
}) {
  return (
    <aside className="my-12 not-prose rounded-lg border border-border bg-muted p-6 sm:p-8">
      <div className="font-mono text-[11.5px] uppercase tracking-[0.16em] text-accent">
        — From the team
      </div>
      <div className="mt-3 text-[20px] sm:text-[22px] font-medium tracking-[-0.01em]">
        {title}
      </div>
      <p className="mt-2 text-[15px] leading-[1.6] text-neutral-700">{body}</p>
      <Link
        href={href}
        className="mt-5 inline-flex h-10 items-center rounded-md bg-foreground px-4 text-[14px] font-medium text-white hover:opacity-90 transition-opacity"
      >
        {cta}
      </Link>
    </aside>
  );
}
