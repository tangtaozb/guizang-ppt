"use client";

import Link from "next/link";
import { useTranslation } from "@/i18n";

export function SiteFooter() {
  const { t, locale } = useTranslation();
  const contactLabel = locale === "zh" ? "联系我们" : "Contact us";
  const links = [
    { href: "/pricing", label: t("common.pricing") },
    { href: "/privacy", label: t("legal.privacy") },
    { href: "/terms", label: t("legal.terms") },
    { href: "/refund", label: t("legal.refund") },
  ];
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
            {contactLabel}
          </a>
        </nav>
      </div>
    </footer>
  );
}
