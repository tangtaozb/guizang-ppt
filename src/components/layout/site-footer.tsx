"use client";

import Link from "next/link";
import { useTranslation } from "@/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";

interface FooterLink {
  href: string;
  label: string;
  external?: boolean;
}

export function SiteFooter() {
  const { t } = useTranslation();

  const productLinks: FooterLink[] = [
    { href: "/#themes", label: t("nav.themes") },
    { href: "/pricing", label: t("common.pricing") },
    { href: "/blog", label: "Blog" },
    { href: "/login", label: t("common.login") },
  ];

  const legalLinks: FooterLink[] = [
    { href: "/privacy", label: t("legal.privacy") },
    { href: "/terms", label: t("legal.terms") },
    { href: "/refund", label: t("legal.refund") },
  ];

  return (
    <footer className="border-t border-border bg-white px-6 sm:px-14 pb-10 pt-14 text-[13.5px] text-muted-foreground">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-start gap-8 border-b border-border pb-8">
          <div className="max-w-[480px]">
            <div className="text-[18px] font-semibold tracking-[-0.02em] text-foreground">
              Artify<span className="text-accent">Slide</span>
            </div>
            <p className="mt-2.5 leading-[1.6]">{t("footer.tagline")}</p>
          </div>

          <div className="flex flex-wrap gap-10 sm:gap-14">
            <FooterCol title={t("footer.colProduct")} items={productLinks} />
            <FooterCol title={t("footer.colLegal")} items={legalLinks} />
            <div>
              <div className="mb-3.5 font-mono text-[11px] uppercase tracking-[0.16em] text-neutral-400">
                {t("footer.colLang")}
              </div>
              <LanguageSwitcher />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-0 justify-between pt-5 font-mono text-[11px] uppercase tracking-[0.14em]">
          <span>{t("footer.copyright")}</span>
          <span className="hidden sm:inline">{t("footer.madeWith")}</span>
          <a
            href="mailto:support@artifyslide.com"
            className="hover:text-foreground transition-colors"
          >
            {t("footer.billedVia")}
          </a>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: FooterLink[] }) {
  return (
    <div>
      <div className="mb-3.5 font-mono text-[11px] uppercase tracking-[0.16em] text-neutral-400">
        {title}
      </div>
      <div className="flex flex-col gap-2">
        {items.map((i) => (
          <Link
            key={i.href}
            href={i.href}
            className="text-[13.5px] text-foreground hover:text-accent transition-colors"
          >
            {i.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
