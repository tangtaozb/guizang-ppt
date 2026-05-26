import Link from "next/link";

const links = [
  { href: "/pricing", label: "定价" },
  { href: "/privacy", label: "隐私政策" },
  { href: "/terms", label: "服务条款" },
  { href: "/refund", label: "退款政策" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border py-8 px-6 bg-white">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <span className="whitespace-nowrap">© 2026 One PPT</span>
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="whitespace-nowrap hover:text-foreground transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <a
            href="mailto:support@oneppt.com"
            className="whitespace-nowrap hover:text-foreground transition-colors"
          >
            联系我们
          </a>
        </nav>
      </div>
    </footer>
  );
}
