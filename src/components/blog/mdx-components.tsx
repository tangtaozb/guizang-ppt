// MDX 内容渲染样式 —— 杂志风阅读体验
// - 正文 Geist sans 17px / 1.75（瑞士设计偏好）
// - 标题间距开阔，h2 配 mono kicker
// - 引文做拉条 + 衬线放大处理
// - 链接朱砂下划线

import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

type AnchorProps = ComponentPropsWithoutRef<"a">;

function MDXAnchor({ href = "", children, ...rest }: AnchorProps) {
  const isExternal = /^https?:\/\//i.test(href);
  const isHash = href.startsWith("#");
  const className =
    "text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent transition-colors";
  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        {...rest}
      >
        {children}
      </a>
    );
  }
  if (isHash) {
    return (
      <a href={href} className={className} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export const mdxComponents: MDXComponents = {
  h1: ({ children }) => (
    <h1 className="mt-16 mb-6 text-[40px] sm:text-[52px] font-medium leading-[1.05] tracking-[-0.03em]">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-16 mb-5 text-[26px] sm:text-[32px] font-medium leading-[1.15] tracking-[-0.02em] border-t border-border pt-10">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-10 mb-3 text-[20px] sm:text-[22px] font-medium leading-[1.25] tracking-[-0.01em]">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-8 mb-3 text-[17px] font-semibold leading-[1.3]">{children}</h4>
  ),
  p: ({ children }) => (
    <p className="mt-5 text-[17px] leading-[1.75] text-neutral-800">{children}</p>
  ),
  a: MDXAnchor,
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => (
    <ul className="mt-5 ml-5 list-disc space-y-2.5 text-[17px] leading-[1.7] text-neutral-800 marker:text-accent">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-5 ml-5 list-decimal space-y-2.5 text-[17px] leading-[1.7] text-neutral-800 marker:text-accent">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-10 border-l-2 border-accent pl-6 font-serif text-[24px] sm:text-[28px] leading-[1.4] text-neutral-900">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-14 border-t border-border" />,
  code: ({ children }) => (
    <code className="font-mono text-[14px] bg-muted px-1.5 py-0.5 rounded text-foreground">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="my-6 overflow-x-auto rounded-lg border border-border bg-muted p-5 text-[13.5px] leading-[1.6] font-mono">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="my-8 overflow-x-auto">
      <table className="w-full border-collapse text-[15px]">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-b-2 border-foreground">{children}</thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-border">{children}</tbody>
  ),
  th: ({ children }) => (
    <th className="px-3 py-3 text-left font-mono text-[11.5px] uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-3 align-top text-[15px] leading-[1.55]">{children}</td>
  ),
  img: (props) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img {...props} className="my-8 w-full rounded-md border border-border" />
  ),
};
